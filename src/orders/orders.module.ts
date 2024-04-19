import { Module } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { NatsModule } from 'src/transports'

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [NatsModule]
})
export class OrdersModule {}
