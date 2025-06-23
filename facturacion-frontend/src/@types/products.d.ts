interface Product {
  ProductID: number;
  Name: string;
  Price: number;
  Stock: number;
}

interface ProductFormValues extends Omit<Product, 'ProductID'> {
  ProductID?: number; // Optional for edit forms
}

interface ProductWithDetails extends Product {
  InInvoices?: InvoiceDetail[]; // For relationships
}

// Filters for products
interface ProductFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  orderBy?: 'name' | 'price' | 'stock';
  order?: 'asc' | 'desc';
  limit?: number;
}

// For selection in invoices
interface SelectedProduct extends Product {
  Quantity: number;
  Subtotal: number;
}

export interface ProductDto {
  productId: number;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface ProductCreateDto {
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface ProductUpdateDto {
  productId: number;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}
