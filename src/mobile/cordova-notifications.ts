const channelsIds = ["activity_sound", "activity_silence"] as const;

interface CreateChannel {
  id: typeof channelsIds[number],
  name: string,
  description: string,
  importance: "IMPORTANCE_NONE" | "IMPORTANCE_MIN" | "IMPORTANCE_LOW" | "IMPORTANCE_DEFAULT" | "IMPORTANCE_HIGH" | "IMPORTANCE_MAX"
};

interface CreateAction {
  id: string,
  title: string,
  launch?: boolean
};

interface CreateNotification {
  id: number | string,
  title: string,
  text: string,
  android_auto_cancel?: boolean,
  ongoing?: boolean,
  actions?: string,
  channel_id?: typeof channelsIds[number]
};

interface EventCallback {
  event: string,
  foreground: boolean,
  notification: number,
  queued: boolean
};

type Callback = (notification: Partial<CreateNotification>, event: EventCallback) => void;

class CordovaNotificationsPlugin {
  private cordova = (window as any)?.cordova?.plugins?.notification?.local;

  get local() {
    return this.cordova;
  };

  async createChannel(body: CreateChannel) {
    await this.cordova?.createChannel({
      androidChannelId: body.id,
      androidChannelName: body.name,
      androidChannelDescription: body.description,
      androidChannelImportance: body.importance,
      androidChannelSoundUsage: 5,
    });
  };

  async createActions(id: string, actions: CreateAction[]) {
    await this.cordova?.addActions(id, actions);
  };

  async createNotification(body: CreateNotification) {
    return await new Promise(async (resolve) => {
      const interval = setInterval(async () => {
        const isTriggered = await this.isTriggeredNotification(body.id);
        if (isTriggered) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);

      await this.cordova?.schedule({
        ...body,
        androidChannelId: body.channel_id,
        androidAutoCancel: body.android_auto_cancel,
        androidSmallIcon: "res://ic_launcher"
      });
    });
  };

  async updateNotification(body: Partial<CreateNotification>) {
    await this.cordova?.update({
      ...body,
      androidChannelId: body.channel_id,
      androidAutoCancel: body.android_auto_cancel,
      androidSmallIcon: "res://ic_launcher",
      androidWakeUpScreen: false
    });
  };

  async cancelNotification(ids: number | number[]) {
    await this.cordova?.cancel(ids);
  };

  async isTriggeredNotification(ids: number | number[] | string | string[]): Promise<boolean> {
    return await new Promise((resolve) => {
      this.cordova?.isTriggered(ids, (triggered: boolean) => resolve(triggered));
    });
  };

  on(event: string, callback: Callback) {
    this.cordova?.on(event, callback);
  };

  un(event: string, callback: Callback) {
    this.cordova?.un(event, callback);
  };

  createId() {
    return Date.now();
  };
};

export const CordovaNotifications = new CordovaNotificationsPlugin;