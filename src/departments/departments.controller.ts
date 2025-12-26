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
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentRequest } from './dto/request/create-department.request';
import { UpdateDepartmentRequest } from './dto/request/update-department.request';
import { GetDepartmentResponse } from './dto/response/get-department.response';
import { DEFAULT_PAGE_SIZE } from '../common/constants/pagination.constants';
import { EntityMapper } from '../common/mappers/entity.mapper';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  public constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, type: GetDepartmentResponse, isArray: true })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  public async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<GetDepartmentResponse[]> {
    const departments = await this.departmentsService.findAll(
      limit ? parseInt(limit) : DEFAULT_PAGE_SIZE,
      offset ? parseInt(offset) : 0,
    );
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
