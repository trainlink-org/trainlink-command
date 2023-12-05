<!-- Connector component for the Routes page -->
<script setup lang="ts">
import type { TurnoutLink } from '@trainlink-org/trainlink-types';
import { type Coordinate, calculateMidPoints } from './shared';

const props = defineProps({
    link: { type: Object as () => TurnoutLink, required: true },
    settings: { type: Boolean, required: false, default: false },
});

const turnoutStore = useTurnoutStore();
const startCoord = computed(
    () =>
        turnoutStore.getMapPoint(props.link.start, props.settings)
            ?.coordinate || {
            x: -5,
            y: -5,
        },
);
const endCoord = computed(
    () =>
        turnoutStore.getMapPoint(props.link.end, props.settings)
            ?.coordinate || {
            x: -5,
            y: -5,
        },
);

const midPoints = computed(() =>
    calculateMidPoints(startCoord.value, props.link.points, endCoord.value),
);
const path = computed(() => {
    let path = `M ${midPoints.value.startMid.x} ${midPoints.value.startMid.y}`;

    Array.from(props.link.points).forEach((point) => {
        const virtualPoint = point;
        path = `${path} L ${virtualPoint.x} ${virtualPoint.y}`;
    });

    path = `${path} L ${midPoints.value.endMid.x} ${midPoints.value.endMid.y}`;
    return path;
});
const startPath = computed(
    () =>
        `M ${startCoord.value.x} ${startCoord.value.y} L ${midPoints.value.startMid.x} ${midPoints.value.startMid.y}`,
);
const endPath = computed(
    () =>
        `M ${endCoord.value.x} ${endCoord.value.y} L ${midPoints.value.endMid.x} ${midPoints.value.endMid.y}`,
);
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
