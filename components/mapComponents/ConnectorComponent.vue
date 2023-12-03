<!-- Connector component for the Routes page -->
<script setup lang="ts">
import type { TurnoutLink } from '@trainlink-org/trainlink-types';
import { type Coordinate, calculateMidPoints } from './shared';

const props = defineProps({
    link: { type: Object as () => TurnoutLink, required: true },
    settings: { type: Boolean, required: false, default: false },
});

const turnoutStore = useTurnoutStore();
const startCoord = turnoutStore.getMapPoint(props.link.start)?.coordinate || {
    x: -5,
    y: -5,
};
const endCoord = turnoutStore.getMapPoint(props.link.end)?.coordinate || {
    x: -5,
    y: -5,
};

const midPoints = calculateMidPoints(startCoord, props.link.points, endCoord);
const path = computed(() => {
    let path = `M ${midPoints.startMid.x} ${midPoints.startMid.y}`;

    Array.from(props.link.points).forEach((point) => {
        const virtualPoint = point;
        path = `${path} L ${virtualPoint.x} ${virtualPoint.y}`;
    });

    path = `${path} L ${midPoints.endMid.x} ${midPoints.endMid.y}`;
    return path;
});
const startPath = `M ${startCoord.x} ${startCoord.y} L ${midPoints.startMid.x} ${midPoints.startMid.y}`;
const endPath = `M ${endCoord.x} ${endCoord.y} L ${midPoints.endMid.x} ${midPoints.endMid.y}`;
</script>

<template>
    <path
        :d="startPath"
        class="fill-transparent"
        :stroke-width="`${props.link.startActive ? 1 : 0.5}`"
        :class="
            props.link.startActive
                ? 'stroke-green-600'
                : props.link.usedInRoute && !props.settings
                  ? 'stroke-blue-600'
                  : 'stroke-black'
        "
    />
    <path
        v-if="midPoints.startMid !== midPoints.endMid"
        :d="path"
        :stroke-width="`${0.5}`"
        class="fill-transparent"
        :class="
            props.link.usedInRoute && !props.settings
                ? 'stroke-blue-600'
                : 'stroke-black'
        "
    />
    <path
        :d="endPath"
        class="fill-transparent"
        :stroke-width="`${props.link.endActive ? 1 : 0.5}`"
        :class="
            props.link.endActive
                ? `stroke-green-600`
                : props.link.usedInRoute && !props.settings
                  ? 'stroke-blue-600'
                  : `stroke-black`
        "
    />
</template>
