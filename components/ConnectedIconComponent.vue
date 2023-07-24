<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
// import { socket } from '@/utils/socketHelper';
import { HardwareDevice } from '@trainlink-org/trainlink-types';
import { useSocketStore } from '@/stores/socket';

const configStore = useConfigStore();
const socket = useSocketStore().socketRef;

const advanced = ref(false);
const address = ref('');
const selected = ref('Virtual');
const selectedDevice: Ref<HardwareDevice | undefined> = ref(undefined);
const connectionModalVisible = ref(false);

function openModal() {
    console.log('Getting devices');
    socket.emit('hardware/getDevices');
    selectedDevice.value = configStore.device;
    connectionModalVisible.value = true;
}

function cancelModal() {
    selectedDevice.value = undefined;
    connectionModalVisible.value = false;
}

function connectDriver() {
    if (advanced.value) {
        socket.emit('hardware/setDriver', selected.value, address.value);
    } else {
        console.log(selectedDevice.value);
        if (selectedDevice.value !== undefined)
            socket.emit('hardware/setDevice', selectedDevice.value);
    }
    connectionModalVisible.value = false;
}
</script>

<template>
    <div class="group cursor-pointer" @click="openModal">
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
            class="absolute right-8 top-10 border-4 rounded-lg mt-1 flex flex-col items-center text-center group-hover:visible invisible bg-white border-borderColor-300"
        >
            <p class="text-xl border-b-2 px-6 pt-2 border-borderColor-300">
                Connected
            </p>
            <p class="px-2 pb-2">
                Connected to {{ configStore.device?.name }} using the
                {{ configStore.driverName }} driver
            </p>
        </div>
    </div>
    <ModalComponent
        v-if="connectionModalVisible"
        title="Connection Properties"
        submitText="Connect"
        @submit="connectDriver"
        @cancel="cancelModal"
    >
        <div
            v-if="advanced"
            class="grid grid-cols-2 gap-2 mx-2 place-items-center"
        >
            <p>Driver:</p>
            <SelectComponent
                :options="configStore.availableDrivers"
                v-model:selected="selected"
            />
            <p class="col-span-2">
                Currently using: {{ configStore.driverName }}
            </p>
            <span class="col-span-2 border-b-2 mx-10" />
            <p v-if="selected !== 'Virtual'">Address:</p>
            <input
                v-if="selected !== 'Virtual'"
                type="text"
                class="w-full rounded border-2 border-primary-400 invalid:border-red-600"
                v-model="address"
            />
        </div>
        <div v-else class="grid grid-cols-2 gap-2 mx-2 place-items-center">
            <p>Available Devices:</p>
            <select class="w-full rounded" v-model="selectedDevice">
                <option disabled :value="undefined" class="w-full">
                    Select a device
                </option>
                <option
                    v-for="device in configStore.availableDevices.values()"
                    :value="device"
                >
                    <span v-if="device.address !== undefined"
                        >{{ device.name }} ({{ device.address }}) [{{
                            device.driver
                        }}]</span
                    >
                    <span v-else>{{ device.name }} [{{ device.driver }}]</span>
                </option>
            </select>
        </div>
        <p
            class="cursor-pointer text-blue-400 left-1 bottom-1 text-left absolute"
            @click="advanced = !advanced"
        >
            Switch to {{ advanced ? 'basic mode' : 'advanced mode' }}
        </p>
    </ModalComponent>
</template>
