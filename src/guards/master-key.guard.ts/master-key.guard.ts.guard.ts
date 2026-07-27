import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MasterKeyGuardTsGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const masterKey = request.headers['x-master-key'];
    if (!masterKey || masterKey !== process.env.MASTER_KEY) {
      throw new UnauthorizedException('Unauthorized');
    }
    return true;
  }
}
