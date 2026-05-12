import { ROLES } from 'src/constants/roles';

export interface PayloadToken {
  sub?: string;
  role?: ROLES;
  secret?: string;
}

export interface AuthBody {
  username: string;
  password: string;
}

export interface AuthTokenResult {
  role: string;
  sub: string;
  iat: number;
  exp: number;
}

export interface IUseToken {
  role: string;
  sub: string;
  isExpired: boolean;
}
