/**
 * 🧾 DEFINICIONES DE TIPOS PARA FACTURAS
 * 
 * Este archivo contiene todas las definiciones de tipos TypeScript relacionadas con
 * la gestión de facturas en el sistema. Proporciona interfaces robustas para garantizar
 * la coherencia de datos en todo el proceso de facturación.
 * 
 * Propósito:
 * - Definir contratos de datos para entidades de facturación
 * - Asegurar consistencia en operaciones CRUD de facturas
 * - Facilitar la validación automática de tipos para facturación
 * - Proporcionar interfaces claras para componentes de facturación
 * 
 * Funcionalidades Cubiertas:
 * - Facturación completa con detalles de productos
 * - Relaciones entre facturas, clientes y usuarios
 * - Cálculos automáticos de totales y subtotales
 * - Filtros avanzados para búsqueda de facturas
 * - Formularios de creación y edición de facturas
 * 
 * Compatibilidad:
 * - Compatible con las respuestas de la API del backend
 * - Integrado con React Hook Form para validación de formularios
 * - Soporte completo para operaciones asíncronas con Promises
 * - Optimizado para uso con React Query y estado global
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 * @desde 2025-06-25
 */

/**
 * 🧾 Interfaz base para datos de facturas
 * 
 * Define la estructura fundamental de una factura con campos
 * esenciales para identificación, relaciones y cálculos.
 */
interface Invoice {
  /** ID único de la factura en el sistema */
  InvoiceID: number;
  /** Número de identificación del cliente */
  ClientIDNumber: string;
  /** ID del usuario que creó la factura */
  UserID: number;
  /** Fecha de creación de la factura */
  Date: string | Date;
  /** Total calculado de la factura */
  Total: number;
  /** Datos del cliente asociado (relación opcional) */
  Client?: Client;
  /** Datos del usuario que creó la factura (relación opcional) */
  User?: User;
  /** Lista de detalles/líneas de la factura (relación opcional) */
  Details?: InvoiceDetail[];
}

/**
 * 📋 Interfaz para detalles/líneas de factura
 * 
 * Define la estructura de cada línea de producto dentro de una factura
 * con cálculos automáticos de subtotales.
 */
interface InvoiceDetail {
  /** ID único del detalle */
  DetailID: number;
  /** ID de la factura padre (clave foránea) */
  InvoiceID_FK: number;
  /** ID del producto (clave foránea) */
  ProductID_FK: number;
  /** Cantidad del producto en esta línea */
  Quantity: number;
  /** Precio unitario del producto en el momento de la factura */
  UnitPrice: number;
  /** Subtotal calculado (Quantity × UnitPrice) */
  Subtotal: number;
  /** Datos del producto asociado (relación opcional) */
  Product?: Product;
}

/**
 * 📝 Interfaz para valores de formularios de facturas
 * 
 * Define la estructura de datos para formularios de creación y edición
 * de facturas con validación de productos y cantidades.
 */
interface InvoiceFormValues {
  /** Número de identificación del cliente */
  ClientIDNumber: string;
  /** Lista de productos con cantidades y precios */
  Products: Array<{
    /** ID del producto seleccionado */
    ProductID: number;
    /** Cantidad solicitada */
    Quantity: number;
    /** Precio unitario del producto */
    UnitPrice: number;
  }>;
  /** ID del usuario que crea la factura */
  UserID: number;
}

/**
 * 🔗 Interfaz extendida para facturas con datos completos
 * 
 * Incluye todos los datos relacionales completos de una factura
 * para operaciones que requieren información detallada.
 */
interface FullInvoice extends Invoice {
  /** Detalles completos con información de productos */
  Details: Array<InvoiceDetail & { Product: Product }>;
}

/**
 * 🔍 Interfaz para filtros de búsqueda de facturas
 * 
 * Define los parámetros disponibles para filtrar y buscar facturas
 * en listados paginados con capacidades avanzadas de filtrado.
 */
interface InvoiceFilters {
  /** Fecha de inicio para filtrado por rango */
  from?: string | Date;
  /** Fecha de fin para filtrado por rango */
  to?: string | Date;
  /** Filtrar por cliente específico */
  byClient?: string;
  /** Filtrar por usuario específico */
  byUser?: number;
  /** Campo por el cual ordenar resultados */
  orderBy?: 'date' | 'total';
  /** Dirección del ordenamiento */
  order?: 'asc' | 'desc';
  /** Límite de resultados por consulta */
  limit?: number;
}

/**
 * 🧾 DTO principal para datos de facturas desde la API
 * 
 * Interfaz que representa la estructura exacta de datos de facturas
 * tal como la devuelve la API del backend.
 */
export interface InvoiceDto {
  /** ID único de la factura en la base de datos */
  invoiceId: number;
  /** Número de factura generado automáticamente */
  invoiceNumber: string;
  /** Datos completos del cliente asociado */
  client: ClientDto;
  /** Fecha de emisión de la factura */
  issueDate: string;
  /** Total calculado de la factura */
  total: number;
}

/**
 * ✏️ DTO para actualización de facturas existentes
 * 
 * Interfaz que define los datos necesarios para actualizar una factura
 * existente con nuevos detalles de productos.
 */
interface InvoiceUpdateDto {
  /** ID del cliente asociado */
  clientId: number;
  /** Fecha de emisión de la factura */
  issueDate: string;
  /** Lista de detalles de productos actualizados */
  invoiceDetails: Array<{
    /** ID del producto */
    productId: number;
    /** Cantidad del producto */
    quantity: number;
    /** Precio unitario del producto */
    unitPrice: number;
  }>;
}

/**
 * ➕ DTO para creación de nuevas facturas
 * 
 * Interfaz que define los datos requeridos para crear una nueva factura
 * en el sistema a través de la API.
 */
interface InvoiceCreateDto {
  /** Número de factura único */
  invoiceNumber: string;
  /** ID del cliente asociado */
  clientId: number;
  /** ID del usuario que crea la factura */
  userId: string;
  /** Fecha de emisión de la factura */
  issueDate: string;
  /** Observaciones adicionales de la factura */
  observations: string;
  /** Lista de detalles de productos */
  invoiceDetails: Array<{
    /** ID del producto */
    productId: number;
    /** Cantidad del producto */
    quantity: number;
    /** Precio unitario del producto */
    unitPrice: number;
  }>;
}

/**
 * 📋 DTO para detalles individuales de factura
 * 
 * Interfaz simplificada para representar una línea de producto
 * en una factura con información básica.
 */
interface InvoiceDetailDto {
  /** ID del producto */
  productId: number;
  /** Cantidad del producto */
  quantity: number;
  /** Precio unitario del producto */
  unitPrice: number;
}

/**
 * 👥 DTO de cliente para contexto de facturación
 * 
 * Interfaz específica para datos de cliente en el contexto
 * de facturación con campos opcionales.
 */
export interface ClientDto {
  /** ID único del cliente */
  clientId: number;
  /** Tipo de identificación */
  identificationType: 'cedula';
  /** Número de identificación */
  identificationNumber: string;
  /** Primer nombre del cliente */
  firstName: string;
  /** Apellido del cliente */
  lastName: string;
  /** Correo electrónico (opcional) */
  email?: string;
  /** Teléfono (opcional) */
  phone?: string;
  /** Dirección (opcional) */
  address?: string;
}

/**
 * 🏷️ DTO de producto para contexto de facturación
 * 
 * Interfaz simplificada para datos de producto en el contexto
 * de facturación con información esencial.
 */
interface ProductDto {
  /** ID único del producto */
  productId: number;
  /** Nombre del producto */
  name: string;
  /** Precio unitario del producto */
  price: number;
  /** Stock disponible del producto */
  stock: number;
}
