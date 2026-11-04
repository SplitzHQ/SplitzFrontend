import { withThemeByClassName } from "@storybook/addon-themes";
import { setup, type Preview } from "@storybook/vue3-vite";

import { createAppFluent } from "@/libs/fluent";
import "@/assets/base.css";
import "@/assets/color.css";

// Components read their strings through fluent, so stories install the same plugin as the app.
setup((app) => {
  app.use(createAppFluent());
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "error",
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
