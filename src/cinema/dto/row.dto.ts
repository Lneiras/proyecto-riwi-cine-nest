import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

/** Lo que el frontend envía */
export class ReqCreateRowDto {
    @IsNotEmpty()
    @IsString()
    @Length(1, 1)
    letter: string;

    @IsOptional()
    @IsBoolean()
    isVip?: boolean;

    @IsOptional()
    @IsNumber()
    roomNumber?: number; // the parent room is supplied by the nested route
}

export class ReqUpdateRowDto {
    @IsOptional()
    @IsString()
    @Length(1, 1)
    letter?: string;

    @IsOptional()
    @IsBoolean()
    isVip?: boolean;

    @IsOptional()
    @IsNumber()
    roomNumber?: number; // frontend manda número, no id
}

/** Uso interno (dao) */
export class CreateRowDto {
    @IsNotEmpty()
    @IsString()
    @Length(1, 1)
    letter: string;

    @IsOptional()
    @IsBoolean()
    isVip?: boolean;

    @IsNumber()
    roomId: number;
}

export class UpdateRowDto {
    @IsOptional()
    @IsString()
    @Length(1, 1)
    letter?: string;

    @IsOptional()
    @IsBoolean()
    isVip?: boolean;

    @IsOptional()
    @IsNumber()
    roomId?: number;
}
