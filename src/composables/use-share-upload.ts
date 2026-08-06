import { Fetcher } from "@/plugins/Fetcher";

export const useShareUpload = () => {
  const isUploading = ref(false);

  return {
    isUploading,
    uploadImage: async (dataUrl: string): Promise<string | null> => {
      isUploading.value = true;
      try {
        const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        const response = await Fetcher(`${import.meta.env.VITE_API_BACKEND}share/upload`, {
          method: "POST",
          body: { image: base64 },
        });
        return !response.error && response.json?.url ? response.json.url : null;
      } catch {
        return null;
      } finally {
        isUploading.value = false;
      }
    }
  };
};