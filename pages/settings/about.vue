<!-- The about page in settings -->
<script setup lang="ts">
import { version } from '@/utils/main';
</script>

<template>
    <div class="flex h-full w-full flex-col items-center justify-center text-center">
        <p class="w-3/4 text-4xl">
            Model Railway Control System
        </p>
        <br>
        <div>
            <p class="text-2xl">
                Client:
            </p>
            <p>{{ version.clientName }} version {{ version.clientVersion }}</p>
        </div>
        <br>
        <div>
            <p class="text-2xl">
                Server:
            </p>
            <p>{{ version.serverName }} version {{ version.serverVersion }}</p>
        </div>
        <div>
            <p class="text-2xl">
                Hardware:
            </p>
            <p>Connected via Native connector version 0.0.0</p>
            <p>Using the DCC-EX driver<br>Connected to EX-CommandStation version 4.1.1</p>
        </div>
    </div>
</template>