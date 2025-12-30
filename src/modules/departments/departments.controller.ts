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
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from '@modules/departments/departments.service';
import {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  GetDepartmentResponse,
} from '@modules/departments/dto';
import { EntityMapper } from '@common/mappers/entity.mapper';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ApiResponseDto } from '@common/dto/paginated-response.dto';
import { Roles, Role } from '@/common/roles';

@ApiTags('Departments')
@ApiBearerAuth('JWT-auth')
@Controller('departments')
// @Roles(Role.Admin)
@UseInterceptors(ResponseInterceptor)
export class DepartmentsController {
  public constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  public async findAll(@Query() query: PaginationQueryDto): Promise<GetDepartmentResponse[]> {
    const departments = await this.departmentsService.findAll(query.pageId, query.pageSize);
    return departments.map(EntityMapper.toDepartmentResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, type: GetDepartmentResponse })
  public async findOne(@Param('id') id: string): Promise<GetDepartmentResponse> {
    const department = await this.departmentsService.findOne(id);
    return EntityMapper.toDepartmentResponse(department);
  }

  @Post()
  @ApiOperation({ summary: 'Create new department' })
  @ApiResponse({ status: 201, type: GetDepartmentResponse })
  public async create(
    @Body() createDepartmentRequest: CreateDepartmentRequest,
  ): Promise<GetDepartmentResponse> {
    const department = await this.departmentsService.create(createDepartmentRequest);
    return EntityMapper.toDepartmentResponse(department);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, type: GetDepartmentResponse })
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
  public async remove(@Param('id') id: string): Promise<void> {
    return this.departmentsService.remove(id);
  }
}
