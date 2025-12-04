type ApiResponse<T = unknown> = {
  data?: T;
  message?: string;
  error?: string;
};

export default ApiResponse;
