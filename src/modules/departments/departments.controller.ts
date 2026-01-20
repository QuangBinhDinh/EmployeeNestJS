import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from '@modules/departments/departments.service';
import {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  GetDepartmentResponse,
} from '@modules/departments/dto';
import { EntityMapper } from '@common/mappers/entity.mapper';
import {
  ResponseInterceptor,
  CacheResponseInterceptor,
  CacheResponse,
  InvalidateCache,
} from '@common/interceptors';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ApiResponseDto } from '@common/dto/paginated-response.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RateLimitGuard, RateLimit } from '@common/guards/rate-limit.guard';

@ApiTags('Departments')
@ApiBearerAuth('JWT-auth')
@Controller('departments')
// @Roles(Role.Admin)
@UseInterceptors(ResponseInterceptor, CacheResponseInterceptor)
@UseGuards(RateLimitGuard)
@RateLimit()
export class DepartmentsController {
  public constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments (cached)' })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  @CacheResponse() // Cache based on query params
  @Public()
  public async findAll(@Query() query: PaginationQueryDto): Promise<GetDepartmentResponse[]> {
    const departments = await this.departmentsService.findAll(query.pageId, query.pageSize);
    return departments.map(EntityMapper.toDepartmentResponse);
  }

  @Get('external')
  @ApiOperation({ summary: 'Fetch external data' })
  @ApiResponse({ status: 200, description: 'External data fetched successfully' })
  @Public()
  public async fetchExternal(): Promise<any> {
    return this.departmentsService.fetchExternal();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, type: GetDepartmentResponse })
  @CacheResponse() // Cache based on :id param
  public async findOne(@Param('id') id: string): Promise<GetDepartmentResponse> {
    const department = await this.departmentsService.findOne(id);
    return EntityMapper.toDepartmentResponse(department);
  }

  @Post()
  @ApiOperation({ summary: 'Create new department' })
  @ApiResponse({ status: 201, type: GetDepartmentResponse })
  @InvalidateCache() // Increment cache version
  public async create(
    @Body() createDepartmentRequest: CreateDepartmentRequest,
  ): Promise<GetDepartmentResponse> {
    const department = await this.departmentsService.create(createDepartmentRequest);
    return EntityMapper.toDepartmentResponse(department);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, type: GetDepartmentResponse })
  @InvalidateCache() // Increment cache version
  public async update(
    @Param('id') id: string,
    @Body() updateDepartmentRequest: UpdateDepartmentRequest,
  ): Promise<GetDepartmentResponse> {
    const department = await this.departmentsService.update(id, updateDepartmentRequest);
    return EntityMapper.toDepartmentResponse(department);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ status: 204, description: 'Department deleted successfully' })
  @InvalidateCache() // Increment cache version
  public async remove(@Param('id') id: string): Promise<void> {
    return this.departmentsService.remove(id);
  }
}
