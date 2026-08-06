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

    <v-text-field
      v-if="!mask && !isMoney"
      :bg-color="props.backgroundColor"
      :variant="props.variant"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :clearable="props.clearable"
      :color="props.color"
      :type="type"
      :rules="allRules"
      :loading="props.loading"
      :id="props.id || generatedId"
      :hint="props.hint"
      :persistent-hint="props.persistentHint"
      :placeholder="props.placeholder"
      :prepend-inner-icon="props.prependIcon"
      :append-inner-icon="props.appendIcon ?? (isPassword ? (showPassword ? 'mdi-eye-off' : 'mdi-eye') : undefined)"
      :hide-details="props.hideDetails"
      :density="props.density"
      v-model="modelProxy"
      @click:append-inner="isPassword ? (showPassword = !showPassword) : emit('click:append')"
      @focus="focused = true"
      @blur="focused = false"
    >
      <template v-if="props.label && props.inline" v-slot:label>
        <span>{{ label }}</span>
        <span v-if="props.required" class="ml-1 text-error">*</span>
      </template>
      <template v-slot:append-inner>
        <slot name="append"></slot>
      </template>
    </v-text-field>
    <v-text-field
      v-else-if="mask && loaded"
      :bg-color="props.backgroundColor"
      :variant="props.variant"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :clearable="props.clearable"
      :color="props.color"
      :type="props.type"
      :rules="allRules"
      :loading="props.loading"
      :id="props.id || generatedId"
      :hint="props.hint"
      :persistent-hint="props.persistentHint"
      :placeholder="props.placeholder"
      :prepend-inner-icon="props.prependIcon"
      :append-inner-icon="props.appendIcon"
      :hide-details="props.hideDetails"
      :density="props.density"
      v-model="modelProxy"
      v-maska="mask"
      @click:append-inner="emit('click:append')"
      @focus="focused = true"
      @blur="focused = false"
    >
      <template v-if="props.label && props.inline" v-slot:label>
        <span>{{ label }}</span>
        <span v-if="props.required" class="ml-1 text-error">*</span>
      </template>
      <template v-slot:append-inner>
        <slot name="append"></slot>
      </template>
    </v-text-field>
    <v-text-field
      v-else-if="props.isMoney && loaded"
      :bg-color="props.backgroundColor"
      :variant="props.variant"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :clearable="props.clearable"
      :color="props.color"
      :rules="allRules"
      :prepend-inner-icon="props.prependIcon"
      :append-inner-icon="props.appendIcon"
      :hide-details="props.hideDetails"
      :loading="props.loading"
      :hint="props.hint"
      :persistent-hint="props.persistentHint"
      :placeholder="props.placeholder"
      :id="props.id || generatedId"
      :density="props.density"
      ref="inputRef"
      v-model="formattedValue"
      @click:append-inner="emit('click:append')"
      @focus="focused = true"
      @blur="focused = false"
    >
      <template v-if="props.label && props.inline" v-slot:label>
        <span>{{ label }}</span>
        <span v-if="props.required" class="ml-1 text-error">*</span>
      </template>
      <template v-slot:append-inner>
        <slot name="append"></slot>
      </template>
    </v-text-field>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { useLocale } from "vuetify";
import { vMaska } from "maska/vue";
import { useCurrencyInput, CurrencyDisplay } from "vue-currency-input";

defineOptions({ name: "TextField" });

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
  type?: string,
  placeholder?: string,
  label?: string,
  required?: boolean,
  rules?: Rules[],
  modelValue: string | number,
  hint?:string,
  prependIcon?: string,
  appendIcon?: string,
  hideDetails?: boolean | "auto",
  mask?: string | string[],
  persistentHint?: boolean,
  loading?: boolean,
  id?: string,
  isMoney?: boolean,
  allowNegative?: boolean
  inline?: boolean,
  hideSymbol?: boolean,
};

const props = withDefaults(defineProps<Props>(), {
  color: "primary",
  density: "comfortable",
  variant: "solo",
  type: "text",
  allowNegative: false,
  inline: false,
  hideSymbol: false,
  hideDetails: "auto",
  backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--tertiary")
});

// DATA
const { t } = useLocale();
const emit = defineEmits(["update:modelValue", "click:append", "update", "focus", "blur"]);
const loaded = ref(false);
const showPassword = ref(false);
const isPassword = ref(false);
const generatedId = ref("");
const focused = ref(false);

const { inputRef, formattedValue } = useCurrencyInput({
  currencyDisplay: props.hideSymbol ? CurrencyDisplay.hidden : CurrencyDisplay.symbol,
  currency: t("$vuetify.currency"),
  hideCurrencySymbolOnFocus: true,
  hideGroupingSeparatorOnFocus: true,
  precision: 2,
  autoDecimalDigits: true,
  valueRange: !props.allowNegative ? { min: 0 } : undefined
});

// COMPUTED
const modelProxy = computed({
  get: () => props.modelValue,
  set: (val: string | number) => emit("update:modelValue", val)
});

const allRules = computed(() => {
  const rules: Rules[] = [];
  if (props.required) rules.push(value => !!value || t("$vuetify.errors.required"));
  rules.push(...(props.rules ?? []));
  return rules;
});

const type = computed(() => {
  if (props.type !== "password") return props.type;
  return showPassword.value ? "text" : "password";
});

const masksWithThresholds = computed(() => {
  const sorted = [...props.mask!].sort((a, b) => a.length - b.length);

  return sorted.map((mask, index) => {
    const baseLength = mask.length;
    const isLast = index === sorted.length - 1;

    return {
      original: mask,
      mask: isLast ? mask : `${mask}#`,
      length: baseLength,
      changeLength: isLast ? null : baseLength + 1
    };
  });
});

const mask = computed(() => {
  // Caso não tenha máscara
  if (!props.mask) return "";

  // Caso seja string
  if (typeof props.mask === "string") return props.mask;

  // Caso seja array, reorganizar
  const length = String(modelProxy.value).length;

  for (let i = 0; i < masksWithThresholds.value.length; i++) {
    const m = masksWithThresholds.value[i]!;
    const next = masksWithThresholds.value[i + 1];

    if (!next || length < m.changeLength!) {
      return m.mask;
    }
  }

  return masksWithThresholds.value[masksWithThresholds.value.length - 1]!.mask;
});

// WATCH
watch(modelProxy, (val) => {
  emit("update");
});

watch(() => props.mask, (val) => {
  loaded.value = true;
});

watch(focused, (val) => {
  emit(val ? "focus" : "blur");
});

// LIFE CYCLES
onMounted(() => {
  generatedId.value = uuidv4();
  if (props.type === "password") isPassword.value = true;
  if (props.mask || props.isMoney) loaded.value = true;
});
</script>