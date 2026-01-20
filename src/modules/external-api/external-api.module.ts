import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalApiService } from './external-api.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
      // Configure base URL via environment variable
      baseURL: process.env.EXTERNAL_BASE_URL || 'https://jsonplaceholder.typicode.com/',
      headers: {
        'Content-Type': 'application/json',
        // Add default headers if needed
      },
    }),
  ],
  providers: [ExternalApiService],
  exports: [ExternalApiService],
})
export class ExternalApiModule {}
