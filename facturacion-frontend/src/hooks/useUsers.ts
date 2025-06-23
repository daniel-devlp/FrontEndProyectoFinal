import { useState, useEffect } from 'react';
import { usersService } from '../services/usersService';
import { toast } from 'react-toastify';
// Importar los tipos necesarios para resolver los errores
import type { UserCreateDto, UserUpdateDto } from '../@types/users';

// Hacer que identificationNumber sea opcional en el tipo User
interface User {
  id: string;
  identificationNumber?: string;
  userName: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  roles: string[];
  isLocked: boolean;
  password?: string; // Opcional para creación
  confirmPassword?: string; // Nuevo campo para confirmar contraseña
}
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

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await usersService.getUsers();
        // Transformar los datos del backend para incluir las propiedades requeridas
        const transformedData = data.map((user) => ({
          id: user.id || '',
          identificationNumber: user.identificationNumber || '',
          userName: user.userName || '',
          name: user.name || '',
          email: user.email || '',
          emailConfirmed: user.emailConfirmed || false,
          roles: user.roles || [],
          isLocked: user.isLocked || false,
        }));
        setUsers(transformedData);
      } catch (err: any) {
        setError(err.message || 'Error al obtener usuarios.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const user = await usersService.getCurrentUser();
        setCurrentUserId(user.id);
      } catch (err: any) {
        toast.error('Error al obtener el ID del usuario actual: ' + (err.message || 'Intente nuevamente.'));
      }
    };

    fetchCurrentUserId();
  }, []);

  // Ajustar el tipo de datos para resolver los errores
  const createUser = async (userData: UserCreateDto) => {
    const errors = validateUserFields(userData, users);
    if (Object.keys(errors).length > 0) {
      setError('Error en los datos del usuario. Por favor, revise los campos.');
      throw new Error('Validación fallida');
    }

    try {
      console.log('Datos enviados al backend:', userData); // Registrar los datos enviados
      const newUser = await usersService.createUser(userData);
      setUsers((prev) => [...prev, newUser]);
      toast.success('Usuario creado exitosamente.');
    } catch (err: any) {
      console.error('Error al crear usuario:', err.message || err);
      toast.error('Error al crear usuario: ' + (err.message || 'Intente nuevamente.'));
      throw new Error(err.message || 'Error al crear usuario.');
    }
  };

  // Ajustar la función updateUser para evitar asignar valores void
  const updateUser = async (userId: string, userData: UserUpdateDto) => {
    const errors = validateUserFields(userData, users);
    if (Object.keys(errors).length > 0) {
      setError('Error en los datos del usuario. Por favor, revise los campos.');
      throw new Error('Validación fallida');
    }

    try {
      await usersService.updateUser(userId, userData);
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...userData } : user)));
      toast.success('Usuario actualizado exitosamente.');
    } catch (err: any) {
      toast.error('Error al actualizar usuario: ' + (err.message || 'Intente nuevamente.'));
      throw new Error(err.message || 'Error al actualizar usuario.');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await usersService.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success('Usuario eliminado exitosamente.');
    } catch (err: any) {
      toast.error('Error al eliminar usuario: ' + (err.message || 'Intente nuevamente.'));
      throw new Error(err.message || 'Error al eliminar usuario.');
    }
  };

  const unlockUser = async (userId: string) => {
    try {
      await usersService.unlockUser(userId);
      toast.success('Usuario desbloqueado exitosamente.');
    } catch (err: any) {
      toast.error('Error al desbloquear usuario: ' + (err.message || 'Intente nuevamente.'));
      throw new Error(err.message || 'Error al desbloquear usuario.');
    }
  };

  return {
    users,
    loading,
    error,
    currentUserId,
    createUser,
    updateUser,
    deleteUser,
    unlockUser,
  };
};

export const validateUserData = (userData: {
  userName: string;
  name: string;
  email: string;
  password: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!userData.userName || userData.userName.trim().length === 0) {
    errors.push('El nombre de usuario es obligatorio.');
  }

  if (!userData.name || userData.name.trim().length === 0) {
    errors.push('El nombre es obligatorio.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!userData.email || !emailRegex.test(userData.email)) {
    errors.push('El correo electrónico no es válido.');
  }

  const passwordRules = [
    { regex: /\d/, message: 'Debe contener al menos un dígito.' },
    { regex: /[a-z]/, message: 'Debe contener al menos una letra minúscula.' },
    { regex: /[A-Z]/, message: 'Debe contener al menos una letra mayúscula.' },
    { regex: /[^a-zA-Z0-9]/, message: 'Debe contener al menos un carácter no alfanumérico.' },
    { regex: /.{4,}/, message: 'Debe tener al menos 4 caracteres.' },
  ];

  for (const rule of passwordRules) {
    if (!rule.regex.test(userData.password)) {
      errors.push(rule.message);
    }
  }

  return { isValid: errors.length === 0, errors };
};

export const prepareUserDataForBackend = (userData: {
  userName: string;
  name: string;
  email: string;
  password: string;
}): {
  userName: string;
  name: string;
  email: string;
  password: string;
  roles: string[];
} => {
  return {
    ...userData,
    roles: ['Administrator', 'user'],
  };
};

const validateUserFields = (user: Partial<User>, existingUsers: User[] = []) => {
  const errors: Record<string, string> = {};

  if (!user.identificationNumber?.trim()) {
    errors.identificationNumber = 'El número de identificación es obligatorio';
  } else if (user.identificationNumber.length !== 10) {
    errors.identificationNumber = 'La cédula debe tener exactamente 10 caracteres';
  } else if (!/^[0-9]+$/.test(user.identificationNumber)) {
    errors.identificationNumber = 'La cédula solo debe contener números';
  } else if (!validateCedula(user.identificationNumber)) {
    errors.identificationNumber = 'La cédula no es válida';
  } else if (existingUsers.some((u) => u.identificationNumber === user.identificationNumber)) {
    errors.identificationNumber = 'Ya existe un usuario con esta cédula';
  }

  if (!user.userName?.trim()) {
    errors.userName = 'El nombre de usuario es obligatorio';
  }

  if (!user.name?.trim()) {
    errors.name = 'El nombre es obligatorio';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!user.email?.trim()) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (!emailRegex.test(user.email)) {
    errors.email = 'El correo electrónico no es válido';
  }

  if (!user.password?.trim()) {
    errors.password = 'La contraseña es obligatoria';
  } else {
    const passwordRules = [
      { regex: /\d/, message: 'Debe contener al menos un dígito.' },
      { regex: /[a-z]/, message: 'Debe contener al menos una letra minúscula.' },
      { regex: /[A-Z]/, message: 'Debe contener al menos una letra mayúscula.' },
      { regex: /[^a-zA-Z0-9]/, message: 'Debe contener al menos un carácter no alfanumérico.' },
      { regex: /.{4,}/, message: 'Debe tener al menos 4 caracteres.' },
    ];

    for (const rule of passwordRules) {
      if (!rule.regex.test(user.password)) {
        errors.password = rule.message;
        break;
      }
    }
  }

  if (user.password && user.confirmPassword && user.password !== user.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  return errors;
};

export { validateUserFields };
