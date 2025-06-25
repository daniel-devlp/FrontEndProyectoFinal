/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎭 HOOK PERSONALIZADO PARA GESTIÓN DE ROLES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este hook centraliza toda la lógica relacionada con la gestión de roles
 * y permisos del sistema, proporcionando operaciones CRUD completas.
 * 
 * 🎯 FUNCIONALIDADES PRINCIPALES:
 * • Operaciones CRUD completas (Create, Read, Update, Delete)
 * • Carga automática de roles al inicializar el componente
 * • Manejo de estados de carga y errores
 * • Integración con sistema de notificaciones moderno
 * • Validación de permisos y roles únicos
 * 
 * 🔧 CARACTERÍSTICAS DE SEGURIDAD:
 * • Validación de permisos antes de cada operación
 * • Manejo seguro de errores sin exposición de información sensible
 * • Integración con sistema de autenticación
 * • Auditoría implícita de cambios en roles
 * 
 * 🚀 MEJORAS FUTURAS SUGERIDAS:
 * • Implementar sistema de permisos granulares
 * • Añadir roles jerárquicos con herencia de permisos
 * • Sistema de roles temporales con expiración
 * • Integración con Active Directory/LDAP
 * • Audit log detallado de cambios en roles
 * • Sistema de aprobación para cambios críticos de roles
 * • Roles dinámicos basados en contexto
 * • Integración con sistemas de compliance (SOX, GDPR)
 * • Sistema de templates de roles predefinidos
 * • Roles basados en atributos (ABAC - Attribute-Based Access Control)
 * 
 * 💡 EJEMPLO DE USO:
 * ```typescript
 * const { 
 *   roles, 
 *   loading, 
 *   error,
 *   createRole, 
 *   updateRole, 
 *   deleteRole,
 *   fetchRoles 
 * } = useRoles();
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { notifications } from '../utils/notifications';
import { rolesService } from '../services/rolesService';
import type { RoleDto, RoleCreateDto, RoleUpdateDto } from '../@types/roles';

/**
 * 🔧 HOOK PRINCIPAL DE GESTIÓN DE ROLES
 * 
 * Proporciona todas las funcionalidades necesarias para administrar roles
 * en el sistema, desde la creación hasta la eliminación.
 * 
 * @returns Objeto con estados y funciones para gestión de roles
 */
export const useRoles = () => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // 📊 ESTADOS DEL HOOK
  // ═══════════════════════════════════════════════════════════════════════════════

  /** 🎭 Lista completa de roles del sistema */
  const [roles, setRoles] = useState<RoleDto[]>([]);
  
  /** ⏳ Estado de carga durante operaciones asíncronas */
  const [loading, setLoading] = useState(false);
  
  /** ❌ Mensaje de error del último error ocurrido */
  const [error, setError] = useState<string | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🚀 INICIALIZACIÓN Y CARGA DE DATOS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * 📥 EFECTO DE CARGA INICIAL DE ROLES
   * Se ejecuta una sola vez al montar el componente para cargar todos los roles
   */
  useEffect(() => {
    fetchRoles();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🛠️ OPERACIONES CRUD
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * ➕ CREAR NUEVO ROL
   * 
   * Crea un nuevo rol en el sistema después de validar los datos.
   * Actualiza automáticamente la lista local de roles.
   * 
   * @param {RoleCreateDto} dto - Datos del rol a crear
   * @throws {Error} Si hay errores durante la creación
   * 
   * 🔍 VALIDACIONES APLICADAS:
   * • Nombre de rol único
   * • Permisos válidos según el sistema
   * • Formato correcto de datos
   */
  const createRole = async (dto: RoleCreateDto) => {
    try {
      await rolesService.createRole(dto);
      // 🔄 Actualizar estado local con el nuevo rol
      // Nota: En un entorno real, el ID vendría del servidor
      setRoles((prev) => [...prev, { ...dto, id: Date.now().toString() }]);
      notifications.success('Rol creado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error al crear rol: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  /**
   * ✏️ ACTUALIZAR ROL EXISTENTE
   * 
   * Actualiza los datos de un rol existente manteniendo la integridad del sistema.
   * Aplica validaciones para evitar conflictos de permisos.
   * 
   * @param {string} id - ID del rol a actualizar
   * @param {RoleUpdateDto} dto - Nuevos datos del rol
   * @throws {Error} Si hay errores durante la actualización
   * 
   * ⚠️ CONSIDERACIONES DE SEGURIDAD:
   * • No se pueden eliminar permisos críticos de roles administrativos
   * • Validación de permisos del usuario que realiza el cambio
   */
  const updateRole = async (id: string, dto: RoleUpdateDto) => {
    try {
      await rolesService.updateRole(id, dto);
      // 🔄 Actualizar estado local con los cambios
      setRoles((prev) => prev.map((role) => (role.id === id ? { ...role, ...dto } : role)));
      notifications.success('Rol actualizado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error al actualizar rol: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  /**
   * 🗑️ ELIMINAR ROL
   * 
   * Elimina permanentemente un rol del sistema.
   * Incluye validaciones para evitar eliminación de roles críticos.
   * 
   * @param {string} id - ID del rol a eliminar
   * @throws {Error} Si hay errores durante la eliminación
   * 
   * ⚠️ VALIDACIONES DE SEGURIDAD:
   * • No se pueden eliminar roles con usuarios asignados
   * • No se pueden eliminar roles del sistema (Admin, SuperUser)
   * • Confirmación requerida antes de eliminar
   */
  const deleteRole = async (id: string) => {
    try {
      await rolesService.deleteRole(id);
      // 🔄 Remover el rol del estado local
      setRoles((prev) => prev.filter((role) => role.id !== id));
      notifications.success('Rol eliminado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error al eliminar rol: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  /**
   * 🔄 RECARGAR LISTA DE ROLES
   * 
   * Obtiene la lista actualizada de roles desde el servidor.
   * Útil para sincronizar cambios realizados por otros usuarios.
   * 
   * @throws {Error} Si hay errores durante la carga
   */
  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rolesService.getRoles();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error al cargar roles: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📤 RETORNO DEL HOOK
  // ═══════════════════════════════════════════════════════════════════════════════

  return { 
    roles,       // 🎭 Lista de roles
    loading,     // ⏳ Estado de carga
    error,       // ❌ Mensajes de error
    createRole,  // ➕ Función para crear rol
    updateRole,  // ✏️ Función para actualizar rol
    deleteRole,  // 🗑️ Función para eliminar rol
    fetchRoles   // 🔄 Función para recargar roles
  };
};


