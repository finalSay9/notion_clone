import { MinLength, IsString } from "class-validator";


export class CreateDocumentDto {

    @MinLength(5)
    @IsString()
    title!: string

    @MinLength(12)
    content!: string
}