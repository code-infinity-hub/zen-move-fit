import { Filesystem, Directory, Share } from "@/mobile";

export const useShareExport = () => {
  return {
    exportCards: async (images: string[], dialogTitle: string) => {
      const paths: string[] = [];
      const uris: string[] = [];
      try {
        for (const [index, data] of images.entries()) {
          const path = `zen-share-${Date.now()}-${index}.png`;
          paths.push(path);
          const { uri } = await Filesystem.writeFile({ path, data, directory: Directory.Cache });
          uris.push(uri);
        }
        await Share.share({ files: uris, dialogTitle });
      } finally {
        for (const path of paths) {
          try {
            await Filesystem.deleteFile({ path, directory: Directory.Cache });
          } catch {
            /* best-effort cleanup */
          }
        }
      }
    }
  };
};