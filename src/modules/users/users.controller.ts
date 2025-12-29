import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UsersService } from '@modules/users/users.service';
import { CreateUserRequest, UpdateUserRequest } from '@modules/users/dto';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ApiResponseDto } from '@common/dto/paginated-response.dto';
import { EntityMapper } from '@common/mappers/entity.mapper';
import { GetUserResponse } from '@modules/users/dto/response/get-user.response';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ResponseInterceptor)
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: ApiResponseDto,
  })
  public async findAll(@Query() query: PaginationQueryDto) {
    const users = await this.usersService.findAll(query.pageId, query.pageSize);
    return users.map((user) => EntityMapper.toUserResponse(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  public async findOne(@Param('id', ParseIntPipe) id: number): Promise<GetUserResponse> {
    const user = await this.usersService.findOne(id);
    return EntityMapper.toUserResponse(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  public async create(@Body() createUserRequest: CreateUserRequest): Promise<GetUserResponse> {
    const user = await this.usersService.create(createUserRequest);
    return EntityMapper.toUserResponse(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRequest: UpdateUserRequest,
  ): Promise<GetUserResponse> {
    const user = await this.usersService.update(id, updateUserRequest);
    return EntityMapper.toUserResponse(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  public async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.remove(id);
  }
}
