/**
 * 👥 DEFINICIONES DE TIPOS PARA CLIENTES
 * 
 * Este archivo contiene todas las definiciones de tipos TypeScript relacionadas con
 * la gestión de clientes en el sistema de facturación. Proporciona interfaces robustas
 * para garantizar la coherencia de datos y la seguridad de tipos en toda la aplicación.
 * 
 * Propósito:
 * - Definir contratos de datos para entidades de clientes
 * - Asegurar consistencia en operaciones CRUD de clientes
 * - Facilitar la validación automática de tipos en tiempo de compilación
 * - Proporcionar interfaces claras para componentes y servicios
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
 * 📝 Interfaz base para datos de clientes
 * 
 * Define la estructura fundamental de un cliente con todos los campos
 * básicos requeridos para identificación y contacto.
 */
interface Client {
  /** Número de identificación único del cliente */
  Identification: string;
  /** Primer nombre del cliente */
  FirstName: string;
  /** Apellido del cliente */
  LastName: string;
  /** Número de teléfono (opcional) */
  Phone?: string | null;
  /** Dirección de correo electrónico (opcional) */
  Email?: string | null;
  /** Dirección física (opcional) */
  Address?: string | null;
}

/**
 * 📋 Interfaz para valores de formularios de clientes
 * 
 * Extiende la interfaz Client pero hace opcional el campo Identification
 * para casos donde se edita un cliente existente.
 */
interface ClientFormValues extends Omit<Client, 'Identification'> {
  /** Identificación opcional para formularios de edición */
  Identification?: string;
}

/**
 * 🔗 Interfaz extendida para clientes con relaciones
 * 
 * Incluye datos relacionales como facturas asociadas al cliente
 * para operaciones que requieren datos completos.
 */
interface FullClient extends Client {
  /** Lista de facturas asociadas al cliente (opcional) */
  Invoices?: Invoice[];
}

/**
 * 🔍 Interfaz para filtros de búsqueda de clientes
 * 
 * Define los parámetros disponibles para filtrar y buscar clientes
 * en listados paginados y operaciones de consulta.
 */
interface ClientFilters {
  /** Término de búsqueda general */
  search?: string;
  /** Filtro por número de identificación */
  byIdentification?: string;
  /** Filtro por primer nombre */
  byFirstName?: string;
  /** Filtro por correo electrónico */
  byEmail?: string;
  /** Límite de resultados por consulta */
  limit?: number;
}

/**
 * 🏢 DTO principal para datos de clientes desde la API
 * 
 * Interfaz que representa la estructura exacta de datos de clientes
 * tal como la devuelve la API del backend.
 */
export interface ClientDto {
  /** ID único del cliente en la base de datos */
  clientId: number;
  /** Tipo de identificación (siempre 'cedula' en Costa Rica) */
  identificationType: 'cedula';
  /** Número de identificación del cliente */
  identificationNumber: string;
  /** Primer nombre del cliente */
  firstName: string;
  /** Apellido del cliente */
  lastName: string;
  /** Correo electrónico del cliente */
  email: string;
  /** Número de teléfono del cliente */
  phone: string;
  /** Dirección del cliente */
  address: string;
}

/**
 * ➕ DTO para creación de nuevos clientes
 * 
 * Interfaz que define los datos requeridos para crear un nuevo cliente
 * en el sistema a través de la API.
 */
export interface ClientCreateDto {
  /** Tipo de identificación (siempre 'cedula' para Costa Rica) */
  identificationType: 'cedula';
  /** Número de identificación único */
  identificationNumber: string;
  /** Primer nombre del cliente */
  firstName: string;
  /** Apellido del cliente */
  lastName: string;
  /** Correo electrónico del cliente */
  email: string;
  /** Número de teléfono del cliente */
  phone: string;
  /** Dirección del cliente */
  address: string;
}

/**
 * ✏️ DTO para actualización de clientes existentes
 * 
 * Interfaz que define los datos necesarios para actualizar un cliente
 * existente, incluyendo su ID para identificación.
 */
export interface ClientUpdateDto {
  /** ID único del cliente a actualizar */
  clientId: number;
  /** Tipo de identificación (siempre 'cedula' para Costa Rica) */
  identificationType: 'cedula';
  /** Número de identificación único */
  identificationNumber: string;
  /** Primer nombre del cliente */
  firstName: string;
  /** Apellido del cliente */
  lastName: string;
  /** Correo electrónico del cliente */
  email: string;
  /** Número de teléfono del cliente */
  phone: string;
  /** Dirección del cliente */
  address: string;
}
