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
    return new Promise((resolve, reject) => {
      const DocConstructor = (PDFDocument as any).default || PDFDocument;
      const doc = new DocConstructor({
        margin: 40,
        size: 'A4',
      });

      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ==========================
      // TÍTULO
      // ==========================

      doc
        .fillColor('#1E3A8A')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('REPORTE DIARIO DE VENTAS', {
          align: 'center',
        });

      doc.moveDown(0.5);

      doc.strokeColor('#CCCCCC').moveTo(40, doc.y).lineTo(555, doc.y).stroke();

      doc.moveDown();

      // ==========================
      // RESUMEN
      // ==========================

      const boxY = doc.y;

      doc.roundedRect(40, boxY, 240, 95, 5).stroke('#CCCCCC');

      doc.font('Helvetica').fontSize(11);

      doc.text('Fecha:', 50, boxY + 10);
      doc.text(new Date().toLocaleDateString(), 140, boxY + 10);

      doc.text('Ventas:', 50, boxY + 30);
      doc.text(`$${reportData.totalSalesToday}`, 140, boxY + 30);

      doc.text('Costos:', 50, boxY + 50);
      doc.text(`$${reportData.totalCostToday}`, 140, boxY + 50);

      doc.text('Ganancia:', 50, boxY + 70);
      doc.text(`$${reportData.totalProfitToday}`, 140, boxY + 70);

      doc.text('Órdenes:', 50, boxY + 90);
      doc.text(reportData.totalOrders.toString(), 140, boxY + 90);

      let y = boxY + 130;

      // ==========================
      // TABLA
      // ==========================

      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .fillColor('black')
        .text('Detalle de órdenes', 40, y);

      y += 25;

      // Encabezado

      doc.rect(40, y, 515, 22).fill('#1E3A8A');

      doc
        .fillColor('white')
        .fontSize(10)
        .text('#', 45, y + 6)
        .text('Orden', 70, y + 6)
        .text('Productos', 150, y + 6)
        .text('Total', 500, y + 6, {
          width: 45,
          align: 'right',
        });

      y += 25;

      doc.font('Helvetica');

      reportData.orders.forEach((order: any, index: number) => {
        // Salto de página

        if (y > 720) {
          doc.addPage();
          y = 50;
        }

        // Fondo alternado

        if (index % 2 === 0) {
          doc.rect(40, y - 2, 515, 20).fill('#F5F5F5');
        }

        doc.fillColor('black');

        doc.text(index + 1, 45, y);

        doc.text(order.id.toString(), 70, y);

        const products = order.order_details
          ?.map((d: any) => {
            const name = d.product?.products?.name ?? 'Producto';

            return `${name}`;
          })
          .join('\n');

        doc.text(products, 150, y, {
          width: 300,
        });

        doc.text(`$${order.total}`, 500, y, {
          width: 45,
          align: 'right',
        });

        const rowHeight = Math.max(22, (order.order_details?.length || 1) * 15);

        y += rowHeight;

        doc.moveTo(40, y).lineTo(555, y).strokeColor('#DDDDDD').stroke();

        y += 10;
      });

      // ==========================
      // PIE
      // ==========================

      doc.moveDown();

      doc
        .fontSize(8)
        .fillColor('gray')
        .text(
          `Generado el ${new Date().toLocaleString()}`,
          0,
          doc.page.height - 50,
          {
            align: 'center',
          },
        );

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
