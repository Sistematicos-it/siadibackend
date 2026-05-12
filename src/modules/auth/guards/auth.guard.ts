import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PUBLIC_KEY } from '../../../constants';
import { UsersService } from '../../../modules/users/services/users.service';
import { useToken } from '../../../utils/use.token';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UsersService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers['authorization'];

    if (!token)
      throw new UnauthorizedException('Invalid token');

    const splitted_token = token.split(' ')[1];
    const manageToken = useToken(splitted_token);

    if (typeof manageToken === 'string')
      throw new UnauthorizedException(manageToken);

    if (manageToken.isExpired) throw new UnauthorizedException('Token expired');

    const { sub } = manageToken;

    const user = await this.userService.findUserById(sub);
    if (!user) {
      throw new UnauthorizedException('User invalid');
    }

    req.idUser = user?.id;
    req.roleUser = user?.role?.role_value;
    return true;
  }
}
