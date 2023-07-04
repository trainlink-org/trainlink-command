<script setup lang="ts">
// import { RouterLink, useRouter } from 'vue-router';

import { trackPower } from '@/utils/main';

// import SelectNavComponent from './SelectNavComponent.vue';
import { socket } from '@/utils/socketHelper';
import { useConfigStore } from '@/stores/config';

const router = useRouter();

function selectHandler(event: string) {
    console.log(event);
    router.push({ name: event });
}

function setState() {
    socket.emit('throttle/setTrackPower', !trackPower.value);
}
const configStore = useConfigStore();
</script>

<template>
    <div class="absolute left-0 top-0 z-10 flex h-10 items-center pl-1">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            viewBox="0 0 16 16"
        >
            <path d="M7.5 1v7h1V1h-1z" />
            <path
                d="M3 8.812a4.999 4.999 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812z"
            />
        </svg>
        <label class="switch">
            <input v-model="trackPower" type="checkbox" @click="setState" />
            <span class="slider round" />
        </label>
    </div>
    <div
        class="absolute top-0 left-0 hidden h-10 w-full flex-row items-center justify-evenly border sm:flex"
    >
        <RouterLink class="w-40 text-center" to="/"> Throttle </RouterLink>
        <RouterLink class="w-40 text-center" to="/routes"> Routes </RouterLink>
        <NuxtLink class="w-40 text-center" to="/automations">
            Automations
        </NuxtLink>
    </div>
    <div
        class="absolute top-0 left-0 flex h-10 w-full flex-row items-center justify-evenly border sm:hidden"
    >
        <SelectNavComponent
            :options="['Throttle', 'Routes', 'Automations']"
            @input="selectHandler"
        />
    </div>
    <div class="absolute right-0 top-0 flex flex-row space-x-2 items-center">
        <ConnectedIconComponent />
        <!-- <RouterLink class="absolute right-0 top-0" to="/settings"> -->
        <RouterLink to="/settings">
            <img
                src="~/assets/icons/gear-fill.svg"
                alt="Settings"
                width="32"
                class="h-10 p-1"
            />
        </RouterLink>
    </div>
</template>

<style scoped>
/* The switch - the box around the slider */
.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

/* The slider */
.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
}

.slider:before {
    position: absolute;
    content: '';
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
}

input:checked + .slider {
    background-color: #2196f3;
}

input:focus + .slider {
    box-shadow: 0 0 1px #2196f3;
}

input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}
</style>
