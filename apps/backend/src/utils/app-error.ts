export class AppError extends Error {
  constructor(
    public readonly error: {
      message: string;
      status: number;
    }
  ) {
    super(error.message);
  }

  get statusCode() {
    return this.error.status;
  }
}
