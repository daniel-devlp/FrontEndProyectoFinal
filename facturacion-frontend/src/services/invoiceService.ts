import type {
  InvoiceDto,
  InvoiceCreateDto,
  InvoiceUpdateDto,
  InvoiceDetailDto,
} from '../@types/invoices';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import { getToken } from './authService';

// Extended type for PDF generation with product name
interface EnrichedInvoiceDetailDto extends InvoiceDetailDto {
  productName?: string;
}

const API_URL = 'https://invoiceDevWeb.somee.com/api/Invoice';

const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    throw new Error('No se encontró un token de autenticación.');
  }
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

export const invoiceService = {
  getInvoiceById: async (id: number): Promise<InvoiceDto> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch invoice');
    return response.json();
  },

  getAllInvoices: async ({
    pageNumber = 1,
    pageSize = 10,
    searchTerm = '',
  }: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
  }): Promise<{ data: InvoiceDto[]; totalItems: number }> => {
    const response = await fetch(
      `${API_URL}?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch invoices');

    const result = await response.json();
    return { data: result.items, totalItems: result.totalCount };
  },

  createInvoice: async (dto: InvoiceCreateDto): Promise<void> => {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to create invoice');
  },

  updateInvoice: async (id: number, dto: InvoiceUpdateDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to update invoice');
  },

  deleteInvoice: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete invoice');
  },

  getInvoiceDetails: async (invoiceId: number): Promise<InvoiceDetailDto[]> => {
    const response = await fetch(`${API_URL}/${invoiceId}/details`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch invoice details');
    return response.json();
  },

  addProductToInvoice: async (invoiceId: number, productId: number, quantity: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${invoiceId}/add-product`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });
    if (!response.ok) throw new Error('Failed to add product to invoice');
  },

  removeProductFromInvoice: async (invoiceId: number, productId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${invoiceId}/remove-product/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove product from invoice');
  },  
  generateInvoicePDF: (
    client: { name: string; email: string; phone: string },
    details: EnrichedInvoiceDetailDto[],
    total: number
  ): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Header section with company info
    doc.setFillColor(41, 128, 185); // Blue header
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Company name and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('FACTURA COMERCIAL', margin, 20);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Sistema de Facturación Digital', margin, 30);
    
    // Invoice number and date
    const currentDate = new Date().toLocaleDateString('es-ES');
    const invoiceNumber = `#${Date.now().toString().slice(-6)}`;
    doc.setTextColor(255, 255, 255);
    doc.text(`Factura: ${invoiceNumber}`, pageWidth - margin - 50, 20);
    doc.text(`Fecha: ${currentDate}`, pageWidth - margin - 50, 30);
    
    // Reset text color for body
    doc.setTextColor(0, 0, 0);
    
    // Client information section
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DEL CLIENTE', margin, 60);
    
    // Client info box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin, 65, pageWidth - 2 * margin, 35);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Nombre: ${client.name}`, margin + 5, 75);
    doc.text(`Email: ${client.email}`, margin + 5, 85);
    doc.text(`Teléfono: ${client.phone}`, margin + 5, 95);
    
    // Products table header
    const tableStartY = 120;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('DETALLES DE LA FACTURA', margin, tableStartY - 10);
    
    // Table header background
    doc.setFillColor(52, 152, 219);
    doc.rect(margin, tableStartY, pageWidth - 2 * margin, 12, 'F');
    
    // Table headers
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('#', margin + 2, tableStartY + 8);
    doc.text('PRODUCTO', margin + 15, tableStartY + 8);
    doc.text('CANT.', margin + 80, tableStartY + 8);
    doc.text('PRECIO UNIT.', margin + 105, tableStartY + 8);
    doc.text('SUBTOTAL', margin + 145, tableStartY + 8);
    
    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    let currentY = tableStartY + 15;
    
    details.forEach((detail, index) => {
      const subtotal = detail.unitPrice * detail.quantity;
      const rowY = currentY + (index * 12);
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, rowY - 3, pageWidth - 2 * margin, 12, 'F');
      }
      
      // Row data
      doc.text(`${index + 1}`, margin + 2, rowY + 5);
      
      // Product name (truncate if too long)
      const productName = detail.productName || `Producto ID: ${detail.productId}`;
      const truncatedName = productName.length > 25 ? productName.substring(0, 25) + '...' : productName;
      doc.text(truncatedName, margin + 15, rowY + 5);
      
      doc.text(detail.quantity.toString(), margin + 85, rowY + 5);
      doc.text(`$${detail.unitPrice.toFixed(2)}`, margin + 110, rowY + 5);
      doc.text(`$${subtotal.toFixed(2)}`, margin + 150, rowY + 5);
      
      // Row separator line
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, rowY + 8, pageWidth - margin, rowY + 8);
    });
    
    // Total section
    const totalY = currentY + (details.length * 12) + 20;
    
    // Total box
    doc.setFillColor(46, 204, 113);
    doc.rect(pageWidth - margin - 80, totalY - 5, 80, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', pageWidth - margin - 75, totalY + 5);
    doc.text(`$${total.toFixed(2)}`, pageWidth - margin - 35, totalY + 5);
    
    // Footer
    const footerY = pageHeight - 30;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Gracias por su compra. Esta factura fue generada automáticamente por nuestro sistema.', margin, footerY);
    doc.text(`Generado el ${new Date().toLocaleString('es-ES')}`, margin, footerY + 10);
    
    // Border around the entire document
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    
    // Generate filename with date and invoice number
    const filename = `Factura_${invoiceNumber}_${currentDate.replace(/\//g, '-')}.pdf`;
    doc.save(filename);
  },
};

interface InvoiceDetail {
  productId: number;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  clientId: number;
  invoiceDetails: InvoiceDetail[];
}

export const createInvoice = async (invoice: Invoice, selectedClientName: string, invoiceDetails: any[], calculateTotal: () => number) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(invoice),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Error: ${response.status} - ${errorMessage}`);
    }

    // Generate improved PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Header section with company info
    doc.setFillColor(41, 128, 185); // Blue header
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Company name and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('FACTURA COMERCIAL', margin, 20);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Sistema de Facturación Digital', margin, 30);
    
    // Invoice number and date
    const currentDate = new Date().toLocaleDateString('es-ES');
    const invoiceNumber = `#${Date.now().toString().slice(-6)}`;
    doc.setTextColor(255, 255, 255);
    doc.text(`Factura: ${invoiceNumber}`, pageWidth - margin - 50, 20);
    doc.text(`Fecha: ${currentDate}`, pageWidth - margin - 50, 30);
    
    // Reset text color for body
    doc.setTextColor(0, 0, 0);
    
    // Client information section
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DEL CLIENTE', margin, 60);
    
    // Client info box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin, 65, pageWidth - 2 * margin, 25);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Nombre: ${selectedClientName}`, margin + 5, 75);
    
    // Products table header
    const tableStartY = 110;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('DETALLES DE LA FACTURA', margin, tableStartY - 10);
    
    // Table header background
    doc.setFillColor(52, 152, 219);
    doc.rect(margin, tableStartY, pageWidth - 2 * margin, 12, 'F');
    
    // Table headers
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('#', margin + 2, tableStartY + 8);
    doc.text('PRODUCTO', margin + 15, tableStartY + 8);
    doc.text('CANT.', margin + 80, tableStartY + 8);
    doc.text('PRECIO UNIT.', margin + 105, tableStartY + 8);
    doc.text('SUBTOTAL', margin + 145, tableStartY + 8);
    
    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    let currentY = tableStartY + 15;
    
    invoiceDetails.forEach((detail, index) => {
      const rowY = currentY + (index * 12);
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, rowY - 3, pageWidth - 2 * margin, 12, 'F');
      }
      
      // Row data
      doc.text(`${index + 1}`, margin + 2, rowY + 5);
      
      // Product name (truncate if too long)
      const productName = detail.name || 'Producto';
      const truncatedName = productName.length > 25 ? productName.substring(0, 25) + '...' : productName;
      doc.text(truncatedName, margin + 15, rowY + 5);
      
      doc.text(detail.quantity.toString(), margin + 85, rowY + 5);
      doc.text(`$${detail.unitPrice.toFixed(2)}`, margin + 110, rowY + 5);
      doc.text(`$${detail.subtotal.toFixed(2)}`, margin + 150, rowY + 5);
      
      // Row separator line
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, rowY + 8, pageWidth - margin, rowY + 8);
    });
    
    // Total section
    const totalY = currentY + (invoiceDetails.length * 12) + 20;
    const totalAmount = calculateTotal();
    
    // Total box
    doc.setFillColor(46, 204, 113);
    doc.rect(pageWidth - margin - 80, totalY - 5, 80, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', pageWidth - margin - 75, totalY + 5);
    doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - margin - 35, totalY + 5);
    
    // Footer
    const footerY = pageHeight - 30;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Gracias por su compra. Esta factura fue generada automáticamente por nuestro sistema.', margin, footerY);
    doc.text(`Generado el ${new Date().toLocaleString('es-ES')}`, margin, footerY + 10);
    
    // Border around the entire document
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    
    // Generate filename with date and invoice number
    const filename = `Factura_${invoiceNumber}_${currentDate.replace(/\//g, '-')}.pdf`;
    doc.save(filename);

    toast.success('Factura guardada exitosamente y PDF generado.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    toast.error(`Error al guardar la factura: ${errorMessage}`);
  }
};
