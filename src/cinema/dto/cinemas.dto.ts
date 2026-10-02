import { IsNumber, IsOptional, IsString } from "class-validator";


export class ReqCreateCinemaDto{
    @IsString()
    name: string;

    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    cityName?: string;

    @IsString()
    address: string;
}



export class CreateCinemaDto {
    
    @IsString()
    name: string;

    @IsString()
    type: string;

    @IsNumber()
    cityId: Number;

    @IsString()
    address: string;
}

export class ReqUpdateCinemaDto{

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    cityName?: string;

    @IsOptional()
    @IsString()
    address?: string;

}

export class UpdateCinemaDto{

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsNumber()
    cityId?: number;

    @IsOptional()
    @IsString()
    address?: string;

}
