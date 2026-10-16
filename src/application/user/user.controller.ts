import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiNotFoundResponse } from '@nestjs/swagger';

// Services
import { UserService } from './user.service';

// Guards
import { JwtAuthGuard } from '../../infrastructure/core/guards/jwt-auth.guard';

// Filters
import { HttpExceptionDTO } from '../../infrastructure/core/filters/exception/dtos/res/http-exception.dto';

// Errors
import { EntityNotFound } from '../../common/static/results/application.errors';

// Response DTO
import { UserResponseDTO } from './dtos/res/user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Returns the user with the given id.
   * @param {string} id - User's id.
   * @returns Auth user response.
   */
  @Get('/:id')
  @ApiBearerAuth()
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: HttpExceptionDTO,
  })
  async getUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDTO> {
    const user = await this.userService.findOne({ id });
    if (!user) {
      throw new NotFoundException(EntityNotFound('User'));
    }
    return new UserResponseDTO(user);
  }
}
