
import {CreateAppDto} from './dtos/create-app.dto'
import {AppEntity} from './app.entity'

export interface IAppsRepository {
  findAll(): Promise<AppEntity[]>;
  create(App: CreateAppDto): Promise<AppEntity>;
}