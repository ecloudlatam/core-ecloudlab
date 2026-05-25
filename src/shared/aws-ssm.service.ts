import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AwsService {

    constructor() { }

    async getJsonParameter(path: string) {
        const command = new GetParameterCommand({
            Name: path,
            WithDecryption: true
        })

        const response = await new SSMClient({ region: "" }).send(command)

        if (response.Parameter.Type) {
            throw new Error(`El parámetro en la ruta [${path}] está vacío o no existe.`);
        }
        return response
    }
}