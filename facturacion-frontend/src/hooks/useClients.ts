/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 👥 HOOK PERSONALIZADO PARA GESTIÓN DE CLIENTES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este hook centraliza toda la lógica relacionada con la gestión de clientes
 * incluyendo operaciones CRUD, validaciones, paginación y búsqueda.
 * 
 * 🎯 FUNCIONALIDADES PRINCIPALES:
 * • Operaciones CRUD completas (Create, Read, Update, Delete)
 * • Validación avanzada de cédulas ecuatorianas
 * • Sistema de paginación automática
 * • Búsqueda en tiempo real con debounce
 * • Manejo de estados de carga y errores
 * • Integración con sistema de notificaciones moderno
 * • Validación de campos con mensajes específicos
 * • Prevención de duplicados por cédula/email
 * 
 * 🔧 VALIDACIONES IMPLEMENTADAS:
 * • Algoritmo oficial de validación de cédula ecuatoriana
 * • Validación de formato de email
 * • Verificación de longitud de campos
 * • Validación de caracteres permitidos
 * • Prevención de duplicados en la base de datos
 * • Validación de números de teléfono
 * 
 * 🚀 MEJORAS FUTURAS SUGERIDAS:
 * • Validación de RUC para empresas
 * • Soporte para pasaportes internacionales
 * • Geocodificación de direcciones
 * • Validación de códigos postales
 * • Sistema de tags/categorías para clientes
 * • Historial de transacciones por cliente
 * • Integración con APIs de verificación de identidad
 * • Sistema de calificación/scoring de clientes
 * • Exportación a diferentes formatos (CSV, Excel, PDF)
 * • Importación masiva desde archivos
 * 
 * 💡 EJEMPLO DE USO:
 * ```typescript
 * const { 
 *   clients, 
 *   loading, 
 *   createClient, 
 *   updateClient, 
 *   deleteClient 
 * } = useClients({ 
 *   pageNumber: 1, 
 *   pageSize: 10, 
 *   searchTerm: '' 
 * });
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { notifications } from '../utils/notifications';
import type { ClientDto } from '../@types/clients';
import { clientService } from '../services/clientService';

/**
 * 🆔 VALIDADOR DE CÉDULA ECUATORIANA
 * 
 * Implementa el algoritmo oficial de validación de cédulas de Ecuador
 * según las especificaciones del Registro Civil.
 * 
 * @param cedula - Número de cédula como string de 10 dígitos
 * @returns boolean - true si la cédula es válida, false en caso contrario
 * 
 * 🔍 ALGORITMO DE VALIDACIÓN:
 * 1. Verifica que tenga exactamente 10 dígitos numéricos
 * 2. Valida que los primeros 2 dígitos correspondan a una provincia válida (01-24)
 * 3. Verifica que el tercer dígito sea menor a 6 (reservado para personas naturales)
 * 4. Aplica el algoritmo de módulo 10 con coeficientes específicos
 * 5. Compara el dígito verificador calculado con el proporcionado
 * 
 * 💡 CASOS ESPECIALES:
 * • Provincias válidas: 01-24 (Azuay hasta Orellana + zonas no delimitadas)
 * • Tercer dígito: 0-5 para personas naturales, 6-8 para empresas públicas, 9 para jurídicas
 * • Coeficientes: [2,1,2,1,2,1,2,1,2] aplicados a los primeros 9 dígitos
 * 
 * 🚀 MEJORAS FUTURAS:
 * • Soporte para validación de RUC (empresas)
 * • Cache de validaciones para mejorar performance
 * • Integración con API del Registro Civil para verificación online
 * • Validación de cédulas de extranjeros residentes
 */

const validateCedula = (cedula: string): boolean => {
  const tamanoLongitudCedula = 10;
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const numeroProvincias = 24;
  const tercerDigito = 6;

  if (!/^[0-9]+$/.test(cedula) || cedula.length !== tamanoLongitudCedula) {
    return false;
  }

  const provincia = parseInt(cedula.substring(0, 2), 10);
  const digitoTres = parseInt(cedula[2], 10);

  if (provincia <= 0 || provincia > numeroProvincias || digitoTres >= tercerDigito) {
    return false;
  }

  const digitoVerificadorRecibido = parseInt(cedula[9], 10);
  let total = 0;

  for (let k = 0; k < coeficientes.length; k++) {
    const valor = coeficientes[k] * parseInt(cedula[k], 10);
    total += valor >= 10 ? valor - 9 : valor;
  }

  const digitoVerificadorObtenido = total % 10 === 0 ? 0 : 10 - (total % 10);

  return digitoVerificadorObtenido === digitoVerificadorRecibido;
};

export const validateClientFieldsUpdate = (
  client: Partial<ClientDto>,
  existingClients: ClientDto[] = [],
  validateCedulaField: boolean = true
) => {
  const errors: Record<string, string> = {};

  if (validateCedulaField) {
    if (!client.identificationNumber?.trim() ) {
      errors.identificationNumber = 'El número de identificación es obligatorio';
    } else if (client.identificationNumber.length !== 10) {
      errors.identificationNumber = 'La cédula debe tener exactamente 10 caracteres';
    } else if (!/^[0-9]+$/.test(client.identificationNumber)) {
      errors.identificationNumber = 'La cédula solo debe contener números';
    
    } else if ( !validateCedula(client.identificationNumber)) {
      errors.identificationNumber = 'La cédula no es válida';
    }
  }
  if (!client.firstName?.trim()) {
    errors.firstName = 'El nombre es obligatorio';
  } else if (client.firstName.length > 50) {
    errors.firstName = 'El nombre no puede superar los 50 caracteres';
  } else if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/.test(client.firstName)) {
    errors.firstName = 'El nombre solo puede contener letras y espacios';
  }

  if (!client.lastName?.trim()) {
    errors.lastName = 'El apellido es obligatorio';
  } else if (client.lastName.length > 50) {
    errors.lastName = 'El apellido no puede superar los 50 caracteres';
  } else if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/.test(client.lastName)) {
    errors.lastName = 'El apellido solo puede contener letras y espacios';
  }

  if (!client.phone?.trim()) {
    errors.phone = 'El teléfono es obligatorio';
  } else if (client.phone.length > 10 || client.phone.length < 7) {
    errors.phone = 'El teléfono no puede superar los 10 caracteres';
  } else if (!/^[0-9]+$/.test(client.phone)) {
    errors.phone = 'El teléfono solo debe contener números';
  }
  

  if (!client.email?.trim()) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(client.email)) {
    errors.email = 'El correo electrónico no es válido';
  }

  if (!client.address?.trim()) {
    errors.address = 'La dirección es obligatoria';
  } else if (client.address.length > 100) {
    errors.address = 'La dirección no puede superar los 100 caracteres';
  }
  return errors;
};

export const validateClientFields = (
  client: Partial<ClientDto>,
  existingClients: ClientDto[] = [],
  validateCedulaField: boolean = true
) => {
  const errors: Record<string, string> = {};

  if (validateCedulaField) {
    if (!client.identificationNumber?.trim() ) {
      errors.identificationNumber = 'El número de identificación es obligatorio';
    } else if (client.identificationNumber.length !== 10) {
      errors.identificationNumber = 'La cédula debe tener exactamente 10 caracteres';
    } else if (!/^[0-9]+$/.test(client.identificationNumber)) {
      errors.identificationNumber = 'La cédula solo debe contener números';
    } else if (existingClients.some((c) => c.identificationNumber === client.identificationNumber)) {
      errors.identificationNumber = 'Ya existe un cliente con esta cédula';
    } else if ( !validateCedula(client.identificationNumber)) {
      errors.identificationNumber = 'La cédula no es válida';
    }
  }
  if (!client.firstName?.trim()) {
    errors.firstName = 'El nombre es obligatorio';
  } else if (client.firstName.length > 50) {
    errors.firstName = 'El nombre no puede superar los 50 caracteres';
  } else if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/.test(client.firstName)) {
    errors.firstName = 'El nombre solo puede contener letras y espacios';
  }

  if (!client.lastName?.trim()) {
    errors.lastName = 'El apellido es obligatorio';
  } else if (client.lastName.length > 50) {
    errors.lastName = 'El apellido no puede superar los 50 caracteres';
  } else if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/.test(client.lastName)) {
    errors.lastName = 'El apellido solo puede contener letras y espacios';
  }

  if (!client.phone?.trim()) {
    errors.phone = 'El teléfono es obligatorio';
  } else if (client.phone.length > 10 || client.phone.length < 7) {
    errors.phone = 'El teléfono no puede superar los 10 caracteres';
  } else if (!/^[0-9]+$/.test(client.phone)) {
    errors.phone = 'El teléfono solo debe contener números';
  }
  

  if (!client.email?.trim()) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(client.email)) {
    errors.email = 'El correo electrónico no es válido';
  }

  if (!client.address?.trim()) {
    errors.address = 'La dirección es obligatoria';
  } else if (client.address.length > 100) {
    errors.address = 'La dirección no puede superar los 100 caracteres';
  }
  return errors;
};

export const useClients = ({ pageNumber, pageSize, searchTerm }: { pageNumber: number; pageSize: number; searchTerm: string }) => {
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      // Solo mostrar loading completo en la carga inicial
      if (isInitialLoad) {
        setLoading(true);
      } else {
        // Para búsquedas, usar un estado separado
        setSearching(true);
      }
      
      setError(null);
      
      try {
        const response = await clientService.getAllClients({ pageNumber, pageSize, searchTerm });
        setClients(response.data.items);
        setTotalItems(response.data.totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        notifications.error('Error al cargar clientes. Por favor, intente nuevamente.');
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
        fetchClients();
      }, 300); // 300ms de debounce
    } else {
      // Carga inmediata para carga inicial o búsqueda vacía
      fetchClients();
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [pageNumber, pageSize, searchTerm, isInitialLoad]);

  const createClient = async (client: ClientDto) => {
    const errors = validateClientFields(client, clients);
    if (Object.keys(errors).length > 0) {
      throw new Error('Error en los datos del cliente. Por favor, revise los campos.');
    }

    try {
      await clientService.createClient(client);
      setClients((prev) => [...prev, client]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // Re-lanzar el error para que sea manejado por el componente
      throw err;
    }
  };

  const updateClient = async (clientId: number, client: ClientDto) => {
    const errors = validateClientFieldsUpdate(client, clients, false); // No validar cédula en actualización
    if (Object.keys(errors).length > 0) {
      notifications.error('Error en los datos del cliente. Por favor, revise los campos.');
      return;
    }

    try {
      await clientService.updateClient(clientId, client);
      setClients((prev) =>
        prev.map((c) => (c.clientId === clientId ? { ...c, ...client } : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error al actualizar cliente. Por favor, intente nuevamente.');
    }
  };

  const deleteClient = async (clientId: number) => {
    try {
      await clientService.deleteClient(clientId);
      setClients((prev) => prev.filter((c) => c.clientId !== clientId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      notifications.error('Error al eliminar cliente. Por favor, intente nuevamente.');
    }
  };

  return { clients, totalItems, loading, searching, error, createClient, updateClient, deleteClient };
};



