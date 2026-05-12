import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  ACCESS_LEVEL_KEY,
  ADMIN_KEY,
  PUBLIC_KEY,
  ROLES,
  ROLES_KEY,
} from '../../../constants';
import { UsersService } from '../../../modules/users/services/users.service';

@Injectable()
export class AccessLevelGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    const roles = this.reflector.get<Array<keyof typeof ROLES>>(
      ROLES_KEY,
      context.getHandler(),
    );

    const accessLevel = this.reflector.get<number>(
      ACCESS_LEVEL_KEY,
      context.getHandler(),
    );

    const admin = this.reflector.get<string>(ADMIN_KEY, context.getHandler());

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();

    const { roleUser, idUser } = req;

    if (accessLevel === undefined) {
      if (roles === undefined) {
        if (!admin) {
          return true;
        } else if (admin && roleUser === admin) {
          return true;
        } else {
          throw new UnauthorizedException(
            "You don't have permission to perform this action",
          );
        }
      }
    }

    if (roleUser === ROLES.ADMIN || roleUser === ROLES.FACILITATOR) {
      return true;
    }

    const user = this.userService.findUserById(idUser);
    // const existUserInProject = (await user).projectsIncludes.find(
    //   (project) => project.project.id === req.params.projectId,
    // );

    // if (existUserInProject === undefined) {
    //   throw new UnauthorizedException("You don't belong to this project");
    // }

    // if (accessLevel !== existUserInProject.accessLevel) {
    //   throw new UnauthorizedException(
    //     "You don't have level access to this project",
    //   );
    // }

    return true;
  }
}
