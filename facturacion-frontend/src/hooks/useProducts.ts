import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
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
  const createProduct = async (dto: ProductCreateDto) => {
    const errors = validateProductFields(dto, products);
    if (Object.keys(errors).length > 0) {
      setError('Error en los datos del producto. Por favor, revise los campos.');
      toast.error('Error en los datos del producto. Por favor, revise los campos.');
      throw new Error('Validación fallida');
    }

    try {
      await productService.createProduct(dto);
      setProducts((prev) => [...prev, { ...dto, productId: Date.now() }]);
      toast.success('Producto creado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al crear producto: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      throw err;
    }
  };  const updateProduct = async (id: number, dto: ProductUpdateDto) => {
    // Excluir el producto actual de la validación de código único
    const otherProducts = products.filter(p => p.productId !== id);
    const errors = validateProductFields(dto, otherProducts);
    if (Object.keys(errors).length > 0) {
      setError('Error en los datos del producto. Por favor, revise los campos.');
      toast.error('Error en los datos del producto. Por favor, revise los campos.');
      throw new Error('Validación fallida');
    }

    try {
      await productService.updateProduct(id, dto);
      setProducts((prev) => prev.map((product) => (product.productId === id ? { ...product, ...dto } : product)));
      toast.success('Producto actualizado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al actualizar producto: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      throw err;
    }
  };
  const deleteProduct = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.productId !== id));
      toast.success('Producto eliminado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al eliminar producto: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  return { products, totalItems, loading, searching, error, createProduct, updateProduct, deleteProduct };
};
