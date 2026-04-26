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
            includeAssets: ['logo_2024.png'],
            manifest: {
                name: 'Ethio Domestic Workers Link',
                short_name: 'EDWL',
                description: 'Connecting Quality Help to Your Home in Ethiopia',
                theme_color: '#008080',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'logo_2024.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'logo_2024.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'logo_2024.png',
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
