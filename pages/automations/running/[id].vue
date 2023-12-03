<!-- Displays a running script on the Automations page -->
<script setup lang="ts">
import { runningAutomations } from '@/utils/main';
import { AutomationStatus } from '@trainlink-org/trainlink-types';
import { useSocketStore } from '@/stores/socket';
const route = useRoute();
const router = useRouter();

const socket = useSocketStore().socketRef;

const script = ref(
    runningAutomations.value.get((route.params.id as string).replace('-', '#')),
);

socket.on('automation/fetchRunningResponse', () => {
    script.value = runningAutomations.value.get(
        (route.params.id as string).replace('-', '#'),
    );
});
</script>

<template>
    <div class="flex h-full w-full flex-col justify-between">
        <div v-if="script" class="h-1/3">
            <div
                class="flex flex-col border-b-2 border-primary-300 bg-primary-100 px-1"
            >
                <div class="flex w-full text-lg">
                    <span class="w-5/6">{{ script.name }}</span>
                    <span class="text-md w-1/6 text-right text-primary-600">{{
                        script.pid
                    }}</span>
                </div>
                <p class="text-sm italic text-primary-600">
                    {{ script.type }}
                </p>
            </div>
        </div>

        <div v-if="!script" class="flex h-full w-full flex-col justify-between">
            <p class="flex h-full items-center justify-center text-lg italic">
                Automation has finished
            </p>
        </div>

        <!-- Bottom bar -->
        <div
            class="flex w-full items-center justify-around border-t-2 border-primary-300 py-1 md:hidden"
        >
            <!-- Back Icon -->
            <button
                class="group flex h-7 w-2/12 items-center rounded-full hover:bg-primary-200 active:bg-accent-400"
                @click="router.push('/automations')"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="h-8 w-full group-hover:fill-accent-400"
                    viewBox="0 0 16 16"
                >
                    <!-- height: 34 -->
                    <path
                        fill-rule="evenodd"
                        d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
                    />
                </svg>
            </button>
            <!-- Pause Icon -->
            <button
                v-if="script && script.status === AutomationStatus.running"
                class="group flex h-7 w-1/6 items-center rounded-full hover:bg-primary-200 active:bg-blue-400"
                @click="
                    (event) => {
                        if (script)
                            socket.emit(
                                'automation/pauseAutomation',
                                script.pid,
                            );
                        script = runningAutomations.get(
                            (route.params.id as string).replace('-', '#'),
                        );
                    }
                "
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    class="h-7 w-full group-hover:fill-blue-400"
                >
                    <!-- height: 30 -->
                    <path
                        d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"
                    />
                </svg>
            </button>
            <!-- Play button -->
            <button
                v-if="script && script.status === AutomationStatus.paused"
                class="group flex h-7 w-1/6 items-center rounded-full hover:bg-primary-200 active:bg-green-400"
                @click="
                    (event) => {
                        if (script)
                            socket.emit(
                                'automation/resumeAutomation',
                                script.pid,
                            );
                        script = runningAutomations.get(
                            (route.params.id as string).replace('-', '#'),
                        );
                    }
                "
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    class="h-7 w-full group-hover:fill-green-400"
                >
                    <!-- height: 30 -->
                    <path
                        d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"
                    />
                </svg>
            </button>
            <!-- Delete Icon -->
            <button
                v-if="script"
                class="group flex h-7 w-1/6 items-center rounded-full hover:bg-primary-200 active:bg-red-400"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="h-5 w-full group-hover:fill-red-500"
                    viewBox="0 0 16 16"
                >
                    <!-- height="20" -->
                    <path
                        d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"
                    />
                </svg>
            </button>
        </div>
    </div>
</template>

<style></style>
