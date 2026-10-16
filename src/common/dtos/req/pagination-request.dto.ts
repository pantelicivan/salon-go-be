import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

// Static
import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  PAGINATION_MIN_LIMIT,
  PAGINATION_MIN_PAGE,
} from '../../static/application.static';

export class PaginationRequestDTO {
  @Type(() => Number)
  @IsOptional()
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
    },
    {
      context: {
        priority: 1,
        translationKey: 'isNumber',
        args: { property: 'Limit' },
      },
    },
  )
  @Min(PAGINATION_MIN_LIMIT, {
    context: {
      priority: 2,
      translationKey: 'isMin',
      args: { property: 'Limit', min_number: PAGINATION_MIN_LIMIT },
    },
  })
  @Max(PAGINATION_MAX_LIMIT, {
    context: {
      priority: 3,
      translationKey: 'isMax',
      args: { property: 'Limit', max_number: PAGINATION_MAX_LIMIT },
    },
  })
  @ApiPropertyOptional()
  readonly limit: number = PAGINATION_DEFAULT_LIMIT;

  @Type(() => Number)
  @IsOptional()
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
    },
    {
      context: {
        priority: 1,
        translationKey: 'isNumber',
        args: { property: 'Page' },
      },
    },
  )
  @Min(PAGINATION_MIN_PAGE, {
    context: {
      priority: 2,
      translationKey: 'isMin',
      args: { property: 'Page', min_number: PAGINATION_MIN_PAGE },
    },
  })
  @ApiPropertyOptional()
  readonly page: number = PAGINATION_MIN_PAGE;
}
