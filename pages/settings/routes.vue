<script setup lang="ts">
import { useSocketStore } from '@/stores/socket';
import { useTurnoutStore } from '@/stores/turnouts';
import {
    TurnoutState,
    type Destination,
    type Turnout,
} from '@trainlink-org/trainlink-types';
import panzoom, { type PanZoom } from 'panzoom';

const router = useRouter();
const socket = useSocketStore().socketRef;
const turnoutStore = useTurnoutStore();

const transactionID: Ref<number | null> = ref(null);

enum AddModalType {
    None = 'None',
    Destination = 'Destination',
    Turnout = 'Turnout',
}

let addModalData = reactive(defaultAddModalState());

function defaultAddModalState() {
    return {
        values: {
            name: 'Test',
            id: '20',
            xCoord: 90,
            yCoord: 80,
        },
        errors: {
            name: {
                visible: false,
                msg: '',
            },
            id: {
                visible: false,
                msg: '',
            },
            coord: {
                visible: false,
                msg: '',
            },
        },
        objectType: AddModalType.Turnout,
        open: false,
    };
}

function addMapPoint() {
    if (isNaN(Number(addModalData.values.id))) {
        addModalData.errors.id = {
            msg: "That ID isn't a number",
            visible: true,
        };
        return false;
    } else if (
        turnoutStore.getMapPoint(Number(addModalData.values.id), true) !==
        undefined
    ) {
        addModalData.errors.id = {
            msg: 'That ID is already used',
            visible: true,
        };
        return false;
    } else {
        if (transactionID.value == null)
            transactionID.value = turnoutStore.startTransaction();
        if (addModalData.objectType === AddModalType.Turnout) {
            const newTurnout: Turnout = {
                id: Number(addModalData.values.id),
                name: addModalData.values.name,
                coordinate: {
                    x: addModalData.values.xCoord,
                    y: addModalData.values.yCoord,
                },
                state: TurnoutState.closed,
                primaryDirection: -1,
                secondaryDirection: -1,
                usedInRoute: false,
            };
            turnoutStore.addTurnout(transactionID.value, newTurnout);
        } else {
            const newDestination: Destination = {
                id: Number(addModalData.values.id),
                name: addModalData.values.name,
                description: '',
                coordinate: {
                    x: addModalData.values.xCoord,
                    y: addModalData.values.yCoord,
                },
                usedInRoute: false,
            };
            turnoutStore.addDestination(transactionID.value, newDestination);
        }
    }
    addModalData.open = false;
    addModalData = reactive(defaultAddModalState());
    return true;
}

/** Stores a list of the id's of currently selected elements */
const selectedElements = reactive({
    mapPoints: new Array<number>(),
    links: new Array<number>(),
});

function select(id: number, shift: boolean, isMapPoint: boolean) {
    console.log('select ');
    let selectedArray = [];
    if (isMapPoint) {
        selectedArray = selectedElements.mapPoints;
    } else {
        selectedArray = selectedElements.links;
    }
    if (selectedArray.length === 0 && !shift) {
        selectedArray.push(id);
    } else if (
        selectedArray.length === 1 &&
        selectedArray.includes(id) &&
        !shift
    ) {
        selectedArray.pop();
    } else if (shift && selectedArray.includes(id)) {
        selectedArray.splice(selectedArray.indexOf(id), 1);
    } else if (shift) {
        selectedArray.push(id);
    }
}

function deleteElements() {
    selectedElements.mapPoints.forEach((mapPointID) => {
        if (!transactionID.value)
            transactionID.value = turnoutStore.startTransaction();
        if (turnoutStore.getDestination(mapPointID, true)) {
            turnoutStore.deleteDestination(transactionID.value, mapPointID);
        } else {
            turnoutStore.deleteTurnout(transactionID.value, mapPointID);
        }
    });
    selectedElements.mapPoints = [];
}

// Panzoom code --------------------------------
const homePosition = computed(() => {
    if (svgRef.value)
        return {
            x: svgRef.value.clientWidth / 100,
            y: svgRef.value.clientHeight / 100,
            zoom: Math.min(
                svgRef.value.clientWidth / 100,
                svgRef.value.clientHeight / 100,
            ),
        };
    else return { x: 0, y: 0, zoom: 1 };
});

const svgRef: Ref<SVGElement | null> = ref(null);
const panZoomRef: Ref<SVGElement | null> = ref(null);
const panzoomInstance: Ref<PanZoom | null> = ref(null);
onMounted(() => {
    if (panZoomRef.value !== null) {
        console.log(homePosition.value?.x);
        panzoomInstance.value = panzoom(panZoomRef.value, {
            beforeWheel: function (e) {
                return !e.ctrlKey;
            },
            zoomDoubleClickSpeed: 1,
            onDoubleClick: function (e) {
                return false;
            },
        });
        panzoomInstance.value.zoomAbs(0, 0, homePosition.value.zoom);
        panzoomInstance.value.moveTo(0, 0);
    }
});

function homePanZoom() {
    console.log(panzoomInstance.value?.getTransform());
    if (panzoomInstance.value) {
        panzoomInstance.value.zoomAbs(0, 0, homePosition.value.zoom);
        panzoomInstance.value.moveTo(0, 0);
    }
    console.log(panzoomInstance.value?.getTransform());
}
// ---------------------------------------------
</script>

<template>
    <div class="relative w-full h-full">
        <div class="w-full h-full overflow-y-scroll relative">
            <svg
                id="mapSvg"
                class="h-full w-full z-0"
                ref="svgRef"
                viewBox="0 0 100 100"
            >
                <g ref="panZoomRef">
                    <!-- viewBox="-1000 -1000 2000 2000" -->
                    <!-- viewBox="-100 -100 200 200" -->
                    <ConnectorComponent
                        v-for="link in turnoutStore.allTurnoutLinks"
                        :key="link.id"
                        :link="link"
                        :settings="true"
                    />
                    <TurnoutComponent
                        v-for="turnout in turnoutStore.allTurnoutsInclTransactions"
                        :key="turnout.id"
                        :turnout="turnout"
                        @dblclick.stop="console.log('Doubleclick!')"
                        @click.exact="select(turnout.id, false, true)"
                        @click.shift="select(turnout.id, true, true)"
                        :class="
                            selectedElements.mapPoints.includes(turnout.id)
                                ? 'fill-blue-600'
                                : 'fill-black'
                        "
                    />
                    <DestinationComponent
                        v-for="destination in turnoutStore.allDestinationsInclTransactions"
                        :key="destination.id"
                        :destination="destination"
                        :selected="false"
                        @dblclick.stop="console.log('Doubleclick!')"
                        @click.exact="select(destination.id, false, true)"
                        @click.shift="select(destination.id, true, true)"
                        :class="
                            selectedElements.mapPoints.includes(destination.id)
                                ? 'fill-blue-600'
                                : 'fill-black'
                        "
                    />
                    <!-- <circle r="10" cx="0" cy="0" /> -->
                </g>
            </svg>
        </div>
        <div
            class="absolute bottom-0 z-10 h-8 w-full bg-white border-t-2 border-primary-300 py-1 flex items-center justify-around"
        >
            <!-- Back Icon -->
            <button
                class="group flex h-7 w-2/12 items-center rounded-full hover:bg-accent-200 active:bg-accent-400 md:hidden"
                @click="router.push('/settings')"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="h-8 w-full group-hover:fill-accent-400"
                    viewBox="0 0 16 16"
                >
                    <path
                        fill-rule="evenodd"
                        d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
                    />
                </svg>
            </button>
            <!-- Add Icon -->
            <button
                class="group flex h-7 w-1/5 items-center rounded-full leading-none hover:bg-primary-200 active:bg-green-400 md:w-1/6"
                @click="addModalData.open = !addModalData.open"
            >
                <!-- Boostrap icons: plus -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    class="h-7 group-hover:fill-green-400"
                >
                    <path
                        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
                    />
                </svg>
                Add Items
            </button>
            <!-- Edit Icon -->
            <button
                class="group flex h-7 w-1/5 items-center rounded-full leading-none hover:bg-primary-200 active:bg-green-400 md:w-1/6"
                :class="true ? 'bg-inherit' : 'bg-accent-400'"
            >
                <!-- Bootstrap icons: pencil-square -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="-4 -4 20 20"
                    class="h-7 group-hover:fill-green-400"
                >
                    <path
                        d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
                    />
                    <path
                        fill-rule="evenodd"
                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                    />
                </svg>
                Edit lines
            </button>
            <!-- Delete Icon -->
            <button
                class="group flex h-7 w-1/5 items-center rounded-full leading-none enabled:hover:bg-primary-200 enabled:active:bg-red-400 md:w-1/6"
                :class="
                    selectedElements.mapPoints.length ||
                    selectedElements.links.length
                        ? 'fill-black text-black'
                        : 'fill-primary-500 text-primary-500 disable'
                "
                :disabled="
                    !(
                        selectedElements.mapPoints.length ||
                        selectedElements.links.length
                    )
                "
                @click="deleteElements()"
            >
                <!-- Bootstrap icons: trash-fill -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="h-5 enabled:group-hover:fill-red-500"
                    viewBox="0 0 16 16"
                    :disabled="
                        !(
                            selectedElements.mapPoints.length ||
                            selectedElements.links.length
                        )
                    "
                >
                    <path
                        d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"
                    />
                </svg>
                Delete Items
            </button>
            <button
                class="group flex h-7 w-1/5 items-center rounded-full leading-none hover:bg-primary-200 active:bg-red-400 md:w-1/6"
                :class="transactionID != null ? 'visible' : 'hidden'"
                @click="
                    {
                        turnoutStore.applyTransaction(transactionID || -1);
                        transactionID = null;
                        selectedElements.links = [];
                        selectedElements.mapPoints = [];
                    }
                "
            >
                Save changes
            </button>
            <button
                class="group flex h-7 w-1/5 items-center rounded-full leading-none hover:bg-primary-200 active:bg-red-400 md:w-1/6"
                :class="transactionID != null ? 'visible' : 'hidden'"
                @click="
                    {
                        turnoutStore.revertTransaction(transactionID || -1);
                        transactionID = null;
                        selectedElements.links = [];
                        selectedElements.mapPoints = [];
                    }
                "
            >
                Discard changes
            </button>
        </div>
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
    <ModalComponent
        v-if="addModalData.open"
        title="Add Item"
        submit-text="Add"
        @submit="addMapPoint"
        @cancel="addModalData.open = false"
    >
        <div class="flex h-20 w-full justify-around overflow-y-scroll">
            <div
                class="flex h-full w-1/3 flex-col border border-black"
                :class="
                    addModalData.objectType === AddModalType.Destination
                        ? 'bg-accent-400'
                        : 'bg-inherit'
                "
                @click="addModalData.objectType = AddModalType.Destination"
            >
                <svg class="h-full w-full" viewBox="0 0 10 10">
                    <rect width="5" height="5" x="2.5" y="2.5" />
                </svg>
                Destination
            </div>
            <div
                class="flex h-full w-1/3 flex-col border border-black"
                :class="
                    addModalData.objectType === AddModalType.Turnout
                        ? 'bg-accent-400'
                        : 'bg-inherit'
                "
                @click="addModalData.objectType = AddModalType.Turnout"
            >
                <svg class="h-full w-full" viewBox="0 0 10 10">
                    <circle r="2.5" cx="5" cy="5" />
                </svg>
                Turnout
            </div>
        </div>

        <div
            class="grid h-full w-full grid-flow-row grid-cols-2 grid-rows-4 gap-y-1 pt-5 sm:grid-cols-3 sm:grid-rows-2"
        >
            <p class="col-span-2 sm:col-span-1">Name:</p>
            <div class="col-span-2">
                <input
                    v-model="addModalData.values.name"
                    type="text"
                    class="w-full rounded border-2 border-primary-400 invalid:border-red-600"
                />
                <p
                    class="text-red-600"
                    :class="
                        addModalData.errors.name.visible
                            ? 'visible'
                            : 'invisible'
                    "
                >
                    {{ addModalData.errors.name.msg }}
                </p>
            </div>
            <p class="col-span-2 sm:col-span-1">Address:</p>
            <div class="col-span-2">
                <input
                    v-model="addModalData.values.id"
                    type="text"
                    class="w-full rounded border-2 border-primary-400 invalid:border-red-600"
                />
                <p
                    class="text-red-600"
                    :class="
                        addModalData.errors.id.visible ? 'visible' : 'invisible'
                    "
                >
                    {{ addModalData.errors.id.msg }}
                </p>
            </div>
            <p class="col-span-2 sm:col-span-1">Coordinate (x, y):</p>
            <div class="col-span-2">
                <input
                    v-model="addModalData.values.xCoord"
                    type="number"
                    class="rounded border-2 border-primary-400 invalid:border-red-600 w-1/3 m-1"
                />
                <input
                    v-model="addModalData.values.yCoord"
                    type="number"
                    class="w-1/3 rounded border-2 border-primary-400 invalid:border-red-600"
                />
                <p
                    class="text-red-600"
                    :class="
                        addModalData.errors.coord.visible
                            ? 'visible'
                            : 'invisible'
                    "
                >
                    {{ addModalData.errors.coord.msg }}
                </p>
            </div>
        </div>
    </ModalComponent>
</template>
