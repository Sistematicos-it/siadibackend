import { ConfigModule, ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import {
  AuthTokenResult,
  IUseToken,
} from 'src/modules/auth/interfaces/auth.interfaces';


ConfigModule.forRoot();

const configService = new ConfigService()

const secret = configService.get("JWT_SECRET")


export const useToken = (token: string): IUseToken | string => {
  try {
    const decode = jwt.verify(token, secret) as AuthTokenResult;
    const currentDate = new Date();
    const expiresDate = new Date(decode.exp);
    return {
      role: decode.role,
      sub: decode.sub,
      isExpired: +expiresDate <= +currentDate / 1000,
    };
  } catch (error) {
      console.log(error);
    return 'Token is invalid';
  }
};
