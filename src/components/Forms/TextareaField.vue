<template>
  <div class="w-100 d-flex flex-column">
    <label
      v-if="!props.inline"
      class="mb-2 text-subtitle-2"
      :for="props.id || generatedId"
    >
      {{ label }}
      <span v-if="props.required" class="text-error">*</span>
    </label>

    <v-textarea
      :bg-color="props.backgroundColor"
      :variant="props.variant"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :clearable="props.clearable"
      :color="props.color"
      :rules="allRules"
      :loading="props.loading"
      :id="props.id || generatedId"
      :hint="props.hint"
      :persistent-hint="props.persistentHint"
      :placeholder="props.placeholder"
      :hide-details="props.hideDetails"
      :counter="props.counter || (focused && props.maxLength ? props.maxLength : undefined)"
      :no-resize="props.noResize"
      :rows="props.rows"
      :density="props.density"
      v-model="modelProxy"
      @focus="focused = true"
      @blur="focused = false"
    >
      <template v-if="props.label && props.inline" v-slot:label>
        <span>{{ label }}</span>
        <span v-if="props.required" class="ml-1 text-error">*</span>
      </template>

      <template v-slot:append-inner>
        <slot name="append"></slot>

        <v-menu v-if="props.enableEmoji" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn
              icon=""
              size="x-small"
              v-bind="props"
              color="secondary"
            >
              <v-icon>mdi-emoticon</v-icon>
            </v-btn>
          </template>

          <Emoji @add="(t) => modelProxy += t" />
        </v-menu>
      </template>
    </v-textarea>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { useLocale } from "vuetify";

/// COMPONENTS
import Emoji from "../Emoji.vue";

defineOptions({ name: "TextareaField" });

// PROPS
type Rules = (value: any) => string | boolean;

interface Props {
  backgroundColor?: string,
  variant?: "solo" | "outlined",
  density?: "comfortable" | "compact",
  disabled?: boolean,
  readonly?: boolean,
  clearable?: boolean,
  dense?: boolean,
  color?: string,
  placeholder?: string,
  label?: string,
  required?: boolean,
  rules?: Rules[],
  modelValue: string | number,
  hint?:string,
  hideDetails?: boolean | "auto",
  persistentHint?: boolean,
  loading?: boolean,
  id?: string,
  inline?: boolean,
  counter?: true,
  noResize?: boolean
  rows?: number,
  enableEmoji?: boolean,
  maxLength?: number,
};

const props = withDefaults(defineProps<Props>(), {
  color: "primary",
  density: "comfortable",
  variant: "solo",
  inline: false,
  hideDetails: "auto",
  rows: 5,
  backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--tertiary")
});

// DATA
const { t } = useLocale();
const emit = defineEmits(["update:modelValue", "click:append", "focus", "blur"]);
const generatedId = ref("");
const focused = ref(false);

// COMPUTED
const modelProxy = computed({
  get: () => {
    if (typeof props.modelValue === "string" && props.maxLength) {
      return props.modelValue.substring(0, props.maxLength);
    }

    return props.modelValue;
  },
  set: (val: string | number) => {
    if (typeof props.modelValue === "string" && props.maxLength) {
      emit("update:modelValue", String(val).substring(0, props.maxLength));
    }

    emit("update:modelValue", val);
  }
});

const allRules = computed(() => {
  const rules: Rules[] = [];

  if (props.required) {
    rules.push(value => !!value || t("$vuetify.errors.required"));
  }

  rules.push(...(props.rules ?? []));

  return rules;
});

/// WATCH
watch(focused, (val) => {
  emit(val ? "focus" : "blur");
});

// LIFE CYCLES
onMounted(() => {
  generatedId.value = uuidv4();
});
</script>