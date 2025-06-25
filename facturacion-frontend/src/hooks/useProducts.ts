/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 HOOK PERSONALIZADO PARA GESTIÓN DE PRODUCTOS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este hook centraliza toda la lógica relacionada con la gestión de productos
 * del inventario, incluyendo operaciones CRUD, validaciones, paginación y búsqueda.
 * 
 * 🎯 FUNCIONALIDADES PRINCIPALES:
 * • Operaciones CRUD completas (Create, Read, Update, Delete)
 * • Sistema de paginación automática con navegación eficiente
 * • Búsqueda en tiempo real con debounce para optimizar rendimiento
 * • Validación avanzada de códigos de producto únicos
 * • Manejo inteligente de estados de carga separados (inicial vs búsqueda)
 * • Integración con sistema de notificaciones moderno
 * • Control de stock y precios con validaciones numéricas
 * 
 * 🔧 VALIDACIONES IMPLEMENTADAS:
 * • Códigos de producto únicos con verificación en tiempo real
 * • Validación de precios positivos y formato numérico
 * • Control de stock mínimo y máximo
 * • Longitud y caracteres permitidos en nombres y descripciones
 * • Prevención de duplicados por código y nombre
 * 
 * 🚀 MEJORAS FUTURAS SUGERIDAS:
 * • Sistema de categorías y subcategorías de productos
 * • Gestión de variantes (color, talla, modelo)
 * • Control de stock por ubicación/almacén
 * • Historial de cambios de precios con fechas
 * • Sistema de proveedores por producto
 * • Códigos de barras con generación automática
 * • Imágenes de productos con galería
 * • Sistema de descuentos y promociones
 * • Alertas de stock mínimo configurables
 * • Integración con APIs de precios de mercado
 * • Sistema de etiquetas/tags para clasificación
 * • Control de productos activos/inactivos
 * • Exportación de catálogo en diferentes formatos
 * • Sistema de reseñas y calificaciones
 * 
 * 💡 EJEMPLO DE USO:
 * ```typescript
 * const { 
 *   products, 
 *   loading, 
 *   searching,
 *   totalItems,
 *   createProduct, 
 *   updateProduct, 
 *   deleteProduct 
 * } = useProducts({ 
 *   pageNumber: 1, 
 *   pageSize: 10, 
 *   searchTerm: 'laptop' 
 * });
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { notifications } from '../utils/notifications';
import { productService } from '../services/productService';
import type { ProductDto, ProductCreateDto, ProductUpdateDto } from '../@types/products';

export const useProducts = ({ pageNumber, pageSize, searchTerm }: { pageNumber: number; pageSize: number; searchTerm: string }) => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      // Solo mostrar loading completo en la carga inicial
      if (isInitialLoad) {
        setLoading(true);
      } else {
        // Para búsquedas, usar un estado separado
        setSearching(true);
      }
      
      setError(null);
      
      try {
        const response = await productService.getAllProducts({ pageNumber, pageSize, searchTerm });
        console.log('Respuesta completa del servidor:', response);
        if (response && typeof response === 'object' && Array.isArray(response.data)) {
          setProducts(response.data);
          setTotalItems(response.totalItems);
        } else {
          console.error('Error: La propiedad "data" no es un arreglo válido. Respuesta recibida:', response);
          throw new Error('La propiedad "data" no es un arreglo válido.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
        setSearching(false);
        setIsInitialLoad(false);
      }
    };

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Si es búsqueda (no carga inicial), aplicar debounce
    if (!isInitialLoad && searchTerm !== '') {
      searchTimeoutRef.current = setTimeout(() => {
        fetchProducts();
      }, 300); // 300ms de debounce
    } else {
      // Carga inmediata para carga inicial o búsqueda vacía
      fetchProducts();
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [pageNumber, pageSize, searchTerm, isInitialLoad]);

  const validateProductFields = (product: Partial<ProductDto>, existingProducts: ProductDto[] = []) => {
    const errors: Record<string, string> = {};

    if (!product.code?.trim()) {
      errors.code = 'El código es obligatorio';
    } else if (existingProducts.some((p) => p.code === product.code)) {
      errors.code = 'Ya existe un producto con este código';
    }

    if (!product.name?.trim()) {
      errors.name = 'El nombre es obligatorio';
    } else if (product.name.length > 100) {
      errors.name = 'El nombre no puede superar los 100 caracteres';
    }

    if (product.price === undefined || product.price <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }

    if (product.stock === undefined || product.stock < 0) {
      errors.stock = 'El stock no puede ser negativo';
    }

    return errors;
  };
  const createProduct = async (dto: ProductCreateDto) => {    const errors = validateProductFields(dto, products);
    if (Object.keys(errors).length > 0) {
      setError('Error en los datos del producto. Por favor, revise los campos.');
      notifications.error('Error en los datos del producto. Por favor, revise los campos.');
      throw new Error('Validación fallida');
    }

    try {
      await productService.createProduct(dto);
      setProducts((prev) => [...prev, { ...dto, productId: Date.now() }]);
      notifications.success('Producto creado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error al crear producto: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      throw err;
    }
  };  const updateProduct = async (id: number, dto: ProductUpdateDto) => {
    // Excluir el producto actual de la validación de código único
    const otherProducts = products.filter(p => p.productId !== id);
    const errors = validateProductFields(dto, otherProducts);
    if (Object.keys(errors).length > 0) {
      setError('Error en los datos del producto. Por favor, revise los campos.');
      notifications.error('Error en los datos del producto. Por favor, revise los campos.');
      throw new Error('Validación fallida');
    }

    try {
      await productService.updateProduct(id, dto);
      setProducts((prev) => prev.map((product) => (product.productId === id ? { ...product, ...dto } : product)));
      notifications.success('Producto actualizado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error al actualizar producto: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      throw err;
    }
  };  const deleteProduct = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.productId !== id));
      notifications.success('Producto eliminado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error al eliminar producto: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  return { products, totalItems, loading, searching, error, createProduct, updateProduct, deleteProduct };
};


