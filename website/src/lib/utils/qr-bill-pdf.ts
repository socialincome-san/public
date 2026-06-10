import PDFDocument from 'pdfkit';
import { SwissQRBill } from 'swissqrbill/pdf';
import { buildQrBillData, type QrBillGenerationProps } from './qr-bill';

export const generateQrBillPdfBuffer = (props: Omit<QrBillGenerationProps, 'type'>): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		const data = buildQrBillData(props);
		const chunks: Buffer[] = [];
		const pdf = new PDFDocument({ size: 'A4' });
		const qrBill = new SwissQRBill(data);

		pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
		pdf.on('end', () => resolve(Buffer.concat(chunks)));
		pdf.on('error', reject);

		qrBill.attachTo(pdf);
		pdf.end();
	});
