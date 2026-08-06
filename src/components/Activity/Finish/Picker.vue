<template>
  <List>
    <v-list-item
      v-for="(option, i) in options"
      :key="i"
    >
      <v-list-item-title>
        <div
          v-ripple
          class="rounded-lg bg-secondary pa-2 d-flex align-center ga-3"
          @click="option.method"
        >
          <div class="size-3rem rounded-circle bg-tertiary d-flex justify-center align-center">
            <v-icon :size="25">
              {{ option.icon }}
            </v-icon>
          </div>

          <span class="text-h6">
            {{ option.text }}
          </span>
        </div>
      </v-list-item-title>
    </v-list-item>
  </List>
</template>

<script lang="ts" setup>
import { useLocale } from "vuetify";
import { eventBus } from "@/eventBus";
import { MediaService } from "@/services/media.service";

/// COMPONENTS
import List from "@/components/List.vue";

/// DATA
const { t } = useLocale();
const emit = defineEmits(["handle-files"]);
const mediaService = new MediaService;
const maximumSizeVideo = +import.meta.env.VITE_MAXIMUM_MB_VIDEO;

/// COMPUTED
const options = computed(() => [
  {
    icon: "mdi-camera-outline",
    text: t("$vuetify.label.take_a_picture"),
    method: takePicture
  },
  {
    icon: "mdi-film",
    text: t("$vuetify.label.record_video"),
    method: recordVideo
  },
  {
    icon: "mdi-image-outline",
    text: t("$vuetify.label.select_photos"),
    method: selectPhotos
  },
  {
    icon: "mdi-video-outline",
    text: t("$vuetify.label.select_videos"),
    method: selectVideos
  },
]);

/// METHODS
const takePicture = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const result = await mediaService.takePicture();
    emit("handle-files", [result]);
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const selectPhotos = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const results = await mediaService.getFiles("Photo", 5);
    emit("handle-files", results);
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const recordVideo = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const result = await mediaService.recordVideo();

    if (result.size > maximumSizeVideo) {
      eventBus.emit("SNACKBAR", {
        message: t("$vuetify.errors.maximum_size_mb", maximumSizeVideo)
      });
    } else {
      emit("handle-files", [result]);
    }
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};

const selectVideos = async () => {
  try {
    eventBus.emit("SET_LOADER", { enabled: true });
    const results = await mediaService.getFiles("Video", 5);

    emit(
      "handle-files",
      results.filter((result) => result.size <= maximumSizeVideo)
    );

    if (results.some((result) => result.size > maximumSizeVideo)) {
      eventBus.emit("SNACKBAR", {
        message: t("$vuetify.errors.some_files_exceeded_mb", maximumSizeVideo)
      });
    }
  } catch (e: any) {
    eventBus.emit("SNACKBAR", {
      message: e?.code ? t(`$vuetify.errors_camera.${e?.code}`) : e?.message
    });
  } finally {
    eventBus.emit("SET_LOADER", { enabled: false });
  }
};
</script>