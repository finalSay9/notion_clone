import { MinLength, IsString } from "class-validator";


export class UpdateDocumentDto {

    @MinLength(5)
    @IsString()
    title!: string

    @MinLength(12)
    content!: string
}