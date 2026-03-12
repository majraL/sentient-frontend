import { ApiError } from "@/lib/api/errors";

type MockHandler<T> = () => Promise<T>;

export async function mockRequest<T>(handler: MockHandler<T>) {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Unexpected mock API error");
  }
}
