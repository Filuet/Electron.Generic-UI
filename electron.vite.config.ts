// Node.js path utility to resolve absolute paths
import { resolve } from 'path';
import eslint from 'vite-plugin-eslint';
// Importing config and plugin helpers from electron-vite
import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite';
// React plugin for Vite — adds support for JSX, Fast Refresh, etc.
import react from '@vitejs/plugin-react';

// Export the Electron-Vite configuration
export default defineConfig(({ mode }) => {
  // Load environment variables based on current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Main process (Electron's background process)
    main: {
      // This plugin tells Vite not to bundle external Node modules — improves build speed and avoids duplication
      plugins: [externalizeDepsPlugin()],
      define: {
        'process.env.VITE_KIOSK_NAME': JSON.stringify(env.VITE_KIOSK_NAME),
        'process.env.VITE_KIOSK_EMAIL': JSON.stringify(env.VITE_KIOSK_EMAIL),
        'process.env.VITE_KIOSK_PASSWORD': JSON.stringify(env.VITE_KIOSK_PASSWORD),
        'process.env.VITE_OGMENTO_BASE_URL': JSON.stringify(env.VITE_OGMENTO_BASE_URL),
        'process.env.SKIP_ADD_TO_CART_CONDITION': JSON.stringify(env.SKIP_ADD_TO_CART_CONDITION),
        'process.env.SKIP_PAYMENT': JSON.stringify(env.SKIP_PAYMENT),
        'process.env.EXPO_EMAIL_SHOULD_SEND': JSON.stringify(env.EXPO_EMAIL_SHOULD_SEND)
      }
    },

    // Preload script configuration (executed before renderer in Electron context)
    preload: {
      plugins: [externalizeDepsPlugin()],
      define: {
        'process.env.VITE_KIOSK_NAME': JSON.stringify(env.VITE_KIOSK_NAME),
        'process.env.VITE_KIOSK_EMAIL': JSON.stringify(env.VITE_KIOSK_EMAIL),
        'process.env.VITE_KIOSK_PASSWORD': JSON.stringify(env.VITE_KIOSK_PASSWORD),
        'process.env.VITE_OGMENTO_BASE_URL': JSON.stringify(env.VITE_OGMENTO_BASE_URL)
      }
    },

    // Renderer process (your React frontend)
    renderer: {
      resolve: {
        alias: {
          // Create an alias so you can import like: import X from '@renderer/...'
          '@': resolve('src/renderer')
        }
      },
      // Use the React plugin to handle .jsx/.tsx files, Fast Refresh, etc.
      plugins: [react(), eslint()],
      define: {
        'process.env.VITE_KIOSK_NAME': JSON.stringify(env.VITE_KIOSK_NAME),
        'process.env.VITE_KIOSK_EMAIL': JSON.stringify(env.VITE_KIOSK_EMAIL),
        'process.env.VITE_KIOSK_PASSWORD': JSON.stringify(env.VITE_KIOSK_PASSWORD),
        'process.env.VITE_OGMENTO_BASE_URL': JSON.stringify(env.VITE_OGMENTO_BASE_URL)
      },
      server: {
        // Port to serve the development server (used in dev mode only)
        port: 5174,

        // Use HTTPS with a local self-signed certificate (for development)
        https: {
          // Private key for the local HTTPS server
          key: resolve('certificates/vendingMachine.key'),
          // Certificate file for the local HTTPS server
          cert: resolve('certificates/vendingMachine.crt')
        }
      }
    }
  };
});
