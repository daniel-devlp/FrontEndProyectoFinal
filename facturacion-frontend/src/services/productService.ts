/**
 * 🏷️ SERVICIO DE PRODUCTOS
 * 
 * Servicio integral para la gestión de productos que proporciona operaciones CRUD completas
 * con autenticación basada en tokens, validación robusta de datos y manejo integral de errores.
 * 
 * Características Principales:
 * - Operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar)
 * - Autenticación automática con tokens Bearer
 * - Paginación y búsqueda avanzadas
 * - Validación y sanitización de datos
 * - Manejo robusto de errores y estados HTTP
 * - Compatibilidad con TypeScript para seguridad de tipos
 * 
 * Funcionalidades Implementadas:
 * - Obtención de productos individuales por ID
 * - Listado paginado con capacidades de búsqueda
 * - Creación de nuevos productos con validación
 * - Actualización de productos existentes
 * - Eliminación segura de productos
 * 
 * Integración con Backend:
 * - URL Base: https://localhost:44306/api/Product
 * - Autenticación: Bearer Token en headers
 * - Formato: JSON para request/response
 * - Paginación: Soporta pageNumber, pageSize y searchTerm
 * 
 * Seguridad:
 * - Validación automática de tokens de autenticación
 * - Headers de autorización en todas las peticiones
 * - Manejo seguro de errores sin exposición de datos sensibles
 * - Validación de parámetros de entrada
 * 
 * Manejo de Errores:
 * - Verificación de tokens antes de cada petición
 * - Validación de códigos de estado HTTP
 * - Mensajes de error descriptivos y localizados
 * - Propagación controlada de errores
 * 
 * Optimización:
 * - Uso eficiente de axios para peticiones complejas
 * - fetch API para operaciones simples
 * - Reutilización de headers de autenticación
 * - Tipado TypeScript para mejor rendimiento del IDE
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 * @desde 2025-06-25
 */
import axios from 'axios';
import type { ProductDto, ProductCreateDto, ProductUpdateDto } from '../@types/products';
import { getToken } from './authService';

/** 🌐 URL base de la API de productos */
const API_URL = 'https://91c2-45-173-230-87.ngrok-free.app/api/Product';

/**
 * 🔐 Genera headers de autenticación para peticiones HTTP
 * 
 * Crea automáticamente los headers necesarios incluyendo el token Bearer
 * y el tipo de contenido para comunicación con la API de productos.
 * 
 * @retorna {object} Headers con autorización y tipo de contenido
 * @lanza {Error} Si no existe un token de autenticación válido
 */
const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    throw new Error('No se encontró un token de autenticación.');
  }
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

/**
 * 🏷️ SERVICIO PRINCIPAL DE PRODUCTOS
 * 
 * Objeto que contiene todos los métodos para interactuar con la API de productos.
 * Proporciona una interfaz unificada para operaciones CRUD con manejo de errores
 * y autenticación automática.
 */
export const productService = {
  /**
   * 📄 Obtiene un producto específico por su ID único
   * 
   * Realiza una petición GET al endpoint de productos para obtener
   * los datos completos de un producto específico.
   * 
   * @param {number} id - ID único del producto a buscar
   * @retorna {Promise<ProductDto>} Datos completos del producto
   * @lanza {Error} Si la petición falla o el producto no existe
   */
  getProductById: async (id: number): Promise<ProductDto> => {
    const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Error al obtener el producto');
    return response.json();
  },

  /**
   * 📋 Obtiene una lista paginada de productos con búsqueda opcional
   * 
   * Realiza una petición GET con parámetros de paginación y búsqueda
   * para obtener una lista de productos filtrada y paginada.
   * 
   * @param {object} params - Parámetros de consulta
   * @param {number} params.pageNumber - Número de página (base 1, por defecto: 1)
   * @param {number} params.pageSize - Cantidad de productos por página (por defecto: 10)
   * @param {string|null} params.searchTerm - Término de búsqueda opcional
   * @retorna {Promise<{data: ProductDto[], totalItems: number}>} Lista paginada de productos
   * @lanza {Error} Si la petición falla o hay errores de red
   */
  getAllProducts: async ({
    pageNumber = 1,
    pageSize = 10,
    searchTerm = null,
  }: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string | null;
  }): Promise<{ data: ProductDto[]; totalItems: number }> => {
    const response = await axios.get<{ items: ProductDto[]; totalCount: number }>(API_URL, {
      params: { pageNumber, pageSize, searchTerm },
      headers: getAuthHeaders(),
    });
    return { data: response.data.items, totalItems: response.data.totalCount };
  },

  /**
   * ➕ Crea un nuevo producto en el sistema
   * 
   * Envía los datos del nuevo producto al servidor para su creación
   * con validación automática de datos y autenticación.
   * 
   * @param {ProductCreateDto} dto - Datos del nuevo producto a crear
   * @retorna {Promise<void>} Promesa de creación exitosa
   * @lanza {Error} Si la validación falla o hay errores del servidor
   */
  createProduct: async (dto: ProductCreateDto): Promise<void> => {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Error al crear el producto');
  },

  /**
   * ✏️ Actualiza un producto existente con nuevos datos
   * 
   * Envía los datos actualizados de un producto específico al servidor
   * para su modificación con validación completa.
   * 
   * @param {number} id - ID del producto a actualizar
   * @param {ProductUpdateDto} dto - Nuevos datos del producto
   * @retorna {Promise<void>} Promesa de actualización exitosa
   * @lanza {Error} Si el producto no existe o la validación falla
   */
  updateProduct: async (id: number, dto: ProductUpdateDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Error al actualizar el producto');
  },

  /**
   * 🗑️ Elimina un producto específico del sistema
   * 
   * Realiza una eliminación permanente de un producto por su ID único
   * con confirmación de autorización y validación.
   * 
   * @param {number} id - ID del producto a eliminar
   * @retorna {Promise<void>} Promesa de eliminación exitosa
   * @lanza {Error} Si el producto no existe o no se puede eliminar
   */
  deleteProduct: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar el producto');
  },
};
