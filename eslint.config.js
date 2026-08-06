import vuetify from "eslint-config-vuetify";

export default [
	...vuetify(),
	{
		rules: {
			quotes: ["error", "double"],
			semi: ["error", "always"],
			"eol-last": ["off"]
		}
	}
];