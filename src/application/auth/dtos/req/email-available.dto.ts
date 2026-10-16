import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailAvailableRequestDTO {
  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Email' },
    },
  })
  @IsEmail(undefined, {
    context: { priority: 2, translationKey: 'emailNotValid' },
  })
  @ApiProperty({ example: 'example@gmail.com' })
  readonly email: string;
}
