import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

// Static
import { SocialProviders } from '../../static/auth.static';

export class SocialAuthRequestDTO {
  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Token' },
    },
  })
  @IsString({
    context: {
      priority: 2,
      translationKey: 'isString',
      args: { property: 'Token' },
    },
  })
  readonly token: string;

  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Provider' },
    },
  })
  @IsString({
    context: {
      priority: 2,
      translationKey: 'isString',
      args: { property: 'Provider' },
    },
  })
  @IsEnum(SocialProviders, {
    context: {
      priority: 3,
      translationKey: 'isEnum',
      args: { property: 'Provider' },
    },
  })
  readonly provider: SocialProviders;

  @IsOptional()
  @IsString({
    context: {
      priority: 1,
      translationKey: 'isString',
      args: { property: 'First name' },
    },
  })
  @Expose({ name: 'first_name' })
  @ApiPropertyOptional({ name: 'first_name' })
  readonly firstName?: string;

  @IsOptional()
  @IsString({
    context: {
      priority: 1,
      translationKey: 'isString',
      args: { property: 'Last name' },
    },
  })
  @Expose({ name: 'last_name' })
  @ApiPropertyOptional({ name: 'last_name' })
  readonly lastName?: string;
}
