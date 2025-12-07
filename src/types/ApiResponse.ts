type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  message?: string;
};

export default ApiResponse;
