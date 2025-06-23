interface Invoice {
  InvoiceID: number;
  ClientIDNumber: string;
  UserID: number;
  Date: string | Date;
  Total: number;
  Client?: Client; // For relationships
  User?: User; // For relationships
  Details?: InvoiceDetail[]; // For relationships
}

interface InvoiceDetail {
  DetailID: number;
  InvoiceID_FK: number;
  ProductID_FK: number;
  Quantity: number;
  UnitPrice: number;
  Subtotal: number;
  Product?: Product; // For relationships
}

interface InvoiceFormValues {
  ClientIDNumber: string;
  Products: Array<{
    ProductID: number;
    Quantity: number;
    UnitPrice: number;
  }>;
  UserID: number;
}

interface FullInvoice extends Invoice {
  Details: Array<InvoiceDetail & { Product: Product }>;
}

// Filters for invoices
interface InvoiceFilters {
  from?: string | Date;
  to?: string | Date;
  byClient?: string;
  byUser?: number;
  orderBy?: 'date' | 'total';
  order?: 'asc' | 'desc';
  limit?: number;
}

export interface InvoiceDto {
  invoiceId: number;
  invoiceNumber: string;
  client: ClientDto;
  issueDate: string;
  total: number;
}

interface InvoiceUpdateDto {
  clientId: number;
  issueDate: string;
  invoiceDetails: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
  }>;
}

interface InvoiceCreateDto {
  invoiceNumber: string;
  clientId: number;
  userId: string;
  issueDate: string;
  observations: string;
  invoiceDetails: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
  }>;
}

interface InvoiceDetailDto {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface ClientDto {
  clientId: number;
  identificationType: 'cedula';
  identificationNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ProductDto {
  productId: number;
  name: string;
  price: number;
  stock: number;
}
