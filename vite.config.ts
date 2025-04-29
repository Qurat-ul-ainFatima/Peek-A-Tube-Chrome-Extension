import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "src/chrome-extension/manifest.json", dest: "." },
        { src: "src/chrome-extension/popup.png", dest: "." },
        { src: "src/chrome-extension/public/16.png", dest: "./public" },
        { src: "src/chrome-extension/public/32.png", dest: "./public" },
        { src: "src/chrome-extension/public/48.png", dest: "./public" },
        { src: "src/chrome-extension/public/128.png", dest: "./public" },
      ],
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  'process.env.DEBUG': 'false',
  // etc.
    'process.env': {}  // Defines process.env as an empty object for the entire project
  },
  server: {
    open: "/popup-local.html",
  },
  
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        background: resolve(__dirname, "src/chrome-extension/background.ts"),
        contentScript: resolve(__dirname, 'src/chrome-extension/contentScript.ts'),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
    outDir: 'dist', // Specify the output directory for the build
    lib: {
      entry: resolve(__dirname, 'src/chrome-extension/background.ts'),
      formats: ['es'], // Use ES modules format
      fileName: () => `background.js`, // Output the background.js file
    },
  },
});
