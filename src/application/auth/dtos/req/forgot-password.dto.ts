import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class ForgotPasswordRequestDTO {
  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Email' },
    },
  })
  @IsString({
    context: {
      priority: 2,
      translationKey: 'isString',
      args: { property: 'Email' },
    },
  })
  @IsEmail(undefined, {
    context: {
      priority: 3,
      translationKey: 'emailNotValid',
    },
  })
  readonly email: string;
}
