import { SupabaseService } from '@app/supabase';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AwsService {

    constructor() {

    }

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

    async uploadToSupabaseS3(fileBuffer: Buffer, fileName: string) {

        const s3Client = new S3Client({
            forcePathStyle: true,
            region: process.env.SUPABASE_REGION_BUCKET,
            endpoint: process.env.SUPABASE_URL_BUCKET,
            credentials: {
                accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID,
                secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY,
            },
        });

        const command = new PutObjectCommand({
            Bucket: "minimarket",
            Key: `audios/${fileName}`,
            Body: fileBuffer,
            ContentType: "audio/ogg",
        });

        try {
            const response = await s3Client.send(command);
            return response;
        } catch (err) {
            console.error("Error subiendo con S3 SDK:", err);

        }
    }
}