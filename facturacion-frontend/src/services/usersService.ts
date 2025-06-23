import type { UserDto, UserCreateDto, UserUpdateDto } from '../@types/users';
import axios from 'axios';

const API_URL = 'http://invoiceDevWeb.somee.com/api/Users';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const usersService = {
  getUsers: async (): Promise<UserDto[]> => {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
  },

  getUser: async (id: string): Promise<UserDto> => {
    const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
  },

  createUser: async (data: UserCreateDto): Promise<UserDto> => {
    console.log('Datos enviados al backend:', data); // Registrar los datos enviados
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear usuario');
    return response.json();
  },

  updateUser: async (id: string, data: UserUpdateDto): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al actualizar usuario');
  },

  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar usuario');
  },

  unlockUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}/unlock`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al desbloquear usuario');
  },

  getMyProfile: async (): Promise<UserDto> => {
    const response = await fetch(`${API_URL}/me`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Error al obtener perfil');
    return response.json();
  },

  getCurrentUser: async () => {
    const response = await axios.get(`${API_URL}/me`, { headers: getAuthHeaders() });
    return response.data;
  },
};
