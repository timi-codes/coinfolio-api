import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { AssetType } from '../entities/asset.entity';
import { CreateAssetDto } from '../dto/create-asset.dto';

interface ValidationObject {
  [key: string]: string | undefined | null;
}

export function IsERC20(
  property: keyof CreateAssetDto,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isERC20',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: string | number | bigint, args: ValidationArguments) {
          const relatedValue = (args.object as ValidationObject)[
            args.constraints[0]
          ];
          if (relatedValue === AssetType.ERC20) {
            if (typeof value === 'bigint') {
              return value > 0n;
            } else if (typeof value === 'string' && /^\d+$/.test(value)) {
              return BigInt(value) > 0n;
            } else if (typeof value === 'number') {
              return BigInt(value) > 0n;
            }
            return value !== undefined && value !== null && value !== '';
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be defined when type is ERC-20`;
        },
      },
    });
  };
}
