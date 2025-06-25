import React from 'react';
import toast from 'react-hot-toast';
import '../../assets/styles/ConfirmToast.css';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🤔 COMPONENTE DE CONFIRMACIÓN PERSONALIZADO
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este componente reemplaza completamente los diálogos nativos del navegador
 * (window.confirm, window.alert) proporcionando una experiencia visual
 * consistente con el diseño de la aplicación.
 * 
 * 🎯 OBJETIVOS PRINCIPALES:
 * • Mantener consistencia visual con el resto de la aplicación
 * • Proporcionar mejor control sobre la experiencia de usuario
 * • Permitir personalización completa de textos y estilos
 * • Funcionar correctamente en todos los navegadores modernos
 * • Ser completamente accesible para usuarios con discapacidades
 * 
 * 🎨 CARACTERÍSTICAS DE DISEÑO:
 * • Modal centrado con overlay semi-transparente
 * • Animaciones suaves de entrada y salida
 * • Botones con colores contextuales (rojo para destructivo, azul para constructivo)
 * • Typography consistente con el design system
 * • Responsive design que se adapta a cualquier tamaño de pantalla
 * • Soporte para contenido variable (con/sin título)
 * 
 * 🔧 FUNCIONALIDADES TÉCNICAS:
 * • Integración perfecta con react-hot-toast
 * • Manejo automático de dismissal al hacer clic en botones
 * • Props flexibles para diferentes tipos de confirmación
 * • Event handling robusto para interacciones de usuario
 * • CSS scoped para evitar conflictos de estilos
 * 
 * 🚀 MEJORAS FUTURAS SUGERIDAS:
 * • Soporte para escape con tecla ESC
 * • Click fuera del modal para cancelar (opcional)
 * • Soporte para iconos contextuales automáticos
 * • Animaciones más sofisticadas (spring animations)
 * • Soporte para contenido HTML rico
 * • Diferentes tamaños de modal (small, medium, large)
 * • Temas personalizables (dark mode, custom colors)
 * • Soporte para múltiples botones de acción
 * • Integración con sistema de shortcuts de teclado
 * • Logging de interacciones para analytics
 * 
 * 💡 CASOS DE USO:
 * • Confirmación antes de eliminar registros
 * • Confirmar acciones irreversibles
 * • Validar cambios importantes
 * • Mostrar advertencias críticas
 * • Solicitar confirmación para navegación con cambios sin guardar
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * 📋 INTERFAZ DE PROPIEDADES DEL COMPONENTE
 * Define todos los parámetros que acepta el componente ConfirmToast
 */
interface ConfirmToastProps {
  /** 
   * 🆔 Objeto toast de react-hot-toast
   * Contiene metadata del toast incluyendo el ID único para dismissal
   */
  t: any;

  /** 
   * 📝 Título opcional del modal
   * Se muestra en la parte superior con tipografía destacada
   * Si no se proporciona, el modal será más compacto
   */
  title?: string;

  /** 
   * 💬 Mensaje principal de confirmación
   * Texto descriptivo que explica qué acción se va a realizar
   * Debe ser claro, específico y en lenguaje amigable para el usuario
   */
  message: string;

  /** 
   * ✅ Texto del botón de confirmación
   * Debe ser específico a la acción (ej: "Sí, eliminar", "Continuar", "Guardar")
   * El estilo del botón se adapta automáticamente al contexto
   */
  confirmText: string;

  /** 
   * ❌ Texto del botón de cancelación
   * Generalmente "Cancelar" pero puede personalizarse según el contexto
   * Siempre debe ofrecer una salida segura al usuario
   */
  cancelText: string;

  /** 
   * 🎯 Callback ejecutado cuando el usuario confirma
   * Función que se llama inmediatamente después de cerrar el modal
   * Debe contener la lógica de la acción a realizar
   */
  onConfirm: () => void;

  /** 
   * 🚪 Callback ejecutado cuando el usuario cancela
   * Función que se llama cuando el usuario decide no continuar
   * Puede ser simplemente una función vacía o contener lógica de cleanup
   */
  onCancel: () => void;
}

/**
 * 🎭 COMPONENTE PRINCIPAL CONFIRMTOAST
 * 
 * Renderiza un modal de confirmación personalizado que reemplaza
 * los diálogos nativos del navegador con una experiencia visual
 * consistente y moderna.
 * 
 * @param props - Propiedades del componente según ConfirmToastProps
 * @returns JSX.Element - Modal de confirmación completamente funcional
 */
const ConfirmToast: React.FC<ConfirmToastProps> = ({
  t,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  /**
   * 🟢 MANEJADOR DE CONFIRMACIÓN
   * 
   * Se ejecuta cuando el usuario hace clic en el botón de confirmación.
   * Primero cierra el modal y luego ejecuta la acción confirmada.
   * 
   * 🔄 Flujo de ejecución:
   * 1. Cierra inmediatamente el toast usando su ID único
   * 2. Ejecuta el callback onConfirm proporcionado por el padre
   * 3. El callback padre maneja la lógica específica de la acción
   * 
   * 💡 Consideraciones de UX:
   * • El modal se cierra inmediatamente para dar feedback visual rápido
   * • La acción se ejecuta después del cierre para evitar lag visual
   * • Si la acción toma tiempo, el componente padre debe mostrar loading
   */
  const handleConfirm = () => {
    toast.dismiss(t.id); // Cierra el modal inmediatamente
    onConfirm(); // Ejecuta la acción confirmada
  };

  /**
   * 🔴 MANEJADOR DE CANCELACIÓN
   * 
   * Se ejecuta cuando el usuario hace clic en el botón de cancelación.
   * Cierra el modal y ejecuta cualquier lógica de cleanup necesaria.
   * 
   * 🔄 Flujo de ejecución:
   * 1. Cierra inmediatamente el toast
   * 2. Ejecuta el callback onCancel (generalmente vacío)
   * 3. El usuario regresa al estado anterior sin cambios
   * 
   * 💡 Consideraciones de UX:
   * • Proporciona una salida segura sin consecuencias
   * • No debe ejecutar ninguna acción destructiva
   * • Puede usarse para analytics (tracking de cancelaciones)
   */
  const handleCancel = () => {
    toast.dismiss(t.id); // Cierra el modal inmediatamente
    onCancel(); // Ejecuta lógica de cancelación (si existe)
  };

  /**
   * 🎨 RENDERIZADO DEL COMPONENTE
   * 
   * Estructura visual del modal de confirmación con:
   * • Container principal con overlay
   * • Área de contenido centrada
   * • Título opcional (solo si se proporciona)
   * • Mensaje principal siempre visible
   * • Área de botones con cancelar (izquierda) y confirmar (derecha)
   * 
   * 🔧 Clases CSS aplicadas:
   * • confirm-toast: Container principal con overlay
   * • confirm-toast-content: Área de contenido centrada
   * • confirm-toast-title: Título opcional (h4)
   * • confirm-toast-message: Mensaje principal (párrafo)
   * • confirm-toast-buttons: Container de botones (flexbox)
   * • confirm-toast-btn: Clase base para botones
   * • confirm-toast-btn-cancel: Estilo específico para botón cancelar
   * • confirm-toast-btn-confirm: Estilo específico para botón confirmar
   * 
   * 🎯 Orden de los botones:
   * • Cancelar a la izquierda (acción segura)
   * • Confirmar a la derecha (acción principal)
   * • Sigue convenciones de UX estándares
   */
  return (
    <div className="confirm-toast">
      <div className="confirm-toast-content">
        {/* Título opcional - solo se renderiza si se proporciona */}
        {title && <h4 className="confirm-toast-title">{title}</h4>}
        
        {/* Mensaje principal - siempre visible */}
        <p className="confirm-toast-message">{message}</p>
        
        {/* Área de botones */}
        <div className="confirm-toast-buttons">
          {/* Botón Cancelar - acción segura, posición izquierda */}
          <button
            className="confirm-toast-btn confirm-toast-btn-cancel"
            onClick={handleCancel}
            type="button" // Previene envío de formularios accidental
          >
            {cancelText}
          </button>
          
          {/* Botón Confirmar - acción principal, posición derecha */}
          <button
            className="confirm-toast-btn confirm-toast-btn-confirm"
            onClick={handleConfirm}
            type="button" // Previene envío de formularios accidental
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmToast;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📚 DOCUMENTACIÓN DE USO PARA DESARROLLADORES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 EJEMPLO DE USO BÁSICO:
 * ```typescript
 * import { confirmAction } from '../utils/notifications';
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirmAction(
 *     '¿Está seguro de eliminar este elemento?',
 *     'Confirmar Eliminación',
 *     'Sí, eliminar',
 *     'Cancelar'
 *   );
 *   
 *   if (confirmed) {
 *     // Proceder con la eliminación
 *     await deleteItem();
 *   }
 * };
 * ```
 * 
 * 🔧 PERSONALIZACIÓN AVANZADA:
 * • Modificar estilos en ConfirmToast.css
 * • Agregar nuevas variantes de botones
 * • Implementar diferentes tamaños de modal
 * • Añadir animaciones personalizadas
 * 
 * 🚀 EXTENSIONES FUTURAS:
 * • ConfirmToastWithIcon: Variante con iconos contextuales
 * • ConfirmToastLarge: Para contenido más extenso
 * • ConfirmToastDestructive: Variante específica para acciones peligrosas
 * • ConfirmToastMultiAction: Soporte para más de 2 botones
 * ═══════════════════════════════════════════════════════════════════════════════
 */
