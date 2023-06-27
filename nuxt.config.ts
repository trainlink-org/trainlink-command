// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    // modules: ['nuxt-electron', '@nuxtjs/tailwindcss', '@pinia/nuxt'],
    modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
    components: [{ path: '~/components/mapComponents' }, '~/components'],

    routeRules: {
        '/routes': { ssr: false },
        '/settings/*': { ssr: false },
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
