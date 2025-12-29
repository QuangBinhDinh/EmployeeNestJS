import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiProperty()
  public accessToken: string;

  @ApiProperty()
  public user: {
    id: number;
    username: string;
    email: string;
    fullName: string | null;
  };
}
