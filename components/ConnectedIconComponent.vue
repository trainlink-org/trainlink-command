<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import { socket } from '@/utils/socketHelper';
import { connect } from 'http2';

const configStore = useConfigStore();
const availableDrivers = ['Virtual', 'DCC-EX'];
const selected = ref('Virtual');
const address = ref('');
const connectionModalVisible = ref(false);

function connectDriver() {
    socket.emit('hardware/setDriver', selected.value, address.value);
    connectionModalVisible.value = false;
}
</script>

<template>
    <div class="group cursor-pointer" @click="connectionModalVisible = true">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="default"
            viewBox="0 0 16 16"
        >
            <path
                d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-8zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11z"
            />
        </svg>
        <div
            class="absolute right-8 top-10 border-4 rounded-lg mt-1 flex flex-col items-center text-center group-hover:visible invisible bg-white"
        >
            <p class="text-xl border-b-2 px-6 pt-2">Connected</p>
            <p class="px-2 pb-2">
                Connected to {{ configStore.driverName }} driver
            </p>
        </div>
    </div>
    <ModalComponent
        v-if="connectionModalVisible"
        title="Connection Properties"
        submitText="Connect"
        @submit="connectDriver"
        @cancel="connectionModalVisible = false"
    >
        <div class="grid grid-cols-2 gap-2 mx-2 place-items-center">
            <p>Driver:</p>
            <SelectComponent
                :options="availableDrivers"
                v-model:selected="selected"
            />
            <p class="col-span-2">
                Currently selected: {{ configStore.driverName }}
            </p>
            <span class="col-span-2 border-b-2 mx-10" />
            <p>Address:</p>
            <input
                type="text"
                class="w-full rounded border-2 border-primary-400 invalid:border-red-600"
                v-model="address"
            />
        </div>
    </ModalComponent>
</template>
