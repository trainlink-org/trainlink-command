<!-- The page for editing the routes map in settings -->
<script setup lang="ts">
// import { ref, onMounted, onUnmounted, computed, reactive, type Ref } from 'vue';
import {
    isTouchScreen,
    svgWidth,
    svgHeight,
    DestinationState,
} from '@/components/mapComponents/shared';

// import TurnoutComponent from '@/components/mapComponents/TurnoutComponent.vue';
// import ConnectorComponentSettings from '@/components/mapComponents/ConnectorComponentSettings.vue';
// import DestinationComponent from '@/components/mapComponents/DestinationComponent.vue';

import { turnoutLinks, turnouts, destinations } from '@/utils/main';

import {
    TurnoutState,
    type Coordinate,
    type Destination,
    type Turnout,
} from '@trainlink-org/trainlink-types';
// import ConnectorHandleComponent from '../mapComponents/ConnectorHandleComponent.vue';
// import { useRouter } from 'vue-router';
// import ModalComponent from '../ModalComponent.vue';
// import { socket } from '@/utils/socketHelper';
import { useSocketStore } from '@/stores/socket';
import { useTurnoutStore } from '@/stores/turnouts';
const socket = useSocketStore().socketRef;
const turnoutStore = useTurnoutStore();

const changesMade = ref(false);

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

const viewBox = computed(() => {
    return `0 0 ${svgWidth.value} ${svgHeight.value}`;
});

const points = computed(() => {
    const points: { coord: Coordinate; id: number }[] = [];
    let nextId = 1;
    Array.from(turnoutLinks.values()).forEach((turnoutLink) => {
        for (let i = 0; i < turnoutLink.points.length; i++) {
            const point = { coord: turnoutLink.points[i], id: nextId };
            points.push(point);
            nextId++;
        }
    });
    console.log(
        points
            .map((point) => `{x: ${point.coord.x}, y: ${point.coord.y}}`)
            .join(','),
    );
    return points;
});

const beingMoved: Ref<number | null> = ref(null);

function drag(
    id: number,
    { offsetX, offsetY }: { offsetX: number; offsetY: number },
) {
    console.log('Drag');
    const offset = offsets.get(id) || { x: 3, y: 3 };
    dragOffset.x = offsetX - offset.x;
    dragOffset.y = offsetY - offset.y;
    beingMoved.value = id;
    box.value?.addEventListener('mousemove', move);
    box.value?.addEventListener('mouseleave', pause);
    box.value?.addEventListener('mouseenter', resume);
}

function drop() {
    dragOffset.x = dragOffset.y = 0;
    console.log('Drop');
    box.value?.removeEventListener('mousemove', move);
    box.value?.removeEventListener('mouseleave', pause);
    box.value?.removeEventListener('mouseenter', resume);
    beingMoved.value = null;
}

function pause() {
    box.value?.removeEventListener('mousemove', move);
}

function resume() {
    box.value?.addEventListener('mousemove', move);
}

function move({ offsetX, offsetY }: { offsetX: number; offsetY: number }) {
    changesMade.value = true;
    console.log('move');
    if (beingMoved.value !== null) {
        const offset = offsets.get(beingMoved.value) || { x: 3, y: 3 };
        offset.x = offsetX - dragOffset.x;
        offset.y = offsetY - dragOffset.y;
        if (beingMoved.value > 0) {
            const turnout = turnoutStore.getTurnout(beingMoved.value);
            if (turnout) {
                turnout.connections.forEach((linkId) => {
                    const link = turnoutLinks.get(linkId);
                    if (link) {
                        if (link.end === beingMoved.value) {
                            const offset = linkEndOffsets.get(link.id) || {
                                x: 3,
                                y: 3,
                            };
                            offset.x = offsetX - dragOffset.x;
                            offset.y = offsetY - dragOffset.y;
                        } else {
                            const offset = linkStartOffsets.get(link.id) || {
                                x: 3,
                                y: 3,
                            };
                            offset.x = offsetX - dragOffset.x;
                            offset.y = offsetY - dragOffset.y;
                        }
                    }
                });
            }
        } else {
            const destination = destinations.get(beingMoved.value);
            if (destination) {
                destination.connections.forEach((linkId) => {
                    const link = turnoutLinks.get(linkId);
                    if (link) {
                        if (link.end === beingMoved.value) {
                            const offset = linkEndOffsets.get(link.id) || {
                                x: 3,
                                y: 3,
                            };
                            offset.x = offsetX - dragOffset.x;
                            offset.y = offsetY - dragOffset.y;
                        } else {
                            const offset = linkStartOffsets.get(link.id) || {
                                x: 3,
                                y: 3,
                            };
                            offset.x = offsetX - dragOffset.x;
                            offset.y = offsetY - dragOffset.y;
                        }
                    }
                });
            }
        }
    }
}

function dragPoint(
    id: number,
    { offsetX, offsetY }: { offsetX: number; offsetY: number },
) {
    console.log('Drag');
    const offset = pointOffsets.get(id) || { x: 3, y: 3 };
    dragOffset.x = offsetX - offset.x;
    dragOffset.y = offsetY - offset.y;
    beingMoved.value = id;
    box.value?.addEventListener('mousemove', movePoint);
    box.value?.addEventListener('mouseleave', pausePoint);
    box.value?.addEventListener('mouseenter', resumePoint);
}

function dropPoint() {
    dragOffset.x = dragOffset.y = 0;
    console.log('Drop');
    box.value?.removeEventListener('mousemove', movePoint);
    box.value?.removeEventListener('mouseleave', pausePoint);
    box.value?.removeEventListener('mouseenter', resumePoint);
    beingMoved.value = null;
}

function pausePoint() {
    box.value?.removeEventListener('mousemove', movePoint);
}

function resumePoint() {
    box.value?.addEventListener('mousemove', movePoint);
}

function movePoint({ offsetX, offsetY }: { offsetX: number; offsetY: number }) {
    changesMade.value = true;
    console.log('move');
    if (beingMoved.value !== null) {
        const offset = pointOffsets.get(beingMoved.value) || { x: 3, y: 3 };
        offset.x = offsetX - dragOffset.x;
        offset.y = offsetY - dragOffset.y;
    }
}

const offsets = reactive(new Map<number, Coordinate>());

const linkStartOffsets = reactive(new Map<number, Coordinate>());
const linkEndOffsets = reactive(new Map<number, Coordinate>());

turnoutStore.allTurnouts.forEach((element) => {
    offsets.set(element.id, { x: 3, y: 3 });
});
turnoutStore.allDestinations.forEach((element) => {
    offsets.set(element.id, { x: 3, y: 3 });
});

turnoutStore.allTurnoutLinks.forEach((element) => {
    linkStartOffsets.set(element.id, { x: 3, y: 3 });
    linkEndOffsets.set(element.id, { x: 3, y: 3 });
});

const pointOffsets = reactive(new Map<number, Coordinate>());
const pointIdLookup = reactive(new Map<Coordinate, number>());

points.value.forEach((element) => {
    pointOffsets.set(element.id, { x: 3, y: 3 });
    pointIdLookup.set(element.coord, element.id);
});

const box = ref<HTMLInputElement | null>(null);

onMounted(() => {
    box.value?.focus();
});

const dragOffset = reactive({
    x: 0,
    y: 0,
});

function calculateXCoordInverse(coord: number): number {
    return ((coord - 3) / (svgWidth.value - 6)) * 100;
}
function calculateYCoordInverse(coord: number): number {
    return ((coord - 3) / (svgHeight.value - 6)) * 100;
}

function calculateCoordInverse(coord: Coordinate): Coordinate {
    return {
        x: calculateXCoordInverse(coord.x),
        y: calculateYCoordInverse(coord.y),
    };
}

function addCoords(coord1: Coordinate, coord2: Coordinate) {
    return { x: coord1.x + coord2.x, y: coord1.y + coord2.y };
}

function applyPointOffsets(points: Coordinate[]): Coordinate[] {
    if (points.length > 0) {
        const newPoints: Coordinate[] = [];
        points.forEach((point) => {
            const id = pointIdLookup.get(point) || 0;
            newPoints.push(
                addCoords(
                    point,
                    calculateCoordInverse(
                        pointOffsets.get(id) || { x: 0, y: 0 },
                    ),
                ),
            );
        });
        return newPoints;
    } else return [];
}

enum AddModalType {
    None = 'None',
    Destination = 'Destination',
    Point = 'Point',
}

const addModalSelected = ref(AddModalType.None);
const addModalOpen = ref(false);

const addError = reactive({
    nameMsg: '',
    name: false,
    id: false,
    idMsg: '',
});

const newDestinations: number[] = reactive([]);
const newTurnouts: number[] = reactive([]);

const addModalValues = reactive({
    name: '',
    id: 0,
});

function addToMap() {
    if (addModalValues.id <= 0) {
        addError.id = true;
        addError.idMsg = 'ID must be greater than 0';
    }

    addModalOpen.value = false;
    if (addModalSelected.value === AddModalType.Destination) {
        newDestinations.push(addModalValues.id);
        const newDestination: Destination = {
            id: 1 - addModalValues.id,
            name: addModalValues.name,
            description: '',
            coordinate: { x: 0, y: 0 },
            connections: [],
        };
        destinations.set(newDestination.id, newDestination);
        offsets.set(newDestination.id, { x: 0, y: 0 });
        drag(newDestination.id, { offsetX: 0, offsetY: 0 });
    } else {
        newTurnouts.push(addModalValues.id);
        const newTurnout: Turnout = {
            id: addModalValues.id,
            name: addModalValues.name,
            coordinate: { x: 0, y: 0 },
            connections: [],
            state: TurnoutState.closed,
            primaryDirection: 0,
            secondaryDirection: 0,
        };
        turnouts.set(newTurnout.id, newTurnout);
        offsets.set(newTurnout.id, { x: 0, y: 0 });
        drag(newTurnout.id, { offsetX: 0, offsetY: 0 });
    }
}

const lineEditMode = ref(false);

const newLineStart: Ref<number | undefined> = ref();

function createLine(ID: number) {
    if (newLineStart.value !== undefined && newLineStart.value !== ID) {
        const keys = Array.from(turnoutLinks.keys()).sort(
            (a: number, b: number) => {
                return a > b ? a : b;
            },
        );
        const nextID = keys[0] + 1;
        console.log(keys);
        console.log(nextID);
        turnoutLinks.set(nextID, {
            id: nextID,
            length: 0,
            points: [],
            startActive: false,
            endActive: false,
            start: newLineStart.value,
            end: ID,
        });
        linkStartOffsets.set(nextID, { x: 3, y: 3 });
        linkEndOffsets.set(nextID, { x: 3, y: 3 });
        turnoutStore.getTurnout(ID)?.connections.push(nextID);
        turnoutStore.getTurnout(newLineStart.value)?.connections.push(nextID);
        newLineStart.value = undefined;
    } else if (newLineStart.value === ID) {
        newLineStart.value = undefined;
    } else {
        newLineStart.value = ID;
    }
}

const deleteMode = ref(false);

function saveChanges() {
    offsets.forEach((value, id) => {
        if (value.x !== 3 || value.y !== 3) {
            let coord;
            if (id > 0) {
                coord = turnoutStore.getTurnout(id)?.coordinate || {
                    x: 0,
                    y: 0,
                };
            } else {
                coord = turnoutStore.getDestination(id)?.coordinate || {
                    x: 0,
                    y: 0,
                };
            }
            socket.emit(
                'config/routes/changeObjectCoordinate',
                id,
                addCoords(coord, calculateCoordInverse(value)),
            );
        }
    });
    changesMade.value = false;
}

function discardChanges() {
    offsets.forEach((value) => {
        value.x = 3;
        value.y = 3;
    });
    linkStartOffsets.forEach((value) => {
        value.x = 3;
        value.y = 3;
    });
    linkEndOffsets.forEach((value) => {
        value.x = 3;
        value.y = 3;
    });
    pointOffsets.forEach((value) => {
        value.x = 3;
        value.y = 3;
    });
    changesMade.value = false;
}
</script>

<template>
    <div class="flex h-full w-full flex-col">
        <svg id="mapSvg" ref="box" class="h-full w-full" :viewBox="viewBox">
            <!-- From saved map -->
            <ConnectorComponentSettings
                v-for="link in turnoutLinks.values()"
                :key="link.id"
                :start="
                    addCoords(
                        turnoutStore.getTurnout(link.start)?.coordinate ||
                            turnoutStore.getDestination(link.start)
                                ?.coordinate || {
                                x: -5,
                                y: -5,
                            },
                        calculateCoordInverse(
                            linkStartOffsets.get(link.id) || { x: 0, y: 0 },
                        ),
                    )
                "
                :points="applyPointOffsets(link.points)"
                :end="
                    addCoords(
                        turnoutStore.getTurnout(link.end)?.coordinate || {
                            x: -5,
                            y: -5,
                        },
                        calculateCoordInverse(
                            linkEndOffsets.get(link.id) || { x: 0, y: 0 },
                        ),
                    )
                "
                :active-route="false"
            />
            <TurnoutComponent
                v-for="turnout in turnoutStore.allTurnouts"
                :key="turnout.id"
                :coordinate="{
                    x:
                        turnout.coordinate.x +
                        calculateXCoordInverse(offsets.get(turnout.id)?.x || 0),
                    y:
                        turnout.coordinate.y +
                        calculateYCoordInverse(offsets.get(turnout.id)?.y || 0),
                }"
                :active-route="false"
                :title="turnout.name"
                :class="
                    !lineEditMode
                        ? beingMoved === turnout.id
                            ? 'cursor-grabbing'
                            : 'cursor-grab'
                        : newLineStart === turnout.id
                          ? 'fill-red-500'
                          : 'fill-black'
                "
                @mousedown="
                    (event: MouseEvent) =>
                        lineEditMode
                            ? createLine(turnout.id)
                            : drag(turnout.id, event)
                "
                @mouseup="
                    (event: MouseEvent) => {
                        if (!lineEditMode) drop();
                    }
                "
            />
            <DestinationComponent
                v-for="destination in destinations.values()"
                :key="destination.id"
                :state="DestinationState.inactive"
                :title="destination.name"
                :coordinate="
                    addCoords(
                        destination.coordinate,
                        calculateCoordInverse(
                            offsets.get(destination.id) || { x: 0, y: 0 },
                        ),
                    )
                "
                :class="
                    beingMoved === destination.id
                        ? 'cursor-grabbing'
                        : 'cursor-grab'
                "
                @mousedown="(event: MouseEvent) => drag(destination.id, event)"
                @mouseup="drop"
            />
            <ConnectorHandleComponent
                v-for="point in points"
                :key="point.id"
                :point="
                    addCoords(
                        point.coord,
                        calculateCoordInverse(
                            pointOffsets.get(point.id) || { x: 0, y: 0 },
                        ),
                    )
                "
                @mousedown="(event: MouseEvent) => dragPoint(point.id, event)"
                @mouseup="dropPoint"
            />
        </svg>
        <div
            class="relative flex w-full items-center justify-around border-t-2 border-primary-300 py-1"
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
                @click="addModalOpen = true"
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
                :class="!lineEditMode ? 'bg-inherit' : 'bg-accent-400'"
                @click="lineEditMode = !lineEditMode"
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
                class="group flex h-7 w-1/5 items-center rounded-full leading-none hover:bg-primary-200 active:bg-red-400 md:w-1/6"
                :class="deleteMode ? 'bg-red-400' : 'bg-inherit'"
                @click="deleteMode = !deleteMode"
            >
                <!-- Bootstrap icons: trash-fill -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="h-5 group-hover:fill-red-500"
                    viewBox="0 0 16 16"
                >
                    <path
                        d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"
                    />
                </svg>
                Delete Items
            </button>

            <button
                class="group flex h-7 w-1/5 items-center rounded-full leading-none hover:bg-primary-200 active:bg-red-400 md:w-1/6"
                :class="changesMade ? 'visible' : 'hidden'"
                @click="saveChanges"
            >
                Save changes
            </button>
            <button
                class="group flex h-7 w-1/5 items-center rounded-full leading-none hover:bg-primary-200 active:bg-red-400 md:w-1/6"
                :class="changesMade ? 'visible' : 'hidden'"
                @click="discardChanges"
            >
                Discard changes
            </button>

            <div class="absolute bottom-5 flex h-10" />
        </div>
    </div>

    <ModalComponent
        v-if="addModalOpen"
        title="Add Item"
        submit-text="Add"
        @submit="addToMap"
        @cancel="addModalOpen = false"
    >
        <div class="flex h-20 w-full justify-around">
            <div
                class="flex h-full w-1/3 flex-col border border-black"
                :class="
                    addModalSelected === AddModalType.Destination
                        ? 'bg-accent-400'
                        : 'bg-inherit'
                "
                @click="addModalSelected = AddModalType.Destination"
            >
                <svg class="h-full w-fit" viewBox="0 0 10 10">
                    <rect width="5" height="5" x="2.5" y="2.5" />
                </svg>
                Destination
            </div>
            <div
                class="flex h-full w-1/3 flex-col border border-black"
                :class="
                    addModalSelected === AddModalType.Point
                        ? 'bg-accent-400'
                        : 'bg-inherit'
                "
                @click="addModalSelected = AddModalType.Point"
            >
                <svg class="h-full w-fit" viewBox="0 0 10 10">
                    <circle r="2.5" cx="5" cy="5" />
                </svg>
                Point
            </div>
        </div>

        <div
            class="grid h-full w-full grid-flow-row grid-cols-2 grid-rows-4 gap-y-1 pt-5 sm:grid-cols-3 sm:grid-rows-2"
        >
            <p class="col-span-2 sm:col-span-1">Name:</p>
            <div class="col-span-2">
                <input
                    v-model="addModalValues.name"
                    type="text"
                    class="w-full rounded border-2 border-primary-400 invalid:border-red-600"
                />
                <p
                    class="text-red-600"
                    :class="addError.name ? 'visible' : 'invisible'"
                >
                    {{ addError.nameMsg }}
                </p>
            </div>
            <p class="col-span-2 sm:col-span-1">Address:</p>
            <div class="col-span-2">
                <input
                    v-model="addModalValues.id"
                    type="text"
                    class="w-full rounded border-2 border-primary-400 invalid:border-red-600"
                />
                <p
                    class="text-red-600"
                    :class="addError.id ? 'visible' : 'invisible'"
                >
                    {{ addError.idMsg }}
                </p>
            </div>
        </div>
    </ModalComponent>
</template>
