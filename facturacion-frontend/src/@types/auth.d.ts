/**
 * Authentication Type Definitions
 * 
 * Comprehensive type definitions for authentication, authorization, and user management
 * throughout the application. These types ensure type safety and consistency
 * across all authentication-related operations.
 * 
 * Key Areas Covered:
 * - User authentication and authorization
 * - Role-based access control (RBAC)
 * - JWT token management
 * - User registration and management
 * - Session state management
 * 
 * Security Considerations:
 * - Password fields are optional for security (not included in responses)
 * - Token expiration handling
 * - Role-based permission validation
 * - User state management for authentication flows
 * 
 * Usage Context:
 * - Used throughout authentication flows
 * - Integrated with auth services and hooks
 * - Supports role-based routing and permissions
 * - Compatible with JWT-based authentication
 * 
 * @author Sistema de Facturación
 * @version 1.0.0
 */

/**
 * Role interface for role-based access control
 * 
 * Defines the structure for user roles within the system.
 * Used for permission management and access control.
 * 
 * @interface Role
 * @property {number} RoleID - Unique identifier for the role
 * @property {string} RoleName - Human-readable name of the role (e.g., 'admin', 'user')
 */
interface Role {
  RoleID: number;
  RoleName: string;
}

/**
 * User interface for user management and authentication
 * 
 * Represents a complete user entity with authentication and authorization data.
 * Password is optional for security reasons (excluded from API responses).
 * 
 * @interface User
 * @property {number} UserID - Unique identifier for the user
 * @property {string} Username - Unique username for login
 * @property {string} Email - User's email address
 * @property {string} [Password] - User's password (only for creation/update operations)
 * @property {Role[]} [Roles] - Array of roles assigned to the user
 */
interface User {
  UserID: number;
  Username: string;
  Email: string;
  Password?: string; // Only for creation/update operations, never in responses
  Roles?: Role[]; // For role-based relationships and permissions
}

/**
 * User-Role relationship interface
 * 
 * Represents the many-to-many relationship between users and roles.
 * Used for role assignment and permission management.
 * 
 * @interface UserRole
 * @property {number} UserID - Reference to the user
 * @property {number} RoleID - Reference to the role
 */
interface UserRole {
  UserID: number;
  RoleID: number;
}

/**
 * Login request interface
 * 
 * Defines the structure for user login credentials.
 * Used for authentication API calls.
 * 
 * @interface LoginRequest
 * @property {string} username - User's username or email
 * @property {string} password - User's password
 */
interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response interface
 * 
 * Defines the structure of successful authentication responses.
 * Contains JWT token, user data, and session information.
 * 
 * @interface LoginResponse
 * @property {string} token - JWT authentication token
 * @property {User} user - Authenticated user's data (without password)
 * @property {number} expiration - Token expiration timestamp
 */
interface LoginResponse {
  token: string;
  user: User;
  expiration: number;
}

/**
 * Authentication state interface
 * 
 * Represents the current authentication state of the application.
 * Used by authentication context and hooks for state management.
 * 
 * @interface AuthState
 * @property {User | null} user - Currently authenticated user or null
 * @property {string | null} token - Current JWT token or null
 * @property {boolean} isAuthenticated - Authentication status flag
 * @property {boolean} loading - Loading state for authentication operations
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

/**
 * User registration interface
 * 
 * Defines the structure for creating new user accounts.
 * Includes optional role assignment for administrative operations.
 * 
 * @interface RegisterUser
 * @property {string} Username - Desired username (must be unique)
 * @property {string} Email - User's email address (must be unique)
 * @property {string} Password - Initial password for the account
 * @property {number[]} [RoleIDs] - Optional array of role IDs to assign
 */
interface RegisterUser {
  Username: string;
  Email: string;
  Password: string;
  RoleIDs?: number[]; // For role assignment during registration
}

/**
 * User role type enumeration
 * 
 * Defines the main role types available in the system.
 * Used for type-safe role checking and permissions.
 * 
 * @type UserRoleType
 * @values 'admin' | 'user'
 */
declare type UserRoleType = 'admin' | 'user'; // Main system roles
