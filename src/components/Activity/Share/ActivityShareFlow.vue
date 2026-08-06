<template>
  <div class="flow-overlay">
    <Teleport to="body">
      <div class="offscreen-area">
        <div
          v-if="activeTemplate"
          :ref="(el) => (offscreenEl = el as HTMLElement)"
          :style="offscreenStyle"
        >
          <component
            :is="activeTemplate.component"
            :activity="activity"
            :format="format"
            :image-cache="imageCache"
            :route-points="routePoints"
            v-bind="activeTemplate.props ?? {}"
          />
        </div>
      </div>
    </Teleport>

    <div class="flow-header">
      <v-btn
        icon
        size="x-small"
        variant="text"
        color="rgba(255, 255, 255, 0.6)"
        @click="emit('close')"
      >
        <v-icon :size="20">mdi-close</v-icon>
      </v-btn>

      <p class="text-subtitle-2 font-weight-bold">
        {{ t("$vuetify.share.sheet_title") }}
      </p>
      <div class="format-pills">
        <button
          class="format-pill"
          :class="{ active: format === 'feed' }"
          @click="switchFormat('feed')"
        >{{ t("$vuetify.share.format_feed") }}</button>
        <button
          class="format-pill"
          :class="{ active: format === 'story' }"
          @click="switchFormat('story')"
        >{{ t("$vuetify.share.format_story") }}</button>
      </div>
    </div>

    <div class="flow-scroll">
      <div class="preview-area">
        <div class="preview-frame" :class="{ story: format === 'story' }">
          <img
            v-if="renderedCurrentImage"
            :src="renderedCurrentImage"
            class="preview-img"
            draggable="false"
          />
          <div v-else-if="activeTemplate" class="preview-live">
            <div :style="previewScaleStyle">
              <component
                :is="activeTemplate.component"
                :activity="activity"
                :format="format"
                :image-cache="imageCache"
                :route-points="routePoints"
                v-bind="activeTemplate.props ?? {}"
              />
            </div>
          </div>
          <div
            v-else
            class="preview-placeholder"
          >
            <v-progress-circular
              indeterminate color="rgba(255, 255, 255, 0.3)"
              :size="24"
              :width="2"
            />
          </div>
          <div
            v-if="isRendering"
            class="preview-generating"
          >
            <v-progress-circular
              indeterminate
              color="primary"
              :size="24"
              :width="2"
            />
          </div>
        </div>
      </div>

      <div class="group-tabs">
        <button
          v-for="group in templateGroups"
          :key="group.id"
          class="group-tab"
          :class="{ active: selectedGroupId === group.id }"
          @click="selectedGroupId = group.id"
        >{{ t(group.labelKey) }}</button>
      </div>

      <div ref="carouselRef" class="thumb-carousel">
        <div
          v-for="template in visibleTemplates"
          :key="template.id"
          :data-id="template.id"
          :class="{
            'thumb-item': true,
            active: selectedTemplateId === template.id
          }"
          @click="selectTemplate(template.id)"
        >
          <div class="thumb-clip" :class="{ story: format === 'story' }">
            <div class="thumb-scale" :style="thumbScaleStyle">
              <component
                :is="template.component"
                :activity="activity"
                :format="format"
                :image-cache="imageCache"
                :route-points="routePoints"
                v-bind="template.props ?? {}"
              />
            </div>
          </div>
          <p class="thumb-label">{{ t(template.labelKey) }}</p>
        </div>
      </div>

      <div :style="{ height: '16px' }"></div>
    </div>

    <div class="flow-footer">
      <v-btn
        variant="outlined"
        color="rgba(255, 255, 255, 0.2)"
        class="d-flex pa-5 text-none text-white"
        :loading="isUploading"
        :disabled="!hasRenderedImage"
        rounded="lg"
        @click="download"
      >
        <v-icon start size="18">mdi-download-outline</v-icon>
        {{ t("$vuetify.share.download") }}
      </v-btn>
      <v-btn
        color="primary"
        class="d-flex pa-5 text-none text-black font-weight-bold flex-1"
        :loading="isSharing"
        :disabled="!hasRenderedImage"
        rounded="lg"
        @click="share"
      >
        <v-icon start size="18">mdi-share-variant</v-icon>
        {{ t("$vuetify.share.share_btn") }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 } from "uuid";
import { useLocale } from "vuetify";
import { nextTick } from "vue";
import { CapacitorDownloader } from "@/mobile";
import { Fetcher } from "@/plugins/Fetcher";
import { useShareRenderer, type ShareFormat } from "@/composables/use-share-renderer";
import { useShareImageProxy } from "@/composables/use-share-image-proxy";
import { useShareExport } from "@/composables/use-share-export";
import { useShareUpload } from "@/composables/use-share-upload";
import { ShareTemplateProvider, getAllTemplateImages, type ShareTemplateDef } from "@/composables";
import { eventBus } from "@/eventBus";
import type { ActivityDetail } from "@/types/activity.type";

const PREVIEW_WIDTH = 272;

/// DATA
const props = defineProps<{ activity: ActivityDetail }>();
const emit = defineEmits<{ close: [] }>();

const { t } = useLocale();
const { renderTemplate, ensureFontsReady, prewarm } = useShareRenderer();
const { resolveImages } = useShareImageProxy();
const { exportCards } = useShareExport();
const { isUploading, uploadImage } = useShareUpload();
const format = ref<ShareFormat>("feed");
const selectedGroupId = ref("");
const selectedTemplateId = ref("");
const routePoints = ref<{ lat: number; lng: number; id: number }[]>([]);
const renderedImages = ref<Record<string, string>>({});
const imageCache = ref<Record<string, string>>({});
const isRendering = ref(false);
const isLoadingImages = ref(true);
const isSharing = ref(false);
const offscreenEl = ref<HTMLElement | null>(null);
const carouselRef = ref<HTMLElement | null>(null);

/// COMPUTED
const thumbWidth = computed(() => (window.innerWidth - 32) / 2.5);
const dims = computed(() => (format.value === "story" ? { w: 540, h: 960 } : { w: 540, h: 540 }));
const templateGroups = computed(() => ShareTemplateProvider(props.activity, routePoints.value));
const activeGroup = computed(() => templateGroups.value.find((g) => g.id === selectedGroupId.value) ?? templateGroups.value[0]);
const visibleTemplates = computed<ShareTemplateDef[]>(() => {
  const group = activeGroup.value;
  return group ? group.templates.filter((tpl) => tpl.formats.includes(format.value)) : [];
});
const activeTemplate = computed<ShareTemplateDef | null>(() =>
  templateGroups.value.flatMap((g) => g.templates).find((tpl) => tpl.id === selectedTemplateId.value) ?? null
);
const offscreenStyle = computed(() => ({
  width: `${dims.value.w}px`,
  height: `${dims.value.h}px`,
  overflow: "hidden",
}));
const previewScaleStyle = computed(() => ({
  transform: `scale(${PREVIEW_WIDTH / dims.value.w})`,
  transformOrigin: "0 0",
  width: `${dims.value.w}px`,
  height: `${dims.value.h}px`,
}));
const thumbScaleStyle = computed(() => ({
  transform: `scale(${thumbWidth.value / dims.value.w})`,
  transformOrigin: "0 0",
  width: `${dims.value.w}px`,
  height: `${dims.value.h}px`,
}));
const renderedCurrentImage = computed(() => selectedTemplateId.value ? renderedImages.value[renderKey(selectedTemplateId.value)] ?? null : null);
const hasRenderedImage = computed(() => !!renderedCurrentImage.value);

/// WATCH
watch(selectedGroupId, async () => {
  const first = visibleTemplates.value[0];
  if (first && first.id !== selectedTemplateId.value) await goToTemplate(first.id);
});

/// LIFE CYCLES
onMounted(async () => {
  CapacitorDownloader.addListener("downloadCompleted", () => {
    eventBus.emit("SNACKBAR", {
      message: t("$vuetify.message.file_downloaded"),
      color: "success"
    });
  });

  CapacitorDownloader.addListener("downloadFailed", (event) => {
    eventBus.emit("SNACKBAR", {
      message: t("$vuetify.message.error_downloading", event.error),
      color: "error"
    });
  });

  isLoadingImages.value = true;

  // Pay the font-load and html2canvas cold-start cost during this loading spinner (in parallel with
  // image/route fetches) so the first card rasterizes fast instead of stalling on those one-time costs.
  const [resolved] = await Promise.all([
    resolveImages(getAllTemplateImages(props.activity)),
    Fetcher(`${import.meta.env.VITE_API_BACKEND}activities/${props.activity._id}/route`, { method: "GET" })
      .then((res) => {
        if (!res.error && Array.isArray(res.json?.points)) routePoints.value = res.json.points;
      })
      .catch(() => {}),
    ensureFontsReady(),
    prewarm(),
  ]);

  imageCache.value = resolved;
  isLoadingImages.value = false;

  const firstGroup = templateGroups.value[0];
  if (firstGroup) {
    selectedGroupId.value = firstGroup.id;
    const firstTemplate = firstGroup.templates.filter((tpl) => tpl.formats.includes(format.value))[0];
    if (firstTemplate) {
      selectedTemplateId.value = firstTemplate.id;
      await nextTick();
      await generateCurrent();
    }
  }
});

onBeforeUnmount(() => {
  CapacitorDownloader.removeAllListeners();
});

/// METHODS
const renderKey = (templateId: string) => `${templateId}:${format.value}`;
const selectTemplate = (id: string) => { void goToTemplate(id); };
const goToTemplate = async (id: string) => {
  selectedTemplateId.value = id;
  await nextTick();
  carouselRef.value?.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  await generateCurrent();
};
const switchFormat = async (next: ShareFormat) => {
  if (next === format.value) return;
  format.value = next;
  await nextTick();
  const stillVisible = visibleTemplates.value;
  if (!stillVisible.find((tpl) => tpl.id === selectedTemplateId.value) && stillVisible[0]) {
    selectedTemplateId.value = stillVisible[0].id;
  }
  await nextTick();
  await generateCurrent();
};
const generateCurrent = async () => {
  if (!selectedTemplateId.value || !offscreenEl.value) return;
  const key = renderKey(selectedTemplateId.value);
  if (renderedImages.value[key]) return;

  isRendering.value = true;
  try {
    const dataUrl = await renderTemplate(
      props.activity._id,
      selectedTemplateId.value,
      format.value,
      offscreenEl.value,
      activeTemplate.value?.transparent ?? false
    );
    renderedImages.value = { ...renderedImages.value, [key]: dataUrl };
  } catch (e) {
    console.warn("[ShareFlow] render failed", e);
  } finally {
    isRendering.value = false;
  }
};
const getRenderedImage = async (): Promise<string | null> => {
  const id = selectedTemplateId.value;
  if (!id) return null;

  const key = renderKey(id);
  if (renderedImages.value[key]) return renderedImages.value[key];

  await nextTick();
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  if (!offscreenEl.value) return null;

  try {
    const template = templateGroups.value.flatMap((g) => g.templates).find((tpl) => tpl.id === id);
    const dataUrl = await renderTemplate(props.activity._id, id, format.value, offscreenEl.value, template?.transparent ?? false);
    renderedImages.value = { ...renderedImages.value, [key]: dataUrl };
    return dataUrl;
  } catch {
    return null;
  }
};

const share = async () => {
  isSharing.value = true;
  try {
    const image = await getRenderedImage();
    if (image) await exportCards([image], t("$vuetify.share.sheet_title"));
  } finally {
    isSharing.value = false;
  }
};

const download = async () => {
  const image = await getRenderedImage();
  if (!image) return;

  const url = await uploadImage(image);
  if (!url) return;

  await CapacitorDownloader.download({
    id: v4(),
    url,
    destination: ""
  });
};
</script>

<style lang="sass" scoped>
.flow-overlay
  position: fixed
  inset: 0
  z-index: 1000
  background: #0E1115
  display: flex
  flex-direction: column
  overflow: hidden

.offscreen-area
  position: absolute
  left: -1200px
  top: 0
  pointer-events: none
  z-index: -1

.flow-header
  display: flex
  align-items: center
  justify-content: space-between
  padding: calc(var(--top-saved, 20px) + 8px) 16px 12px
  flex-shrink: 0

.format-pills
  display: flex
  background: #FFFFFF12
  border-radius: 20px
  padding: 2px

.format-pill
  font-size: 11px
  font-weight: 700
  color: #FFFFFF73
  padding: 4px 12px
  border-radius: 18px
  border: none
  background: transparent
  cursor: pointer
  transition: all .15s
  &.active
    background: var(--primary, #48F26D)
    color: #0e1115

.flow-scroll
  flex: 1
  overflow-y: auto
  overflow-x: hidden
  scrollbar-width: none
  &::-webkit-scrollbar
    display: none

.preview-area
  display: flex
  justify-content: center
  padding: 0 20px 16px

.preview-frame
  width: 272px
  height: 272px
  border-radius: 12px
  overflow: hidden
  border: 1.5px solid rgba(255, 255, 255, 0.08)
  background: #FFFFFF08
  position: relative
  flex-shrink: 0
  &.story
    height: 484px

.preview-img
  width: 100%
  height: 100%
  object-fit: cover
  display: block
  user-select: none

.preview-live
  width: 100%
  height: 100%
  overflow: hidden
  position: relative
  > div
    position: absolute
    top: 0
    left: 0

.preview-placeholder
  width: 100%
  height: 100%
  display: flex
  align-items: center
  justify-content: center

.preview-generating
  position: absolute
  inset: 0
  background: #0e111580
  display: flex
  align-items: center
  justify-content: center
  backdrop-filter: blur(2px)

.group-tabs
  display: flex
  gap: 6px
  overflow-x: auto
  padding: 0 16px 12px
  scrollbar-width: none
  &::-webkit-scrollbar
    display: none

.group-tab
  flex-shrink: 0
  font-size: 12px
  font-weight: 600
  color: #ffffff73
  padding: 6px 14px
  border-radius: 20px
  border: 1.5px solid rgba(255, 255, 255, 0.1)
  background: transparent
  cursor: pointer
  transition: all .15s
  white-space: nowrap
  &.active
    color: var(--primary, #48F26D)
    border-color: var(--primary, #48F26D)
    background: #48f26d14

.thumb-carousel
  display: flex
  gap: 10px
  overflow-x: auto
  padding: 10px 16px 12px
  scroll-snap-type: x mandatory
  scrollbar-width: none
  &::-webkit-scrollbar
    display: none

.thumb-item
  flex-shrink: 0
  width: calc((100vw - 32px) * 0.4)
  scroll-snap-align: start
  display: flex
  flex-direction: column
  align-items: center
  gap: 6px
  cursor: pointer
  position: relative
  transition: transform .15s
  &.active
    transform: scale(1.03)
    .thumb-clip
      border-color: var(--primary, #48F26D)
    .thumb-label
      color: var(--primary, #48F26D)

.thumb-clip
  width: 100%
  aspect-ratio: 1
  overflow: hidden
  border-radius: 8px
  border: 2px solid rgba(255, 255, 255, 0.06)
  position: relative
  transition: border-color .15s
  &.story
    aspect-ratio: 9/16

.thumb-scale
  position: absolute
  top: 0
  left: 0

.thumb-label
  font-size: 9px
  font-weight: 600
  color: #FFF6
  text-align: center
  line-height: 1.2
  max-width: 80px
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.flow-footer
  display: flex
  gap: 8px
  align-items: center
  padding: 8px 16px calc(var(--bottom-saved, 16px) + 8px)
  flex-shrink: 0
  border-top: 1px solid rgba(255, 255, 255, 0.07)

.flex-1
  flex: 1
</style>