<!-- Connector component for the Routes page -->
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
    startSegActive: { type: Boolean, required: true },
    endSegActive: { type: Boolean, required: true },
    activeRoute: { type: Boolean, required: true },
});

const midPoints = calculateMidPoints(props.start, props.points, props.end);
// const path = computed(() => {
//     let path = `M ${calculateXCoord(midPoints.startMid.x)} ${calculateYCoord(
//         midPoints.startMid.y,
//     )}`;

//     Array.from(props.points).forEach((point) => {
//         const virtualPoint = calculateCoord(point);
//         path = `${path} L ${virtualPoint.x} ${virtualPoint.y}`;
//     });
//     path = `${path} L ${calculateXCoord(midPoints.endMid.x)} ${calculateYCoord(
//         midPoints.endMid.y,
//     )}`;
//     return path;
// });
const path = computed(() => {
    let path = `M ${midPoints.startMid.x * 10} ${midPoints.startMid.y * 10}`;

    Array.from(props.points).forEach((point) => {
        const virtualPoint = point;
        path = `${path} L ${virtualPoint.x * 10} ${virtualPoint.y * 10}`;
    });
    path = `${path} L ${midPoints.endMid.x * 10} ${midPoints.endMid.y * 10}`;
    return path;
});
// const startPath = computed(() => {
//     return `M ${calculateXCoord(props.start.x)} ${calculateYCoord(
//         props.start.y,
//     )} L ${calculateXCoord(midPoints.startMid.x)} ${calculateYCoord(
//         midPoints.startMid.y,
//     )}`;
// });
const startPath = `M ${props.start.x * 10} ${props.start.y * 10} L ${
    midPoints.startMid.x * 10
} ${midPoints.startMid.y * 10}`;
// const endPath = computed(() => {
//     return `M ${calculateXCoord(props.end.x)} ${calculateYCoord(
//         props.end.y,
//     )} L ${calculateXCoord(midPoints.endMid.x)} ${calculateYCoord(
//         midPoints.endMid.y,
//     )}`;
// });
const endPath = `M ${props.end.x * 10} ${props.end.y * 10} L ${
    midPoints.endMid.x * 10
} ${midPoints.endMid.y * 10}`;
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
</script>

<template>
    <path
        :d="startPath"
        class="fill-transparent"
        :stroke-width="`${calculateSize(props.startSegActive ? 1 : 0.5)}`"
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
        :stroke-width="`${calculateSize(0.5)}`"
        class="fill-transparent"
        :class="props.activeRoute ? 'stroke-blue-600' : 'stroke-black'"
    />
    <path
        :d="endPath"
        class="fill-transparent"
        :stroke-width="`${calculateSize(props.endSegActive ? 1 : 0.5)}`"
        :class="
            props.endSegActive
                ? `stroke-green-600`
                : props.activeRoute
                ? 'stroke-blue-600'
                : `stroke-black`
        "
    />
</template>
