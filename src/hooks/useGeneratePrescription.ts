import Document from "@/types/Document";
import useApiCall from "./useApiCall";
import { openPDFInNewWindow } from "@/utils/common.utils";

const useGeneratePrescription = () => {
  const { invokeRequest } = useApiCall<Document>();

  const invokeGeneratePrescription = async (appointmentId: number) => {
    await invokeRequest(
      {
        endpoint: "/api/document/generate",
        params: { appointmentId },
        method: "GET"
      },
      {
        onSuccess: openPDFInNewWindow
      }
    );
  };

  return {
    invokeGeneratePrescription
  };
};

export default useGeneratePrescription;
