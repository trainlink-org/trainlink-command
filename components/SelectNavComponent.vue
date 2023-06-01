<script setup lang="ts">

// import { onMounted, ref, computed } from 'vue';
// import { useRoute } from 'vue-router';

const props = defineProps({
    options: {type: Array<string>, required: true},
    tabindex: {type: Number, required: false, default: 0}
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
    (e: 'input', value: string): void
}>();

const route = useRoute();

const selected = ref(props.options.length > 0 ? props.options[0] : '');
const open = ref(false);

const itemsClasses = computed(() => {
    return !open.value ? 'hidden' : '';
});


const selectedClasses = computed(() => {
    return open.value ? 'bg-primary-100' : 'bg-inherit';
});

const routeNameClasses = computed(() => {
    return open.value ? 'border-b-transparent' : 'border-b-black';
});

const routeName = computed(() => {
    return route.name;
});

onMounted(() => {
    console.log(selected.value);
});

</script>

<template>
    <div
        class="relative h-10 w-full text-left outline-none"
        :tabindex="tabindex"
        @blur="open = false"
    >
        <div
            class="flex h-10 w-full cursor-pointer select-none items-center rounded-t rounded-b-none border border-none border-primary-800"
            :class="[selectedClasses]"
            @click="open = !open"
        >
            <div
                class="m-auto flex w-fit flex-row items-center border border-transparent px-1 text-center"
                :class="[routeNameClasses]"
            >
                {{ routeName }}
                <span class="ml-2 h-0 w-0 border-4 border-solid border-transparent border-x-transparent border-t-black border-b-transparent"/>
            </div>
        </div>
        <div
            class="absolute inset-x-0 z-10 w-full overflow-hidden rounded-b border border-primary-800 border-t-primary-500 bg-primary-100"
            :class="[itemsClasses]"
        >
            <div
                v-for="(option, i) of props.options"
                :key="i"
                class=" w-full cursor-pointer select-none text-center hover:bg-accent-200"
                @click="
                    selected = option;
                    open = false;
                    $emit('input', option);
                "
            >
                {{ option }}
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>
