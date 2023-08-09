<!-- Used to display a destination on the Routes map -->
<script setup lang="ts">
// import { computed } from 'vue';
import {
    calculateSize,
    calculateCoord,
    type Coordinate,
    DestinationState,
} from './shared';

const props = defineProps({
    coordinate: { type: Object as () => Coordinate, required: true },
    // state: { type: String as () => DestinationState, required: true },
    active: { type: Boolean, required: true },
    selected: { type: Boolean, required: true },
});
const xCoord = computed(() => {
    return props.coordinate.x;
});
const yCoord = computed(() => {
    return props.coordinate.y;
});
</script>

<template>
    <rect
        class="hover:fill-primary-400"
        :class="
            props.active
                ? 'fill-blue-600'
                : props.selected
                ? 'fill-red-600'
                : 'fill-black'
        "
        :x="xCoord - 1"
        :y="yCoord - 1"
        :width="2"
        :height="2"
    />
    <!-- :class="
            props.state === DestinationState.selected
                ? 'fill-red-600'
                : props.state === DestinationState.active
                ? 'fill-blue-600'
                : 'fill-black'
        " -->
    <!-- :x="xCoord - calculateSize(2) / 2"
        :y="yCoord - calculateSize(2) / 2"
        :width="calculateSize(2)"
        :height="calculateSize(2)" -->
</template>
