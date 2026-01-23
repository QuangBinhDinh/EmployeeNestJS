import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { EntityMapper } from '@common/mappers/entity.mapper';
import { ApiResponseDto } from '@common/dto/paginated-response.dto';
import { DeviceLogService } from './device-log.service';
import { CreateDeviceLogRequest, GetDeviceLogResponse } from './dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Device logs')
@Controller('device-logs')
@Public()
export class DeviceLogsController {
  public constructor(private readonly deviceLogService: DeviceLogService) {}

  @Get('accountNo/:accountNo')
  @ApiOperation({ summary: 'Get all device logs' })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  public async findByAccountNo(
    @Param('accountNo') accountNo: string,
  ): Promise<GetDeviceLogResponse> {
    const deviceLogs = await this.deviceLogService.findLogsByAccountNumber(accountNo);
    return EntityMapper.toDeviceLogResponse(deviceLogs);
  }

  @Post('message')
  @ApiOperation({ summary: 'Create new department' })
  @ApiResponse({ status: 201 })
  public async create(@Body() request: CreateDeviceLogRequest): Promise<void> {
    await this.deviceLogService.pushLogMessages(request);
  }
}
