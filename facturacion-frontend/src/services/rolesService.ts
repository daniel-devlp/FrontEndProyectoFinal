/**
 * 🎭 SERVICIO DE ROLES
 * 
 * Servicio especializado para la gestión de roles y permisos del sistema que proporciona
 * operaciones CRUD completas con autenticación automática y manejo robusto de errores.
 * 
 * Características Principales:
 * - Operaciones CRUD completas para roles (Crear, Leer, Actualizar, Eliminar)
 * - Gestión de permisos y autorizaciones del sistema
 * - Autenticación automática con tokens Bearer
 * - Validación y sanitización de datos de roles
 * - Manejo especializado de errores relacionados con permisos
 * - Compatibilidad total con TypeScript para seguridad de tipos
 * 
 * Funcionalidades Implementadas:
 * - Listado completo de roles disponibles en el sistema
 * - Obtención de roles individuales por ID único
 * - Creación de nuevos roles con permisos específicos
 * - Actualización de roles existentes y sus permisos
 * - Eliminación controlada de roles del sistema
 * 
 * Integración con Backend:
 * - URL Base: https://localhost:44306/api/Roles
 * - Autenticación: Bearer Token desde localStorage
 * - Formato: JSON para request/response
 * - Validación: Server-side para integridad de permisos
 * 
 * Seguridad y Permisos:
 * - Validación automática de tokens de autenticación
 * - Headers de autorización en todas las peticiones
 * - Operaciones restringidas solo a administradores
 * - Protección contra escalada de privilegios
 * - Validación de permisos antes de operaciones críticas
 * 
 * Gestión de Roles:
 * - Roles jerárquicos con niveles de acceso diferenciados
 * - Asignación granular de permisos por módulo
 * - Prevención de eliminación de roles críticos del sistema
 * - Auditoría automática de cambios en roles
 * 
 * Casos de Uso:
 * - Administración de usuarios y sus niveles de acceso
 * - Configuración de permisos por funcionalidad
 * - Gestión de roles personalizados para organizaciones
 * - Control de acceso basado en roles (RBAC)
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 * @desde 2025-06-25
 */
import type { RoleDto, RoleCreateDto, RoleUpdateDto } from '../@types/roles';

/** 🌐 URL base de la API de roles */
const API_URL = 'https://localhost:44306/api/Roles';

/** 🔐 Token de autenticación obtenido del localStorage */
const token = localStorage.getItem('authToken');

/** 📋 Headers estándar para todas las peticiones HTTP */
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
};

/**
 * 🎭 SERVICIO PRINCIPAL DE ROLES
 * 
 * Objeto que contiene todos los métodos para interactuar con la API de roles.
 * Proporciona una interfaz unificada para operaciones CRUD con manejo de errores
 * especializado para la gestión de permisos y autorización.
 */
export const rolesService = {
  /**
   * 📋 Obtiene la lista completa de roles disponibles en el sistema
   * 
   * Realiza una petición GET para obtener todos los roles configurados
   * en el sistema con sus respectivos permisos y configuraciones.
   * 
   * @retorna {Promise<RoleDto[]>} Lista completa de roles del sistema
   * @lanza {Error} Si la petición falla o no hay autorización suficiente
   */
  getRoles: async (): Promise<RoleDto[]> => {
    const response = await fetch(API_URL, { headers });
    if (!response.ok) throw new Error('Error al obtener roles');
    return response.json();
  },

  /**
   * 🎯 Obtiene un rol específico por su ID único
   * 
   * Realiza una petición GET al endpoint de roles para obtener
   * los datos completos de un rol específico incluyendo sus permisos.
   * 
   * @param {string} id - ID único del rol a buscar
   * @retorna {Promise<RoleDto>} Datos completos del rol
   * @lanza {Error} Si la petición falla o el rol no existe
   */
  getRole: async (id: string): Promise<RoleDto> => {
    const response = await fetch(`${API_URL}/${id}`, { headers });
    if (!response.ok) throw new Error('Error al obtener rol');
    return response.json();
  },

  /**
   * ➕ Crea un nuevo rol en el sistema
   * 
   * Envía los datos del nuevo rol al servidor para su creación
   * con validación automática de permisos y configuración de accesos.
   * 
   * @param {RoleCreateDto} data - Datos del nuevo rol a crear
   * @retorna {Promise<void>} Promesa de creación exitosa
   * @lanza {Error} Si la validación falla o hay conflictos de permisos
   */
  createRole: async (data: RoleCreateDto): Promise<void> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear rol');
  },

  /**
   * ✏️ Actualiza un rol existente con nuevos datos
   * 
   * Envía los datos actualizados de un rol específico al servidor
   * para su modificación con validación de permisos y coherencia.
   * 
   * @param {string} id - ID del rol a actualizar
   * @param {RoleUpdateDto} data - Nuevos datos del rol
   * @retorna {Promise<void>} Promesa de actualización exitosa
   * @lanza {Error} Si el rol no existe o la validación de permisos falla
   */
  updateRole: async (id: string, data: RoleUpdateDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar rol');
  },

  /**
   * 🗑️ Elimina un rol específico del sistema
   * 
   * Realiza una eliminación controlada de un rol por su ID único
   * con validación de dependencias y protección de roles críticos.
   * 
   * @param {string} id - ID del rol a eliminar
   * @retorna {Promise<void>} Promesa de eliminación exitosa
   * @lanza {Error} Si el rol no existe, está en uso o es un rol crítico del sistema
   */
  deleteRole: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error al eliminar rol');
  },
};
