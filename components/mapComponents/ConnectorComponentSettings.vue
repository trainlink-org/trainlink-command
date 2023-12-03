<!-- Connector component for the settings page -->
<script setup lang="ts">
// import { computed  } from 'vue';
import type { TurnoutLink } from '@trainlink-org/trainlink-types';
import {
    calculateCoord,
    calculateSize,
    calculateXCoord,
    calculateYCoord,
    type Coordinate,
} from './shared';

const props = defineProps({
    link: { type: Object as () => TurnoutLink, required: true },
    start: { type: Object as () => Coordinate, required: true },
    points: { type: Object as () => Coordinate[], required: true },
    end: { type: Object as () => Coordinate, required: true },
    activeRoute: { type: Boolean, required: true },
});
const turnoutStore = useTurnoutStore();
const startPoint = turnoutStore.getMapPoint(props.link.start)?.coordinate || {
    x: -5,
    y: -5,
};
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
