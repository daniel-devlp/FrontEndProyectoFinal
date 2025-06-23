import axios from 'axios';
import type { ClientDto } from '../@types/clients';
import { getToken } from './authService'; // Importar función para obtener el token

const BASE_URL = 'http://invoiceDevWeb.somee.com/api/Client';

const getAuthHeaders = () => {
  const token = getToken(); // Obtener el token JWT
  if (!token) {
    throw new Error('No se encontró un token de autenticación.');
  }
  return { Authorization: `Bearer ${token}` };
};

export const clientService = {
  getClients: async () => {
    return await axios.get<ClientDto[]>(`${BASE_URL}`, { headers: getAuthHeaders() });
  },

  getClientById: async (id: number) => {
    if (!id || id <= 0) {
      throw new Error('El ID del cliente es obligatorio y debe ser un número positivo.');
    }
    return await axios.get(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
  },

  getAllClients: async ({
    pageNumber = 1,
    pageSize = 10,
    searchTerm = null,
  }: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string | null;
  }) => {
    if (pageNumber <= 0 || pageSize <= 0) {
      throw new Error('El número de página y el tamaño de página deben ser mayores a 0.');
    }
    const params = { pageNumber, pageSize, searchTerm };
    return await axios.get(`${BASE_URL}`, { params, headers: getAuthHeaders() });
  },

  createClient: async (client: ClientDto) => {
    // Validar datos en el frontend antes de enviarlos al backend
    if (!client.identificationNumber || client.identificationNumber.length > 20) {
      throw new Error('El número de identificación es obligatorio y debe tener un máximo de 20 caracteres.');
    }
    if (!client.firstName || client.firstName.length > 50) {
      throw new Error('El nombre es obligatorio y debe tener un máximo de 50 caracteres.');
    }
    if (!client.lastName || client.lastName.length > 100) {
      throw new Error('El apellido es obligatorio y debe tener un máximo de 100 caracteres.');
    }
    if (!client.phone || client.phone.length > 15) {
      throw new Error('El teléfono es obligatorio y debe tener un máximo de 15 caracteres.');
    }
    if (!client.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(client.email)) {
      throw new Error('El correo electrónico es obligatorio y debe tener un formato válido.');
    }
    if (!client.address || client.address.length > 200) {
      throw new Error('La dirección es obligatoria y debe tener un máximo de 200 caracteres.');
    }

    // Asegurar que el cliente cumple con el formato esperado
    const formattedClient = {
      clientId: client.clientId, // Asegurar que el ID del cliente esté incluido
      identificationType: 'cedula', // Valor fijo según lo esperado por el backend
      identificationNumber: client.identificationNumber,
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      email: client.email,
      address: client.address,
    };

    return await axios.post(`${BASE_URL}`, formattedClient, { headers: getAuthHeaders() });
  },

  updateClient: async (id: number, client: ClientDto) => {
    if (!id || id <= 0) {
      throw new Error('El ID del cliente es obligatorio y debe ser un número positivo.');
    }
    if (id !== client.clientId) {
      throw new Error('El ID en la URL debe coincidir con el ID en el cuerpo de la solicitud.');
    }
    if (!client.identificationNumber || client.identificationNumber.length > 20) {
      throw new Error('El número de identificación es obligatorio y debe tener un máximo de 20 caracteres.');
    }
    if (!client.firstName || client.firstName.length > 50) {
      throw new Error('El nombre es obligatorio y debe tener un máximo de 50 caracteres.');
    }
    if (!client.lastName || client.lastName.length > 100) {
      throw new Error('El apellido es obligatorio y debe tener un máximo de 100 caracteres.');
    }
    if (!client.phone || client.phone.length > 15) {
      throw new Error('El teléfono es obligatorio y debe tener un máximo de 15 caracteres.');
    }
    if (!client.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(client.email)) {
      throw new Error('El correo electrónico es obligatorio y debe tener un formato válido.');
    }
    if (!client.address || client.address.length > 200) {
      throw new Error('La dirección es obligatoria y debe tener un máximo de 200 caracteres.');
    }

    const formattedClient = {
      clientId: client.clientId, // Asegurar que el ID del cliente esté incluido
      identificationType: 'cedula', // Valor fijo según lo esperado por el backend
      identificationNumber: client.identificationNumber,
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      email: client.email,
      address: client.address,
    };

    return await axios.put(`${BASE_URL}/${id}`, formattedClient, { headers: getAuthHeaders() });
  },

  deleteClient: async (id: number) => {
    if (!id || id <= 0) {
      throw new Error('El ID del cliente es obligatorio y debe ser un número positivo.');
    }
    return await axios.delete(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
  },
};
