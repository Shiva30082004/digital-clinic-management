import { checkAuthStatus } from "@/utils/firebase";
import axios, { Method } from "axios";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

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
} = {}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState("");
  const isApiInProgressRef = useRef(false);

  const invokeRequest = async (
    request: RequestOptions,
    mutateOptions?: {
      onSuccess?: (response: Response) => void;
      onError?: (error: string) => void;
    },
    disableLoading = false
  ) => {
    if (isApiInProgressRef.current) return;

    isApiInProgressRef.current = true;
    const token = await checkAuthStatus(request.endpoint, router);

    if (!disableLoading) setIsLoading(true);
    const {
      endpoint = "",
      payload = {},
      method = "GET",
      params = {}
    } = request || {};

    const apiClient = axios.create({
      headers: {
        "X-Authorization": token
      },
      validateStatus: () => true
    });

    const { onSuccess = undefined, onError = undefined } = mutateOptions || {};

    apiClient.interceptors.response.use((response) => {
      const { data: _data = {}, error: _error = "" } = response?.data || {};

      const err = _error || response.status >= 400;

      if (err) {
        setError(_error);
        setData(null);
      } else {
        setError("");
        setData(_data);
      }
      setIsLoading(false);
      isApiInProgressRef.current = false;

      if (err) {
        onError?.(_error);
        Promise.reject(_error);
      } else {
        onSuccess?.(_data);
        return Promise.resolve(_data);
      }
    });

    try {
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
          break;
        case "PUT":
          await apiClient.put(endpoint, payload, {
            params
          });
          break;
        case "PATCH":
          await apiClient.patch(endpoint, payload, {
            params
          });
          break;
        case "DELETE":
          await apiClient.delete(endpoint, {
            params
          });
          break;
        default:
      }
    } catch {
    } finally {
      setIsLoading(false);
      isApiInProgressRef.current = false;
    }
  };

  const refetch = async () => {
    if (request) await invokeRequest(request, {}, true);
  };

  useEffect(() => {
    if (fetchOnMount && request) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      invokeRequest(request);
    }
  }, [fetchOnMount, JSON.stringify(request)]);

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
