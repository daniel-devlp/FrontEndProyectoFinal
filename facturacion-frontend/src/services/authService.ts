
export const authService = {
  login: async (email: string, password: string) => {
    const apiEndpoint = 'http://invoiceDevWeb.somee.com/api/Auth/login';
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
      user: data.user,
    };
  },
logout: async () => {
  // Remove the authentication token from localStorage
  localStorage.removeItem('authToken');
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
};

export const getToken = () => {
  return localStorage.getItem('authToken');
};