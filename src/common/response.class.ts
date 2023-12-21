export class ResponseDto<T> {
  readonly data: T;

  readonly code: number;

  readonly message: string;

  constructor(code: number, data: T, message = 'success') {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

export class Pagination {
  total: number;
  page: number;
  size: number;
}

export class PaginatedResponseDto<T> {
  list: Array<T>;

  pagination: Pagination;
}
