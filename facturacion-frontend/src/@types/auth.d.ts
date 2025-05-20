// Types for Roles
interface Role {
  RoleID: number;
  RoleName: string;
}

// Types for Users
interface User {
  UserID: number;
  Username: string;
  Email: string;
  Password?: string; // Only for creation/update
  Roles?: Role[]; // For relationships
}

// Types for the User-Role relationship
interface UserRole {
  UserID: number;
  RoleID: number;
}

// Types for JWT authentication
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
  expiration: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Types for user registration
interface RegisterUser {
  Username: string;
  Email: string;
  Password: string;
  RoleIDs?: number[]; // For role assignment
}

declare type UserRoleType = 'admin' | 'user'; // Main roles
