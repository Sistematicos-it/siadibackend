import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserEntity } from 'src/modules/users/entities/users.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import { PayloadToken } from '../interfaces/auth.interfaces';
import { jwtConstants } from 'src/constants/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ErrorManager } from 'src/utils';

@Injectable()
export class AuthService {
  // Como solo queremos usar el userService sin tener que importar el repo, pues solo importamos el servicios
  // pero no basta solo con eso, hay que importar el UserService y el UserModule en el auth.module
  // Y para que no de problemas hay que tambien exportar el UserService y el TypeOrmModule en users.module

  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  //  Esta funcion valida el usuario ya sea por el username o por el email
  public async validateUser(username: string, password: string) {
    const userByUsername = await this.userService.findBy({
      key: 'username',
      value: username,
    });
    const userByEmail = await this.userService.findBy({
      key: 'email',
      value: username,
    });

    if (userByUsername) {
      const match = await bcrypt.compare(password, userByUsername.password);
      if (match) return userByUsername;
    }

    if (userByEmail) {
      const match = await bcrypt.compare(password, userByEmail.password);
      if (match) return userByEmail;
    }
    return null;
  }

  public singJWT({
    payload,
    secret,
    expires,
  }: {
    payload: jwt.JwtPayload;
    secret: jwt.Secret;
    expires: number | string;
  }) {
    return jwt.sign(payload, secret, { expiresIn: expires });
  }

  public async generateJWT(user: UserEntity): Promise<any> {
    const getUser = await this.userService.findUserById(user?.id);
    const payload: PayloadToken = {
      sub: getUser?.id,
    };
    return {
      jwtToken: this.singJWT({
        payload,
        secret: this.configService.get('JWT_SECRET'),
        expires: jwtConstants.expiration_time,
      }),
      usefullLifeInMillis: jwtConstants.expiration_time * 1000,
      isFirstTime: getUser?.isFirstTime
    };
  }

  public async refreshToken(token: string) {
    try {
      if (!token) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se proporciono un token de acceso',
        });
      }
      const decoded = jwt.decode(token) as PayloadToken;

      if(!decoded?.sub){
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'JWT Malformado',
        });
      }

      const getUser = await this.userService.findUserById(decoded?.sub);

      return await this.generateJWT(getUser);
    } catch (error) {
      console.log(error);
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
