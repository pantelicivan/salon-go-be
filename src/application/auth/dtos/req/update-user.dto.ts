import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateUserRequestDTO {
  @IsOptional()
  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'First name' },
    },
  })
  @IsString({
    context: {
      priority: 2,
      translationKey: 'isString',
      args: { property: 'First name' },
    },
  })
  @Expose({ name: 'first_name' })
  @ApiPropertyOptional({ name: 'first_name' })
  readonly firstName?: string;

  @IsOptional()
  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Last name' },
    },
  })
  @IsString({
    context: {
      priority: 2,
      translationKey: 'isString',
      args: { property: 'Last name' },
    },
  })
  @Expose({ name: 'last_name' })
  @ApiPropertyOptional({
    name: 'last_name',
  })
  readonly lastName?: string;
}
