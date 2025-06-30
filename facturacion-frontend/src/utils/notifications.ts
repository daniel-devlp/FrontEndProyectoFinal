import toast from 'react-hot-toast';
import React from 'react';
import ConfirmToast from '../components/common/ConfirmToast';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔔 SISTEMA CENTRAL DE NOTIFICACIONES Y CONFIRMACIONES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este archivo contiene todo el sistema de notificaciones moderno que reemplaza
 * completamente a react-toastify y las APIs nativas del navegador.
 * 
 * 📚 FUNCIONALIDADES PRINCIPALES:
 * • Notificaciones de éxito, error, advertencia e información
 * • Sistema de confirmaciones personalizado con ConfirmToast
 * • Estados de carga para operaciones asíncronas
 * • Wrapper para automatizar loading/success/error flows
 * • Funciones especializadas para diferentes tipos de acciones CRUD
 * 
 * 🎨 CARACTERÍSTICAS DE DISEÑO:
 * • Estilos consistentes con la paleta de colores del sistema
 * • Duraciones apropiadas según el tipo de notificación
 * • Iconos temáticos para cada categoría
 * • Posicionamiento uniforme (top-right para notificaciones, top-center para modales)
 * • Animaciones suaves y profesionales
 * 
 * 🚀 PARA FUTURAS MEJORAS:
 * • Agregar soporte para notificaciones persistentes
 * • Implementar sistema de prioridades (high, medium, low)
 * • Añadir soporte para notificaciones con botones de acción
 * • Integrar con sistema de logging para auditoría
 * • Agregar soporte para notificaciones offline/queue
 * • Implementar templates predefinidos para casos comunes
 * • Añadir soporte para notificaciones con rich content (HTML, imágenes)
 * • Crear sistema de notificaciones push para el browser
 * • Implementar categorización y filtrado de notificaciones
 * 
 * 💡 EJEMPLO DE USO:
 * import { notifications, confirmAction } from './utils/notifications';
 * 
 * notifications.success('Operación exitosa');
 * const confirmed = await confirmAction('¿Continuar?', 'Confirmar');
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ╔═══════════════════════════════════════════════════════════════════════════════
// ║ 📢 OBJETO PRINCIPAL DE NOTIFICACIONES
// ║ 
// ║ Este objeto centraliza todas las funciones de notificación básicas.
// ║ Cada función está optimizada para un tipo específico de mensaje.
// ╚═══════════════════════════════════════════════════════════════════════════════
export const notifications = {
  /**
   * 🟢 NOTIFICACIÓN DE ÉXITO
   * Muestra un mensaje de éxito con estilo verde y duración optimizada
   * 
   * @param message - Mensaje a mostrar al usuario
   * 
   * 🎨 Configuración visual:
   * • Color: Verde (#10b981) - transmite éxito y confianza
   * • Duración: 3 segundos (tiempo óptimo para leer sin ser intrusivo)
   * • Icono: Checkmark automático de react-hot-toast
   * • Posición: Top-right (no interfiere con contenido principal)
   * 
   * 💡 Casos de uso recomendados:
   * • Creación exitosa de registros (clientes, productos, facturas)
   * • Actualización completada de datos
   * • Login exitoso y redirección
   * • Descarga de archivos completada
   * • Envío de formularios exitoso
   * • Operaciones de base de datos completadas
   * 
   * 🔧 Para desarrolladores:
   * • Usar mensajes claros y específicos
   * • Incluir el nombre del recurso afectado cuando sea posible
   * • Evitar jerga técnica
   * 
   * @example
   * notifications.success('Cliente "Juan Pérez" creado exitosamente');
   * notifications.success('Factura #001234 generada correctamente');
   */
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: '#10b981',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    });
  },

  /**
   * 🔴 NOTIFICACIÓN DE ERROR
   * Muestra un mensaje de error con estilo rojo y duración extendida
   * 
   * @param message - Mensaje de error a mostrar al usuario
   * 
   * 🎨 Configuración visual:
   * • Color: Rojo (#ef4444) - indica problema que requiere atención inmediata
   * • Duración: 5 segundos (más tiempo para leer y procesar el error)
   * • Icono: X automático de react-hot-toast
   * • Posición: Top-right con prioridad visual alta
   * 
   * 💡 Casos de uso recomendados:
   * • Errores de validación de formularios
   * • Fallos en operaciones CRUD (create, read, update, delete)
   * • Errores de conectividad con el servidor
   * • Datos inválidos o malformados
   * • Errores de autorización/autenticación
   * • Excepciones no controladas que el usuario debe conocer
   * • Violaciones de reglas de negocio
   * 
   * 🔧 Mejores prácticas para desarrolladores:
   * • Proporcionar información específica y actionable
   * • Evitar mostrar stack traces o detalles técnicos
   * • Incluir sugerencias de solución cuando sea posible
   * • Usar un lenguaje amigable, no intimidante
   * • Considerar logging adicional para debugging
   * 
   * @example
   * notifications.error('Error al guardar el cliente: Email ya existe');
   * notifications.error('No se pudo conectar con el servidor. Verifique su conexión');
   */
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      style: {
        background: '#ef4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    });
  },

  /**
   * 🟡 NOTIFICACIÓN DE ADVERTENCIA
   * Muestra un mensaje de advertencia con estilo ámbar para situaciones de precaución
   * 
   * @param message - Mensaje de advertencia a mostrar
   * 
   * 🎨 Configuración visual:
   * • Color: Ámbar (#f59e0b) - indica precaución sin bloquear la acción
   * • Duración: 4 segundos (tiempo intermedio para procesar la advertencia)
   * • Icono: Triángulo de advertencia (⚠️)
   * • Posición: Top-right con visibilidad media-alta
   * 
   * 💡 Casos de uso recomendados:
   * • Validaciones que no impiden la acción pero requieren atención
   * • Stock bajo en productos (ej: "Quedan solo 5 unidades")
   * • Cambios que podrían tener consecuencias imprevistas
   * • Recordatorios importantes para el usuario
   * • Situaciones que requieren confirmación adicional
   * • Datos incompletos pero no inválidos
   * • Límites próximos a ser alcanzados
   * 
   * 🔧 Guías de implementación:
   * • Usar para situaciones intermedias entre info y error
   * • Proporcionar contexto sobre por qué es importante
   * • Incluir recomendaciones de acción cuando sea apropiado
   * 
   * @example
   * notifications.warning('El producto seleccionado tiene stock bajo (2 unidades)');
   * notifications.warning('Esta acción afectará múltiples registros relacionados');
   */
  warning: (message: string) => {
    toast(message, {
      icon: '⚠️',
      duration: 4000,
      style: {
        background: '#f59e0b',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontWeight: '500',
      },
    });
  },

  /**
   * 🔵 NOTIFICACIÓN INFORMATIVA
   * Muestra un mensaje informativo con estilo azul para comunicación general
   * 
   * @param message - Mensaje informativo a mostrar
   * 
   * 🎨 Configuración visual:
   * • Color: Azul (#3b82f6) - neutral, profesional e informativo
   * • Duración: 3 segundos (tiempo estándar para información general)
   * • Icono: Símbolo de información (ℹ️)
   * • Posición: Top-right sin urgencia visual
   * 
   * 💡 Casos de uso recomendados:
   * • Información sobre el estado del sistema
   * • Consejos y ayudas contextuales para el usuario
   * • Confirmaciones de acciones no críticas
   * • Actualizaciones de estado o progreso
   * • Guías paso a paso para el usuario
   * • Información educativa o tips
   * • Notificaciones de bienvenida o introducción
   * 
   * 🔧 Mejores prácticas:
   * • Usar para comunicación no urgente
   * • Proporcionar valor educativo o contextual
   * • Evitar sobrecargar al usuario con demasiada información
   * • Considerar si la información es realmente necesaria
   * 
   * @example
   * notifications.info('Tip: Puede usar Ctrl+S para guardar rápidamente');
   * notifications.info('Sistema actualizado a la versión 2.1.0');
   */
  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      duration: 3000,
      style: {
        background: '#3b82f6',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontWeight: '500',
      },
    });
  },

  /**
   * ⏳ NOTIFICACIÓN DE CARGA
   * Muestra un indicador de carga para operaciones asíncronas largas
   * 
   * @param message - Mensaje descriptivo de la operación en curso
   * @returns string - ID único del toast para poder eliminarlo después
   * 
   * 🎨 Configuración visual:
   * • Color: Gris (#6b7280) - neutral para procesos en curso
   * • Duración: Infinita (hasta ser eliminada manualmente)
   * • Icono: Spinner animado automático de react-hot-toast
   * • Posición: Top-right, persiste hasta completion
   * 
   * 💡 Casos de uso esenciales:
   * • Operaciones de base de datos que toman tiempo considerable
   * • Generación y descarga de PDFs
   * • Uploads de archivos o imágenes
   * • Llamadas a APIs externas lentas
   * • Procesos de validación complejos
   * • Operaciones batch o masivas
   * • Sincronización de datos
   * 
   * 🔧 Patrón de uso recomendado:
   * ```typescript
   * const loadingId = notifications.loading('Generando factura PDF...');
   * try {
   *   await generateInvoicePDF();
   *   notifications.dismiss(loadingId);
   *   notifications.success('PDF generado exitosamente');
   * } catch (error) {
   *   notifications.dismiss(loadingId);
   *   notifications.error('Error al generar PDF');
   * }
   * ```
   * 
   * 🚀 Mejoras futuras sugeridas:
   * • Añadir barra de progreso para operaciones medibles
   * • Implementar cancelación de operaciones
   * • Agregar estimación de tiempo restante
   * 
   * @example
   * const id = notifications.loading('Guardando datos del cliente...');
   * // ... operación asíncrona ...
   * notifications.dismiss(id);
   */
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#6b7280',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontWeight: '500',
      },
    });
  },

  /**
   * ❌ ELIMINACIÓN DE NOTIFICACIÓN
   * Elimina una notificación específica usando su ID único
   * 
   * @param toastId - ID único del toast a eliminar (opcional)
   * 
   * 🔧 Comportamiento:
   * • Si se proporciona toastId: elimina solo esa notificación específica
   * • Si no se proporciona toastId: elimina todas las notificaciones activas
   * 
   * 💡 Casos de uso principales:
   * • Después de completar operaciones de loading
   * • Para eliminar notificaciones obsoletas programáticamente
   * • En cleanup de componentes que se desmontan
   * • Para controlar el flujo de notificaciones en secuencias complejas
   * • Limpiar notificaciones al cambiar de página o contexto
   * 
   * 🚀 Futuras mejoras:
   * • Añadir dismiss por categoría o tipo
   * • Implementar dismiss con delay programable
   * • Agregar callback de confirmación de dismiss
   */
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

// ╔═══════════════════════════════════════════════════════════════════════════════
// ║ 🤔 SISTEMA DE CONFIRMACIONES MODERNAS
// ║ 
// ║ Reemplaza completamente window.confirm() y window.alert() con modales
// ║ personalizados que mantienen la consistencia visual del sistema.
// ╚═══════════════════════════════════════════════════════════════════════════════

/**
 * 🤔 CONFIRMACIÓN PRINCIPAL PERSONALIZADA
 * Función base para todas las confirmaciones del sistema usando ConfirmToast
 * 
 * @param message - Mensaje principal de la confirmación
 * @param title - Título opcional del modal (default: sin título)
 * @param confirmText - Texto del botón de confirmación (default: 'Sí, confirmar')
 * @param cancelText - Texto del botón de cancelación (default: 'Cancelar')
 * @returns Promise<boolean> - true si el usuario confirma, false si cancela
 * 
 * 🎨 Características visuales:
 * • Modal personalizado centrado en la pantalla
 * • Overlay semi-transparente que oscurece el fondo
 * • Animaciones suaves de entrada y salida
 * • Botones con colores apropiados según el contexto
 * • Responsive design que se adapta a cualquier dispositivo
 * 
 * 🔧 Ventajas sobre window.confirm():
 * • Mantiene la consistencia visual con el resto de la aplicación
 * • Permite personalización completa de textos y estilos
 * • No bloquea el thread principal del navegador
 * • Funciona correctamente en todos los navegadores modernos
 * • Permite escape con ESC y click fuera del modal
 * • Accesible con teclado y screen readers
 * 
 * 💡 Casos de uso base:
 * • Confirmaciones generales que no encajan en categorías específicas
 * • Base para funciones especializadas (create, update, delete)
 * • Confirmaciones de navegación (salir sin guardar)
 * • Acciones de configuración importantes
 * 
 * 🚀 Extensiones futuras sugeridas:
 * • Agregar soporte para contenido HTML rico
 * • Implementar diferentes tamaños de modal (small, medium, large)
 * • Añadir iconos contextuales automáticos
 * • Soporte para botones adicionales (ej: Save, Don't Save, Cancel)
 * • Integración con sistema de temas (dark/light mode)
 * 
 * @example
 * const confirmed = await confirmAction(
 *   '¿Está seguro de que desea realizar esta acción?',
 *   'Confirmación requerida',
 *   'Sí, continuar',
 *   'No, cancelar'
 * );
 * if (confirmed) {
 *   // Usuario confirmó la acción
 *   proceedWithAction();
 * }
 */
export const confirmAction = async (
  message: string, 
  title?: string,
  confirmText: string = 'Sí, confirmar',
  cancelText: string = 'Cancelar'
): Promise<boolean> => {
  return new Promise((resolve) => {
    const toastId = toast.custom(
      (t) => React.createElement(ConfirmToast, {
        t,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      }),
      {
        duration: Infinity, // Modal persiste hasta que el usuario actúe
        position: 'top-center', // Centrado para máxima visibilidad
        style: {
          background: 'transparent', // El ConfirmToast maneja su propio styling
          boxShadow: 'none',
          padding: 0,
        },
      }
    );
  });
};

// ╔═══════════════════════════════════════════════════════════════════════════════
// ║ ⚡ WRAPPER AUTOMÁTICO PARA OPERACIONES ASÍNCRONAS
// ║ 
// ║ Automatiza el patrón loading -> success/error para operaciones async
// ╚═══════════════════════════════════════════════════════════════════════════════

/**
 * ⚡ WRAPPER AUTOMÁTICO CON ESTADOS DE CARGA
 * Envuelve operaciones asíncronas con manejo automático de loading/success/error
 * 
 * @template T - Tipo de retorno de la función asíncrona
 * @param asyncFn - Función asíncrona a ejecutar
 * @param loadingMessage - Mensaje a mostrar durante la carga
 * @param successMessage - Mensaje a mostrar en caso de éxito
 * @param errorMessage - Mensaje opcional para errores (default: mensaje genérico)
 * @returns Promise<T> - Resultado de la función asíncrona original
 * 
 * 🔄 Flujo automático:
 * 1. Muestra loading toast con el mensaje especificado
 * 2. Ejecuta la función asíncrona
 * 3. Si es exitosa: elimina loading y muestra success
 * 4. Si falla: elimina loading y muestra error
 * 5. Re-lanza la excepción para que el código llamador pueda manejarla
 * 
 * 💡 Casos de uso ideales:
 * • Operaciones CRUD en hooks personalizados
 * • Llamadas a APIs que pueden tomar tiempo
 * • Operaciones de archivo (upload, download, procesamiento)
 * • Validaciones asíncronas complejas
 * • Sincronización de datos entre sistemas
 * 
 * 🎯 Beneficios principales:
 * • Reduce código boilerplate significativamente
 * • Garantiza consistencia en el manejo de estados
 * • Previene memory leaks al manejar automáticamente los toast IDs
 * • Mejora la experiencia de usuario con feedback inmediato
 * • Centraliza la lógica de notificaciones para operaciones async
 * 
 * 🔧 Ejemplo de uso típico:
 * ```typescript
 * // En lugar de este patrón manual:
 * const loadingId = notifications.loading('Guardando...');
 * try {
 *   const result = await saveClient(data);
 *   notifications.dismiss(loadingId);
 *   notifications.success('Cliente guardado');
 *   return result;
 * } catch (error) {
 *   notifications.dismiss(loadingId);
 *   notifications.error('Error al guardar');
 *   throw error;
 * }
 * 
 * // Usa este patrón simplificado:
 * return withLoadingToast(
 *   () => saveClient(data),
 *   'Guardando cliente...',
 *   'Cliente guardado exitosamente',
 *   'Error al guardar el cliente'
 * );
 * ```
 * 
 * 🚀 Mejoras futuras sugeridas:
 * • Agregar callback opcional onSuccess y onError
 * • Implementar retry automático para ciertos tipos de errores
 * • Añadir soporte para progress tracking
 * • Permitir configuración de timeouts personalizados
 * • Integrar con sistema de analytics para tracking de performance
 */
export const withLoadingToast = async <T>(
  asyncFn: () => Promise<T>,
  loadingMessage: string,
  successMessage: string,
  errorMessage?: string,
  showErrorToast: boolean = true
): Promise<T> => {
  const toastId = notifications.loading(loadingMessage);
  
  try {
    const result = await asyncFn();
    notifications.dismiss(toastId);
    notifications.success(successMessage);
    return result;
  } catch (error) {
    notifications.dismiss(toastId);
    if (showErrorToast) {
      const errorMsg = errorMessage || 'Ha ocurrido un error inesperado';
      notifications.error(errorMsg);
    }
    throw error; // Re-lanza para que el código llamador pueda manejar específicamente
  }
};

// ╔═══════════════════════════════════════════════════════════════════════════════
// ║ 🎯 FUNCIONES ESPECIALIZADAS PARA DIFERENTES TIPOS DE ACCIONES
// ║ 
// ║ Cada función está optimizada para un tipo específico de operación CRUD
// ║ con textos y estilos apropiados para el contexto.
// ╚═══════════════════════════════════════════════════════════════════════════════

/**
 * 🗑️ CONFIRMACIÓN PARA ACCIONES DESTRUCTIVAS
 * Especializada para eliminaciones, bloqueos y otras acciones irreversibles
 * 
 * @param message - Mensaje específico sobre qué se va a eliminar/destruir
 * @param title - Título del modal (default: 'Confirmar Acción')
 * @param confirmText - Texto del botón destructivo (default: 'Sí, eliminar')
 * @returns Promise<boolean> - true si confirma, false si cancela
 * 
 * 🎨 Características visuales específicas:
 * • Botón de confirmación en rojo para indicar peligro
 * • Texto más enfático sobre la naturaleza irreversible
 * • Iconografía de advertencia para reforzar el mensaje
 * 
 * 💡 Casos de uso específicos:
 * • Eliminación de registros de base de datos
 * • Bloqueo/desactivación de usuarios
 * • Cancelación de procesos en curso
 * • Limpieza de datos o cache
 * • Revocación de permisos o accesos
 * • Reset de configuraciones importantes
 * 
 * 🔧 Mejores prácticas de uso:
 * • Ser específico sobre qué se eliminará (nombre, cantidad, etc.)
 * • Mencionar consecuencias si las hay
 * • Usar verbos claros como "eliminar", "borrar", "desactivar"
 * 
 * @example
 * const confirmed = await confirmDestructiveAction(
 *   'Se eliminará el cliente "Juan Pérez" y todas sus facturas asociadas. Esta acción no se puede deshacer.',
 *   'Eliminar Cliente',
 *   'Sí, eliminar permanentemente'
 * );
 */
export const confirmDestructiveAction = async (
  message: string,
  title: string = 'Confirmar Acción',
  confirmText: string = 'Sí, eliminar'
): Promise<boolean> => {
  return confirmAction(message, title, confirmText, 'Cancelar');
};

/**
 * ✨ CONFIRMACIÓN PARA ACCIONES DE CREACIÓN
 * Optimizada para confirmaciones de creación de nuevos registros
 * 
 * @param message - Mensaje sobre qué se va a crear
 * @param title - Título del modal (default: 'Confirmar Creación')
 * @param confirmText - Texto del botón (default: 'Sí, crear')
 * @returns Promise<boolean> - true si confirma, false si cancela
 * 
 * 🎨 Características visuales:
 * • Botón de confirmación en azul/verde para acciones positivas
 * • Tono optimista y constructivo en el mensaje
 * 
 * 💡 Casos de uso ideales:
 * • Creación de clientes, productos, facturas
 * • Registro de nuevos usuarios
 * • Generación de documentos importantes
 * • Configuración inicial de módulos
 * • Duplicación de registros existentes
 * 
 * @example
 * const confirmed = await confirmCreateAction(
 *   '¿Desea crear un nuevo cliente con los datos ingresados?',
 *   'Crear Nuevo Cliente',
 *   'Sí, crear cliente'
 * );
 */
export const confirmCreateAction = async (
  message: string,
  title: string = 'Confirmar Creación',
  confirmText: string = 'Sí, crear'
): Promise<boolean> => {
  return confirmAction(message, title, confirmText, 'Cancelar');
};

/**
 * 📝 CONFIRMACIÓN PARA ACCIONES DE ACTUALIZACIÓN
 * Especializada para confirmaciones de modificación de datos existentes
 * 
 * @param message - Mensaje sobre qué se va a actualizar
 * @param title - Título del modal (default: 'Confirmar Actualización')
 * @param confirmText - Texto del botón (default: 'Sí, actualizar')
 * @returns Promise<boolean> - true si confirma, false si cancela
 * 
 * 🎨 Características visuales:
 * • Botón de confirmación en azul para cambios constructivos
 * • Enfoque en los beneficios de la actualización
 * 
 * 💡 Casos de uso principales:
 * • Modificación de datos de clientes/productos
 * • Actualización de configuraciones del sistema
 * • Cambios en perfiles de usuario
 * • Modificación de precios o inventario
 * • Actualización de estados o status
 * 
 * @example
 * const confirmed = await confirmUpdateAction(
 *   '¿Desea guardar los cambios realizados en el cliente "Juan Pérez"?',
 *   'Guardar Cambios',
 *   'Sí, guardar'
 * );
 */
export const confirmUpdateAction = async (
  message: string,
  title: string = 'Confirmar Actualización',
  confirmText: string = 'Sí, actualizar'
): Promise<boolean> => {
  return confirmAction(message, title, confirmText, 'Cancelar');
};

/**
 * ❓ CONFIRMACIÓN SIMPLE SÍ/NO
 * Para confirmaciones básicas sin contexto específico
 * 
 * @param message - Pregunta simple a confirmar
 * @returns Promise<boolean> - true para Sí, false para No
 * 
 * 💡 Casos de uso:
 * • Confirmaciones rápidas y simples
 * • Preguntas binarias sin consecuencias importantes
 * • Flujos donde el contexto es claro
 * 
 * @example
 * const proceed = await confirmSimple('¿Desea continuar?');
 */
export const confirmSimple = async (message: string): Promise<boolean> => {
  return confirmAction(message, '', 'Sí', 'No');
};

// ╔═══════════════════════════════════════════════════════════════════════════════
// ║ 🚨 FUNCIONES DE ALERTA ESPECIALIZADAS
// ║ 
// ║ Reemplazan window.alert() con toast personalizados
// ╚═══════════════════════════════════════════════════════════════════════════════

/**
 * 📢 ALERTA GENERAL
 * Reemplaza window.alert() con toast informativo
 * 
 * @param message - Mensaje de la alerta
 * @param title - Título opcional
 * 
 * 💡 Cuándo usar vs notifications.info():
 * • alertUser(): Para mensajes importantes que requieren atención
 * • notifications.info(): Para información contextual o tips
 */
export const alertUser = (message: string, title?: string): void => {
  if (title) {
    notifications.info(`${title}: ${message}`);
  } else {
    notifications.info(message);
  }
};

/**
 * ℹ️ MOSTRAR INFORMACIÓN
 * Wrapper directo para notifications.info con semántica clara
 */
export const showInfo = (message: string): void => {
  notifications.info(message);
};

/**
 * ⚠️ MOSTRAR ADVERTENCIA
 * Wrapper directo para notifications.warning con semántica clara
 */
export const showWarning = (message: string): void => {
  notifications.warning(message);
};

/**
 * ❌ MOSTRAR ERROR
 * Wrapper directo para notifications.error con semántica clara
 */
export const showError = (message: string): void => {
  notifications.error(message);
};

/**
 * ✅ MOSTRAR ÉXITO
 * Wrapper directo para notifications.success con semántica clara
 */
export const showSuccess = (message: string): void => {
  notifications.success(message);
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📋 GUÍA RÁPIDA DE USO PARA DESARROLLADORES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 PATRONES COMUNES:
 * 
 * 1. OPERACIÓN CRUD CON CONFIRMACIÓN:
 * ```typescript
 * const handleDelete = async (id: number) => {
 *   const confirmed = await confirmDestructiveAction(
 *     `¿Eliminar el cliente #${id}?`,
 *     'Eliminar Cliente'
 *   );
 *   if (confirmed) {
 *     await withLoadingToast(
 *       () => deleteClient(id),
 *       'Eliminando cliente...',
 *       'Cliente eliminado exitosamente'
 *     );
 *   }
 * };
 * ```
 * 
 * 2. OPERACIÓN SIMPLE CON NOTIFICACIÓN:
 * ```typescript
 * try {
 *   await saveData();
 *   notifications.success('Datos guardados');
 * } catch (error) {
 *   notifications.error('Error al guardar');
 * }
 * ```
 * 
 * 3. VALIDACIÓN CON ADVERTENCIA:
 * ```typescript
 * if (stock < 5) {
 *   notifications.warning(`Stock bajo: ${stock} unidades restantes`);
 * }
 * ```
 * 
 * 🚀 ROADMAP DE MEJORAS FUTURAS:
 * • Sistema de notificaciones push del navegador
 * • Integración con WebSockets para notificaciones en tiempo real
 * • Sistema de undo/redo para acciones críticas
 * • Notificaciones grupales y batch operations
 * • Temas personalizables (dark mode, custom branding)
 * • Analytics de interacción con notificaciones
 * • Accesibilidad mejorada (ARIA, screen readers)
 * • Internacionalización (i18n) para múltiples idiomas
 * ═══════════════════════════════════════════════════════════════════════════════
 */
