import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      // Cambia esta versión o usa el package.json para verificar tus despliegues en Docker
      version: '1.0.1',
    };
  }
}
