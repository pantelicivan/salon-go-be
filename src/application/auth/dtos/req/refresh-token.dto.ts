import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenRequestDTO {
  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Refresh token' },
    },
  })
  @Expose({ name: 'refresh_token' })
  @ApiProperty({ name: 'refresh_token' })
  refreshToken: string;
}
