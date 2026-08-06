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

    <v-select
      :clearable="props.clearable"
      :bg-color="props.backgroundColor"
      :variant="props.variant"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :color="props.color"
      :rules="allRules"
      :loading="props.loading"
      :id="props.id || generatedId"
      :hint="props.hint"
      :persistent-hint="props.persistentHint"
      :hide-details="props.hideDetails"
      :items="allItems"
      :return-object="props.returnObject"
      :multiple="props.multiple"
      :item-title="props.itemTitle"
      :item-value="props.itemValue"
      :menu-props="{ contentClass: 'custom-select-menu' }"
      :density="props.density"
      v-model="modelProxy"
    >
      <template v-if="props.label && props.inline" v-slot:label>
        <span>{{ label }}</span>
        <span v-if="props.required" class="ml-1 text-error">*</span>
      </template>

      <template v-if="slots.item" #item="{ props, item, index }">
        <slot
          name="item"
          :props="props"
          :item="item"
          :index="index"
        ></slot>
      </template>
      <template v-else #item="{ props, item }">
        <v-list-item
          v-bind="props"
          :title="undefined"
          :disabled="item.raw.disabled"
          class="mx-3 rounded-lg"
        >
          <v-list-item-title v-if="typeof item.raw === 'string'">
            {{ item.raw }}
          </v-list-item-title>
          <v-list-item-title v-else>
            <v-icon
              v-if="item.raw.icon"
              class="mr-2"
            >{{ item.raw.icon }}</v-icon>

            {{ item.raw.title }}
          </v-list-item-title>
        </v-list-item>
      </template>

      <template #selection="{ item }">
        <v-chip
          v-if="props.multiple"
          color="primary"
          class="d-flex align-center"
        >
          <v-icon
            v-if="item.raw.icon"
            class="mr-2"
          >{{ item.raw.icon }}</v-icon>

          <span>{{ item.raw.title }}</span>
        </v-chip>
        <div v-else class="d-flex align-center">
          <span v-if="typeof item.raw === 'string'">
            {{ item.raw }}
          </span>
          <template v-else>
            <v-icon
              v-if="item.raw.icon"
              class="mr-2"
            >{{ item.raw.icon }}</v-icon>

            <span>{{ item.raw.title }}</span>
          </template>
        </div>
      </template>
    </v-select>
  </div>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from "uuid";
import { useLocale } from "vuetify";

defineOptions({ name: "ItemSelect" });

const slots = useSlots();

// PROPS
type Rules = (value: any) => string | boolean;

interface Props {
  clearable?: boolean,
  backgroundColor?: string,
  variant?: "solo" | "outlined",
  density?: "comfortable" | "compact",
  disabled?: boolean,
  readonly?: boolean,
  color?: string,
  label?: string,
  required?: boolean,
  rules?: Rules[],
  modelValue: string | number | string[] | boolean,
  hint?:string,
  hideDetails?: boolean | "auto",
  persistentHint?: boolean,
  loading?: boolean,
  id?: string,
  inline?: boolean,
  returnObject?: boolean,
  multiple?: boolean,
  itemTitle?: string,
  itemValue?: string,
  items: any[],
};

const props = withDefaults(defineProps<Props>(), {
  color: "primary",
  density: "comfortable",
  variant: "solo",
  inline: false,
  hideDetails: "auto",
  itemTitle: "title",
  itemValue: "value",
  backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--tertiary")
});

// DATA
const { t } = useLocale();
const emit = defineEmits(["update:modelValue", "click:append"]);
const generatedId = ref("");

// COMPUTED
const modelProxy = computed({
  get: () => props.modelValue,
  set: (val: string | number) => emit("update:modelValue", val)
});

const allItems = computed(() => {
  const items: any[] = [];
  items.push(...(props.items ?? []));
  return items;
});

const allRules = computed(() => {
  const rules: Rules[] = [];

  if (props.required) {
    rules.push(value => !!value || t("$vuetify.errors.required"));
  }

  rules.push(...(props.rules ?? []));

  return rules;
});

// LIFE CYCLES
onMounted(() => {
  generatedId.value = uuidv4();
});
</script>

<style lang="sass">
.custom-select-menu
  .v-list
    gap: 8px
    display: flex
    flex-direction: column
</style>