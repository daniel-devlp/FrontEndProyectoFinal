/**
 * 🎭 DEFINICIONES DE TIPOS PARA ROLES
 * 
 * Este archivo contiene todas las definiciones de tipos TypeScript relacionadas con
 * la gestión de roles y permisos en el sistema de facturación. Proporciona interfaces
 * robustas para garantizar la coherencia en el control de acceso basado en roles (RBAC).
 * 
 * Propósito:
 * - Definir contratos de datos para entidades de roles y permisos
 * - Asegurar consistencia en operaciones CRUD de roles
 * - Facilitar la validación automática de tipos para autorización
 * - Proporcionar interfaces claras para componentes de administración
 * 
 * Funcionalidades Cubiertas:
 * - Gestión completa de roles del sistema
 * - Control de acceso basado en roles (RBAC)
 * - Asignación y modificación de permisos
 * - Jerarquía de roles para diferentes niveles de acceso
 * - Validación de permisos en operaciones críticas
 * 
 * Roles del Sistema:
 * - Administrador: Acceso completo al sistema
 * - Usuario: Acceso limitado a funciones básicas
 * - Roles personalizados: Configurables según necesidades
 * 
 * Compatibilidad:
 * - Compatible con las respuestas de la API del backend
 * - Integrado con sistema de autenticación JWT
 * - Soporte completo para operaciones asíncronas con Promises
 * - Optimizado para middleware de autorización
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 * @desde 2025-06-25
 */

/**
 * 🎭 DTO principal para datos de roles desde la API
 * 
 * Interfaz que representa la estructura exacta de datos de roles
 * tal como la devuelve la API del backend.
 */
export interface RoleDto {
  /** ID único del rol en el sistema */
  id: string;
  /** Nombre descriptivo del rol */
  name: string;
}

/**
 * ➕ DTO para creación de nuevos roles
 * 
 * Interfaz que define los datos requeridos para crear un nuevo rol
 * en el sistema a través de la API.
 */
export interface RoleCreateDto {
  /** Nombre del nuevo rol a crear */
  name: string;
}

/**
 * ✏️ DTO para actualización de roles existentes
 * 
 * Interfaz que define los datos necesarios para actualizar un rol
 * existente, incluyendo su ID para identificación.
 */
export interface RoleUpdateDto {
  /** ID único del rol a actualizar */
  id: string;
  /** Nuevo nombre del rol */
  name: string;
}
