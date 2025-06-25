/**
 * 🏷️ DEFINICIONES DE TIPOS PARA PRODUCTOS
 * 
 * Este archivo contiene todas las definiciones de tipos TypeScript relacionadas con
 * la gestión de productos en el sistema de facturación. Proporciona interfaces robustas
 * para garantizar la coherencia de datos y la seguridad de tipos en el catálogo de productos.
 * 
 * Propósito:
 * - Definir contratos de datos para entidades de productos
 * - Asegurar consistencia en operaciones CRUD de productos
 * - Facilitar la validación automática de tipos en tiempo de compilación
 * - Proporcionar interfaces claras para componentes de catálogo y facturación
 * 
 * Funcionalidades Cubiertas:
 * - Gestión de inventario con control de stock
 * - Operaciones de pricing y actualizaciones de precios
 * - Integración con sistema de facturación
 * - Filtros avanzados para búsqueda de productos
 * - Selección de productos para facturación
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
 * 📦 Interfaz base para datos de productos
 * 
 * Define la estructura fundamental de un producto con campos
 * esenciales para identificación, pricing y control de inventario.
 */
interface Product {
  /** ID único del producto en el sistema */
  ProductID: number;
  /** Nombre del producto */
  Name: string;
  /** Precio unitario del producto */
  Price: number;
  /** Cantidad disponible en inventario */
  Stock: number;
}

/**
 * 📋 Interfaz para valores de formularios de productos
 * 
 * Extiende la interfaz Product pero hace opcional el campo ProductID
 * para casos donde se crea un nuevo producto.
 */
interface ProductFormValues extends Omit<Product, 'ProductID'> {
  /** ID del producto opcional para formularios de edición */
  ProductID?: number;
}

/**
 * 🔗 Interfaz extendida para productos con relaciones
 * 
 * Incluye datos relacionales como detalles de facturas donde
 * aparece el producto para operaciones que requieren datos completos.
 */
interface ProductWithDetails extends Product {
  /** Lista de detalles de facturas donde aparece este producto (opcional) */
  InInvoices?: InvoiceDetail[];
}

/**
 * 🔍 Interfaz para filtros de búsqueda de productos
 * 
 * Define los parámetros disponibles para filtrar y buscar productos
 * en listados paginados con capacidades avanzadas de filtrado.
 */
interface ProductFilters {
  /** Término de búsqueda general */
  search?: string;
  /** Precio mínimo para filtrado */
  minPrice?: number;
  /** Precio máximo para filtrado */
  maxPrice?: number;
  /** Filtrar solo productos en stock */
  inStock?: boolean;
  /** Campo por el cual ordenar resultados */
  orderBy?: 'name' | 'price' | 'stock';
  /** Dirección del ordenamiento */
  order?: 'asc' | 'desc';
  /** Límite de resultados por consulta */
  limit?: number;
}

/**
 * 🛒 Interfaz para productos seleccionados en facturación
 * 
 * Extiende la interfaz Product con campos adicionales necesarios
 * para el proceso de facturación y cálculo de totales.
 */
interface SelectedProduct extends Product {
  /** Cantidad seleccionada del producto */
  Quantity: number;
  /** Subtotal calculado (Quantity × Price) */
  Subtotal: number;
}

/**
 * 🏪 DTO principal para datos de productos desde la API
 * 
 * Interfaz que representa la estructura exacta de datos de productos
 * tal como la devuelve la API del backend.
 */
export interface ProductDto {
  /** ID único del producto en la base de datos */
  productId: number;
  /** Código único del producto */
  code: string;
  /** Nombre del producto */
  name: string;
  /** Descripción detallada del producto */
  description: string;
  /** Precio unitario del producto */
  price: number;
  /** Cantidad disponible en inventario */
  stock: number;
}

/**
 * ➕ DTO para creación de nuevos productos
 * 
 * Interfaz que define los datos requeridos para crear un nuevo producto
 * en el sistema a través de la API.
 */
export interface ProductCreateDto {
  /** Código único del producto */
  code: string;
  /** Nombre del producto */
  name: string;
  /** Descripción detallada del producto */
  description: string;
  /** Precio unitario del producto */
  price: number;
  /** Cantidad inicial en inventario */
  stock: number;
}

/**
 * ✏️ DTO para actualización de productos existentes
 * 
 * Interfaz que define los datos necesarios para actualizar un producto
 * existente, incluyendo su ID para identificación.
 */
export interface ProductUpdateDto {
  /** ID único del producto a actualizar */
  productId: number;
  /** Código único del producto */
  code: string;
  /** Nombre del producto */
  name: string;
  /** Descripción detallada del producto */
  description: string;
  /** Precio unitario del producto */
  price: number;
  /** Cantidad disponible en inventario */
  stock: number;
}
