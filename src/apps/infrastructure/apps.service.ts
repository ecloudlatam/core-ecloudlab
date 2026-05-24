import { Inject, Injectable } from '@nestjs/common';
import { IAppsRepository } from "../domain/iapps.repository";
import { CreateAppDto } from '../domain/dtos/create-apps.dto';
import { AuthService } from 'shared/auth';
import { AppEntity } from '../domain/apps.entity';
import { AppRepository } from './apps.repository';


@Injectable()
export class AppsService {
    constructor(private readonly iAppsRepository: AppRepository,
        private readonly authService: AuthService
    ) { }
    async create(nuevaApp: CreateAppDto): Promise<any> {

        try {
            const token = this.authService.generate()

            const payload = {
                name: nuevaApp.name,
                status: nuevaApp.status,
                api_key_hash: token.apiKeyHash,
                api_key_hint: token.apiKeyHint
            }

            const data = await this.iAppsRepository.create(payload)
            return data

        } catch (error) {
            console.log(error)
        }
    }

    async findAll(): Promise<AppEntity[]> {
        try {
            const data = await this.iAppsRepository.findAll()
            return data
        } catch (error) {

        }
    }


}

