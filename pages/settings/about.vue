<!-- The about page in settings -->
<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
const configStore = useConfigStore();
const runtimeConfig = useRuntimeConfig();
</script>

<template>
    <div
        class="flex h-full w-full flex-col items-center justify-center text-center"
    >
        <p class="w-3/4 text-4xl">About TrainLink</p>
        <br />
        <div>
            <p class="text-2xl">Client:</p>
            <p>
                {{ runtimeConfig.public.productName }} ({{
                    runtimeConfig.public.name
                }}) version
                {{ runtimeConfig.public.version }}
            </p>
        </div>
        <br />
        <div>
            <p class="text-2xl">Server:</p>
            <p>
                {{ configStore.serverProductName }} ({{
                    configStore.serverName
                }}) version {{ configStore.serverVersion }}
            </p>
        </div>
        <div>
            <p class="text-2xl">Hardware:</p>
            <p>Using the {{ configStore.driverName }} driver</p>
            <p>{{ configStore.driverMsg }}</p>
        </div>
    </div>
</template>
