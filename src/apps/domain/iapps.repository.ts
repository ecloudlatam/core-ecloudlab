import { CreateAppDto } from './dtos/create-apps.dto';
import { AppEntity } from './apps.entity';

export interface IAppsRepository {
  findAll(): Promise<AppEntity[]>;
  create(App: CreateAppDto): Promise<AppEntity>;
}
