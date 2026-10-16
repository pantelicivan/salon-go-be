import { IsNotEmpty, IsUUID } from 'class-validator';

export class VerifyEmailRequestDTO {
  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Token ID' },
    },
  })
  @IsUUID(undefined, {
    context: {
      priority: 2,
      translationKey: 'isUUID',
      args: { property: 'Token ID' },
    },
  })
  token: string;
}
