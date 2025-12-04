type ApiResponse<T = unknown> = {
  data?: T;
  message?: string;
};

export default ApiResponse;
