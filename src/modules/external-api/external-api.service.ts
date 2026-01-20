import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ExternalApiResponse, ApiError } from './dto/external-api.dto';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Generic GET request with query parameters
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig,
  ): Promise<ExternalApiResponse<T>> {
    try {
      this.logger.debug(`GET ${endpoint}`, { params });

      const response = await firstValueFrom(
        this.httpService.get<T>(endpoint, { ...config, params }),
      );

      return {
        success: true,
        data: response.data,
        message: 'Request completed successfully',
      };
    } catch (error) {
      this.logger.error('External API Error:', error?.response?.data || error.message);
      return this.formatErrorResponse(error);
    }
  }

  /**
   * Generic POST request
   */
  async post<T, D = any>(
    endpoint: string,
    data: D,
    config?: AxiosRequestConfig,
  ): Promise<ExternalApiResponse<T>> {
    try {
      this.logger.debug(`POST ${endpoint}`, { data });

      const response = await firstValueFrom(this.httpService.post<T>(endpoint, data, config));

      return {
        success: true,
        data: response.data,
        message: 'Request completed successfully',
      };
    } catch (error) {
      this.logger.error('External API Error:', error?.response?.data || error.message);
      return this.formatErrorResponse(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put<T, D = any>(
    endpoint: string,
    data: D,
    config?: AxiosRequestConfig,
  ): Promise<ExternalApiResponse<T>> {
    try {
      this.logger.debug(`PUT ${endpoint}`, { data });

      const response = await firstValueFrom(this.httpService.put<T>(endpoint, data, config));

      return {
        success: true,
        data: response.data,
        message: 'Request completed successfully',
      };
    } catch (error) {
      this.logger.error('External API Error:', error?.response?.data || error.message);
      return this.formatErrorResponse(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ExternalApiResponse<T>> {
    try {
      this.logger.debug(`DELETE ${endpoint}`);

      const response = await firstValueFrom(this.httpService.delete<T>(endpoint, config));

      return {
        success: true,
        data: response.data,
        message: 'Request completed successfully',
      };
    } catch (error) {
      this.logger.error('External API Error:', error?.response?.data || error.message);
      return this.formatErrorResponse(error);
    }
  }

  /**
   * Format error response
   */
  private formatErrorResponse<T>(error: any): ExternalApiResponse<T> {
    const apiError: ApiError = {
      message: error?.response?.data?.message || error.message || 'Unknown error occurred',
      statusCode: error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      details: error?.response?.data || null,
    };

    return {
      success: false,
      data: null,
      message: 'Request failed',
      error: apiError,
    };
  }
}
