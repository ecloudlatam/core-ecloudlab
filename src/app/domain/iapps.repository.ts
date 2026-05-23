export interface IAppsRepository {
  findAll(): Promise<any[]>;
  create(nuevaApp: any): Promise<any>;
}