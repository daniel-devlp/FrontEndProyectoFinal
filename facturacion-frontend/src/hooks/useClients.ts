import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { ClientDto } from '../@types/clients';
import { clientService } from '../services/clientService';

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
export const validateClientFieldsup = (
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
    }  else if ( !validateCedula(client.identificationNumber)) {
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await clientService.getAllClients({ pageNumber, pageSize, searchTerm });
        setClients(response.data.items);
        setTotalItems(response.data.totalCount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        toast.error('Error al cargar clientes. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [pageNumber, pageSize, searchTerm]);

  const createClient = async (client: ClientDto) => {
    const errors = validateClientFields(client, clients);
    if (Object.keys(errors).length > 0) {
      toast.error('Error en los datos del cliente. Por favor, revise los campos.');
      return;
    }

    try {
      await clientService.createClient(client);
      setClients((prev) => [...prev, client]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al crear cliente. Por favor, intente nuevamente.');
    }
  };

  const updateClient = async (clientId: number, client: ClientDto) => {
    const errors = validateClientFieldsup(client, clients, false); // No validar cédula en actualización
    if (Object.keys(errors).length > 0) {
      toast.error('Error en los datos del cliente. Por favor, revise los campos.');
      return;
    }

    try {
      await clientService.updateClient(clientId, client);
      setClients((prev) =>
        prev.map((c) => (c.clientId === clientId ? { ...c, ...client } : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al actualizar cliente. Por favor, intente nuevamente.');
    }
  };

  const deleteClient = async (clientId: number) => {
    // const confirmFirst = window.confirm('¿Estás seguro de que deseas eliminar este cliente?');
    // if (!confirmFirst) return;

    // const confirmSecond = window.confirm('Esta acción es irreversible. ¿Deseas continuar?');
    // if (!confirmSecond) return;

    try {
      await clientService.deleteClient(clientId);
      setClients((prev) => prev.filter((c) => c.clientId !== clientId));
      //toast.success('Cliente eliminado exitosamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al eliminar cliente. Por favor, intente nuevamente.');
    }
  };

  return { clients, totalItems, loading, error, createClient, updateClient, deleteClient };
};
