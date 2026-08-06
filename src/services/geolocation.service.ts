import { BackgroundGeolocation, Geolocation } from "@/mobile";
import { eventBus } from "@/eventBus";
import { useAppStore } from "@/stores/app";
import { usePersistentSession } from "@/plugins/usePersistentSession";

export class GeolocationService {
  async checkPermissions() {
    const { location } = await Geolocation.checkPermissions();

    return ["prompt", "prompt-with-rationale"].includes(location) ?
      "prompt" :
      location;
  };

  async openSettings() {
    await BackgroundGeolocation.openSettings();
  };

  async requestPermission() {
    await Geolocation.requestPermissions({
      permissions: ["location", "coarseLocation"]
    });
  };

  async getCurrentPosition() {
    const persistentSession = usePersistentSession();

    try {
      const result = await Geolocation.getCurrentPosition();

      const data = {
        lat: result.coords.latitude,
        lng: result.coords.longitude,
        accuracy: result.coords.accuracy,
      };

      await persistentSession.set("last-location", JSON.stringify(data));

      return data;
    } catch (e) {
      const data = JSON.parse(
        (await persistentSession.get("last-location")) || "{}"
      );

      return {
        lat: data?.lat || 0,
        lng: data?.lng || 0,
        accuracy: data?.accuracy || 0,
      };
    }
  };

  async startBackgroundGeolocation(backgroundTitle = "", backgroundMessage = "") {
    const appStore = useAppStore();

    BackgroundGeolocation.start(
      {
        backgroundTitle: backgroundTitle || appStore.title_notification_background_geolocation,
        backgroundMessage: backgroundMessage || appStore.message_notification_background_geolocation,
        requestPermissions: false,
        stale: false,
        distanceFilter: 2,
      },
      (location, error) => {
        if (error) {
          this.stopBackgroundGeolocation();
        } else {
          eventBus.emit("LOCATION", {
            lat: location?.latitude || 0,
            lng: location?.longitude || 0,
            accuracy: location?.accuracy || 999,
            altitude: location?.altitude || 0,
            altitudeAccuracy: location?.altitudeAccuracy || 0,
            speed: (location?.speed || 0) * 3.6,
            time: location?.time || Date.now(),
            bearing: location?.bearing || 0
          });
        }
      }
    );
  };

  async stopBackgroundGeolocation() {
    await BackgroundGeolocation.stop();
  };
};