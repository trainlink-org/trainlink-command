<!-- Used to display a turnout on the Routes map -->
<script setup lang="ts">
// import { computed } from 'vue';
import { calculateSize, calculateCoord, type Coordinate } from './shared';

const props = defineProps({
    coordinate: {type: Object as () => Coordinate, required: true},
    activeRoute: {type: Boolean, required: true},
});
const xCoord = computed(() => {
    return calculateCoord(props.coordinate).x;
});
const yCoord = computed(() => {
    return calculateCoord(props.coordinate).y;
});
</script>

<template>
    <circle
        class="hover:fill-primary-400 active:fill-red-600"
        :class="props.activeRoute ? 'fill-blue-700' : ''"
        :cx="xCoord"
        :cy="yCoord"
        :r="calculateSize(1.5)"
    />
</template>