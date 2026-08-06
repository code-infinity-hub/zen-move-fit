import { Fetcher } from "@/plugins/Fetcher";

const CLOUD_URL_PATTERN = /cloudfront\.net|amazonaws\.com/;
const CACHE_MAX_SIZE = 200;

const cache = new Map<string, string>();

const cacheSet = (key: string, value: string) => {
  if (cache.has(key)) cache.delete(key);
  cache.set(key, value);
  if (cache.size > CACHE_MAX_SIZE) cache.delete(cache.keys().next().value as string);
};

// Proxies CDN images through the backend as base64 to avoid CORS taint in html2canvas
export const useShareImageProxy = () => {
  return {
    resolveImages: async (urls: string[]): Promise<Record<string, string>> => {
      const result: Record<string, string> = {};
      const toFetch: string[] = [];

      for (const url of urls) {
        if (!url) continue;
        if (!CLOUD_URL_PATTERN.test(url)) { result[url] = url; continue; }
        if (cache.has(url)) { result[url] = cache.get(url)!; continue; }
        toFetch.push(url);
      }

      if (toFetch.length === 0) return result;

      try {
        const response = await Fetcher(`${import.meta.env.VITE_API_BACKEND}share/images/resolve`, {
          method: "POST",
          body: { urls: toFetch },
        });

        if (!response.error && response.json) {
          for (const [url, dataUrl] of Object.entries(response.json as Record<string, string>)) {
            if (dataUrl) { cacheSet(url, dataUrl); result[url] = dataUrl; }
            else result[url] = url;
          }
        } else {
          for (const url of toFetch) result[url] = url;
        }
      } catch {
        for (const url of toFetch) result[url] = url;
      }

      return result;
    }
  };
};