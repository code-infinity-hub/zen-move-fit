// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "./App.vue";
import TextField from "./components/Forms/TextField.vue";
import ItemSelect from "./components/Forms/ItemSelect.vue";
import TextareaField from "./components/Forms/TextareaField.vue";
import Autocomplete from "./components/Forms/Autocomplete.vue";

// Composables
import { createApp } from "vue";

// Styles
import "unfonts.css";

const app = createApp(App);

app.component("TextField", TextField);
app.component("ItemSelect", ItemSelect);
app.component("TextareaField", TextareaField);
app.component("Autocomplete", Autocomplete);

registerPlugins(app);

app.mount("#app");