import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator'
import { OrderItemDto } from './order-item-dto'

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]

  // @IsNumber()
  // @IsPositive()
  // @Type(() => Number)
  // totalAmount: number

  // @IsNumber()
  // @IsPositive()
  // @Type(() => Number)
  // totalItems: number

  // @IsEnum(OrderStatusList, {
  //   message: `status must be a valid value ${OrderStatusList}`
  // })
  // @IsOptional()
  // status: OrderStatus = OrderStatus.PENDING

  // @IsOptional()
  // @IsBoolean()
  // paid: boolean = false
}
