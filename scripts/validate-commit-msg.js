import fs from "node:fs";

const commitMsgFile = process.argv[2];
if (!commitMsgFile) {
  process.exit(0);
}

const commitMsg = fs.readFileSync(commitMsgFile, "utf-8").trim();

// Permitir merges automáticos o reversiones generadas por git
if (
  commitMsg.startsWith("Merge ") ||
  commitMsg.startsWith("Revert ") ||
  commitMsg.startsWith("fixup! ")
) {
  process.exit(0);
}

// Validación de convención según Guía DevOps: [US-XXX] o [HU-XXX] tipo: descripción
// Tipos válidos: feat, fix, test, refactor, docs, chore
const commitRegex = /^\[(US|HU)-\d+\]\s+(feat|fix|test|refactor|docs|chore):\s+.+/i;

if (!commitRegex.test(commitMsg)) {
  console.error("\n❌ ========================================================");
  console.error("   ERROR: El formato del mensaje de commit es inválido.");
  console.error("==========================================================");
  console.error("El mensaje debe cumplir con la convención:");
  console.error("   [US-XXX] tipo: descripción\n");
  console.error("Tipos permitidos: feat, fix, test, refactor, docs, chore");
  console.error("Ejemplos válidos:");
  console.error("   [US-101] feat: agregar autenticación de usuarios");
  console.error("   [US-102] fix: corregir validación de clientes");
  console.error("   [US-103] test: agregar pruebas para customers service\n");
  console.error(`Mensaje recibido: "${commitMsg}"\n`);
  process.exit(1);
}

console.log("✔ [Git Hook] Mensaje de commit validado correctamente.");
process.exit(0);
