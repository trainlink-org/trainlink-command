<!-- Connector component for the settings page -->
<script setup lang="ts">
// import { computed  } from 'vue';
import {
    calculateCoord,
    calculateSize,
    calculateXCoord,
    calculateYCoord,
    type Coordinate,
} from './shared';

const props = defineProps({
    start: { type: Object as () => Coordinate, required: true },
    points: { type: Object as () => Coordinate[], required: true },
    end: { type: Object as () => Coordinate, required: true },
    activeRoute: { type: Boolean, required: true },
});
const path = computed(() => {
    let path = `M ${calculateXCoord(props.start.x)} ${calculateYCoord(
        props.start.y,
    )}`;

    Array.from(props.points).forEach((point) => {
        const virtualPoint = calculateCoord(point);
        path = `${path} L ${virtualPoint.x} ${virtualPoint.y}`;
    });
    path = `${path} L ${calculateXCoord(props.end.x)} ${calculateYCoord(
        props.end.y,
    )}`;
    return path;
});
</script>

<template>
    <path
        :d="path"
        :stroke-width="`${calculateSize(0.5)}`"
        class="fill-transparent"
        :class="props.activeRoute ? 'stroke-blue-600' : 'stroke-black'"
    />
</template>
