export interface UserDto {
  id: string;
  userName: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  roles: string[];
  isLocked: boolean;
  password?: string;
  identificationNumber?: string;
}

export interface UserCreateDto {
  userName: string;
  name: string;
  email: string;
  password: string;
  roles: string[];
  identificationNumber?: string;
}

export interface UserUpdateDto {
  id: string;
  userName: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  roles: string[];
  isLocked: boolean;
  password?: string;
}
