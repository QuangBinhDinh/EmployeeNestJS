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
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from '@modules/employees/employees.service';
import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  FindByGenderQueryDto,
} from '@modules/employees/dto';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ApiResponseDto } from '@common/dto/paginated-response.dto';
import { EntityMapper } from '@common/mappers/entity.mapper';
import { GetEmployeeResponse } from '@modules/employees/dto/response/get-employee.response';

@ApiTags('Employees')
@ApiBearerAuth('JWT-auth')
@Controller('employees')
@UseInterceptors(ResponseInterceptor)
export class EmployeesController {
  public constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({
    status: 200,
    description: 'List of employees',
    type: ApiResponseDto,
  })
  public async findAll(@Query() query: PaginationQueryDto) {
    console.log('Get listed employees called');
    const employees = await this.employeesService.findAll(query.pageId, query.pageSize);
    return employees.map(EntityMapper.toEmployeeResponse);
  }

  @Get('find-gender')
  @ApiOperation({ summary: 'Get employees by gender' })
  @ApiResponse({ status: 200, description: 'Employee details' })
  public async findByGender(@Query() query: FindByGenderQueryDto): Promise<GetEmployeeResponse[]> {
    const employee = await this.employeesService.findByGender(query.gender);
    return employee.map(EntityMapper.toEmployeeResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee details' })
  public async findOne(@Param('id', ParseIntPipe) id: number): Promise<GetEmployeeResponse> {
    const employee = await this.employeesService.findOne(id);
    return EntityMapper.toEmployeeResponse(employee);
  }

  @Post()
  @ApiOperation({ summary: 'Create new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  public async create(
    @Body() createEmployeeRequest: CreateEmployeeRequest,
  ): Promise<GetEmployeeResponse> {
    const employee = await this.employeesService.create(createEmployeeRequest);
    return EntityMapper.toEmployeeResponse(employee);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeRequest: UpdateEmployeeRequest,
  ): Promise<GetEmployeeResponse> {
    const employee = await this.employeesService.update(id, updateEmployeeRequest);
    return EntityMapper.toEmployeeResponse(employee);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  public async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.employeesService.remove(id);
  }
}
