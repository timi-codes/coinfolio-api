import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

import { CreateAssetDto } from '../dto/create-asset.dto';

interface ValidationObject {
  [key: string]: string | undefined | null;
}

export function IsERC721(
  property: keyof CreateAssetDto,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isERC721',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: string | undefined | null, args: ValidationArguments) {
          const relatedValue = (args.object as ValidationObject)[
            args.constraints[0]
          ];
          if (relatedValue === 'ERC-721') {
            return value !== undefined && value !== null && value !== '';
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be defined when type is ERC-721`;
        },
      },
    });
  };
}
