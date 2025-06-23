import type {
  InvoiceDto,
  InvoiceCreateDto,
  InvoiceUpdateDto,
  InvoiceDetailDto,
} from '../@types/invoices';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import { getToken } from './authService';

const API_URL = 'http://invoiceDevWeb.somee.com/api/Invoice';

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
    details: InvoiceDetailDto[],
    total: number
  ): void => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Factura', 10, 10);

    doc.setFontSize(12);
    doc.text(`Cliente: ${client.name}`, 10, 20);
    doc.text(`Email: ${client.email}`, 10, 30);
    doc.text(`Teléfono: ${client.phone}`, 10, 40);

    doc.text('Detalles:', 10, 50);
    details.forEach((detail, index) => {
      const subtotal = detail.unitPrice * detail.quantity; // Calculate subtotal dynamically
      doc.text(
        `${index + 1}. Producto ID: ${detail.productId} - Cantidad: ${detail.quantity} - Precio: ${detail.unitPrice} - Subtotal: ${subtotal.toFixed(2)}`,
        10,
        60 + index * 10
      );
    });

    doc.text(`Total: ${total}`, 10, 70 + details.length * 10);

    doc.save('factura.pdf');
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

    const doc = new jsPDF();
    doc.text('Factura', 10, 10);
    doc.text(`Cliente: ${selectedClientName}`, 10, 20);
    invoiceDetails.forEach((detail, index) => {
      doc.text(
        `Producto: ${detail.name}, Cantidad: ${detail.quantity}, Precio Unitario: ${detail.unitPrice}, Subtotal: ${detail.subtotal}`,
        10,
        30 + index * 10
      );
    });
    doc.text(`Total: ${calculateTotal()}`, 10, 100);
    doc.save('factura.pdf');

    toast.success('Factura guardada exitosamente.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    toast.error(`Error al guardar la factura: ${errorMessage}`);
  }
};
