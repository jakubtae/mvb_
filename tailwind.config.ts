import type { Config } from "tailwindcss";

import { config as RealConfig } from "./src/lib/realTailwind.config";
const config = {
  ...RealConfig,
  plugins: [
    require("tailwindcss-animate"),
    require("tailwindcss"),
    require("autoprefixer"),
  ],
} satisfies Config;

export default config;
