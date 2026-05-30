import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from "class-validator";


export class CreateDoubtDto{
    @IsString()
    @IsNotEmpty()
    name: string

    @IsNumber({maxDecimalPlaces: 2})
    @Min(0)
    price: number

    @IsUUID('4')
    app_id: string
}