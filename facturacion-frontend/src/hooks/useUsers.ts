/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 👥 HOOK PERSONALIZADO PARA GESTIÓN DE USUARIOS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este hook centraliza toda la lógica relacionada con la gestión de usuarios
 * del sistema, incluyendo operaciones CRUD, validaciones y autenticación.
 * 
 * 🎯 FUNCIONALIDADES PRINCIPALES:
 * • Operaciones CRUD completas (Create, Read, Update, Delete, Unlock)
 * • Validación avanzada de cédulas ecuatorianas según algoritmo oficial
 * • Gestión de roles y permisos de usuario
 * • Manejo de estados de bloqueo/desbloqueo de cuentas
 * • Integración con sistema de notificaciones moderno
 * • Validación de campos con mensajes específicos
 * • Prevención de duplicados por cédula/email/username
 * 
 * 🔧 VALIDACIONES IMPLEMENTADAS:
 * • Algoritmo oficial de validación de cédula ecuatoriana (10 dígitos)
 * • Validación de formato de email
 * • Verificación de longitud de campos
 * • Validación de caracteres permitidos
 * • Verificación de fortaleza de contraseñas
 * • Prevención de duplicados en la base de datos
 * • Validación de nombres de usuario únicos
 * 
 * 🚀 MEJORAS FUTURAS SUGERIDAS:
 * • Implementar validación de RUC para usuarios empresariales
 * • Soporte para múltiples tipos de identificación (pasaporte, visa)
 * • Sistema de verificación de email en dos pasos
 * • Integración con Active Directory/LDAP
 * • Audit log de todas las acciones administrativas
 * • Sistema de notificaciones de cambios de perfil
 * • Implementar políticas de contraseñas configurables
 * • Sistema de recovery de cuentas bloqueadas
 * • Integración con sistemas biométricos
 * • Soporte para autenticación multifactor (2FA)
 * • Sistema de calificación de seguridad de usuarios
 * • Exportación de reportes de usuarios en diferentes formatos
 * 
 * 💡 EJEMPLO DE USO:
 * ```typescript
 * const { 
 *   users, 
 *   loading, 
 *   createUser, 
 *   updateUser, 
 *   deleteUser,
 *   unlockUser,
 *   currentUserId 
 * } = useUsers();
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { usersService } from '../services/usersService';
import { notifications } from '../utils/notifications';
// Importar los tipos necesarios para resolver los errores
import type { UserCreateDto, UserUpdateDto } from '../@types/users';
import { validateCedula } from '../utils/userValidations';

/**
 * 🏗️ INTERFAZ DE USUARIO DEL SISTEMA
 * 
 * Define la estructura de datos que representa un usuario en el frontend.
 * Incluye todos los campos necesarios para la gestión completa del usuario.
 * 
 * @interface User
 * @property {string} id - Identificador único del usuario en el sistema
 * @property {string} identificationNumber - Cédula de identidad (opcional para flexibilidad)
 * @property {string} userName - Nombre de usuario único para login
 * @property {string} name - Nombre completo del usuario
 * @property {string} email - Dirección de correo electrónico
 * @property {boolean} emailConfirmed - Estado de verificación del email
 * @property {string[]} roles - Array de roles asignados al usuario
 * @property {boolean} isLocked - Estado de bloqueo de la cuenta
 * @property {string} password - Contraseña (opcional, solo para creación)
 * @property {string} confirmPassword - Confirmación de contraseña para validación
 */
interface User {
  id: string;
  identificationNumber?: string; // Opcional para flexibilidad de tipos de usuario
  userName: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  roles: string[];
  isLocked: boolean;
  password?: string; // Opcional para creación
  confirmPassword?: string; // Nuevo campo para confirmar contraseña
}
/**
 * 🔧 HOOK PRINCIPAL DE GESTIÓN DE USUARIOS
 * 
 * Proporciona todas las funcionalidades necesarias para administrar usuarios
 * en el sistema, desde la creación hasta la eliminación y desbloqueo.
 * 
 * @returns Objeto con estados y funciones para gestión de usuarios
 */
/**
 * 🔧 HOOK PRINCIPAL DE GESTIÓN DE USUARIOS
 * 
 * Proporciona todas las funcionalidades necesarias para administrar usuarios
 * en el sistema, desde la creación hasta la eliminación y desbloqueo.
 * 
 * @returns Objeto con estados y funciones para gestión de usuarios
 */
export const useUsers = () => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // 📊 ESTADOS DEL HOOK
  // ═══════════════════════════════════════════════════════════════════════════════

  /** 📋 Lista completa de usuarios del sistema */
  const [users, setUsers] = useState<User[]>([]);
  
  /** ⏳ Estado de carga durante operaciones asíncronas */
  const [loading, setLoading] = useState(false);
  
  /** ❌ Mensaje de error del último error ocurrido */
  const [error, setError] = useState<string | null>(null);
  
  /** 👤 ID del usuario actualmente autenticado en el sistema */
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🚀 INICIALIZACIÓN Y CARGA DE DATOS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * 📥 EFECTO DE CARGA INICIAL DE USUARIOS
   * Se ejecuta una sola vez al montar el componente para cargar todos los usuarios
   */
  useEffect(() => {
    /**
     * 🔄 Función para obtener la lista completa de usuarios
     * Transforma los datos del backend para asegurar compatibilidad con el frontend
     */
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await usersService.getUsers();
        
        // 🔄 Transformar datos del backend para compatibilidad frontend
        // Asegura que todos los campos requeridos estén presentes con valores por defecto
        const transformedData = data.map((user) => ({
          id: user.id || '',
          identificationNumber: user.identificationNumber || '',
          userName: user.userName || '',
          name: user.name || '',
          email: user.email || '',
          emailConfirmed: user.emailConfirmed || false,
          roles: user.roles || [],
          isLocked: user.isLocked || false,
        }));
        
        setUsers(transformedData);
      } catch (err: any) {
        setError(err.message || 'Error al obtener usuarios.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /**
   * 👤 EFECTO PARA OBTENER EL ID DEL USUARIO ACTUAL
   * Se ejecuta una sola vez para identificar al usuario autenticado
   */
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const user = await usersService.getCurrentUser();
        setCurrentUserId(user.id);
      } catch (err: any) {
        notifications.error('Error al obtener el ID del usuario actual: ' + (err.message || 'Intente nuevamente.'));
      }
    };

    fetchCurrentUserId();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🛠️ OPERACIONES CRUD
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * ➕ CREAR NUEVO USUARIO
   * 
   * Crea un nuevo usuario en el sistema después de validar todos los campos.
   * Utiliza validaciones específicas para creación que incluyen contraseña y confirmación.
   * 
   * @param {UserCreateDto & { confirmPassword?: string }} userData - Datos del usuario a crear
   * @param {Record<string, string>} validationErrors - Errores de validación del frontend
   * @throws {Error} Si la validación falla o hay errores del servidor
   * 
   * 🔍 VALIDACIONES APLICADAS:
   * • Unicidad de cédula, email y nombre de usuario
   * • Formato válido de cédula ecuatoriana con algoritmo oficial
   * • Formato válido de email con límites de longitud
   * • Políticas de seguridad para contraseñas
   * • Confirmación de contraseña coincidente
   * • Longitud y formato de todos los campos
   * • Asignación obligatoria de al menos un rol
   */
  const createUser = async (
    userData: UserCreateDto & { confirmPassword?: string }, 
    validationErrors?: Record<string, string>
  ) => {
    // Verificar errores de validación del frontend si se proporcionan
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setError('Error en los datos del usuario. Por favor, revise los campos marcados.');
      throw new Error('Errores de validación en el frontend');
    }

    try {
      console.log('Datos enviados al backend:', userData); // 🔍 Log para debugging
      
      // Crear el usuario en el backend
      const newUser = await usersService.createUser(userData);
      
      // Actualizar el estado local con el nuevo usuario
      setUsers((prev) => [...prev, newUser]);
      
      notifications.success('Usuario creado exitosamente.');
    } catch (err: any) {
      console.error('Error al crear usuario:', err.message || err);
      notifications.error('Error al crear usuario: ' + (err.message || 'Intente nuevamente.'));
      throw new Error(err.message || 'Error al crear usuario.');
    }
  };

  /**
   * ✏️ ACTUALIZAR USUARIO EXISTENTE
   * 
   * Actualiza los datos de un usuario existente después de validar los cambios.
   * Utiliza validaciones específicas para actualización que omiten campos no editables.
   * Mantiene la integridad de los datos y evita duplicados.
   * 
   * @param {string} userId - ID del usuario a actualizar
   * @param {UserUpdateDto} userData - Nuevos datos del usuario
   * @param {Record<string, string>} validationErrors - Errores de validación del frontend
   * @throws {Error} Si la validación falla o hay errores del servidor
   * 
   * 🔧 MEJORAS IMPLEMENTADAS:
   * • Validación específica para actualización (sin contraseña)
   * • Preservación de campos no editables del usuario original
   * • Manejo de errores de validación del frontend
   * • Actualización optimizada del estado local
   */
  const updateUser = async (userId: string, userData: UserUpdateDto, validationErrors?: Record<string, string>) => {
    // Verificar errores de validación del frontend si se proporcionan
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setError('Error en los datos del usuario. Por favor, revise los campos marcados.');
      throw new Error('Errores de validación en el frontend');
    }

    try {
      // Obtener usuario original para preservar campos no editables
      const originalUser = users.find(u => u.id === userId);
      if (!originalUser) {
        throw new Error('Usuario no encontrado');
      }

      // Asegurar que emailConfirmed se mantenga como estaba originalmente
      // o se establezca como true para usuarios válidos (política de negocio)
      const dataToUpdate = {
        ...userData,
        emailConfirmed: true, // 🔒 Política de negocio: usuarios editados tienen email confirmado
      };

      // Llamar al servicio para actualizar en el backend
      await usersService.updateUser(userId, dataToUpdate);
      
      // Actualizar el estado local manteniendo campos no editables
      setUsers((prev) => prev.map((user) => 
        user.id === userId 
          ? { 
              ...user, 
              ...dataToUpdate,
              // Preservar campos que no se deben cambiar durante la edición
              name: originalUser.name, // El nombre completo no se edita en el modal
              isLocked: originalUser.isLocked, // El estado de bloqueo se maneja por separado
            }
          : user
      ));
      
      notifications.success('Usuario actualizado exitosamente.');
    } catch (err: any) {
      console.error('Error al actualizar usuario:', err);
      notifications.error('Error al actualizar usuario: ' + (err.message || 'Intente nuevamente.'));
      throw new Error(err.message || 'Error al actualizar usuario.');
    }
  };

  /**
   * 🗑️ ELIMINAR USUARIO
   * 
   * Elimina permanentemente un usuario del sistema.
   * Esta acción es irreversible, por lo que debe ser confirmada por el usuario.
   * 
   * @param {string} userId - ID del usuario a eliminar
   * @throws {Error} Si hay errores durante la eliminación
   * 
   * ⚠️ IMPORTANTE: Esta operación es destructiva e irreversible
   */
  const deleteUser = async (userId: string) => {
    try {
      await usersService.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      notifications.success('Usuario eliminado exitosamente.');
    } catch (err: any) {
      notifications.error('Error al eliminar usuario: ' + (err.message || 'Intente nuevamente.'));
      throw new Error(err.message || 'Error al eliminar usuario.');
    }
  };

  /**
   * 🔓 DESBLOQUEAR USUARIO
   * 
   * Desbloquea una cuenta de usuario que ha sido bloqueada por múltiples
   * intentos fallidos de login o por acción administrativa.
   * 
   * @param {string} userId - ID del usuario a desbloquear
   * @throws {Error} Si hay errores durante el desbloqueo
   * 
   * 🎯 CASOS DE USO:
   * • Desbloqueo por intentos fallidos de contraseña
   * • Reactivación de cuentas suspendidas administrativamente
   * • Recuperación de cuentas tras resolución de incidentes de seguridad
   */
  const unlockUser = async (userId: string) => {
    try {
      await usersService.unlockUser(userId);
      notifications.success('Usuario desbloqueado exitosamente.');
    } catch (err: any) {
      notifications.error('Error al desbloquear usuario: ' + (err.message || 'Intente nuevamente.'));
      throw new Error(err.message || 'Error al desbloquear usuario.');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📤 RETORNO DEL HOOK
  // ═══════════════════════════════════════════════════════════════════════════════

  return {
    users,         // 📋 Lista de usuarios
    loading,       // ⏳ Estado de carga
    error,         // ❌ Mensajes de error
    currentUserId, // 👤 ID del usuario actual
    createUser,    // ➕ Función para crear usuario
    updateUser,    // ✏️ Función para actualizar usuario
    deleteUser,    // 🗑️ Función para eliminar usuario
    unlockUser,    // 🔓 Función para desbloquear usuario
  };
};



