import Document from "@/types/Document";

export const openPDFInNewWindow = async (data: Document) => {
  const byteCharacters = atob(data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const file = new Blob([byteArray], { type: "application/pdf;base64" });
  const fileURL = URL.createObjectURL(file);
  window.open(fileURL);
};
