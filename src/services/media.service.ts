import { v4 } from "uuid";
import {
  Camera, CameraDirection, EncodingType, type MediaResult, MediaTypeSelection,
  Capacitor,
  Directory, Filesystem,
  FileTransfer
} from "@/mobile";

export class MediaService {
  private getMimeType(format: string) {
    const list = new Map([
      ["jpg", "image/jpeg"],
      ["jpeg", "image/jpeg"],
      ["png", "image/png"],
      ["webp", "image/webp"],
      ["mp4", "video/mp4"],
      ["mov", "video/quicktime"]
    ]);

    return list.get(format.toLowerCase()) || "application/octet-stream";
  };

  private getType(format: string) {
    const list = new Map([
      ["jpg", "image"],
      ["jpeg", "image"],
      ["png", "image"],
      ["webp", "image"],
      ["mp4", "video"],
      ["mov", "video"]
    ]);

    return list.get(format.toLowerCase()) || "image";
  };

  private async getFileSizeMB(uri: string)  {
    const stat = await Filesystem.stat({ path: uri });
    const sizeMB = +(stat.size / (1024 * 1024)).toFixed(2);
    return sizeMB;
  };

  private async formatResult(media: MediaResult) {
    const uri = media.uri || "";
    const path = media.webPath || "";
    const list = path.split("/");
    const size = await this.getFileSizeMB(uri);
    const format = media?.metadata?.format || list?.[list?.length - 1]?.split(".")?.[1] || "";

    let base64 = "";

    try {
      base64 = await this.getBase64(path);
    } catch { };

    return {
      base64,
      uri,
      size,
      path,
      format,
      id: v4(),
      type: this.getType(format),
      mimetype: this.getMimeType(format),
      duration: media?.metadata?.duration,
      resolution: media?.metadata?.resolution,
    };
  };

  async recordVideo(): Promise<Awaited<ReturnType<typeof this.formatResult>>> {
    try {
      const result = await Camera.recordVideo({
        saveToGallery: false,
        isPersistent: true,
        includeMetadata: true,
      });

      return await this.formatResult(result);
    } catch (error: any) {
      throw {
        message: error?.message,
        code: error?.code?.replace(/[-]/g, "_")
      };
    }
  };

  async takePicture(): Promise<Awaited<ReturnType<typeof this.formatResult>>> {
    try {
      const result = await Camera.takePhoto({
        quality: 100,
        saveToGallery: false,
        cameraDirection: CameraDirection.Front,
        encodingType: EncodingType.PNG,
        editable: "in-app",
      });

      return await this.formatResult(result);
    } catch (error: any) {
      throw {
        message: error?.message,
        code: error?.code?.replace(/[-]/g, "_")
      };
    };
  };

  async editPhoto(uri: string) {
    try {
      const result = await Camera.editURIPhoto({
        uri,
        saveToGallery: false,
        includeMetadata: true
      });

      return await this.formatResult(result);
    } catch (error: any) {
      throw {
        message: error?.message,
        code: error?.code?.replace(/[-]/g, "_")
      };
    }
  };

  async getFiles(mediaType: "Photo" | "Video" | "All" = "All", limit?: number): Promise<Awaited<ReturnType<typeof this.formatResult>>[]> {
    try {
      const { results } = await Camera.chooseFromGallery({
        limit,
        mediaType: MediaTypeSelection[mediaType],
        allowMultipleSelection: true,
        editable: "no",
        quality: 100,
        includeMetadata: true,
      });

      return await Promise.all(
        results.map(result => this.formatResult(result))
      );
    } catch (error: any) {
      throw {
        message: error?.message,
        code: error?.code?.replace(/[-]/g, "_")
      };
    }
  };

  async fileExists(uri: string) {
    if (!uri) return false;

    try {
      await Filesystem.stat({ path: uri });
      return true;
    } catch (error) {
      return false;
    }
  };

  async getBase64(path: string) {
    const response = await fetch(path);
    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  async deleteFile(path: string) {
    try {
      await Filesystem.deleteFile({
        path,
        directory: Directory.Data
      });
    } catch { }
  };

  async saveMediaOffline(url: string) {
    try {
      const extension = url.trim().split(".").pop();
      const fileName = `file-${Date.now()}.${extension}`;

      const { uri } = await Filesystem.getUri({
        directory: Directory.Data,
        path: fileName
      });

      // Download file
      await FileTransfer.downloadFile({
        url,
        path: uri,
        progress: false
      });

      return {
        error: false,
        file: fileName,
        path: this.convertUrl(uri)
      };
    } catch (e) {
      return { error: true };
    }
  };

  private convertUrl(uri: string) {
    return Capacitor.convertFileSrc(uri);
  };
};