import pinia from "@/stores";
import { setActivePinia } from "pinia";
import { eventBus } from "@/eventBus";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { CapacitorHttp, Device } from "@/mobile";
import { useFeedbackStore } from "@/stores/feedback";
import type { Availability, Options, Response } from "@/types/global.type";

setActivePinia(pinia);

const successStatuses = [200, 201];
const feedbackStore = useFeedbackStore();
let renewPromise: Promise<boolean> | null = null;

const renewSession = async (): Promise<boolean> => {
  const persistentSession = usePersistentSession();

  const [refreshToken, token] = await Promise.all([
    persistentSession.get("refresh-token"),
    persistentSession.get("token")
  ]);

  const body = refreshToken ? { refresh_token: refreshToken } : { token };
  const { platform } = await Device.getInfo();

  try {
    const { status, data } = await CapacitorHttp.request({
      url: `${import.meta.env.VITE_API_BACKEND}accounts/refresh-token`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-application": "1",
        "platform": platform
      },
      data: JSON.stringify(body)
    });

    if (successStatuses.includes(status) && data?.token) {
      await persistentSession.set("token", data.token);
      if (data.refresh_token) await persistentSession.set("refresh-token", data.refresh_token);
      return true;
    }
  } catch { }

  return false;
};

export const checkAvailability = async (): Promise<Availability> => {
  try {
    const { status, data } = await CapacitorHttp.request({
      url: `${import.meta.env.VITE_AWS_CLOUDFRONT_URL}app-availability.json`,
      method: "GET"
    });

    if (status === 200) return data;
  } catch { };

  return {
    available: true,
    message: { pt: "", en: "" },
    updated_at: ""
  };
};

export const Fetcher = async (url: string, options: Options, isRetry = false): Promise<Response> => {
  const persistentSession = usePersistentSession();

  const internetConnection = await persistentSession.get("internet-connection");

  if (internetConnection === "OFFLINE") {
    eventBus.emit("MESSAGE_NO_INTERNET_CONNECTION");
    return { status: 500, error: true, };
  }

  const availability = await checkAvailability();

  if (!availability.available) {
    const lang = navigator.language.split("-")[0];
    const message = (lang === "en" ? availability.message?.en : availability.message?.pt) || availability.message?.pt || "";

    eventBus.emit("MAINTENANCE_MODE", { message });

    return { status: 503, error: true, maintenance: true };
  }

  const language = navigator.language.split("-")[0];
  const { platform } = await Device.getInfo();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": language!,
    "Authorization": `Bearer ${await persistentSession.get("token")}`,
    "x-client-url": window.location.href,
    "x-application": "1",
    "platform": platform
  };

  const notificationId = await persistentSession.get("notification-id");
  if (notificationId) headers["x-application-notification"] = notificationId;

  if (options.headers) Object.assign(headers, options.headers);

  try {
    const { status, data: json } = await CapacitorHttp.request({
      url,
      method: options.method ?? "GET",
      headers,
      data: options.body ? JSON.stringify(options.body) : undefined
    });

    if (status === 401 && json?.code === "TOKEN_EXPIRED" && !isRetry) {
      if (!renewPromise) {
        renewPromise = renewSession().finally(() => renewPromise = null);
      }

      const renewed = await renewPromise;

      if (renewed) return Fetcher(url, options, true);

      eventBus.emit("SESSION_EXPIRED");
    }

    const error = !successStatuses.includes(status);

    return { status, error, json };
  } catch (e) {
    return {
      status: 500,
      error: true,
      server_error: true,
    };
  }
};

export const _GET = async (url: string): Promise<Response> => {
  const response = await Fetcher(`${import.meta.env.VITE_API_BACKEND}${url}`, { method: "GET" });
  feedbackStore.populate({ error: response.error, ...response.json });
  return { error: response.error, ...response.json };
};

export const _POST = async (url: string, body: Record<string, any> = {}, headers?: Record<string, string>): Promise<Response> => {
  const response = await Fetcher(`${import.meta.env.VITE_API_BACKEND}${url}`, { method: "POST", body, headers });
  feedbackStore.populate({ error: response.error, ...response.json });
  return { error: response.error, ...response.json };
};

export const _PATCH = async (url: string, body: Record<string, any> = {}, headers?: Record<string, string>): Promise<Response> => {
  const response = await Fetcher(`${import.meta.env.VITE_API_BACKEND}${url}`, { method: "PATCH", body, headers });
  feedbackStore.populate({ error: response.error, ...response.json });
  return { error: response.error, ...response.json };
};

export const _DELETE = async (url: string, body: Record<string, any> = {}): Promise<Response> => {
  const response = await Fetcher(`${import.meta.env.VITE_API_BACKEND}${url}`, { method: "DELETE", body });
  feedbackStore.populate({ error: response.error, ...response.json });
  return { error: response.error, ...response.json };
};