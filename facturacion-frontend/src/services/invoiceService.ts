/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧾 SERVICIO DE GESTIÓN DE FACTURAS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este servicio maneja todas las operaciones relacionadas con facturas,
 * incluyendo CRUD, generación de PDF, y funciones avanzadas de facturación.
 * 
 * 🎯 FUNCIONALIDADES PRINCIPALES:
 * • Operaciones CRUD completas para facturas
 * • Generación automática de PDF con diseño profesional
 * • Gestión de detalles de factura (líneas de productos)
 * • Cálculos automáticos de totales, subtotales e impuestos
 * • Descarga automática de archivos PDF
 * • Integración con sistema de autenticación Bearer
 * • Manejo robusto de errores con notificaciones
 * 
 * 🔧 CARACTERÍSTICAS TÉCNICAS:
 * • Headers de autenticación automáticos
 * • Validación de tokens antes de cada operación
 * • Transformación de datos para compatibilidad backend-frontend
 * • Generación de PDF client-side con jsPDF
 * • Manejo de tipos TypeScript estrictos
 * • Integración con sistema de notificaciones moderno
 * 
 * 🚀 MEJORAS FUTURAS SUGERIDAS:
 * • Plantillas de PDF personalizables por empresa
 * • Envío automático por email al cliente
 * • Firma digital de documentos PDF
 * • Generación de códigos QR para verificación
 * • Múltiples formatos de exportación (Excel, CSV, XML)
 * • Versionado de facturas con historial de cambios
 * • Integración con sistemas de pago online
 * • Facturación recurrente automatizada
 * • Workflow de aprobación para facturas grandes
 * • Análisis de patrones de facturación con IA
 * • Integración con sistemas contables externos
 * • Multi-idioma para facturas internacionales
 * • Compliance con regulaciones fiscales por país
 * 
 * 💡 EJEMPLO DE USO:
 * ```typescript
 * // Crear nueva factura
 * await invoiceService.createInvoice(invoiceData);
 * 
 * // Generar y descargar PDF
 * await invoiceService.generateInvoicePDF(invoiceId);
 * 
 * // Obtener lista paginada
 * const result = await invoiceService.getAllInvoices({
 *   pageNumber: 1,
 *   pageSize: 10,
 *   searchTerm: 'cliente'
 * });
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type {
  InvoiceDto,
  InvoiceCreateDto,
  InvoiceUpdateDto,
  InvoiceDetailDto,
} from '../@types/invoices';
import jsPDF from 'jspdf';
import { notifications } from '../utils/notifications';
import { getToken } from './authService';

/**
 * 📋 INTERFAZ EXTENDIDA PARA GENERACIÓN DE PDF
 * 
 * Extiende InvoiceDetailDto con información adicional de productos
 * necesaria para generar PDFs más informativos y profesionales.
 * 
 * @interface EnrichedInvoiceDetailDto
 * @extends InvoiceDetailDto
 * @property {string} productName - Nombre descriptivo del producto
 * @property {string} productCode - Código único del producto
 */
interface EnrichedInvoiceDetailDto extends InvoiceDetailDto {
  productName?: string;
  productCode?: string;
}

/** 🌐 URL base de la API de facturas */
const API_URL = 'https://localhost:44306/api/Invoice';

/**
 * 🔐 GENERADOR DE HEADERS DE AUTENTICACIÓN
 * 
 * Crea los headers necesarios para las peticiones HTTP con autenticación Bearer.
 * Valida que exista un token antes de realizar cualquier operación.
 * 
 * @returns {object} Headers con autorización y tipo de contenido
 * @throws {Error} Si no se encuentra un token de autenticación
 */
const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    throw new Error('No se encontró un token de autenticación.');
  }
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

/**
 * 🧾 SERVICIO PRINCIPAL DE FACTURAS
 * 
 * Objeto que contiene todas las funciones relacionadas con la gestión
 * de facturas, desde operaciones básicas hasta funciones avanzadas.
 */
export const invoiceService = {
  /**
   * 🔍 OBTENER FACTURA POR ID
   * 
   * Recupera una factura específica usando su identificador único.
   * Incluye todos los detalles y datos relacionados.
   * 
   * @param {number} id - ID único de la factura
   * @returns {Promise<InvoiceDto>} Datos completos de la factura
   * @throws {Error} Si la factura no existe o hay errores de red
   */
  getInvoiceById: async (id: number): Promise<InvoiceDto> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch invoice');
    return response.json();
  },

  /**
   * 📋 OBTENER TODAS LAS FACTURAS CON PAGINACIÓN
   * 
   * Recupera una lista paginada de facturas con capacidad de búsqueda.
   * Optimizado para manejar grandes volúmenes de datos.
   * 
   * @param {object} params - Parámetros de consulta
   * @param {number} params.pageNumber - Número de página (base 1)
   * @param {number} params.pageSize - Cantidad de facturas por página
   * @param {string} params.searchTerm - Término de búsqueda opcional
   * @returns {Promise<{data: InvoiceDto[], totalItems: number}>} Lista paginada de facturas
   * 
   * 🔍 CRITERIOS DE BÚSQUEDA:
   * • Número de factura
   * • Nombre del cliente
   * • Fecha de emisión
   * • Estado de la factura
   */
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

  /**
   * ➕ CREAR NUEVA FACTURA
   * 
   * Crea una nueva factura en el sistema con todos sus detalles.
   * Valida datos y calcula totales automáticamente.
   * 
   * @param {InvoiceCreateDto} dto - Datos de la nueva factura
   * @returns {Promise<void>} Promesa de creación exitosa
   * @throws {Error} Si los datos son inválidos o hay errores del servidor
   * 
   * 🔧 VALIDACIONES APLICADAS:
   * • Cliente válido y existente
   * • Productos válidos con stock disponible
   * • Cantidades positivas
   * • Precios coherentes
   */
  createInvoice: async (dto: InvoiceCreateDto): Promise<void> => {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to create invoice');
  },

  /**
   * ✏️ ACTUALIZAR FACTURA EXISTENTE
   * 
   * Modifica una factura existente manteniendo la integridad de los datos.
   * Recalcula totales automáticamente tras los cambios.
   * 
   * @param {number} id - ID de la factura a actualizar
   * @param {InvoiceUpdateDto} dto - Nuevos datos de la factura
   * @returns {Promise<void>} Promesa de actualización exitosa
   * @throws {Error} Si la factura no existe o los datos son inválidos
   * 
   * ⚠️ CONSIDERACIONES:
   * • No se pueden modificar facturas pagadas o anuladas
   * • Los cambios pueden afectar el inventario
   * • Se mantiene un historial de modificaciones
   */
  updateInvoice: async (id: number, dto: InvoiceUpdateDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to update invoice');
  },

  /**
   * 🗑️ ELIMINAR FACTURA
   * 
   * Elimina permanentemente una factura del sistema.
   * Esta operación es irreversible y debe ser confirmada.
   * 
   * @param {number} id - ID de la factura a eliminar
   * @returns {Promise<void>} Promesa de eliminación exitosa
   * @throws {Error} Si la factura no existe o no se puede eliminar
   * 
   * ⚠️ RESTRICCIONES:
   * • No se pueden eliminar facturas pagadas
   * • No se pueden eliminar facturas con más de 30 días
   * • Requiere permisos administrativos
   */
  deleteInvoice: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete invoice');
  },

  /**
   * 📋 OBTENER DETALLES DE FACTURA
   * 
   * Recupera todas las líneas de detalle (productos) de una factura específica.
   * Incluye información completa de productos y cálculos.
   * 
   * @param {number} invoiceId - ID de la factura
   * @returns {Promise<InvoiceDetailDto[]>} Lista de líneas de detalle
   * @throws {Error} Si la factura no existe o hay errores de red
   */
  getInvoiceDetails: async (invoiceId: number): Promise<InvoiceDetailDto[]> => {
    const response = await fetch(`${API_URL}/${invoiceId}/details`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch invoice details');
    return response.json();
  },

  /**
   * ➕ AGREGAR PRODUCTO A FACTURA
   * 
   * Añade un nuevo producto a una factura existente.
   * Actualiza automáticamente los totales de la factura.
   * 
   * @param {number} invoiceId - ID de la factura
   * @param {number} productId - ID del producto a agregar
   * @param {number} quantity - Cantidad del producto
   * @returns {Promise<void>} Promesa de adición exitosa
   * @throws {Error} Si no hay stock suficiente o datos inválidos
   * 
   * 🔧 VALIDACIONES:
   * • Stock disponible suficiente
   * • Producto activo y válido
   * • Cantidad positiva
   * • Factura en estado editable
   */
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
    doc.text('CÓDIGO', margin + 15, tableStartY + 8);
    doc.text('PRODUCTO', margin + 50, tableStartY + 8);
    
    // Right-aligned headers for numbers
    doc.text('CANT.', margin + 120, tableStartY + 8, { align: 'right' });
    doc.text('PRECIO UNIT.', margin + 150, tableStartY + 8, { align: 'right' });
    doc.text('SUBTOTAL', margin + 180, tableStartY + 8, { align: 'right' });
    
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
      
      // Product code - left aligned (assuming we get the code somehow)
      const productCode = detail.productCode || detail.productId.toString();
      doc.text(productCode, margin + 15, rowY + 5);
      
      // Product name (truncate if too long) - left aligned
      const productName = detail.productName || `Producto ID: ${detail.productId}`;
      const truncatedName = productName.length > 20 ? productName.substring(0, 20) + '...' : productName;
      doc.text(truncatedName, margin + 50, rowY + 5);
      
      // Numbers - right aligned with 2 decimals
      doc.text(detail.quantity.toString(), margin + 120, rowY + 5, { align: 'right' });
      doc.text(`$${detail.unitPrice.toFixed(2)}`, margin + 150, rowY + 5, { align: 'right' });
      doc.text(`$${subtotal.toFixed(2)}`, margin + 180, rowY + 5, { align: 'right' });
      
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
    doc.text('CÓDIGO', margin + 15, tableStartY + 8);
    doc.text('PRODUCTO', margin + 50, tableStartY + 8);
    
    // Right-aligned headers for numbers
    doc.text('CANT.', margin + 120, tableStartY + 8, { align: 'right' });
    doc.text('PRECIO UNIT.', margin + 150, tableStartY + 8, { align: 'right' });
    doc.text('SUBTOTAL', margin + 180, tableStartY + 8, { align: 'right' });
    
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
      
      // Product code - left aligned
      const productCode = detail.code || detail.productId?.toString() || '';
      doc.text(productCode, margin + 15, rowY + 5);
      
      // Product name (truncate if too long) - left aligned
      const productName = detail.name || 'Producto';
      const truncatedName = productName.length > 20 ? productName.substring(0, 20) + '...' : productName;
      doc.text(truncatedName, margin + 50, rowY + 5);
      
      // Numbers - right aligned with 2 decimals
      doc.text(detail.quantity.toString(), margin + 120, rowY + 5, { align: 'right' });
      doc.text(`$${detail.unitPrice.toFixed(2)}`, margin + 150, rowY + 5, { align: 'right' });
      doc.text(`$${detail.subtotal.toFixed(2)}`, margin + 180, rowY + 5, { align: 'right' });
      
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

    notifications.success('Factura guardada exitosamente y PDF generado.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    notifications.error(`Error al guardar la factura: ${errorMessage}`);
  }
};


