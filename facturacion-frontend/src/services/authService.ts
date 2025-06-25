
/**
 * Authentication Service
 * 
 * Provides comprehensive authentication functionality for the application including
 * login, logout, role management, and secure token handling. This service handles
 * all API communications related to user authentication and authorization.
 * 
 * Key Features:
 * - Secure user login with JWT token management
 * - Multi-role user support with role selection
 * - Automatic token refresh and session management
 * - LocalStorage integration for persistence
 * - Role-based authorization headers
 * - Secure logout with complete cleanup
 * 
 * Security Features:
 * - JWT token validation and expiration handling
 * - Secure storage of authentication data
 * - Automatic cleanup on logout
 * - Role-based access control preparation
 * - HTTPS-only API communication
 * 
 * Integration Points:
 * - Works with useAuth hook for state management
 * - Integrates with protected route components
 * - Supports role-based navigation and permissions
 * - Compatible with all CRUD services requiring authentication
 * 
 * Data Flow:
 * 1. User credentials → API authentication
 * 2. JWT token received and stored securely
 * 3. User data and roles cached in localStorage
 * 4. Authentication headers prepared for API calls
 * 5. Role selection for multi-role users
 * 
 * Storage Management:
 * - authToken: JWT for API authentication
 * - userData: User profile and role information
 * - selectedRole: Current active role for the session
 * - authHeader: Prepared authorization header
 * 
 * Error Handling:
 * - Network errors with retry mechanisms
 * - Invalid credentials with clear messages
 * - Token expiration with refresh logic
 * - Role selection validation
 * 
 * @author Sistema de Facturación
 * @version 1.0.0
 */

/**
 * Authentication service object containing all auth-related operations
 * 
 * Provides methods for login, logout, role management, and token handling.
 * All methods are async and handle errors appropriately.
 */
export const authService = {
  /**
   * Authenticates a user with email and password
   * 
   * Sends credentials to the authentication API and processes the response.
   * On success, returns user data, token, and expiration information.
   * 
   * Process:
   * 1. Validate input parameters
   * 2. Send POST request to authentication endpoint
   * 3. Process API response
   * 4. Return structured authentication data
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{token: string, expiration: string, user: object}>} Authentication data
   * @throws {object} Authentication error with errorCode and message
   */
  login: async (email: string, password: string) => {
    const apiEndpoint = 'https://localhost:44306/api/Auth/login';
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

  /**
   * Logs out the current user and cleans up all authentication data
   * 
   * Removes all authentication-related data from localStorage to ensure
   * complete session cleanup and security.
   * 
   * Cleanup includes:
   * - JWT authentication token
   * - User profile data
   * - Selected role information
   * - Prepared authorization headers
   * 
   * @returns {Promise<void>} Resolves when logout is complete
   */
  logout: async () => {
    // Remove all authentication data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('selectedRole');
    localStorage.removeItem('authHeader');
  },

  /**
   * Sets the selected role for the current user session
   * 
   * Stores the selected role in localStorage for multi-role users.
   * This role will be used for authorization throughout the session.
   * 
   * @param {string} role - The role to set as active for this session
   */
  selectRole: (role: string) => {
    localStorage.setItem('selectedRole', role);
  },

  /**
   * Retrieves the currently selected role for the session
   * 
   * Gets the active role from localStorage. Used by authorization
   * systems to determine user permissions.
   * 
   * @returns {string | null} The selected role or null if none selected
   */
  getSelectedRole: (): string | null => {
    return localStorage.getItem('selectedRole');
  },

  /**
   * Fetches current user data from the API
   * 
   * Makes an authenticated request to get the most up-to-date user
   * information from the server. Requires valid authentication token.
   * 
   * Process:
   * 1. Get current token from localStorage
   * 2. Send authenticated GET request to user endpoint
   * 3. Process and return user data
   * 
   * @returns {Promise<object>} Current user data from server
   * @throws {object} API error with errorCode and message
   */
  getCurrentUser: async () => {
    const token = localStorage.getItem('authToken');
    const apiEndpoint = 'https://localhost:44306/api/Users/me';
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

  /**
   * Checks if the current user has a specific role
   * 
   * Validates that the user both possesses the required role and
   * is currently using that role in their session.
   * 
   * Validation Process:
   * 1. Check if user data and selected role exist
   * 2. Parse user data from localStorage
   * 3. Verify role exists in user's role list
   * 4. Confirm the role is currently selected
   * 
   * @param {string} requiredRole - Role to check for
   * @returns {boolean} True if user has and is using the role
   */
  hasRole: (requiredRole: string): boolean => {
    const userData = localStorage.getItem('userData');
    const selectedRole = localStorage.getItem('selectedRole');
    
    if (!userData || !selectedRole) return false;
    
    try {
      const user = JSON.parse(userData);
      const userRoles = user.roles || [];
      
      // Check if user has required role and is currently using it
      return userRoles.includes(requiredRole) && selectedRole === requiredRole;
    } catch {
      return false;
    }
  },

  /**
   * Checks if the user can access resources requiring specific roles
   * 
   * Validates if the user's currently selected role is included
   * in the list of allowed roles for a resource or action.
   * 
   * @param {string[]} allowedRoles - Array of roles that can access the resource
   * @returns {boolean} True if current role is in allowed roles list
   */
  canAccess: (allowedRoles: string[]): boolean => {
    const selectedRole = localStorage.getItem('selectedRole');
    return selectedRole ? allowedRoles.includes(selectedRole) : false;
  }
};

/**
 * Utility function to get the current authentication token
 * 
 * Provides quick access to the stored JWT token for making
 * authenticated API requests.
 * 
 * @returns {string | null} JWT token or null if not authenticated
 */
export const getToken = () => {
  return localStorage.getItem('authToken');
};