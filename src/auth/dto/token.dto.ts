import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequireTokenDto {
  @ApiProperty({
    description: 'Privy or test token required for authentication',
    example: 'your_token_here',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
