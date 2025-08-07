import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true, // Optional: mimics Jest behavior
        environment: "node", // or 'jsdom' for frontend
        include: ["**/*.{test,spec}.{ts,js}"],
    },
});
