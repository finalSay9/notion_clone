import { MinLength, IsString } from "class-validator";


export class DocumentDto {

    @MinLength(5)
    @IsString()
    title!: string

    @MinLength(12)
    content!: string
}