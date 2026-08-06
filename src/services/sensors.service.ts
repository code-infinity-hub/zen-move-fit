import { CapacitorPedometer, Motion } from "@/mobile";
import { eventBus } from "@/eventBus";

export class SensorsService {
  start() {
    Motion.addListener("accel", (event) => {
      eventBus.emit("ACCEL_MOTION_EVENT", event);
    });

    Motion.addListener("orientation", (event) => {
      eventBus.emit("ORIENTATION_MOTION_EVENT", event);
    });

    CapacitorPedometer.addListener("measurement", (event) => {
      eventBus.emit("MEASUREMENT_EVENT", event);
    });
  };

  destroy() {
    Motion.removeAllListeners();
    CapacitorPedometer.removeAllListeners();
  };
};