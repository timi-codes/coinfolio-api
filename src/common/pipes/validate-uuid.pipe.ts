import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class ValidateUuidPipe implements PipeTransform {
  transform(value: string) {
    if (!isUUID(value, '4')) {
      throw new BadRequestException('ID must be a valid UUID');
    }
    return value;
  }
}
