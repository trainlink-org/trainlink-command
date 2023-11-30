<script setup lang="ts">
import { Direction } from '@trainlink-org/trainlink-types';
import { useLocoStore } from '@/stores/locos';
import { LocoClient } from '@/stores/locos';
import { useSocketStore } from '@/stores/socket';

const props = defineProps({
    id: { type: Number, required: true },
});

const locoStore = useLocoStore();
const socket = useSocketStore().socketRef;

// Passed into the proxy to intercept speed and direction changes
const handler: ProxyHandler<LocoClient> = {
    set(target, prop: keyof typeof target, value): boolean {
        switch (prop) {
            case 'speed':
                socket.emit('throttle/setSpeed', target.address, value);
                break;
            case 'direction':
                socket.emit('throttle/setDirection', target.address, value);
                break;
        }
        return Reflect.set(target, prop, value);
    },
};
// The loco the throttle is currently controlling
const activeLoco = computed({
    get() {
        if (locoStore.activeThrottles[props.id] !== undefined) {
            // User has previously selected a train
            return new Proxy(locoStore.activeThrottles[props.id], handler);
        }
        // Default dummy train
        return {
            name: 'Select a Train',
            address: 0,
            speed: 0,
            direction: Direction.stopped,
            locked: false,
            automationPID: '',
        };
    },
    // Just a pass through
    set(val) {
        locoStore.activeThrottles[props.id] = val;
    },
});

const throttleStatus = reactive({
    locked: false,
    lockedReason: '',
    disabled: computed(() => {
        return activeLoco.value.address === 0;
    }),
    automationPID: '',
});

// The loco currently selected by the dropdown
const selectedLoco = ref(activeLoco.value.name);
watch(selectedLoco, (selectedLoco) => {
    const address = locoStore.addressFromName(selectedLoco);
    if (address !== undefined) {
        locoStore.switchActiveThrottle(props.id, address);
    }
});

// Styling for the direction buttons
const forwardStyles = computed(() => {
    return activeLoco.value.direction === Direction.forward
        ? 'bg-green-600'
        : 'bg-primary-400';
});
const reverseStyles = computed(() => {
    return activeLoco.value.direction === Direction.reverse
        ? 'bg-red-600'
        : 'bg-primary-400';
});
const stopStyles = computed(() => {
    return activeLoco.value.direction === Direction.stopped
        ? 'bg-primary-400 border-red-400'
        : 'bg-red-400 border-transparent';
});
</script>

<template>
    <div
        class="flex w-5/6 max-w-md flex-col items-center rounded-lg border-4 border-borderColor-300"
    >
        <div
            class="relative my-2 flex w-11/12 items-center justify-between rounded-lg bg-primary-200 p-1"
            :class="activeLoco.locked ? 'bg-primary-200' : ''"
        >
            <ButtonComponent
                class="w-1/6 bg-red-400"
                :class="activeLoco.locked ? 'visible' : 'invisible'"
                @click="
                    socket.emit(
                        'automation/stopAutomation',
                        activeLoco.automationPID,
                    )
                "
            >
                Stop
            </ButtonComponent>
            <SelectComponent
                v-model:selected="selectedLoco"
                :options="locoStore.locoNames"
                title="Select the train to control"
            />
            <div class="group z-0 flex h-full w-1/6 items-center justify-end">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="justify-self-end"
                    :class="activeLoco.locked ? 'visible' : 'invisible'"
                    viewBox="0 0 16 16"
                >
                    <path
                        d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
                    />
                </svg>
                <div
                    class="invisible absolute right-4 top-0 z-20 mr-1 mt-1 w-max rounded-lg border-2 bg-primary-600 p-1 text-sm text-white group-hover:visible"
                >
                    {{
                        `Train is being used by automation ${activeLoco.automationPID}`
                    }}
                </div>
            </div>
        </div>
        <div
            class="rounded-lg-b h-full w-full border-borderColor-400 p-2"
            :class="
                activeLoco.locked ? 'bg-primary-200 opacity-40 border-t-2' : ''
            "
        >
            <div class="flex w-full flex-col items-center sm:flex-row">
                <p class="w-1/12 select-none p-1 text-center">
                    {{ activeLoco.speed }}
                </p>
                <SliderComponent
                    id="speedSlider"
                    v-model:speed="activeLoco.speed"
                    class="bg-inherit"
                    :disabled="
                        throttleStatus.disabled ||
                        activeLoco.direction === Direction.stopped ||
                        activeLoco.locked
                    "
                />
            </div>
            <div class="flex w-full flex-col space-y-2">
                <div class="flex w-full grow flex-row space-x-2">
                    <ButtonComponent
                        class="basis-1/3"
                        :class="forwardStyles"
                        :disabled="throttleStatus.disabled || activeLoco.locked"
                        @click="activeLoco.direction = Direction.forward"
                    >
                        Forward
                    </ButtonComponent>
                    <ButtonComponent
                        class="basis-1/3 bg-primary-400"
                        :disabled="throttleStatus.disabled || activeLoco.locked"
                        @click="activeLoco.speed = 0"
                    >
                        Stop
                    </ButtonComponent>
                    <ButtonComponent
                        class="basis-1/3"
                        :class="reverseStyles"
                        :disabled="throttleStatus.disabled || activeLoco.locked"
                        @click="activeLoco.direction = Direction.reverse"
                    >
                        Reverse
                    </ButtonComponent>
                </div>
                <ButtonComponent
                    class="border-4"
                    :class="stopStyles"
                    :disabled="throttleStatus.disabled || activeLoco.locked"
                    @click="activeLoco.direction = Direction.stopped"
                >
                    Emergency Stop
                </ButtonComponent>
            </div>
        </div>
    </div>
    <!-- </div> -->
</template>
