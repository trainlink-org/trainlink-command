<script setup lang="ts">
import { TurnoutState, type Destination } from '@trainlink-org/trainlink-types';

import { useSocketStore } from '@/stores/socket';
import { useTurnoutStore } from '@/stores/turnouts';

import { isTouchScreen } from '../components/mapComponents/shared';

const router = useRouter();
const socket = useSocketStore().socketRef;
const turnoutStore = useTurnoutStore();

onMounted(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
        isTouchScreen.value = true;
        console.log('Touchscreen');
    }
});

function setTurnout(id: number) {
    const turnout = turnoutStore.getTurnout(id);
    if (turnout) {
        if (turnout.state === TurnoutState.thrown)
            turnout.state = TurnoutState.closed;
        else turnout.state = TurnoutState.thrown;
        socket.emit('routes/setTurnout', turnout.id, turnout.state);
    }
}

const selectedDestinations: Ref<Destination[]> = ref([]);

function toggleDestination(destination: Destination) {
    if (!selectedDestinations.value.includes(destination)) {
        selectedDestinations.value.push(destination);
        if (selectedDestinations.value.length === 2) {
            socket.emit(
                'routes/setRoute',
                selectedDestinations.value[0].id,
                selectedDestinations.value[1].id,
            );
            selectedDestinations.value = [];
        } else {
        }
    } else {
        selectedDestinations.value = [];
    }
}
import panzoom, { type PanZoom } from 'panzoom';

const svgRef: Ref<SVGElement | null> = ref(null);
const panzoomInstance: Ref<PanZoom | null> = ref(null);
onMounted(() => {
    if (svgRef.value !== null) {
        panzoomInstance.value = panzoom(svgRef.value, {
            beforeWheel: function (e) {
                return !e.ctrlKey;
            },
            zoomDoubleClickSpeed: 1,
            onDoubleClick: function (e) {
                return false;
            },
        });
    }
});

function homePanZoom() {
    console.log(panzoomInstance.value?.getTransform());
    if (panzoomInstance.value) {
        panzoomInstance.value.moveTo(0, 0);
        panzoomInstance.value.zoomAbs(0, 0, 1);
    }
}
</script>

<template>
    <div class="flex h-full w-full items-center justify-evenly pt-10">
        <div
            class="h-5/6 w-11/12 overflow-y-scroll rounded-lg border-4 border-borderColor-300"
        >
            <svg
                id="mapSvg"
                class="h-full w-full"
                viewBox="0 0 100 100"
                ref="svgRef"
            >
                <ConnectorComponent
                    v-for="link in turnoutStore.allTurnoutLinks"
                    :key="link.id"
                    :link="link"
                />
                <TurnoutComponent
                    v-for="turnout in turnoutStore.allTurnouts"
                    :key="turnout.id"
                    :turnout="turnout"
                    @click="setTurnout(turnout.id)"
                />
                <DestinationComponent
                    v-for="destination in turnoutStore.allDestinations"
                    :key="destination.id"
                    :destination="destination"
                    :selected="selectedDestinations.includes(destination)"
                    @click="toggleDestination(destination)"
                />
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
        <div
            class="absolute bottom-0 right-0 mb-2 mr-2 h-10 w-10 rounded-full border-2 border-borderColor-300 bg-primary-200 p-1 pl-2 focus:bg-accent-400"
            @click="homePanZoom()"
        >
            <!-- Bootstrap icon: house-fill -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="h-full w-full"
                viewBox="0 0 18 18"
            >
                <path
                    d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"
                />
                <path
                    d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z"
                />
            </svg>
        </div>
    </div>
</template>
