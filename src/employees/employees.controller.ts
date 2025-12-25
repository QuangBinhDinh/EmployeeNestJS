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
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeRequest } from './dto/request/create-employee.request';
import { UpdateEmployeeRequest } from './dto/request/update-employee.request';
import { GetEmployeeResponse } from './dto/response/get-employee.response';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  public constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, type: GetEmployeeResponse, isArray: true })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  public async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<GetEmployeeResponse[]> {
    return this.employeesService.findAll(
      limit ? parseInt(limit) : 10,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, type: GetEmployeeResponse })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  public async findOne(@Param('id', ParseIntPipe) id: number): Promise<GetEmployeeResponse> {
    return this.employeesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new employee' })
  @ApiResponse({ status: 201, type: GetEmployeeResponse })
  @ApiResponse({ status: 400, description: 'Bad request' })
  public async create(
    @Body(new ValidationPipe({ transform: true })) createEmployeeRequest: CreateEmployeeRequest,
  ): Promise<GetEmployeeResponse> {
    return this.employeesService.create(createEmployeeRequest);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, type: GetEmployeeResponse })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) updateEmployeeRequest: UpdateEmployeeRequest,
  ): Promise<GetEmployeeResponse> {
    return this.employeesService.update(id, updateEmployeeRequest);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  public async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.employeesService.remove(id);
  }
}
