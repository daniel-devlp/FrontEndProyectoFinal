// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: number;
    details?: Record<string, string>;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// Types for forms
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// Types for UI
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface AlertMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timeout?: number;
}

// Types for tables
interface ColumnDefinition<T> {
  key: string;
  header: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

// Utility types
type Nullable<T> = T | null;
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Useful enums
declare enum InvoiceStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  CANCELED = 'Canceled'
}

declare enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}
