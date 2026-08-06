import validator from "validator";
import { useLocale } from "vuetify";
import { cpf, cnpj } from "cpf-cnpj-validator";
import { eventBus } from "@/eventBus";
import { date } from "@/utils";

const checkDocument = (str: string) => {
  str = str.replace(/[-/.]/g, "");
  return str.length <= 11 ? cpf.isValid(str) : cnpj.isValid(str);
};

export const useForm = () => {
  const { t } = useLocale();
  const { validate: dateValidate } = date();

  const validate = async (form: Record<string, any>): Promise<boolean> => {
    const valid = (await Promise.all(
      (form.value.items || []).map(async (item: any) => {
        if (document.body.contains(item.vm.vnode.el)) {
          const validation = await item.validate();
          return Boolean(validation.length === 0);
        }
        return true;
      })
    )).every(Boolean);

    if (!valid) {
      eventBus.emit("SNACKBAR", {
        message: t("$vuetify.message.check_all_fields"),
        color: "error",
        icon: "mdi-close"
      });
    }

    return valid;
  };

  const rules = {
    required: (v: string | number) => !!v || t("$vuetify.errors.required"),
    email: (v: string) => validator.isEmail(v) || t("$vuetify.errors.invalid_email"),
    min_length_pasword: (v: string) => v.length >= 8 || t("$vuetify.errors.min_characters", 8),
    past_date: (v: string) => dateValidate(v, "past") || t("$vuetify.errors.invalid_date"),
    future_date: (v: string) => dateValidate(v, "future") || t("$vuetify.errors.invalid_date"),
    document: (v: string) => checkDocument(v) || t("$vuetify.errors.invalid_document"),
    phone: (v: string) => v.length === 15 || t("$vuetify.errors.invalid_mobile_number"),
    zipcode: (v: string) => v.replace(/[.-]/g, "").length === 8 || t("$vuetify.errors.invalid_postal_code"),
  };

  return { validate, rules };
};