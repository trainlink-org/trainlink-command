<script setup lang="ts">
// import SliderComponent from '../components/SliderComponent.vue';
// import ButtonComponent from '../components/ButtonComponent.vue';
// import SelectComponent from './SelectComponent.vue';

// import { reactive, watch, onMounted, onUnmounted } from 'vue';

import { store, allocatedLocos, targetNameCache, cached } from '@/utils/main';
import { type Throttle } from '@trainlink-org/shared-lib';
import { Direction, PID } from '@trainlink-org/trainlink-types'
// import { socket } from '@/utils/socketHelper';

interface DataStore {
    targetName: string,
    locoNames: string[],
    forwardStyles: string,
    stopStyles: string,
    reverseStyles: string,
    locked: boolean,
    lockedReason: string,
    automationPID: PID,
}


const props = defineProps({
    id: { type: Number, required: true }
});

const emit = defineEmits<{
    (e: 'nameChange', value: string): void
}>();


onMounted(() => {
    console.log('mounted');
    if (cached[props.id]) {
        for (const loco of store.getAllLocos()) {
            data.locoNames.push(loco.name);
        }
        watch(
            () => data.targetName,
            async () => {
                loadData();
            }
        );
    }
    if (targetNameCache[props.id]) {
        data.targetName = targetNameCache[props.id];
    }
    console.log(throttle);
});

function loadData() {
    store.getLoco(data.targetName).then((loco) => {
        throttle.locoAddress = loco.address;
        throttle.name = loco.name;
        throttle.speed = loco.speed;
        throttle.direction = loco.direction;
        throttle.disabled = false;
    }).then(() => {
        const automationPID = allocatedLocos.value.get(throttle.locoAddress);
        // console.log(throttle.locoAddress);
        if (automationPID) {
            data.locked = true;
            data.lockedReason = `Train is being used by automation ${allocatedLocos.value.get(throttle.locoAddress)}`;
            throttle.disabled = true;
            data.automationPID = automationPID;
        } else if (data.targetName !== 'Select a Train') {
            data.locked = false;
            data.lockedReason = '';
            throttle.disabled = false;
            data.automationPID = '';
        }
    }).catch(() => {
        throttle.disabled = true;
    });
}
onUnmounted(() => {
    targetNameCache[props.id] = data.targetName;
    cached[props.id] = true;
});


const data: DataStore = reactive({
    targetName: 'Select a Train',
    locoNames: [],
    forwardStyles: 'bg-primary-400',
    stopStyles: 'bg-primary-500 border-transparent',
    reverseStyles: 'bg-primary-400',
    locked: false,
    lockedReason: '',
    automationPID: '',
});

const throttle: Throttle = reactive({
    locoAddress: 0,
    name: '',
    speed: 0,
    direction: Direction.stopped,
    sliderDisabled: false,
    disabled: true
});

watch(
    () => throttle.name,
    () => {
        emit('nameChange', throttle.name);
    }
);

store.listener(throttle, props.id, () => {
    setThrottle(throttle.direction);
});



store.onLoaded(() => {
    for (const loco of store.getAllLocos()) {
        data.locoNames.push(loco.name);
    }
    watch(
        () => data.targetName,
        async () => {
            loadData();
        }
    );
});


function setThrottle(direction: Direction) {
    switch (direction) {
        case Direction.forward:
            data.forwardStyles = 'bg-green-600';
            data.stopStyles = 'bg-red-400 border-transparent';
            data.reverseStyles = 'bg-primary-400';
            throttle.sliderDisabled = false;
            break;

        case Direction.stopped:
            data.forwardStyles = 'bg-primary-400';
            data.stopStyles = 'bg-primary-400 border-red-400';
            data.reverseStyles = 'bg-primary-400';
            throttle.sliderDisabled = true;
            break;

        case Direction.reverse:
            data.forwardStyles = 'bg-primary-400';
            data.stopStyles = 'bg-red-400 border-transparent';
            data.reverseStyles = 'bg-red-600';
            throttle.sliderDisabled = false;
            break;
    }
}

watch(allocatedLocos, (allocatedLocos) => {
    console.log('changed');
    const automationPID = allocatedLocos.get(throttle.locoAddress);
    if (automationPID) {
        data.locked = true;
        data.lockedReason = `Train is being used by automation ${allocatedLocos.get(throttle.locoAddress)}`;
        throttle.disabled = true;
        data.automationPID = automationPID;
    } else if (data.targetName !== 'Select a Train') {
        data.locked = false;
        data.lockedReason = '';
        throttle.disabled = false;
        data.automationPID = '';
    }
});

function refreshNames() {
    const locos = Array.from(store.getAllLocos());
    const names = locos.map((loco) => {
        return loco.name;
    });
    if (data.locoNames !== names) {
        data.locoNames = names;
    }
}

</script>

<template>
    <div class="flex w-5/6 max-w-md flex-col items-center rounded-lg border-4 border-borderColor-400">
        <div class="relative my-2 flex w-11/12 items-center justify-between rounded-lg bg-primary-200 p-1"
            :class="data.locked ? 'bg-primary-200' : ''">
            <ButtonComponent class="w-1/6 bg-red-400" :class="data.locked ? 'visible' : 'invisible'"
                @click="socket.emit('automation/stopAutomation', data.automationPID)">
                Stop
            </ButtonComponent>
            <SelectComponent v-model:selected="data.targetName" :options="data.locoNames"
                title="Select the train to control" @click="refreshNames()" />
            <div class="group z-0 flex h-full w-1/6 items-center justify-end">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="justify-self-end"
                    :class="data.locked ? 'visible' : 'invisible'" viewBox="0 0 16 16">
                    <path
                        d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
                </svg>
                <div
                    class="invisible absolute right-4 top-0 z-20 mr-1 mt-1 w-max rounded-lg border-2 bg-primary-600 p-1 text-sm text-white group-hover:visible">
                    {{ data.lockedReason }}
                </div>
            </div>
        </div>
        <div class="rounded-lg-b h-full w-full border-borderColor-400 p-2"
            :class="data.locked ? 'bg-primary-200 opacity-40 border-t-2' : ''">
            <div class="flex w-full flex-col items-center sm:flex-row">
                <p class="w-1/12 select-none p-1 text-center">
                    {{ throttle.speed }}
                </p>
                <SliderComponent id="speedSlider" v-model:speed="throttle.speed" class="bg-inherit"
                    :disabled="throttle.sliderDisabled || throttle.disabled" />
            </div>
            <div class="flex w-full flex-col space-y-2">
                <div class="flex w-full grow flex-row space-x-2">
                    <ButtonComponent class="basis-1/3" :class="data.forwardStyles" :disabled="throttle.disabled"
                        @click="() => { if (!throttle.disabled) throttle.direction = Direction.forward }">
                        Forward
                    </ButtonComponent>
                    <ButtonComponent class="basis-1/3 bg-primary-400" :disabled="throttle.disabled"
                        @click="throttle.speed = 0">
                        Stop
                    </ButtonComponent>
                    <ButtonComponent class="basis-1/3" :class="data.reverseStyles" :disabled="throttle.disabled"
                        @click="throttle.direction = Direction.reverse">
                        Reverse
                    </ButtonComponent>
                </div>
                <ButtonComponent class="border-4" :class="data.stopStyles" :disabled="throttle.disabled"
                    @click="throttle.direction = Direction.stopped">
                    Emergency Stop
                </ButtonComponent>
            </div>
        </div>
    </div>
</template>