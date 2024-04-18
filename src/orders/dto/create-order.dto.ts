import { OrderStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive
} from 'class-validator'
import { OrderStatusList } from './enum/order.enum'

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  totalAmount: number

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  totalItems: number

  @IsEnum(OrderStatusList, {
    message: `status must be a valid value ${OrderStatusList}`
  })
  @IsOptional()
  status: OrderStatus = OrderStatus.PENDING

  @IsOptional()
  @IsBoolean()
  paid: boolean = false
}
