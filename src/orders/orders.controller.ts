import { Controller, ParseUUIDPipe } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { OrdersService } from './orders.service'
import { ChangeOrderStatusDto, CreateOrderDto, OrderPaginationDTO } from './dto'

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'createOrder' })
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto)
  }

  @MessagePattern({ cmd: 'findAllOrders' })
  findAll(@Payload() orderPaginationDTO: OrderPaginationDTO) {
    return this.ordersService.findAll(orderPaginationDTO)
  }

  @MessagePattern({ cmd: 'findOneOrder' })
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id)
  }

  @MessagePattern({ cmd: 'changeOrderStatus' })
  changeStatus(@Payload() changeOrderStatusDto: ChangeOrderStatusDto) {
    return this.ordersService.changeStatus(changeOrderStatusDto)
  }
}
