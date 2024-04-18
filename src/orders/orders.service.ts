import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { CreateOrderDto } from './dto/create-order.dto'
import { PrismaClient } from '@prisma/client'
import { RpcException } from '@nestjs/microservices'
import { ChangeOrderStatusDto, OrderPaginationDTO } from './dto'

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService')

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Connected to the database')
  }

  async create(createOrderDto: CreateOrderDto) {
    return await this.order.create({ data: createOrderDto })
  }

  async findAll(orderPaginationDTO: OrderPaginationDTO) {
    const { status, page, limit } = orderPaginationDTO

    const total = await this.order.count({ where: { status } })
    const totalPages = Math.ceil(total / limit)
    const orders = await this.order.findMany({
      where: { status },
      skip: (page - 1) * limit,
      take: limit
    })

    return {
      meta: {
        total,
        totalPages,
        page,
        limit
      },
      data: orders
    }
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({ where: { id } })
    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`
      })
    }

    return order
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto

    const order = await this.findOne(id)

    if (order.status === status) {
      return order
    }

    return await this.order.update({
      where: { id },
      data: { status }
    })
  }
}
