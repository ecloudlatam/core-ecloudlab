import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'shared/auth';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor (private readonly authService: AuthService) {}
  
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request = context.switchToHttp().getRequest()
    const apikey = request.headers['x-api-key']

    if(!apikey){
      throw new UnauthorizedException("empty authorization")
    }

    const apps = await this.authService.validarApiKey(apikey)
    request['apps'] = apps

    return true;
  }
}
