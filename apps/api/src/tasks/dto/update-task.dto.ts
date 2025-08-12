import {IsBoolean, IsString, IsOptional} from "class-validator";

export class UpdateTaskDto {

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsBoolean()
    done?: boolean;
}
