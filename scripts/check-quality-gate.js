import "dotenv/config";
import { readFile } from "node:fs/promises";

const hostUrl = (process.env.SONAR_HOST_URL || "http://localhost:9000").replace(
  /\/$/,
  "",
);
const token = process.env.SONAR_TOKEN || process.env.SONAR_AUTH_TOKEN || "";
const reportPath =
  process.env.SONAR_REPORT_TASK_FILE || ".scannerwork/report-task.txt";
const maxAttempts = 36;
const delayMs = 5000;

function authenticationHeaders() {
  if (!token) return {};

  return {
    Authorization: `Basic ${Buffer.from(`${token}:`).toString("base64")}`,
  };
}

async function sonarRequest(url) {
  const target = new URL(url, `${hostUrl}/`);
  const configuredServer = new URL(hostUrl);

  if (target.origin !== configuredServer.origin) {
    throw new Error(
      `El reporte de SonarQube apunta a un servidor inesperado: ${target.origin}`,
    );
  }

  const response = await fetch(target, {
    headers: authenticationHeaders(),
    signal: AbortSignal.timeout(10000),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SonarQube rechazo las credenciales configuradas.");
  }
  if (!response.ok) {
    throw new Error(`SonarQube respondio HTTP ${response.status}.`);
  }

  return response.json();
}

async function readCurrentTaskUrl() {
  let report;
  try {
    report = await readFile(reportPath, "utf8");
  } catch {
    throw new Error(
      `No se encontro ${reportPath}. Ejecuta primero el analisis de SonarQube.`,
    );
  }

  const properties = Object.fromEntries(
    report
      .split(/\r?\n/)
      .filter((line) => line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );

  if (!properties.ceTaskUrl) {
    throw new Error("El reporte no contiene ceTaskUrl.");
  }

  return properties.ceTaskUrl;
}

async function waitForAnalysis(ceTaskUrl) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const data = await sonarRequest(ceTaskUrl);
    const status = data?.task?.status;

    if (status === "SUCCESS" && data.task.analysisId) {
      return data.task.analysisId;
    }
    if (status === "FAILED" || status === "CANCELED") {
      throw new Error(`El analisis actual termino con estado ${status}.`);
    }
    if (status !== "PENDING" && status !== "IN_PROGRESS") {
      throw new Error(`Estado inesperado de la tarea de analisis: ${status}.`);
    }

    console.log(
      `Esperando el analisis actual (intento ${attempt}/${maxAttempts})...`,
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Tiempo de espera agotado para el analisis actual.");
}

function describeFailedConditions(conditions = []) {
  return conditions
    .filter((condition) => condition.status !== "OK")
    .map(
      (condition) =>
        `- ${condition.metricKey}: actual=${condition.actualValue}, umbral=${condition.errorThreshold}`,
    )
    .join("\n");
}

async function checkQualityGate() {
  const ceTaskUrl = await readCurrentTaskUrl();
  const analysisId = await waitForAnalysis(ceTaskUrl);
  const endpoint =
    `${hostUrl}/api/qualitygates/project_status?analysisId=` +
    encodeURIComponent(analysisId);
  const data = await sonarRequest(endpoint);
  const status = data?.projectStatus?.status;

  if (status !== "OK") {
    const details = describeFailedConditions(data?.projectStatus?.conditions);
    throw new Error(
      `Quality Gate rechazado para el analisis actual (${status || "sin estado"}).` +
        (details ? `\n${details}` : ""),
    );
  }

  console.log(
    `Quality Gate aprobado para el analisis actual (analysisId=${analysisId}).`,
  );
}

checkQualityGate().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
