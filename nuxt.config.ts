// https://nuxt.com/docs/api/configuration/nuxt-config
import pkg from './package.json';
export default defineNuxtConfig({
    // modules: ['nuxt-electron', '@nuxtjs/tailwindcss', '@pinia/nuxt'],
    modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
    components: [{ path: '~/components/mapComponents' }, '~/components'],
    vite: {
        build: {
            rollupOptions: {
                external: ['panzoom'],
            },
        },
    },

    // routeRules: {
    //     '/routes': { ssr: false },
    //     '/settings/*': { ssr: false },
    // },
    ssr: false,

    runtimeConfig: {
        public: {
            version: pkg.version,
            name: pkg.name,
            productName: 'TrainLink Command',
        },
    },

    devtools: {
        enabled: true,
    },

    // electron: {
    //     build: [
    //         {
    //             entry: 'electron/main.ts',
    //         },
    //     ],
    // },
});
