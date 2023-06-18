<script setup lang="ts">
// import { reactive } from 'vue';
// import ThrottleComponent from '../components/ThrottleComponent.vue';

// import { ref, onMounted, onUnmounted} from 'vue';

// import {useRoute, useRouter} from 'vue-router';

const route = useRoute();
const router = useRouter();

console.log(`Params: ${route.params}`);

if (process.client) {
    const windowWidth = ref(window.innerWidth);

    const onWidthChange = () => {
        windowWidth.value = window.innerWidth;
        if (windowWidth.value >= 640) {
            throttleState.smallScreen = false;
        } else {
            throttleState.smallScreen = true;
        }
    };
    onMounted(() => {
        window.addEventListener('resize', onWidthChange);
        if (windowWidth.value >= 640) {
            throttleState.smallScreen = false;
        } else {
            throttleState.smallScreen = true;
        }
    });
    onUnmounted(() => window.removeEventListener('resize', onWidthChange));
}

const activeClasses = 'bg-accent-200 cursor-default';

const throttleState = reactive({
    throttles: [true, false],
    throttleNames: ['Empty', 'Empty'],
    spanClasses: [activeClasses + ' italic', 'italic'],
    smallScreen: false,
});

const activeIndex = ref(0);

function throttleSelector(targetThrottle: number) {
    console.log(`Selector ${targetThrottle} clicked`);
    activeIndex.value = targetThrottle;
    console.log(throttleState);
    if (!throttleState.throttles[targetThrottle]) {
        throttleState.throttles.fill(false);
        throttleState.throttles[targetThrottle] = true;
        throttleState.spanClasses.fill('');
        throttleState.spanClasses[targetThrottle] = activeClasses;
        throttleState.throttleNames.forEach((value, index) => {
            if (value === 'Empty') {
                throttleState.spanClasses[index] += ' italic';
            }
        });
    }
}

// const returnPath = route.params.prev ? `/${route.params.prev}` : '';
</script>

<template>
    <div class="flex h-full flex-col items-center justify-center">
        <div
            class="flex w-full flex-col items-center p-2 sm:flex-row sm:place-content-evenly"
        >
            <ThrottleComponent
                v-show="
                    throttleState.throttles[0] || !throttleState.smallScreen
                "
                :id="0"
                @name-change="
                    (name) => {
                        throttleState.throttleNames[0] = name;
                        throttleState.spanClasses[0] = activeClasses;
                    }
                "
            />
            <ThrottleComponent
                v-show="
                    throttleState.throttles[1] || !throttleState.smallScreen
                "
                :id="1"
                @name-change="
                    (name) => {
                        throttleState.throttleNames[1] = name;
                        throttleState.spanClasses[1] = activeClasses;
                    }
                "
            />
        </div>
    </div>
    <div v-show="throttleState.smallScreen" class="absolute bottom-0 w-full">
        <div
            class="mx-auto my-2 flex w-5/6 cursor-pointer flex-row items-center"
        >
            <span
                class="w-1/2 rounded-l-md border-4 border-r-2 border-accent-200 text-center hover:bg-accent-200"
                :class="throttleState.spanClasses[0]"
                @click="throttleSelector(0)"
                v-text="throttleState.throttleNames[0]"
            />
            <span
                class="w-1/2 rounded-r-md border-4 border-l-2 border-accent-200 text-center hover:bg-accent-200"
                :class="throttleState.spanClasses[1]"
                @click="throttleSelector(1)"
                v-text="throttleState.throttleNames[1]"
            />
        </div>
    </div>
    <div
        v-show="route.params.prev"
        class="absolute bottom-0 left-0 mb-2 ml-2 h-10 w-10 rounded-full border-2 border-borderColor-300 bg-primary-200 p-1 pl-2 focus:bg-accent-400"
        @click="router.back()"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="h-full w-full"
            viewBox="0 0 16 16"
        >
            <!-- <path
                    fill-rule="evenodd"
                    d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
                />
                <path
                    fill-rule="evenodd"
                    d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
                /> -->
            <path
                fill-rule="evenodd"
                d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8zm-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5z"
            />
        </svg>
    </div>
</template>

<style></style>
