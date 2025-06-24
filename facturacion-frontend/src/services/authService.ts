
export const authService = {
  login: async (email: string, password: string) => {
    const apiEndpoint = 'https://invoiceDevWeb.somee.com/api/Auth/login';
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    };

    const response = await fetch(apiEndpoint, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      throw { errorCode: data.errorCode, message: data.message };
    }

    return {
      token: data.token,
      expiration: data.expiration,
      user: data.user,
    };
  },

  logout: async () => {
    // Remove all authentication data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('selectedRole');
    localStorage.removeItem('authHeader');
  },

  selectRole: (role: string) => {
    localStorage.setItem('selectedRole', role);
  },

  getSelectedRole: (): string | null => {
    return localStorage.getItem('selectedRole');
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('authToken');
    const apiEndpoint = 'http://invoiceDevWeb.somee.com/api/Users/me';
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    const response = await fetch(apiEndpoint, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      throw { errorCode: data.errorCode, message: data.message };
    }

    return data;
  },

  hasRole: (requiredRole: string): boolean => {
    const userData = localStorage.getItem('userData');
    const selectedRole = localStorage.getItem('selectedRole');
    
    if (!userData || !selectedRole) return false;
    
    try {
      const user = JSON.parse(userData);
      const userRoles = user.roles || [];
      
      // Verificar si el usuario tiene el rol requerido y si está usando ese rol
      return userRoles.includes(requiredRole) && selectedRole === requiredRole;
    } catch {
      return false;
    }
  },

  canAccess: (allowedRoles: string[]): boolean => {
    const selectedRole = localStorage.getItem('selectedRole');
    return selectedRole ? allowedRoles.includes(selectedRole) : false;
  }
};

export const getToken = () => {
  return localStorage.getItem('authToken');
};