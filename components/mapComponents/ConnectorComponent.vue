<!-- Connector component for the Routes page -->
<script setup lang="ts">
// import { computed  } from 'vue';
import { after } from 'node:test';
import { type Coordinate } from './shared';

const props = defineProps({
    start: { type: Object as () => Coordinate, required: true },
    points: { type: Object as () => Coordinate[], required: true },
    end: { type: Object as () => Coordinate, required: true },
    startSegActive: { type: Boolean, required: true },
    endSegActive: { type: Boolean, required: true },
    activeRoute: { type: Boolean, required: true },
});

const midPoints = calculateMidPoints(props.start, props.points, props.end);
const path = computed(() => {
    let path = `M ${midPoints.startMid.x} ${midPoints.startMid.y}`;

    Array.from(props.points).forEach((point) => {
        const virtualPoint = point;
        path = `${path} L ${virtualPoint.x} ${virtualPoint.y}`;
    });

    path = `${path} L ${midPoints.endMid.x} ${midPoints.endMid.y}`;
    return path;
});
const startPath = `M ${props.start.x} ${props.start.y} L ${midPoints.startMid.x} ${midPoints.startMid.y}`;
const endPath = `M ${props.end.x} ${props.end.y} L ${midPoints.endMid.x} ${midPoints.endMid.y}`;

function calculateMidPoints(
    startPoint: Coordinate,
    points: Coordinate[],
    endPoint: Coordinate,
) {
    const distanceFactor = 5;
    if (
        Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y) <
        distanceFactor
    ) {
        const midPoint = {
            x:
                Math.abs(endPoint.x - startPoint.x) +
                (startPoint.x < endPoint.x ? startPoint.x : endPoint.x),
            y:
                Math.abs(endPoint.y - startPoint.y) +
                (startPoint.y < endPoint.x ? startPoint.x : endPoint.x),
        };
        return {
            startMid: midPoint,
            endMid: midPoint,
        };
    }
    let afterStart = endPoint;
    let beforeEnd = startPoint;
    if (points.length === 1) {
        afterStart = points[0];
        beforeEnd = points[0];
    } else if (points.length > 1) {
        afterStart = points[0];
        beforeEnd = points[points.length - 1];
    }

    let startDistance = Math.hypot(
        afterStart.x - startPoint.x,
        afterStart.y - startPoint.y,
    );
    let endDistance = Math.hypot(
        beforeEnd.x - endPoint.x,
        beforeEnd.y - endPoint.y,
    );

    let startMidPoint = {
        x:
            startPoint.x +
            (distanceFactor / startDistance) * (afterStart.x - startPoint.x),
        y:
            startPoint.y +
            (distanceFactor / startDistance) * (afterStart.y - startPoint.y),
    };
    let endMidPoint = {
        x:
            endPoint.x +
            (distanceFactor / endDistance) * (beforeEnd.x - endPoint.x),
        y:
            endPoint.y +
            (distanceFactor / endDistance) * (beforeEnd.y - endPoint.y),
    };
    if (startDistance < distanceFactor) startMidPoint = afterStart;
    if (endDistance < distanceFactor) endMidPoint = beforeEnd;
    return {
        startMid: startMidPoint,
        endMid: endMidPoint,
    };
}
</script>

<template>
    <path
        :d="startPath"
        class="fill-transparent"
        :stroke-width="`${props.startSegActive ? 1 : 0.5}`"
        :class="
            props.startSegActive
                ? 'stroke-green-600'
                : props.activeRoute
                  ? 'stroke-blue-600'
                  : 'stroke-black'
        "
    />
    <path
        v-if="midPoints.startMid !== midPoints.endMid"
        :d="path"
        :stroke-width="`${0.5}`"
        class="fill-transparent"
        :class="props.activeRoute ? 'stroke-blue-600' : 'stroke-black'"
    />
    <path
        :d="endPath"
        class="fill-transparent"
        :stroke-width="`${props.endSegActive ? 1 : 0.5}`"
        :class="
            props.endSegActive
                ? `stroke-green-600`
                : props.activeRoute
                  ? 'stroke-blue-600'
                  : `stroke-black`
        "
    />
</template>
