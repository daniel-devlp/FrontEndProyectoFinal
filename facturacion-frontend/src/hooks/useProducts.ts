import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import type { ProductDto, ProductCreateDto, ProductUpdateDto } from '../@types/products';

export const useProducts = ({ pageNumber, pageSize, searchTerm }: { pageNumber: number; pageSize: number; searchTerm: string }) => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
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
      }
    };

    fetchProducts();
  }, [pageNumber, pageSize, searchTerm]);

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
      throw new Error('Validación fallida');
    }

    try {
      await productService.createProduct(dto);
      setProducts((prev) => [...prev, { ...dto, productId: Date.now() }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  const updateProduct = async (id: number, dto: ProductUpdateDto) => {
    const errors = validateProductFields(dto, products);
    if (Object.keys(errors).length > 0) {
      setError('Error en los datos del producto. Por favor, revise los campos.');
      throw new Error('Validación fallida');
    }

    try {
      await productService.updateProduct(id, dto);
      setProducts((prev) => prev.map((product) => (product.productId === id ? { ...product, ...dto } : product)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.productId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return { products, totalItems, loading, error, createProduct, updateProduct, deleteProduct };
};
