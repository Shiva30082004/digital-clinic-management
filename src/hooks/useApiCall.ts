import axios, { Method } from "axios";
import { useEffect, useState } from "react";

type RequestOptions = {
  endpoint: string;
  payload?: Record<string, unknown>;
  method?: Method;
  params?: Record<string, unknown>;
};

const useApiCall = <Response>({
  request,
  fetchOnMount = false
}: {
  request?: RequestOptions;
  fetchOnMount?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState("");

  const apiClient = axios.create({
    headers: {
      "X-Authorization": ""
    },
    validateStatus: () => true
  });

  apiClient.interceptors.response.use((response) => {
    const { data: _data = {}, error: _error = "" } = response?.data || {};

    if (_error) {
      setError(_error);
      setData(null);
    } else {
      setError("");
      setData(_data);
    }
    setIsLoading(false);

    return _error ? Promise.reject(_error) : Promise.resolve(_data);
  });

  const invokeRequest = async (request: RequestOptions) => {
    setIsLoading(true);
    const {
      endpoint = "",
      payload = {},
      method = "GET",
      params = {}
    } = request || {};

    switch (method) {
      case "GET":
        await apiClient.get(endpoint, {
          params
        });
        break;
      case "POST":
        await apiClient.post(endpoint, payload, {
          params
        });
      case "PUT":
        await apiClient.put(endpoint, payload, {
          params
        });
      case "DELETE":
        await apiClient.delete(endpoint, {
          params
        });
      default:
        setIsLoading(false);
    }
  };

  const refetch = async () => {
    if (request) await invokeRequest(request);
  };

  useEffect(() => {
    if (fetchOnMount && request) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      invokeRequest(request);
    }
  }, [fetchOnMount]);

  return {
    isLoading,
    isError: !isLoading && !!error,
    isSuccess: !isLoading && !!data,
    data,
    error,
    refetch,
    invokeRequest
  };
};

export default useApiCall;
