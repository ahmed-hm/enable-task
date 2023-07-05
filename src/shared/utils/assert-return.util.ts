import { NotFoundException } from '@nestjs/common';
import { CustomResponsePayload } from '../response';

export function assertReturn<T extends CustomResponsePayload>({ data }: T, error: Error) {
  if (!data) {
    throw new NotFoundException({
      message: error.message,
      errors: { id: error.message },
    });
  }
}
