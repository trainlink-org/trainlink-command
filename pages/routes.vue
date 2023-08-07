<script setup lang="ts">
// import { ref, onMounted, onUnmounted, computed, type Ref } from 'vue';
import {
    isTouchScreen,
    svgWidth,
    svgHeight,
    setLinkStates,
    DestinationState,
} from '../components/mapComponents/shared';

// import TurnoutComponent from '../components/mapComponents/TurnoutComponent.vue';
// import ConnectorComponent from '../components/mapComponents/ConnectorComponent.vue';
// import DestinationComponent from '../components/mapComponents/DestinationComponent.vue';

import { turnoutLinks, turnouts, destinations } from '@/utils/main';
import { TurnoutState, type Destination } from '@trainlink-org/trainlink-types';
// import { socket } from '@/utils/socketHelper';

import { usedLinks, usedTurnouts, destinationStates } from '@/utils/main';
import { useSocketStore } from '@/stores/socket';

const socket = useSocketStore().socketRef;
const router = useRouter();

const windowWidth = ref(window.innerWidth);

const onWidthChange = () => {
    windowWidth.value = window.innerWidth;
    svgHeight.value = document.getElementById('mapSvg')?.clientHeight || 100;
    svgWidth.value = document.getElementById('mapSvg')?.clientWidth || 100;
};
onMounted(() => {
    window.addEventListener('resize', onWidthChange);
    svgHeight.value = document.getElementById('mapSvg')?.clientHeight || 100;
    svgWidth.value = document.getElementById('mapSvg')?.clientWidth || 100;
    if (window.matchMedia('(pointer: coarse)').matches) {
        isTouchScreen.value = true;
        console.log('Touchscreen');
    }
});

onUnmounted(() => window.removeEventListener('resize', onWidthChange));

function setTurnout(id: number) {
    const turnout = turnouts.get(id);
    if (turnout) {
        switch (
            turnout.state //TODO refactor with an if block
        ) {
            case TurnoutState.thrown:
                turnout.state = TurnoutState.closed;
                break;
            case TurnoutState.closed:
                turnout.state = TurnoutState.thrown;
                break;
        }
        setLinkStates(turnout.id, turnout.state);
        socket.emit('routes/setTurnout', turnout.id, turnout.state);
    }
}

const viewBox = computed(() => {
    return `0 0 ${svgWidth.value} ${svgHeight.value}`;
});

function updateTurnout(turnoutID: number, turnoutState: TurnoutState) {
    console.log(`${turnoutID}: ${turnoutState}`);
    const turnout = turnouts.get(turnoutID);
    if (turnout) {
        turnout.state = turnoutState;
        setLinkStates(turnoutID, turnoutState);
    }
}

socket.on('routes/turnoutUpdate', (turnoutID, turnoutState) => {
    console.log('TurnoutUpdate');
    updateTurnout(turnoutID, turnoutState);
});

socket.on('routes/routeUpdate', (route) => {
    route.turnouts.forEach((turnout) => {
        updateTurnout(turnout.id, turnout.state);
    });
});

const selectedDestinationsNum = ref(0);
const firstDestination: Ref<Destination | undefined> = ref(undefined);

function toggleDestination(destination: Destination) {
    if (destination !== firstDestination.value) {
        selectedDestinationsNum.value++;
        if (selectedDestinationsNum.value === 2 && firstDestination.value) {
            socket.emit(
                'routes/setRoute',
                firstDestination.value.id,
                destination.id,
            );
            destinationStates.set(
                firstDestination.value.id,
                DestinationState.inactive,
            );
            selectedDestinationsNum.value = 0;
            firstDestination.value = undefined;
        } else {
            firstDestination.value = destination;
            destinationStates.set(destination.id, DestinationState.selected);
        }
    } else {
        destinationStates.set(destination.id, DestinationState.inactive);
        firstDestination.value = undefined;
        selectedDestinationsNum.value = 0;
    }
}
import panzoom from 'panzoom';
onMounted(() => {
    const svg: HTMLElement | SVGElement | null =
        document.querySelector('#panzoom');
    console.log(svg);
    if (svg) {
        panzoom(svg);
        console.log('panzoom');
    }
});
</script>

<template>
    <div class="flex h-full w-full items-center justify-evenly pt-10">
        <div
            class="h-5/6 w-11/12 overflow-y-scroll rounded-lg border-4 border-borderColor-300"
        >
            <svg id="mapSvg" class="h-full w-full" :viewBox="viewBox">
                <g id="panzoom">
                    <ConnectorComponent
                        v-for="link in turnoutLinks.values()"
                        :key="link.id"
                        :start-seg-active="link.startActive"
                        :end-seg-active="link.endActive"
                        :start="
                            turnouts.get(link.start)?.coordinate ||
                            destinations.get(link.start)?.coordinate || {
                                x: -5,
                                y: -5,
                            }
                        "
                        :points="link.points"
                        :end="
                            turnouts.get(link.end)?.coordinate || {
                                x: -5,
                                y: -5,
                            }
                        "
                        :active-route="usedLinks.get(link.id) !== undefined"
                    />
                    <TurnoutComponent
                        v-for="turnout in turnouts.values()"
                        :key="turnout.id"
                        :coordinate="turnout.coordinate"
                        :active-route="
                            usedTurnouts.get(turnout.id) !== undefined
                        "
                        @click="setTurnout(turnout.id)"
                    />
                    <!-- @click="showAlert('clicked')" -->
                    <DestinationComponent
                        v-for="destination in destinations.values()"
                        :key="destination.id"
                        :state="
                            destinationStates.get(destination.id) ||
                            DestinationState.inactive
                        "
                        :coordinate="destination.coordinate"
                        @click="toggleDestination(destination)"
                    />
                </g>
            </svg>
        </div>
        <div
            class="absolute bottom-0 left-0 mb-2 ml-2 h-10 w-10 rounded-full border-2 border-borderColor-300 bg-primary-200 p-1 pl-2 focus:bg-accent-400"
            @click="router.push('/')"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                class="h-full w-full"
                viewBox="0 0 16 16"
            >
                <path
                    fill-rule="evenodd"
                    d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5zM10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5z"
                />
            </svg>
        </div>
    </div>
</template>
