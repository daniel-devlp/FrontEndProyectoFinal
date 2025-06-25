/**
 * 👥 DEFINICIONES DE TIPOS PARA USUARIOS
 * 
 * Este archivo contiene todas las definiciones de tipos TypeScript relacionadas con
 * la gestión de usuarios en el sistema de facturación. Proporciona interfaces robustas
 * para garantizar la coherencia en la administración de cuentas de usuario y autenticación.
 * 
 * Propósito:
 * - Definir contratos de datos para entidades de usuarios
 * - Asegurar consistencia en operaciones CRUD de usuarios
 * - Facilitar la validación automática de tipos para autenticación
 * - Proporcionar interfaces claras para componentes de administración de usuarios
 * 
 * Funcionalidades Cubiertas:
 * - Gestión completa de usuarios del sistema
 * - Autenticación y autorización de usuarios
 * - Asignación de roles y permisos a usuarios
 * - Control de estado de cuentas (bloqueo/desbloqueo)
 * - Confirmación de correos electrónicos
 * - Gestión de credenciales y perfil de usuario
 * 
 * Características de Seguridad:
 * - Manejo seguro de contraseñas (opcional en lectura)
 * - Control de acceso basado en roles
 * - Estados de cuenta para prevenir accesos no autorizados
 * - Validación de correos electrónicos
 * - Identificación única por número de documento
 * 
 * Compatibilidad:
 * - Compatible con las respuestas de la API del backend
 * - Integrado con sistema de autenticación JWT
 * - Soporte completo para operaciones asíncronas con Promises
 * - Optimizado para React Hook Form y validación de formularios
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 * @desde 2025-06-25
 */

/**
 * 👤 DTO principal para datos de usuarios desde la API
 * 
 * Interfaz que representa la estructura exacta de datos de usuarios
 * tal como la devuelve la API del backend.
 */
export interface UserDto {
  /** ID único del usuario en el sistema */
  id: string;
  /** Nombre de usuario único para login */
  userName: string;
  /** Nombre completo del usuario */
  name: string;
  /** Dirección de correo electrónico del usuario */
  email: string;
  /** Estado de confirmación del correo electrónico */
  emailConfirmed: boolean;
  /** Lista de roles asignados al usuario */
  roles: string[];
  /** Estado de bloqueo de la cuenta */
  isLocked: boolean;
  /** Contraseña del usuario (opcional, solo para operaciones específicas) */
  password?: string;
  /** Número de identificación del usuario (opcional) */
  identificationNumber?: string;
}

/**
 * ➕ DTO para creación de nuevos usuarios
 * 
 * Interfaz que define los datos requeridos para crear un nuevo usuario
 * en el sistema a través de la API.
 */
export interface UserCreateDto {
  /** Nombre de usuario único para login */
  userName: string;
  /** Nombre completo del usuario */
  name: string;
  /** Dirección de correo electrónico del usuario */
  email: string;
  /** Contraseña inicial del usuario */
  password: string;
  /** Lista de roles a asignar al nuevo usuario */
  roles: string[];
  /** Número de identificación del usuario (opcional) */
  identificationNumber?: string;
}

/**
 * ✏️ DTO para actualización de usuarios existentes
 * 
 * Interfaz que define los datos necesarios para actualizar un usuario
 * existente, incluyendo su ID para identificación.
 */
export interface UserUpdateDto {
  /** ID único del usuario a actualizar */
  id: string;
  /** Número de identificación del usuario */
  identificationNumber: string;
  /** Dirección de correo electrónico del usuario */
  email: string;
  /** Nombre de usuario único para login */
  userName: string;
  /** Estado de confirmación del correo electrónico */
  emailConfirmed: boolean;
  /** Lista de roles asignados al usuario */
  roles: string[];
  /** Estado de bloqueo de la cuenta */
  isLocked: boolean;
}
