import { Injectable, Logger } from "@nestjs/common";
import { CategoriesDto } from "../domain/dtos/create-category.dto";
import { CategoriesRepository } from "./categories.repository";


@Injectable()
export class CategoriesService {

    private readonly logger = new Logger(CategoriesService.name)

    constructor(private readonly categoriesRepository: CategoriesRepository) { }

    async create(catg: CategoriesDto, appId: string) {
        try {

            const payload = {
                name: catg.name,
                app_id: appId,
                slug: catg.name.replaceAll(" ","-")
            }

            this.logger.log(payload)
            const data =  await this.categoriesRepository.create(payload);
            return data
        } catch (error) {

        }
    }
}