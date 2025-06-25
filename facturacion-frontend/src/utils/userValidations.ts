/**
 * 🔍 UTILIDADES DE VALIDACIÓN PARA USUARIOS
 * 
 * Este archivo centraliza todas las funciones de validación específicas para usuarios,
 * incluyendo validaciones para creación, actualización y algoritmo de cédula ecuatoriana.
 * 
 * Propósito:
 * - Centralizar la lógica de validación de usuarios
 * - Proporcionar validaciones específicas para diferentes operaciones
 * - Implementar algoritmos de validación oficiales (cédula ecuatoriana)
 * - Facilitar el mantenimiento y reutilización de validaciones
 * 
 * @autor Sistema de Facturación
 * @versión 1.0.0
 * @desde 2025-06-25
 */

import type { UserDto, UserCreateDto, UserUpdateDto } from '../@types/users';

/**
 * 🆔 VALIDADOR DE CÉDULA ECUATORIANA
 * 
 * Implementa el algoritmo oficial del Registro Civil de Ecuador para
 * validar la autenticidad de una cédula de identidad.
 * 
 * 🔍 PROCESO DE VALIDACIÓN:
 * 1. Verifica que tenga exactamente 10 dígitos numéricos
 * 2. Valida que los primeros 2 dígitos representen una provincia válida (01-24)
 * 3. Verifica que el tercer dígito sea menor a 6 (reservado para futuro uso)
 * 4. Aplica el algoritmo de módulo 10 con coeficientes específicos
 * 5. Calcula el dígito verificador y lo compara con el último dígito
 * 
 * @param {string} cedula - Cédula de 10 dígitos a validar
 * @returns {boolean} true si la cédula es válida, false caso contrario
 */
export const validateCedula = (cedula: string): boolean => {
  // Constantes del algoritmo oficial de validación
  const tamanoLongitudCedula = 10;
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]; // Coeficientes oficiales del algoritmo
  const numeroProvincias = 24; // Máximo número de provincias en Ecuador
  const tercerDigito = 6; // Límite máximo para el tercer dígito

  // Validación inicial: solo números y longitud exacta
  if (!/^[0-9]+$/.test(cedula) || cedula.length !== tamanoLongitudCedula) {
    return false;
  }

  // Extraer y validar código de provincia (primeros 2 dígitos)
  const provincia = parseInt(cedula.substring(0, 2), 10);
  const digitoTres = parseInt(cedula[2], 10);

  // Validar rango de provincia y tercer dígito
  if (provincia <= 0 || provincia > numeroProvincias || digitoTres >= tercerDigito) {
    return false;
  }

  // Aplicar algoritmo de módulo 10
  const digitoVerificadorRecibido = parseInt(cedula[9], 10);
  let total = 0;

  for (let k = 0; k < coeficientes.length; k++) {
    const valor = coeficientes[k] * parseInt(cedula[k], 10);
    // Si el resultado es >= 10, restar 9 (parte del algoritmo)
    total += valor >= 10 ? valor - 9 : valor;
  }

  // Calcular dígito verificador
  const digitoVerificadorObtenido = total % 10 === 0 ? 0 : 10 - (total % 10);

  return digitoVerificadorObtenido === digitoVerificadorRecibido;
};

/**
 * 🔍 VALIDADOR COMPLETO PARA CREACIÓN DE USUARIO
 * 
 * Valida todos los campos requeridos para crear un nuevo usuario,
 * incluyendo validaciones específicas de formato y unicidad.
 * 
 * @param {UserCreateDto & { confirmPassword?: string }} user - Datos del usuario a validar
 * @param {UserDto[]} existingUsers - Lista de usuarios existentes para verificar duplicados
 * @returns {Record<string, string>} Objeto con errores por campo
 */
export const validateUserForCreation = (
  user: UserCreateDto & { confirmPassword?: string },
  existingUsers: UserDto[] = []
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // 🆔 Validación de cédula de identidad
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

  // 👤 Validación de nombre de usuario
  if (!user.userName?.trim()) {
    errors.userName = 'El nombre de usuario es obligatorio';
  } else if (user.userName.length < 3) {
    errors.userName = 'El nombre de usuario debe tener al menos 3 caracteres';
  } else if (user.userName.length > 50) {
    errors.userName = 'El nombre de usuario no puede superar los 50 caracteres';
  } else if (existingUsers.some((u) => u.userName.toLowerCase() === user.userName.toLowerCase())) {
    errors.userName = 'Ya existe un usuario con este nombre de usuario';
  }

  // 🏷️ Validación de nombre completo
  if (!user.name?.trim()) {
    errors.name = 'El nombre es obligatorio';
  } else if (user.name.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  } else if (user.name.length > 100) {
    errors.name = 'El nombre no puede superar los 100 caracteres';
  }

  // 📧 Validación de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!user.email?.trim()) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (user.email.length > 255) {
    errors.email = 'El correo electrónico no puede superar los 255 caracteres';
  } else if (!emailRegex.test(user.email)) {
    errors.email = 'El correo electrónico no es válido';
  } else if (existingUsers.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    errors.email = 'Ya existe un usuario con este correo electrónico';
  }

  // 🔐 Validación de contraseña
  if (!user.password?.trim()) {
    errors.password = 'La contraseña es obligatoria';
  } else {
    // 🛡️ Aplicar políticas de seguridad para contraseñas
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
        break; // 🚫 Solo mostrar el primer error encontrado
      }
    }
  }

  // 🔄 Validación de confirmación de contraseña
  if (user.password && user.confirmPassword && user.password !== user.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  // 🎭 Validación de roles
  if (!user.roles || user.roles.length === 0) {
    errors.roles = 'Debe seleccionar al menos un rol';
  }

  return errors;
};

/**
 * 🔍 VALIDADOR ESPECÍFICO PARA ACTUALIZACIÓN DE USUARIO
 * 
 * Valida solo los campos editables durante la actualización de un usuario,
 * excluyendo campos como contraseña y datos no modificables.
 * 
 * @param {UserUpdateDto} user - Datos del usuario a validar
 * @param {UserDto[]} existingUsers - Lista de usuarios existentes para verificar duplicados
 * @returns {Record<string, string>} Objeto con errores por campo
 */
export const validateUserForUpdate = (
  user: UserUpdateDto,
  existingUsers: UserDto[] = []
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // 🆔 Validación de cédula de identidad
  if (!user.identificationNumber?.trim()) {
    errors.identificationNumber = 'El número de identificación es obligatorio';
  } else if (user.identificationNumber.length !== 10) {
    errors.identificationNumber = 'La cédula debe tener exactamente 10 caracteres';
  } else if (!/^[0-9]+$/.test(user.identificationNumber)) {
    errors.identificationNumber = 'La cédula solo debe contener números';
  } else if (!validateCedula(user.identificationNumber)) {
    errors.identificationNumber = 'La cédula no es válida';
  } else {
    // Verificar que no exista otro usuario con la misma cédula (excluyendo el actual)
    const duplicateUser = existingUsers.find(u => 
      u.identificationNumber === user.identificationNumber && u.id !== user.id
    );
    if (duplicateUser) {
      errors.identificationNumber = 'Ya existe un usuario con esta cédula';
    }
  }

  // 👤 Validación de nombre de usuario
  if (!user.userName?.trim()) {
    errors.userName = 'El nombre de usuario es obligatorio';
  } else if (user.userName.length < 3) {
    errors.userName = 'El nombre de usuario debe tener al menos 3 caracteres';
  } else if (user.userName.length > 50) {
    errors.userName = 'El nombre de usuario no puede superar los 50 caracteres';
  } else {
    // Verificar que no exista otro usuario con el mismo userName (excluyendo el actual)
    const duplicateUser = existingUsers.find(u => 
      u.userName.toLowerCase() === user.userName.toLowerCase() && u.id !== user.id
    );
    if (duplicateUser) {
      errors.userName = 'Ya existe un usuario con este nombre de usuario';
    }
  }

  // 📧 Validación de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!user.email?.trim()) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (user.email.length > 255) {
    errors.email = 'El correo electrónico no puede superar los 255 caracteres';
  } else if (!emailRegex.test(user.email)) {
    errors.email = 'El correo electrónico no es válido';
  } else {
    // Verificar que no exista otro usuario con el mismo email (excluyendo el actual)
    const duplicateUser = existingUsers.find(u => 
      u.email.toLowerCase() === user.email.toLowerCase() && u.id !== user.id
    );
    if (duplicateUser) {
      errors.email = 'Ya existe un usuario con este correo electrónico';
    }
  }

  // 🎭 Validación de roles
  if (!user.roles || user.roles.length === 0) {
    errors.roles = 'Debe seleccionar al menos un rol';
  }

  return errors;
};

/**
 * 🔧 LIMITADORES DE ENTRADA PARA INPUTS
 * 
 * Funciones que limitan y formatean la entrada de datos en los campos del formulario.
 */

/**
 * Limita y formatea la entrada de cédula a solo números con máximo 10 dígitos
 */
export const formatCedulaInput = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 10);
};

/**
 * Limita la entrada de nombre de usuario a caracteres alfanuméricos y guiones bajos
 */
export const formatUserNameInput = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 50);
};

/**
 * Limita la entrada de nombre completo a letras, espacios y tildes
 */
export const formatNameInput = (value: string): string => {
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 100);
};

/**
 * Limita la entrada de email
 */
export const formatEmailInput = (value: string): string => {
  return value.trim().slice(0, 255);
};
