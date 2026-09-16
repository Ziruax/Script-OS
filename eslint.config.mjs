import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([{
    extends: [...next],
    ignores: [
        "examples/**",
        "tests/**",
        "mini-services/**",
        "backend/**",
        "scripts/**",
        "node_modules/**",
        ".next/**",
        "upload/**",
        "download/**",
    ],
}]);
