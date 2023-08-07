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

const midPoints = calculateMidPointsNew(props.start, props.points, props.end);
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
    let innerStart: Coordinate;
    let innerEnd: Coordinate;
    if (points.length > 0) {
        innerStart = points[0];
        innerEnd = points[points.length - 1];
    } else {
        innerStart = endPoint;
        innerEnd = startPoint;
    }
    let newStartPoint: Coordinate;
    let newEndPoint: Coordinate;
    console.log(props.start);
    if (
        Math.sqrt(
            Math.pow(startPoint.x - endPoint.x, 2) +
                Math.pow(startPoint.y - endPoint.y, 2),
        ) <= 5
    ) {
        console.log('Start and end too close!');
        newStartPoint = {
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2,
        };
        newEndPoint = {
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2,
        };
    } else {
        {
            const angle = Math.atan(
                (innerStart.x - startPoint.x) / (innerStart.y - startPoint.y),
            );
            const yLength = Math.cos(angle) * 5;
            const xLength = Math.sqrt(25 - Math.pow(yLength, 2));
            console.log(
                `Start: ${startPoint.y}, innerStart: ${
                    innerStart.y
                }\n\t${yLength} -> ${startPoint.y + yLength}`,
            );
            let xPoint = startPoint.x + xLength;
            let yPoint = startPoint.y + yLength;
            if (
                (xPoint > startPoint.x && xPoint > innerStart.x) ||
                (xPoint < startPoint.x && xPoint < innerStart.x)
            ) {
                xPoint = startPoint.x - xLength;
                if (
                    (xPoint > startPoint.x && xPoint > innerStart.x) ||
                    (xPoint < startPoint.x && xPoint < innerStart.x)
                ) {
                    xPoint = Math.abs(endPoint.x - startPoint.x);
                }
            }
            if (
                (yPoint > startPoint.y && yPoint > innerStart.y) ||
                (yPoint < startPoint.y && yPoint < innerStart.y)
            ) {
                console.log('Correction');
                yPoint = startPoint.y - yLength;
                if (
                    (yPoint > startPoint.y && yPoint > innerStart.y) ||
                    (yPoint < startPoint.y && yPoint < innerStart.y)
                ) {
                    yPoint = Math.abs(endPoint.y - startPoint.y);
                    console.log('Secondary correction');
                }
            }
            newStartPoint = {
                x: xPoint,
                y: yPoint,
            };
        }
        {
            const angle = Math.atan(
                (innerEnd.x - endPoint.x) / (innerEnd.y - endPoint.y),
            );
            const yLength = Math.cos(angle) * 5;
            const xLength = Math.sqrt(25 - Math.pow(yLength, 2));
            let xPoint = endPoint.x + xLength;
            let yPoint = endPoint.y + yLength;

            if (
                (xPoint > startPoint.x && xPoint > endPoint.x) ||
                (xPoint < startPoint.x && xPoint < endPoint.x)
            ) {
                xPoint = endPoint.x - xLength;
                if (
                    (xPoint > startPoint.x && xPoint > endPoint.x) ||
                    (xPoint < startPoint.x && xPoint < endPoint.x)
                ) {
                    xPoint = Math.abs(endPoint.x - startPoint.x);
                }
            }
            if (
                (yPoint > innerEnd.y && yPoint > endPoint.y) ||
                (yPoint < innerEnd.y && yPoint < endPoint.y)
            ) {
                yPoint = endPoint.y - yLength;
                if (
                    (yPoint > innerEnd.y && yPoint > endPoint.y) ||
                    (yPoint < innerEnd.y && yPoint < endPoint.y)
                ) {
                    yPoint = Math.abs(endPoint.y - startPoint.y);
                }
            }
            newEndPoint = {
                x: xPoint,
                y: yPoint,
            };
        }
        if (
            Math.sqrt(
                Math.pow(startPoint.x - innerStart.x, 2) +
                    Math.pow(startPoint.y - innerStart.y, 2),
            ) <= 5
        ) {
            newStartPoint = {
                x: Math.abs(startPoint.x - innerStart.x),
                y: Math.abs(startPoint.y - innerStart.y),
            };
        }
        if (
            Math.sqrt(
                Math.pow(endPoint.x - innerEnd.x, 2) +
                    Math.pow(endPoint.y - innerEnd.y, 2),
            ) <= 5
        ) {
            newEndPoint = {
                x: Math.abs(endPoint.x - innerEnd.x),
                y: Math.abs(endPoint.y - innerEnd.y),
            };
        }
    }
    console.log(`Start: (${newStartPoint.x}, ${newStartPoint.y})`);
    console.log(`End: (${newEndPoint.x}, ${newEndPoint.y})`);
    return {
        startMid: newStartPoint,
        endMid: newEndPoint,
    };
}
function calculateMidPointsNew(
    startPoint: Coordinate,
    points: Coordinate[],
    endPoint: Coordinate,
) {
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

    const distanceFactor = 5;
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
