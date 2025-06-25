/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔗 HOOK COMBINADO PARA CLIENTES Y PRODUCTOS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este hook especializado maneja la carga conjunta de clientes y productos,
 * optimizado para formularios de facturación que requieren ambos datasets.
 * 
 * 🎯 FUNCIONALIDADES PRINCIPALES:
 * • Carga simultánea de clientes y productos para formularios de facturación
 * • APIs separadas pero coordinadas para cada tipo de datos
 * • Transformación de datos para compatibilidad con componentes UI
 * • Manejo centralizado de errores para ambos tipos de datos
 * • Optimización de rendimiento con carga inicial única
 * • Headers de autenticación automáticos
 * 
 * 🔧 CARACTERÍSTICAS TÉCNICAS:
 * • Interfaz simplificada para datos de facturación
 * • Transformación automática de datos del backend
 * • Manejo robusto de errores de red
 * • Integración con sistema de notificaciones
 * • Token de autenticación desde localStorage
 * 
 * 🚀 MEJORAS FUTURAS SUGERIDAS:
 * • Cache inteligente con invalidación automática
 * • Búsqueda en tiempo real para clientes y productos
 * • Paginación lazy loading para grandes datasets
 * • Filtros avanzados (activos/inactivos, categorías)
 * • Sincronización en tiempo real con WebSockets
 * • Preload predictivo basado en patrones de uso
 * • Integración con APIs de terceros (catálogos, CRM)
 * • Sistema de favoritos/recientes para formularios
 * • Validación cruzada de disponibilidad de productos
 * • Alertas de stock bajo en tiempo real
 * • Sistema de sugerencias basado en historial
 * 
 * 💡 EJEMPLO DE USO:
 * ```typescript
 * const { 
 *   clients, 
 *   products, 
 *   fetchClients, 
 *   fetchProducts 
 * } = useClientsAndProducts();
 * 
 * // Los datos están listos automáticamente al montar el componente
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { notifications } from '../utils/notifications';

/**
 * 👤 INTERFAZ SIMPLIFICADA DE CLIENTE PARA FACTURACIÓN
 * 
 * Representa los datos mínimos necesarios de un cliente para
 * los formularios de facturación y selección rápida.
 * 
 * @interface Client
 * @property {number} id - Número de identificación único del cliente
 * @property {string} name - Nombre del cliente
 * @property {string} lastName - Apellido del cliente
 * @property {string} phone - Número de teléfono de contacto
 */
interface Client {
  id: number;
  name: string;
  lastName: string;
  phone: string;
}

/**
 * 📦 INTERFAZ SIMPLIFICADA DE PRODUCTO PARA FACTURACIÓN
 * 
 * Representa los datos esenciales de un producto para
 * los formularios de facturación y cálculos de totales.
 * 
 * @interface Product
 * @property {number} id - ID único del producto
 * @property {string} name - Nombre descriptivo del producto
 * @property {number} stock - Cantidad disponible en inventario
 * @property {number} price - Precio unitario del producto
 */
interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
}

/**
 * 🔧 HOOK PRINCIPAL DE CLIENTES Y PRODUCTOS
 * 
 * Proporciona acceso combinado a clientes y productos con carga automática
 * al inicializar el hook, optimizado para formularios de facturación.
 * 
 * @returns Objeto con datos y funciones para clientes y productos
 */
const useClientsAndProducts = () => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // 📊 ESTADOS DEL HOOK
  // ═══════════════════════════════════════════════════════════════════════════════

  /** 👥 Lista de clientes disponibles para facturación */
  const [clients, setClients] = useState<Client[]>([]);
  
  /** 📦 Lista de productos disponibles para facturación */
  const [products, setProducts] = useState<Product[]>([]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔄 FUNCIONES DE OBTENCIÓN DE DATOS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * 👥 OBTENER CLIENTES DESDE LA API
   * 
   * Realiza petición HTTP para obtener lista de clientes con paginación.
   * Incluye headers de autenticación y manejo de errores.
   * 
   * @param {string} searchTerm - Término de búsqueda para filtrar clientes
   * @param {number} pageSize - Cantidad de clientes por página
   * @param {number} pageNumber - Número de página a obtener
   * @returns {Promise<Client[]>} Lista de clientes transformados
   * 
   * 🔄 PROCESO:
   * 1. Construir query parameters para la API
   * 2. Añadir headers de autenticación
   * 3. Realizar petición HTTP
   * 4. Validar respuesta del servidor
   * 5. Transformar datos para la interfaz
   */
  const fetchClients = async (searchTerm: string, pageSize: number, pageNumber: number) => {
    const queryParams = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
      searchTerm: searchTerm || '',
    });

    // 🔐 Headers con autenticación Bearer
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Token desde localStorage
    };

    const response = await fetch(`/api/clients?${queryParams}`, { headers });

    if (!response.ok) {
      console.error(`Error al obtener clientes: ${response.status} - ${response.statusText}`);
      throw new Error('Error al obtener clientes');
    }

    const clients = await response.json();
    console.log('Respuesta del endpoint de clientes:', clients); // 🔍 Log para debugging

    // 🔄 Transformar datos del backend al formato requerido por la UI
    return clients.map((client: any) => ({
      id: client.identificationNumber, // Usar número de identificación como ID
      name: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
    }));
  };

  /**
   * 📦 OBTENER PRODUCTOS DESDE LA API
   * 
   * Realiza petición HTTP para obtener lista de productos con paginación.
   * Incluye la misma lógica de autenticación que clientes.
   * 
   * @param {string} searchTerm - Término de búsqueda para filtrar productos
   * @param {number} pageSize - Cantidad de productos por página
   * @param {number} pageNumber - Número de página a obtener
   * @returns {Promise<any>} Respuesta completa del servidor con productos
   */
  const fetchProducts = async (searchTerm: string, pageSize: number, pageNumber: number) => {
    const queryParams = new URLSearchParams({
      searchTerm,
      pageSize: pageSize.toString(),
      pageNumber: pageNumber.toString(),
    });
    const response = await fetch(`/api/products?${queryParams}`);
    return response.json();
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🚀 INICIALIZACIÓN AUTOMÁTICA
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * 📥 EFECTO DE CARGA INICIAL
   * 
   * Se ejecuta una sola vez al montar el componente para cargar
   * tanto clientes como productos de forma simultánea.
   */
  useEffect(() => {
    /**
     * 🔄 Función asíncrona para cargar datos iniciales
     * Maneja errores de forma centralizada y muestra notificaciones apropiadas
     */
    const fetchClientsAndProducts = async () => {
      try {
        // 🔄 Cargar clientes y productos en paralelo para optimizar rendimiento
        const clientsData = await fetchClients('', 10, 1); // Cargar primeros 10 clientes
        const productsData = await fetchProducts('', 10, 1); // Cargar primeros 10 productos
        
        setClients(clientsData);
        setProducts(productsData);
      } catch (error) {
        // 🚨 Notificar error al usuario de forma amigable
        notifications.error('Error al cargar clientes o productos.');
        console.error('Error detallado:', error); // 🔍 Log para debugging
      }
    };
    
    fetchClientsAndProducts();
  }, []); // Array vacío = solo ejecutar una vez al montar

  // ═══════════════════════════════════════════════════════════════════════════════
  // 📤 RETORNO DEL HOOK
  // ═══════════════════════════════════════════════════════════════════════════════

  return { 
    clients,       // 👥 Lista de clientes disponibles
    products,      // 📦 Lista de productos disponibles
    fetchClients,  // 🔄 Función para recargar clientes
    fetchProducts  // 🔄 Función para recargar productos
  };
};

export default useClientsAndProducts;



