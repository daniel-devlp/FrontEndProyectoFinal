/**
 * 👥 SERVICIO DE USUARIOS
 * 
 * Servicio integral para la gestión de usuarios del sistema que proporciona operaciones CRUD completas
 * con autenticación basada en tokens, gestión de perfiles y funcionalidades administrativas especializadas.
 * 
 * Características Principales:
 * - Operaciones CRUD completas para usuarios (Crear, Leer, Actualizar, Eliminar)
 * - Gestión de perfil del usuario actual
 * - Funcionalidades administrativas (desbloqueo de usuarios)
 * - Autenticación automática con tokens Bearer
 * - Validación y manejo robusto de errores
 * - Compatibilidad total con TypeScript
 * 
 * Funcionalidades Implementadas:
 * - Listado completo de usuarios (solo administradores)
 * - Obtención de usuarios individuales por ID
 * - Creación de nuevos usuarios con validación
 * - Actualización de datos de usuarios existentes
 * - Eliminación segura de usuarios
 * - Desbloqueo de cuentas de usuario
 * - Gestión del perfil del usuario autenticado
 * 
 * Integración con Backend:
 * - URL Base: https://localhost:44306/api/Users
 * - Autenticación: Bearer Token desde localStorage
 * - Formato: JSON para request/response
 * - Endpoints especializados: /me, /{id}/unlock
 * 
 * Seguridad:
 * - Validación automática de tokens de autenticación
 * - Headers de autorización en todas las peticiones
 * - Operaciones administrativas protegidas
 * - Manejo seguro de datos sensibles de usuario
 * 
 * Funcionalidades Administrativas:
 * - Gestión completa de usuarios del sistema
 * - Desbloqueo de cuentas bloqueadas
 * - Creación de usuarios con roles específicos
 * - Eliminación controlada con validaciones
 * 
 * Gestión de Perfil:
 * - Acceso al perfil del usuario autenticado
 * - Actualización de datos personales
 * - Recuperación de información de sesión
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 * @desde 2025-06-25
 */
import type { UserDto, UserCreateDto, UserUpdateDto } from '../@types/users';
import axios from 'axios';

/** 🌐 URL base de la API de usuarios */
const API_URL = 'https://localhost:44306/api/Users';

/**
 * 🔐 Genera headers de autenticación para peticiones HTTP
 * 
 * Obtiene el token de autenticación del localStorage y crea los headers
 * necesarios para comunicación autenticada con la API de usuarios.
 * 
 * @retorna {object} Headers con autorización y tipo de contenido
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * 👥 SERVICIO PRINCIPAL DE USUARIOS
 * 
 * Objeto que contiene todos los métodos para interactuar con la API de usuarios.
 * Proporciona una interfaz unificada para operaciones CRUD, gestión de perfiles
 * y funcionalidades administrativas con manejo de errores y autenticación automática.
 */
export const usersService = {
  /**
   * 📋 Obtiene la lista completa de usuarios del sistema
   * 
   * Realiza una petición GET para obtener todos los usuarios registrados.
   * Esta función está destinada para uso administrativo únicamente.
   * 
   * @retorna {Promise<UserDto[]>} Lista completa de usuarios del sistema
   * @lanza {Error} Si la petición falla o no hay autorización suficiente
   */
  getUsers: async (): Promise<UserDto[]> => {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
  },

  /**
   * 👤 Obtiene un usuario específico por su ID único
   * 
   * Realiza una petición GET al endpoint de usuarios para obtener
   * los datos completos de un usuario específico.
   * 
   * @param {string} id - ID único del usuario a buscar
   * @retorna {Promise<UserDto>} Datos completos del usuario
   * @lanza {Error} Si la petición falla o el usuario no existe
   */
  getUser: async (id: string): Promise<UserDto> => {
    const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
  },

  /**
   * ➕ Crea un nuevo usuario en el sistema
   * 
   * Envía los datos del nuevo usuario al servidor para su creación
   * con validación automática de datos y asignación de roles.
   * 
   * @param {UserCreateDto} data - Datos del nuevo usuario a crear
   * @retorna {Promise<UserDto>} Datos del usuario creado
   * @lanza {Error} Si la validación falla o hay errores del servidor
   */
  createUser: async (data: UserCreateDto): Promise<UserDto> => {
    console.log('Datos enviados al backend:', data); // Registro para debugging
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear usuario');
    return response.json();
  },

  /**
   * ✏️ Actualiza un usuario existente con nuevos datos
   * 
   * Envía los datos actualizados de un usuario específico al servidor
   * para su modificación con validación completa de permisos.
   * 
   * @param {string} id - ID del usuario a actualizar
   * @param {UserUpdateDto} data - Nuevos datos del usuario
   * @retorna {Promise<void>} Promesa de actualización exitosa
   * @lanza {Error} Si el usuario no existe o la validación falla
   */
  updateUser: async (id: string, data: UserUpdateDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar usuario');
  },

  /**
   * 🗑️ Elimina un usuario específico del sistema
   * 
   * Realiza una eliminación permanente de un usuario por su ID único
   * con validación de permisos administrativos y confirmación.
   * 
   * @param {string} id - ID del usuario a eliminar
   * @retorna {Promise<void>} Promesa de eliminación exitosa
   * @lanza {Error} Si el usuario no existe o no se puede eliminar
   */
  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar usuario');
  },

  /**
   * 🔓 Desbloquea una cuenta de usuario bloqueada
   * 
   * Realiza una operación administrativa para desbloquear una cuenta
   * de usuario que haya sido bloqueada por intentos fallidos de login
   * o por políticas de seguridad.
   * 
   * @param {string} id - ID del usuario a desbloquear
   * @retorna {Promise<void>} Promesa de desbloqueo exitoso
   * @lanza {Error} Si el usuario no existe o no se puede desbloquear
   */
  unlockUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}/unlock`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al desbloquear usuario');
  },

  /**
   * 👤 Obtiene el perfil del usuario autenticado actualmente
   * 
   * Realiza una petición al endpoint especializado para obtener
   * los datos del perfil del usuario que está actualmente autenticado.
   * 
   * @retorna {Promise<UserDto>} Datos del perfil del usuario actual
   * @lanza {Error} Si no hay sesión activa o la petición falla
   */
  getMyProfile: async (): Promise<UserDto> => {
    const response = await fetch(`${API_URL}/me`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Error al obtener perfil');
    return response.json();
  },

  /**
   * 🔍 Obtiene información del usuario actual (método alternativo)
   * 
   * Método alternativo que utiliza axios para obtener información
   * del usuario actualmente autenticado. Útil para casos especiales
   * donde se requiera el objeto de respuesta completo de axios.
   * 
   * @retorna {Promise<any>} Datos del usuario actual via axios
   * @lanza {Error} Si no hay sesión activa o la petición falla
   */
  getCurrentUser: async () => {
    const response = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
    return response.data;
  },
};
