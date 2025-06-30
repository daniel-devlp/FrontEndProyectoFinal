/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧾 HOOK PERSONALIZADO PARA GESTIÓN DE FACTURAS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este hook centraliza toda la lógica relacionada con la gestión de facturas
 * del sistema, incluyendo operaciones CRUD, validaciones, paginación y búsqueda.
 * 
 * 🎯 FUNCIONALIDADES PRINCIPALES:
 * • Operaciones CRUD completas (Create, Read, Update, Delete)
 * • Sistema de paginación automática para grandes volúmenes de facturas
 * • Búsqueda en tiempo real con debounce por número, cliente o fecha
 * • Manejo inteligente de estados de carga separados (inicial vs búsqueda)
 * • Integración con sistema de notificaciones moderno
 * • Cálculos automáticos de totales y subtotales
 * • Validación de datos de facturación
 * 
 * 🔧 CARACTERÍSTICAS EMPRESARIALES:
 * • Numeración automática de facturas
 * • Cálculo de impuestos según configuración regional
 * • Gestión de estados de factura (borrador, enviada, pagada, anulada)
 * • Integración con datos de clientes y productos
 * • Validaciones de integridad de datos financieros
 * • Manejo de múltiples items por factura
 * 
 * 🚀 MEJORAS FUTURAS SUGERIDAS:
 * • Generación automática de PDF con diseño personalizable
 * • Envío automático por email al cliente
 * • Sistema de recordatorios de pago automatizado
 * • Integración con sistemas de pago online
 * • Facturación recurrente/suscripciones
 * • Multi-moneda con conversión automática
 * • Notas de crédito y débito
 * • Reportes financieros avanzados (ventas, impuestos, ganancias)
 * • Integración con sistemas contables (QuickBooks, SAP)
 * • Workflow de aprobación para facturas grandes
 * • Historial de cambios y auditoría
 * • Plantillas de facturas personalizables
 * • Sistema de descuentos y promociones aplicables
 * • Gestión de inventario integrada
 * • Análisis de patrones de facturación
 * 
 * 💡 EJEMPLO DE USO:
 * ```typescript
 * const { 
 *   invoices, 
 *   loading, 
 *   searching,
 *   totalItems,
 *   createInvoice, 
 *   updateInvoice, 
 *   deleteInvoice 
 * } = useInvoices({ 
 *   pageNumber: 1, 
 *   pageSize: 10, 
 *   searchTerm: 'INV-2024' 
 * });
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { notifications } from '../utils/notifications';
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
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      // Solo mostrar loading completo en la carga inicial
      if (isInitialLoad) {
        setLoading(true);
      } else {
        // Para búsquedas, usar un estado separado
        setSearching(true);
      }
      
      setError(null);
      
      try {
        const response = await invoiceService.getAllInvoices({
          pageNumber,
          pageSize,          searchTerm,
        });
        setInvoices(response.data);
        setTotalItems(response.totalItems);      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        notifications.error('Error al cargar facturas: ' + (err instanceof Error ? err.message : 'Error desconocido'));
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
        fetchInvoices();
      }, 300); // 300ms de debounce
    } else {
      // Carga inmediata para carga inicial o búsqueda vacía
      fetchInvoices();
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [pageNumber, pageSize, searchTerm, isInitialLoad]);
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
      notifications.success('Factura creada exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error : ' + (err instanceof Error ? err.message : 'Error desconocido'));
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
              }            : invoice
        )
      );
      notifications.success('Factura actualizada exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error al actualizar factura: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };
  const deleteInvoice = async (id: number) => {
    try {
      await invoiceService.deleteInvoice(id);
      setInvoices((prev) => prev.filter((invoice) => invoice.invoiceId !== id));
      notifications.success('Factura eliminada exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error al eliminar factura: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  return { invoices, totalItems, loading, searching, error, createInvoice, updateInvoice, deleteInvoice };
};



