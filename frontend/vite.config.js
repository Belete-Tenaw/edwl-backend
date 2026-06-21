import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            workbox: {
                cleanupOutdatedCaches: true,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}']
            },
            includeAssets: [
                'edwl_logo.png',
                'apple-touch-icon.png',
                'icons/pwa/edwl-logo-192.png',
                'icons/pwa/edwl-logo-512.png'
            ],
            manifest: {
                name: 'Ethio Domestic Workers Link',
                short_name: 'EDWL',
                description: 'Ethio Domestic Workers Link helps Ethiopian households browse reviewed domestic worker summaries and sign up when ready.',
                theme_color: '#008080',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                id: '/',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'icons/pwa/edwl-logo-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: 'icons/pwa/edwl-logo-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'icons/pwa/edwl-logo-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: 'icons/pwa/edwl-logo-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            }
        }
    },
    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
                    'vendor-i18n': ['react-i18next', 'i18next'],
                    'vendor-ui': ['lucide-react'],
                }
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
        include: ['src/**/*.{test,spec}.{js,jsx}'],
    }
})
