import { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService';
import type {
  InvoiceDto,
  InvoiceCreateDto,
  InvoiceUpdateDto,
} from '../@types/invoices';

export const useInvoices = ({
  pageNumber,
  pageSize,
  searchTerm,
}: {
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
}) => {
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await invoiceService.getAllInvoices({
          pageNumber,
          pageSize,
          searchTerm,
        });
        setInvoices(response.data);
        setTotalItems(response.totalItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [pageNumber, pageSize, searchTerm]);

  const createInvoice = async (dto: InvoiceCreateDto) => {
    try {
      await invoiceService.createInvoice(dto);
      setInvoices((prev): InvoiceDto[] => [
        ...prev,
        {
          invoiceId: Date.now(),
          invoiceNumber: 'TEMP',
          client: {
            clientId: dto.clientId,
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            identificationType: 'cedula',
            identificationNumber: '',
          },
          issueDate: dto.issueDate,
          invoiceDetails: dto.invoiceDetails.map((detail) => ({
            ...detail,
            subtotal: detail.quantity * detail.unitPrice,
          })),
          total: dto.invoiceDetails.reduce(
            (sum, detail) => sum + detail.quantity * detail.unitPrice,
            0
          ),
        } as InvoiceDto,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const updateInvoice = async (id: number, dto: InvoiceUpdateDto) => {
    try {
      await invoiceService.updateInvoice(id, dto);
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.invoiceId === id
            ? {
                ...invoice,
                clientId: dto.clientId,
                issueDate: dto.issueDate,
                invoiceDetails: dto.invoiceDetails.map((detail) => ({
                  ...detail,
                  price: 0,
                  subtotal: detail.quantity * 0,
                })),
                total: dto.invoiceDetails.reduce(
                  (sum, detail) => sum + detail.quantity * 0,
                  0
                ),
              }
            : invoice
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const deleteInvoice = async (id: number) => {
    try {
      await invoiceService.deleteInvoice(id);
      setInvoices((prev) => prev.filter((invoice) => invoice.invoiceId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return { invoices, totalItems, loading, error, createInvoice, updateInvoice, deleteInvoice };
};
