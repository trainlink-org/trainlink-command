<!-- A draggable handle for the Routes page in the settings -->
<script setup lang="ts">
import {
    calculateSize,
    calculateXCoord,
    calculateYCoord,
    type Coordinate,
} from './shared';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
    point: { type: Object as () => Coordinate, required: true },
});
</script>

<template>
    <circle
        :key="point.x * point.y"
        :r="calculateSize(1.2)"
        :cx="calculateXCoord(point.x)"
        :cy="calculateYCoord(point.y)"
        class="fill-blue-400"
    />
</template>
