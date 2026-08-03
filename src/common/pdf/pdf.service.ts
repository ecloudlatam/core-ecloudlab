import { Injectable } from '@nestjs/common';
import { AwsService } from 'src/shared/aws.service';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  constructor(private readonly awsService: AwsService) {}

  /**
   * Genera el Buffer binario del reporte en formato PDF
   */
  async generateDailyReportPdf(reportData: any): Promise<Buffer> {
    // const PDFDocument = (await import('pdfkit/js/pdfkit.standalone')).default;

    return new Promise((resolve, reject) => {
      const DocConstructor = (PDFDocument as any).default || PDFDocument;
      const doc = new DocConstructor({ margin: 30 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Encabezado
      doc.fontSize(18).text('Reporte Diario de Ventas', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString()}`);
      doc.text(`Total Ventas: $${reportData.totalSalesToday}`);
      doc.text(`Total Costo: $${reportData.totalCostToday}`);
      doc.text(`Ganancia Neta: $${reportData.totalProfitToday}`);
      doc.text(`Órdenes Totales: ${reportData.totalOrders}`);
      doc.moveDown();

      doc.fontSize(12).text('Detalle de Órdenes:', { underline: true });
      doc.moveDown(0.5);

      // Listado de Órdenes
      reportData.orders.forEach((order: any, index: number) => {
        doc
          .fontSize(10)
          .text(`${index + 1}. Orden ID: ${order.id} | Total: $${order.total}`);
        order.order_details?.forEach((detail: any) => {
          const prodName =
            detail.product?.products?.name || 'Producto Desconocido';
          doc.fontSize(8).text(`   - ${prodName} (Código: ${detail.barcode})`);
        });
        doc.moveDown(0.5);
      });

      doc.end();
    });
  }

  async generateAndUploadDailyReportPdf(reportData: any) {
    try {
      console.log('reportData', reportData);
      // 1. Generar el Buffer del documento PDF
      const pdfBuffer = await this.generateDailyReportPdf(reportData);

      // 2. Definir el nombre único del archivo
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `reporte_${dateStr}_${Date.now()}.pdf`;

      // 3. Ruta dentro de Supabase S3
      const s3Key = `whatsapp/documents/pdf/${fileName}`;
      const bucket = 'minimarket';

      await this.awsService.uploadToSupabaseS3(
        bucket,
        pdfBuffer,
        s3Key,
        'application/pdf',
      );

      return {
        success: true,
        message: 'resumen de los pedidos del dia de hoy',
        uploadResult: `https://oevymuwxtjigqywbewpe.storage.supabase.co/storage/v1/object/public/minimarket/whatsapp/documents/pdf/${fileName}`,
      };
    } catch (error) {
      console.log('error ===', error);
      return {
        success: false,
        message: 'hubo errores para generar el reporte',
      };
    }
  }
}
