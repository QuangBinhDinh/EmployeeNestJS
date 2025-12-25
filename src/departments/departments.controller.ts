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
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentRequest } from './dto/request/create-department.request';
import { UpdateDepartmentRequest } from './dto/request/update-department.request';
import { GetDepartmentResponse } from './dto/response/get-department.response';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  public constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, type: GetDepartmentResponse, isArray: true })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  public async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<GetDepartmentResponse[]> {
    return this.departmentsService.findAll(
      limit ? parseInt(limit) : 10,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, type: GetDepartmentResponse })
  @ApiResponse({ status: 404, description: 'Department not found' })
  public async findOne(@Param('id') id: string): Promise<GetDepartmentResponse> {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new department' })
  @ApiResponse({ status: 201, type: GetDepartmentResponse })
  @ApiResponse({ status: 400, description: 'Bad request' })
  public async create(
    @Body(new ValidationPipe({ transform: true }))
    createDepartmentRequest: CreateDepartmentRequest,
  ): Promise<GetDepartmentResponse> {
    return this.departmentsService.create(createDepartmentRequest);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, type: GetDepartmentResponse })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  public async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true }))
    updateDepartmentRequest: UpdateDepartmentRequest,
  ): Promise<GetDepartmentResponse> {
    return this.departmentsService.update(id, updateDepartmentRequest);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ status: 204, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  public async remove(@Param('id') id: string): Promise<void> {
    return this.departmentsService.remove(id);
  }
}
