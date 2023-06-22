<script setup lang="ts">
// import { RouterView } from 'vue-router';

// import NavComponent  from './components/NavComponent.vue';

import { connected } from './utils/main';
import { useLocoStore } from './stores/locos';
import { Loco } from '@trainlink-org/shared-lib';
const context = useNuxtApp();
const locoStore = useLocoStore(context.$pinia);
socket.on('metadata/initialState/locos', async (locosState) => {
    console.log('New initial state');
    for (const locoString of locosState) {
        const loco = Loco.fromJson(JSON.parse(locoString));
        locoStore.addLoco({
            name: loco.name,
            address: loco.address,
            speed: loco.speed,
            direction: loco.direction,
            locked: false,
            automationPID: '',
        });
        console.log('Added to store');
    }
});
socket.on('automation/fetchRunningResponse', (automations) => {
    console.log('Updating locked')
    const usedLocos = automations.map((automation) => automation.locoAddress)
    console.log(usedLocos)
    locoStore.allLocos.forEach((loco) => {
        if (!usedLocos.includes(loco.address)) {
            locoStore.unlock(loco.address)
        }
    })
    automations.forEach((automation) => {
        if (automation.locoAddress) {
            locoStore.lock(automation.locoAddress, automation.pid)
        }
    })
})

socket.on('throttle/speedUpdate', (identifier, speed, socketId) => {
    if (typeof identifier === 'number' && socketId !== socket.id) {
        const loco = locoStore.definedLocos.get(identifier);
        if (loco) loco.speed = speed;
    }
});
socket.on('throttle/directionUpdate', (identifier, direction) => {
    if (typeof identifier === 'number') {
        const loco = locoStore.definedLocos.get(identifier);
        if (loco) loco.direction = direction;
    }
});
</script>

<template>
    <div class="h-screen">
        <NavComponent />
        <!-- <RouterView/> -->
        <NuxtPage />
    </div>
    <div v-if="!connected" class="cursor-wait">
        <div class="absolute top-0 left-0 z-20 h-screen w-screen bg-black opacity-25" />
        <div class="absolute top-0 left-0 z-30 flex h-screen w-screen items-center justify-center bg-transparent flex-col">
            <svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="64px" height="64px" viewBox="0 0 128 128"
                xml:space="preserve">
                <g>
                    <linearGradient id="linear-gradient">
                        <stop offset="0%" stop-color="#FFFFFF00" />
                        <stop offset="90%" stop-color="#202020" />
                    </linearGradient>
                    <path
                        d="M63.85 0A63.85 63.85 0 1 1 0 63.85 63.85 63.85 0 0 1 63.85 0zm.65 19.5a44 44 0 1 1-44 44 44 44 0 0 1 44-44z"
                        fill="url(#linear-gradient)" fill-rule="evenodd" />
                    <animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="1080ms"
                        repeatCount="indefinite" />
                </g>
            </svg>
            <p class="select-none text-xl">Connecting...</p>
        </div>
    </div>
</template>

<style></style>
