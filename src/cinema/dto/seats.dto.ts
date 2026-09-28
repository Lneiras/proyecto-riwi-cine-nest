import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

/** Lo que el frontend envía */
export class ReqCreateSeatsDto {
    @IsNumber()
    number: number;

    @IsBoolean()
    isPreferential: boolean;

    @IsOptional()
    @IsString()
    @Length(1, 1)
    rowLetter?: string; // the parent row is supplied by the nested route
}

export class ReqUpdateSeatsDto {
    @IsOptional()
    @IsNumber()
    number?: number;

    @IsOptional()
    @IsBoolean()
    isPreferential?: boolean;

    @IsOptional()
    @IsString()
    @Length(1, 1)
    rowLetter?: string; // frontend manda letra, no id
}

/** Uso interno (dao) */
export class CreateSeatsDto {
    @IsNumber()
    number: number;

    @IsBoolean()
    isPreferential: boolean;

    @IsNumber()
    rowId: number;
}

export class UpdateSeatsDto {
    @IsOptional()
    @IsNumber()
    number?: number;

    @IsOptional()
    @IsBoolean()
    isPreferential?: boolean;

    @IsOptional()
    @IsNumber()
    rowId?: number;
}
