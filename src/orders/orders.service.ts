import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit
} from '@nestjs/common'
import { CreateOrderDto } from './dto/create-order.dto'
import { PrismaClient } from '@prisma/client'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { ChangeOrderStatusDto, OrderPaginationDTO } from './dto'
import { NATS_SERVICE } from 'src/config/services'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super()
  }

  private readonly logger = new Logger('OrdersService')

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Connected to the database')
  }

  async create(createOrderDto: CreateOrderDto) {
    const { items } = createOrderDto
    const ids = Array.from(new Set(items.map((item) => item.productId)))

    const products: any[] = await firstValueFrom(
      this.client.send({ cmd: 'validateProducts' }, ids)
    ).catch((error) => {
      throw new RpcException(error)
    })

    const totalAmount = items.reduce((acc, orderItem) => {
      const price = (products as unknown as any[]).find(
        (product) => product.id === orderItem.productId
      ).price
      return acc + price * orderItem.quantity
    }, 0)

    const totalItems = items.reduce((acc, orderItem) => {
      return acc + orderItem.quantity
    }, 0)

    const order = await this.order.create({
      data: {
        totalAmount,
        totalItems,
        OrderItem: {
          createMany: {
            data: items.map((item) => ({
              quantity: item.quantity,
              price: products.find((product) => product.id === item.productId)
                .price,
              productId: item.productId
            }))
          }
        }
      },
      include: {
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true
          }
        }
      }
    })

    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        product: products.find((product) => product.id === orderItem.productId)
          .name
      }))
    }
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
    const order = await this.order.findFirst({
      where: { id },
      include: {
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true
          }
        }
      }
    })
    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`
      })
    }

    const productIds = order.OrderItem.map((orderItem) => orderItem.productId)

    const products = await firstValueFrom(
      this.client.send({ cmd: 'validateProducts' }, productIds)
    ).catch((error) => {
      throw new RpcException(error)
    })

    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        product: products.find((product) => product.id === orderItem.productId)
          .name
      }))
    }
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
