<script setup lang="ts">
// import { useRoute, useRouter } from 'vue-router';
// import { onMounted, onUnmounted, ref, watch } from 'vue';

const router = useRouter();

const detailsOpen = ref(false);
const smallScreen = ref(false);

const windowWidth = ref(window.innerWidth);

const onWidthChange = () => {
    windowWidth.value = window.innerWidth;
    if (windowWidth.value >= 768 ) {
        smallScreen.value = false;
    } else {
        smallScreen.value = true;
    }
};
onMounted(() => {
    window.addEventListener('resize', onWidthChange);
    if (windowWidth.value >= 768 ) {
        smallScreen.value = false;
    } else {
        smallScreen.value = true;
    }
});
onUnmounted(() => window.removeEventListener('resize', onWidthChange));
const route = useRoute();

watch(route, (newRoute) => {
    if (newRoute.fullPath === '/settings') {
        detailsOpen.value = false;
    }
});

</script>

<template>
    <div class="flex h-full w-full items-center justify-evenly pt-10">
        <div
            v-if="!detailsOpen || !smallScreen"
            class="h-5/6 w-11/12 overflow-y-scroll rounded-lg border-4 border-borderColor-300 sm:w-5/6 md:w-3/12"
        >
            <ul
                class="h-full"
            >
                <li
                    class="flex h-8 w-full cursor-pointer items-center justify-center border-b-2 border-primary-300 px-2 hover:bg-primary-200 select-none"
                    @click="router.push('/settings/throttle'); detailsOpen = true"
                >
                    Throttle
                </li>
                <li
                    class="flex h-8 w-full cursor-pointer items-center justify-center px-2 hover:bg-primary-200 border-b-2 border-primary-300 select-none"
                    @click="router.push('/settings/routes'); detailsOpen = true"
                >
                    Routes
                </li>
                <li
                    class="flex h-8 w-full cursor-pointer items-center justify-center px-2 hover:bg-primary-200 border-b-2 border-primary-30 select-none"
                    @click="router.push('/settings/about'); detailsOpen = true"
                >
                    About
                </li>
            </ul>
        </div>
        <div
            v-if="detailsOpen || !smallScreen"
            class="h-5/6 w-11/12 rounded-lg border-4 md:w-4/6"
        >
            <RouterView/>
        </div>
        <div
            class="absolute bottom-0 left-0 mb-2 ml-2 h-10 w-10 rounded-full border-2 border-borderColor-300 bg-primary-200 p-1 pl-2 focus:bg-accent-400"
            @click="router.push('/throttle/jump')"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                class="h-full w-full"
                viewBox="0 0 16 16"
            >
                <path
                    fill-rule="evenodd"
                    d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5zM10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5z"
                />
            </svg>
        </div>
    </div>
</template>