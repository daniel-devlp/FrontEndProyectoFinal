/**
 * Componente HomeUser
 * 
 * Una página de inicio de panel simple diseñada específicamente para usuarios regulares.
 * Este componente sirve como página de destino después de la autenticación del usuario,
 * proporcionando una interfaz acogedora con acceso rápido a las funciones principales del usuario.
 * 
 * Características Principales:
 * - Diseño de panel simple y limpio
 * - Tarjetas de acceso rápido para funciones principales del usuario
 * - Integración de navegación amigable para el usuario
 * - Diseño responsivo para varios dispositivos
 * - Interfaz mínima y enfocada
 * 
 * Experiencia del Usuario:
 * - Mensaje de bienvenida con contexto del usuario
 * - Navegación intuitiva basada en tarjetas
 * - Diseño limpio y sin desorden
 * - Acceso rápido a funciones primarias
 * 
 * Implementación Técnica:
 * - Componente ligero con estado mínimo
 * - Contenido estático con integración de navegación
 * - Estilizado basado en CSS para atractivo visual
 * - Principios de diseño responsivo
 * 
 * Contexto de Uso:
 * Destinado para usuarios regulares (no administradores) como su panel principal.
 * Debe usarse dentro de una ruta protegida que asegure la autenticación del usuario.
 * 
 * @componente
 * @ejemplo
 * ```tsx
 * // Dentro de una ruta protegida para usuarios autenticados
 * <HomeUser />
 * ```
 * 
 * Estilizado:
 * - Usa HomeUser.css para estilos específicos del componente
 * - Diseño basado en tarjetas para contenido organizado
 * - Diseño visual moderno y amigable para el usuario
 * 
 * Mejoras Futuras:
 * - Saludo dinámico del usuario con nombre real del usuario
 * - Actividad reciente o visualización de estadísticas rápidas
 * - Contenido personalizado basado en preferencias del usuario
 * - Atajos de acción rápida para tareas comunes
 * - Integración con métricas y análisis del usuario
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 */
import React from 'react';
import Navbar from '../../components/common/Navbar';
import '../../assets/styles/HomeUser.css';

/**
 * Componente funcional HomeUser
 * 
 * Renderiza una interfaz de panel simple para usuarios regulares con
 * tarjetas de navegación básicas y mensajes de bienvenida.
 * 
 * @retorna {JSX.Element} Interfaz del panel del usuario
 */
const HomeUser: React.FC = () => {
  return (
    <div className="home-user">
      {/* Componente de Navegación */}
      <Navbar />
      
      <div className="user-dashboard">
        {/* Encabezado de Bienvenida */}
        {/* Saludo simple para contexto del usuario */}
        <h1>Bienvenido, Usuario</h1>
        
        {/* Tarjetas del Panel */}
        {/* 
          Tarjetas de acceso rápido para funciones principales del usuario.
          Tarjetas simples y estáticas que proporcionan pistas de navegación visual.
        */}
        <div className="dashboard-cards">
          <div className="card">
            <h3>Perfil</h3>
            <p>Gestión de tu perfil</p>
          </div>
          <div className="card">
            <h3>Facturas</h3>
            <p>Consulta tus facturas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeUser;
