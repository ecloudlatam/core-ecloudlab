import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@app/supabase';
import { OrderCreateDto, orderDetailsDto } from './order-create.dto';

@Injectable()
export class OrdersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createOrderDetails(orders: orderDetailsDto[]) {
    try {
      const db = this.supabaseService.getClient();
      const response = await db.from('order_details').insert(orders).select();
      return response;
    } catch (error) {}
  }

  async createOrder(order: OrderCreateDto) {
    const { reference_id, status, total } = order;
    try {
      const db = this.supabaseService.getClient();
      const response = await db
        .from('orders')
        .insert({
          reference_id,
          status,
          total,
        })
        .select();
      return response;
    } catch (error) {}
  }

  async getOrdersToday() {
    try {
      const db = this.supabaseService.getClient();

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // 1. Obtener órdenes con sus detalles
      const { data: orders, error } = await db
        .from('orders')
        .select(
          `
        id,
        created_at,
        status,
        total,
        order_details (
          id,
          total,
          barcode
        )
      `,
        )
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. Extraer códigos de barras únicos
      const barcodes = [
        ...new Set(
          orders?.flatMap(
            (o) => o.order_details?.map((d) => d.barcode) || [],
          ) || [],
        ),
      ].filter(Boolean);

      // 3. Consultar price_buy, price_sell, unit_type y name
      const barcodeMap = new Map();
      if (barcodes.length > 0) {
        const { data: barcodeData } = await db
          .from('product_barcodes')
          .select(
            `
          barcode,
          product_variants (
            unit_type,
            price_buy,
            price_sell,
            products (
              name
            )
          )
        `,
          )
          .in('barcode', barcodes);

        barcodeData?.forEach((item) => {
          barcodeMap.set(item.barcode, item.product_variants);
        });
      }

      // 4. Enriquecer los datos y calcular acumulados de compra/venta
      let totalSales = 0;
      let totalCost = 0;

      const enrichedOrders = orders?.map((order) => {
        totalSales += Number(order.total || 0);

        const enrichedDetails = order.order_details?.map((detail) => {
          const variantInfo = barcodeMap.get(detail.barcode);

          // Sumar el costo de compra
          if (variantInfo?.price_buy) {
            totalCost += Number(variantInfo.price_buy);
          }

          return {
            ...detail,
            product: variantInfo || null,
          };
        });

        return {
          ...order,
          order_details: enrichedDetails,
        };
      });

      const totalProfit = totalSales - totalCost;

      return {
        totalSalesToday: Number(totalSales.toFixed(2)),
        totalCostToday: Number(totalCost.toFixed(2)),
        totalProfitToday: Number(totalProfit.toFixed(2)),
        totalOrders: enrichedOrders?.length || 0,
        orders: enrichedOrders || [],
      };
    } catch (error) {
      console.error('Error al obtener las órdenes de hoy:', error);
      throw error;
    }
  }
}
