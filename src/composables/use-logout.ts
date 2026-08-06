import { useRouter } from "vue-router";
import { usePersistentSession } from "@/plugins/usePersistentSession";
import { useAccountsStore } from "@/stores/accounts";
import { eventBus } from "@/eventBus";
import { Device, OneSignal } from "@/mobile";
import { MediaService } from "@/services/media.service";
import { type Account } from "@/types/account.type";

export const useLogout = () => {
  const router = useRouter();
  const persistentSession = usePersistentSession();
  const accountsStore = useAccountsStore();

  const logout = async (removeNotificationId = true) => {
    try {
      eventBus.emit("SET_LOADER", { enabled: true });

      if (removeNotificationId) {
        const device = await Device.getInfo();

        if (device.platform !== "web") {
          const oneSignalID = await OneSignal.default?.User?.pushSubscription?.getIdAsync();

          if (oneSignalID) {
            await accountsStore.UPDATE_ACCOUNT({
              notification_ids: accountsStore.account.notification_ids.filter((notification) =>
                notification.id !== oneSignalID
              )
            });
          }
        }
      }

      const file = JSON.parse(
        (await persistentSession.get("picture")) || "{}"
      );

      if (file?.file) {
        const mediaService = new MediaService();
        await mediaService.deleteFile(file);
      }

      // Revokes the device refresh token before clearing the local session
      const refreshToken = await persistentSession.get("refresh-token");

      if (refreshToken) await accountsStore.POST("logout", { refresh_token: refreshToken });

      await persistentSession.destroy();
    } catch {
      ///
    } finally {
      accountsStore._id = "";
      accountsStore.account = { } as Account;

      eventBus.emit("SET_LOADER", { enabled: false });
      eventBus.emit("UPDATE_APP_ICONS");

      router.push({ name: "login" });
    }
  };

  return { logout };
};