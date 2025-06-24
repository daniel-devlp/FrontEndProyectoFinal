import axios from 'axios';
import type { ProductDto, ProductCreateDto, ProductUpdateDto } from '../@types/products';
import { getToken } from './authService';

const API_URL = 'https://invoiceDevWeb.somee.com/api/Product';

const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    throw new Error('No se encontró un token de autenticación.');
  }
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

export const productService = {
  getProductById: async (id: number): Promise<ProductDto> => {
    const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

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

  createProduct: async (dto: ProductCreateDto): Promise<void> => {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to create product');
  },

  updateProduct: async (id: number, dto: ProductUpdateDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to update product');
  },

  deleteProduct: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete product');
  },
};
