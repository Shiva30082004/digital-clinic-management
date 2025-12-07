import Document from "@/types/Document";
import useApiCall from "./useApiCall";
import { openPDFInNewWindow } from "@/utils/common.utils";

const useGeneratePrescription = () => {
  const { isLoading: isGeneratingPrescription = false, invokeRequest } =
    useApiCall<Document>();

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
    isGeneratingPrescription,
    invokeGeneratePrescription
  };
};

export default useGeneratePrescription;
