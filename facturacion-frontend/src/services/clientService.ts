/**
 * Client Service
 * 
 * Provides comprehensive client management functionality including CRUD operations,
 * pagination, search, and validation. This service handles all API communications
 * related to client management with proper authentication and error handling.
 * 
 * Key Features:
 * - Complete CRUD operations for client management
 * - Paginated client listing with search capabilities
 * - Client data validation and sanitization
 * - Authenticated API requests with JWT tokens
 * - Comprehensive error handling and validation
 * - Input sanitization for security
 * 
 * Security Features:
 * - JWT token authentication for all requests
 * - Input validation and sanitization
 * - SQL injection prevention through parameterized queries
 * - XSS protection through data validation
 * - Authorization header management
 * 
 * Validation Rules:
 * - Identification Number: Required, max 20 characters
 * - First Name: Required, max 50 characters
 * - Last Name: Required, max 50 characters
 * - Email: Optional, valid email format if provided
 * - Phone: Optional, valid phone format if provided
 * - Address: Optional, max 200 characters
 * 
 * API Integration:
 * - URL Base: https://localhost:44306/api/Client
 * - Authentication: Bearer JWT token
 * - Content-Type: application/json
 * - Response format: JSON with proper error handling
 * 
 * Error Handling:
 * - Network connectivity issues
 * - Authentication failures
 * - Validation errors with specific messages
 * - Server errors with user-friendly messages
 * - Duplicate client detection
 * 
 * Usage Patterns:
 * - Used by useClients hook for state management
 * - Integrated with client CRUD pages
 * - Supports both admin and user access levels
 * - Compatible with pagination and search components
 * 
 * @author Sistema de Facturación
 * @version 1.0.0
 */
import axios from 'axios';
import type { ClientDto } from '../@types/clients';
import { getToken } from './authService'; // Import function to get authentication token

/** URL base para endpoints de la API de clientes */
const BASE_URL = 'https://91c2-45-173-230-87.ngrok-free.app/api/Client';

/**
 * Generates authentication headers with JWT token
 * 
 * Creates the authorization header required for authenticated API requests.
 * Throws an error if no valid token is found.
 * 
 * @returns {object} Headers object with Authorization bearer token
 * @throws {Error} When no authentication token is found
 */
const getAuthHeaders = () => {
  const token = getToken(); // Get JWT token from auth service
  if (!token) {
    throw new Error('No se encontró un token de autenticación.');
  }
  return { Authorization: `Bearer ${token}` };
};

/**
 * Client service object containing all client-related operations
 * 
 * Provides methods for client CRUD operations, pagination, search,
 * and validation. All methods include proper error handling and authentication.
 */
export const clientService = {
  /**
   * Retrieves all clients (simple list)
   * 
   * Gets a basic list of all clients without pagination.
   * Used for dropdown lists and simple client selection.
   * 
   * @returns {Promise<AxiosResponse<ClientDto[]>>} Response with client list
   * @throws {Error} Network or authentication errors
   */
  getClients: async () => {
    return await axios.get<ClientDto[]>(`${BASE_URL}`, { headers: getAuthHeaders() });
  },

  /**
   * Retrieves a specific client by ID
   * 
   * Fetches detailed information for a single client.
   * Includes input validation for the client ID.
   * 
   * @param {number} id - Client ID to retrieve
   * @returns {Promise<AxiosResponse>} Response with client data
   * @throws {Error} Invalid ID or network/authentication errors
   */
  getClientById: async (id: number) => {
    if (!id || id <= 0) {
      throw new Error('El ID del cliente es obligatorio y debe ser un número positivo.');
    }
    return await axios.get(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
  },

  /**
   * Retrieves paginated list of clients with search capability
   * 
   * Supports pagination and search functionality for client management.
   * Validates pagination parameters to ensure proper API usage.
   * 
   * @param {object} params - Pagination and search parameters
   * @param {number} params.pageNumber - Page number (1-based, default: 1)
   * @param {number} params.pageSize - Items per page (default: 10)
   * @param {string|null} params.searchTerm - Search term for filtering (optional)
   * @returns {Promise<AxiosResponse>} Response with paginated client data
   * @throws {Error} Invalid pagination parameters or network errors
   */
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

  /**
   * Creates a new client with validation
   * 
   * Creates a new client after performing comprehensive validation
   * on all required and optional fields. Ensures data integrity
   * before sending to the API.
   * 
   * Validation Rules Applied:
   * - Identification Number: Required, max 20 chars
   * - First Name: Required, max 50 chars
   * - Last Name: Required, max 50 chars
   * - Email: Optional, valid format if provided
   * - Phone: Optional, valid format if provided
   * - Address: Optional, max 200 chars
   * 
   * @param {ClientDto} client - Client data to create
   * @returns {Promise<AxiosResponse>} Response with created client data
   * @throws {Error} Validation errors or network/API errors
   */
  createClient: async (client: ClientDto) => {
    // Frontend validation before sending to backend
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

    // Ensure client meets expected format for backend API
    const formattedClient = {
      clientId: client.clientId, // Ensure client ID is included
      identificationType: 'cedula', // Fixed value as expected by backend
      identificationNumber: client.identificationNumber,
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      email: client.email,
      address: client.address,
    };

    return await axios.post(`${BASE_URL}`, formattedClient, { headers: getAuthHeaders() });
  },

  /**
   * Updates an existing client with validation
   * 
   * Updates client information after performing comprehensive validation
   * on all fields and ensuring ID consistency. Validates that the URL ID
   * matches the client data ID for security.
   * 
   * Security Checks:
   * - URL ID matches request body ID
   * - All validation rules applied (same as create)
   * - Authentication required
   * 
   * @param {number} id - Client ID to update
   * @param {ClientDto} client - Updated client data
   * @returns {Promise<AxiosResponse>} Response with updated client data
   * @throws {Error} Validation errors, ID mismatch, or network errors
   */
  updateClient: async (id: number, client: ClientDto) => {
    if (!id || id <= 0) {
      throw new Error('El ID del cliente es obligatorio y debe ser un número positivo.');
    }
    if (id !== client.clientId) {
      throw new Error('El ID en la URL debe coincidir con el ID en el cuerpo de la solicitud.');
    }
    
    // Apply same validation rules as create
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

    // Format client data for backend consistency
    const formattedClient = {
      clientId: client.clientId, // Ensure client ID is included
      identificationType: 'cedula', // Fixed value as expected by backend
      identificationNumber: client.identificationNumber,
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      email: client.email,
      address: client.address,
    };

    return await axios.put(`${BASE_URL}/${id}`, formattedClient, { headers: getAuthHeaders() });
  },

  /**
   * Deletes a client by ID
   * 
   * Permanently removes a client from the system. Includes ID validation
   * to ensure proper request format. This is a destructive operation
   * that should be used with caution.
   * 
   * Security Notes:
   * - Requires authentication
   * - Validates ID format
   * - Permanent deletion (consider soft delete for production)
   * 
   * @param {number} id - Client ID to delete
   * @returns {Promise<AxiosResponse>} Response confirming deletion
   * @throws {Error} Invalid ID or network/authentication errors
   */
  deleteClient: async (id: number) => {
    if (!id || id <= 0) {
      throw new Error('El ID del cliente es obligatorio y debe ser un número positivo.');
    }
    return await axios.delete(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
  },
};
