<script setup lang="ts">
// import { RouterView } from 'vue-router';

// import NavComponent  from './components/NavComponent.vue';

import { connected } from './utils/main';
</script>

<template>
    <div class="h-screen">
        <NavComponent />
        <!-- <RouterView/> -->
        <NuxtPage />
    </div>
    <div v-if="!connected" class="cursor-wait">
        <div
            class="absolute top-0 left-0 z-20 h-screen w-screen bg-black opacity-25"
        />
        <div
            class="absolute top-0 left-0 z-30 flex h-screen w-screen items-center justify-center bg-transparent flex-col"
        >
            <svg
                xmlns:svg="http://www.w3.org/2000/svg"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                version="1.0"
                width="64px"
                height="64px"
                viewBox="0 0 128 128"
                xml:space="preserve"
            >
                <g>
                    <linearGradient id="linear-gradient">
                        <stop offset="0%" stop-color="#FFFFFF00" />
                        <stop offset="90%" stop-color="#202020" />
                    </linearGradient>
                    <path
                        d="M63.85 0A63.85 63.85 0 1 1 0 63.85 63.85 63.85 0 0 1 63.85 0zm.65 19.5a44 44 0 1 1-44 44 44 44 0 0 1 44-44z"
                        fill="url(#linear-gradient)"
                        fill-rule="evenodd"
                    />
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 64 64"
                        to="360 64 64"
                        dur="1080ms"
                        repeatCount="indefinite"
                    />
                </g>
            </svg>
            <p class="select-none text-xl">Connecting...</p>
        </div>
    </div>
</template>

<style></style>
