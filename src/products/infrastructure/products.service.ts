import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from '../dto/create.dto';
import { GeminiService } from 'src/common/gemini/gemini.service';
import { omit, isEmpty } from 'lodash';
import { SuppliersRepository } from 'src/suppliers/supplier.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly supplierRepository: SuppliersRepository,
    private readonly geminiService: GeminiService,
  ) {}

  async create(products: CreateProductDto, appId: string) {
    console.log('products ====', products);
    const { supplier } = products;
    const { data } = await this.supplierRepository.findOne(supplier);
    let supplier_id = '';
    if (isEmpty(data)) {
      const res = await this.supplierRepository.create({ name: supplier });
      supplier_id = res.data[0].id;
    } else {
      supplier_id = data[0].id;
    }

    const embedding = await this.geminiService.generateEmbedding(products.name);

    const payload = {
      app_id: appId,
      slug: products.name.replaceAll(' ', '-'),
      name: products.name,
      cant: products.cant,
      embedding,
      supplier_id,
    };

    const response = await this.productsRepository.create(payload);

    // 2. Manejar posibles errores
    if (response.error || !response.data) {
      return {
        success: false,
        data: null,
        error: response.error?.message || 'Error al insertar el producto',
      };
    }

    const { id } = response.data[0];

    for (let index = 0; index < products.variants.length; index++) {
      const data = products.variants[index];

      console.log('variants ===', data);
      const product = {
        product_id: id,
        unit_quantity: data.unit_quantity,
        stock: data.stock,
        price_buy: data.price_buy,
        unit_type: data.unit_type,
        price_sell: data.price_sell,
        tax_rate: Number(data.tax_rate) / 100,
        image_url: data.image_url || '',
      };

      const variantId = await this.productsRepository.findProductBarCode(
        data.barcode,
      );

      if (!isEmpty(variantId)) continue;

      const prts = await this.productsRepository.createProductVariants(product);
      await this.productsRepository.createProductBarCode({
        barcode: data.barcode || this.generateInternalBarcode(),
        product_variant_id: prts.data[0].id,
        img_barcode: data.img_barcode || '',
      });
    }

    // 3. Limpiar los productos omitiendo el 'embedding'
    const cleanedProducts = response.data.map((item) =>
      omit(item, [
        'embedding',
        'supplier_id',
        'description',
        'is_available',
        'created_at',
      ]),
    );

    // 4. Retornar con el formato que espera ApiResponse<any>
    return {
      success: response.status >= 200 && response.status < 300, // Convierte el código HTTP a booleano
      message: 'product created',
      data: cleanedProducts.map((item) => item.name).join(''),
    };
  }

  async searchProducts(queryText: string, type: string): Promise<any> {
    if (type == 'suppliers') {
      return await this.productsRepository.findbySupplier(queryText);
    }

    const queryEmbedding =
      await this.geminiService.generateEmbedding(queryText);

    return await this.productsRepository.findOne(queryEmbedding);
  }

  async findAll() {
    return await this.productsRepository.findAll();
  }

  async createListProducts(products: any, appId: string): Promise<any> {
    const resp = [];
    try {
      console.log('products', products);
      for (let index = 0; index < products.length; index++) {
        const element = products[index];
        const item = JSON.parse(element);
        const items = await this.create(item, appId);

        resp.push(items);
      }
      return { success: true, message: 'crearon los registros', data: resp };
    } catch (error) {
      return { success: false, message: 'hubo errores para registrar datos' };
    }
  }

  async findBarCode(barcodes: any) {
    try {
      const { data } =
        await this.productsRepository.findProductBarCodes(barcodes);

      if (isEmpty(data))
        return {
          success: false,
          message: 'no contenemos los productos de los codigos',
        };

      return {
        success: true,
        message: 'resumen de los codigos de barra de los productos',
        data,
      };
    } catch (error) {
      return { success: false, message: 'hubo errores para registrar datos' };
    }
  }

  generateInternalBarcode() {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return randomSuffix.toString();
  }
}
