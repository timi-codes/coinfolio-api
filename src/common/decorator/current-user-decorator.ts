import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from 'src/auth/entities/user.entities';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
