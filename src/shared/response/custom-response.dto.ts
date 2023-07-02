export class CustomResponse<T = any> {
  payload?: CustomResponsePayload<T>;
  message: string = 'Success';
  statusCode: number = 200;

  constructor(partial: Partial<CustomResponse<T>>) {
    Object.assign(this, partial);
  }
}

export class CustomResponsePayload<T = any> {
  data: T | T[];
  page?: number;
  pages?: number;
  limit?: number;
  total?: number;
}
