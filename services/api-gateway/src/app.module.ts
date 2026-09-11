import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModuleGateway } from './module/module.gateway';
import { ServiceGateway } from './service/service.gateway';
import { ControllerGateway } from './controller/controller.gateway';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [AppController],
  providers: [AppService, ModuleGateway, ServiceGateway, ControllerGateway],
})
export class AppModule {}
