import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';


export class QueryDocumentDto {

    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1


    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10
}