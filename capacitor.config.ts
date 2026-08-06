import { type CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.zen_move_fit.app",
  appName: "Zen Move Fit",
  webDir: "dist",
  android: { useLegacyBridge: true },
  plugins: {
    CapacitorHttp: { enabled: true },
    SplashScreen: { backgroundColor: "#0E1115" },
    SystemBars: {
      insetsHandling: "css",
      style: "DARK",
      hidden: false
    },
    LiveUpdates: {
      appId: "c7d45fd7",
      channel: "Production",
      autoUpdateMethod: "none"
    },
    AppAttest: {
      cloudProjectNumber: "655773092173"
    }
  }
};

export default config;