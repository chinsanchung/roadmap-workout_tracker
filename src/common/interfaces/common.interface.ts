export interface ServiceOutput {
  success: boolean;
  message: string;
  error?: Error;
}

export interface DatabaseError extends Error {
  code?: string;
}
