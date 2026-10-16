import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class LoginRequestDTO {
  @ApiProperty({ example: 'example@gmail.com' })
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
  readonly email: string;

  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Password' },
    },
  })
  @ApiProperty({ example: 'superSecretPassword' })
  readonly password: string;
}
