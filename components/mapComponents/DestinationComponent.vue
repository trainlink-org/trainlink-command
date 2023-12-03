<!-- Used to display a destination on the Routes map -->
<script setup lang="ts">
import type { Destination } from '@trainlink-org/trainlink-types';

const props = defineProps({
    destination: { type: Object as () => Destination, required: true },
    selected: { type: Boolean, required: true },
});
</script>

<template>
    <rect
        class="hover:fill-primary-400"
        :class="
            props.destination.usedInRoute
                ? 'fill-blue-600'
                : props.selected
                  ? 'fill-red-600'
                  : 'fill-black'
        "
        :x="props.destination.coordinate.x - 1"
        :y="props.destination.coordinate.y - 1"
        :width="2"
        :height="2"
    />
</template>
