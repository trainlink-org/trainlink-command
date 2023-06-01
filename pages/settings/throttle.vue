<!-- Page to manage locos in settings -->
<script setup lang="ts">
// import { useRouter } from 'vue-router';
// import ModalComponent from '../ModalComponent.vue';

import { store } from '@/utils/main';
// import { reactive, ref, type Ref } from 'vue';
import { socket } from '@/utils/socketHelper';

const router = useRouter();

const modalValues = reactive({
    name: '',
    address: '',
});

const addError = reactive({
    name: false,
    nameMsg: 'Empty message',
    address: false,
    addressMsg: 'Empty message',
});

const editError = reactive({
    name: false,
    nameMsg: 'Empty message',
    address: false,
    addressMsg: 'Empty message',
});

const selectedItems: Ref<number[]> = ref([]);

const addOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);

const currentlyEditing = reactive({
    name: '',
    address: 0,
});

const deleteText = ref('');

function openAddLoco() {
    modalValues.name = '';
    modalValues.address = '';
    addError.name = false;
    addError.address = false;
    addOpen.value = true;
}

function openEditLoco(address: number) {
    editError.name = false;
    editError.address = false;
    store.getLoco(address).then((loco) => {
        currentlyEditing.name = loco.name;
        currentlyEditing.address = loco.address;
        modalValues.name = loco.name;
        modalValues.address = loco.address.toString();
        editOpen.value = true;
    }).catch();
}

function openDeleteLoco(addresses: number[]) {
    if (addresses.length === 1) {
        store.getLoco(addresses[0]).then((loco) => {
            deleteText.value = `Are you sure you want to delete "${loco?.name}"?`;
        }).catch();
    } else {
        let locoList = '';
        addresses.forEach((address) => {
            store.getLoco(address).then((loco) => {
                locoList += `\n${loco?.name} (${loco?.address})`;
            }).catch();
        });
        deleteText.value = `Are you sure you want to delete the ${addresses.length} following locomotives?${locoList}`;
    }
    deleteOpen.value = true;
}

async function addLoco() {
    const locoAddress = Number(modalValues.address);
    store.getLoco(modalValues.name)
        .then(() => {
            addError.nameMsg = 'Name is already used';
            addError.name = true;
        })
        .catch(() => {
            if (modalValues.name !== '') {
                addError.name = false;
            } else {
                addError.nameMsg = 'Name can\'t be blank!';
                addError.name = true;
            }
        }).then(() => {
            if (isNaN(locoAddress) || locoAddress <= 0 || locoAddress > 10293) {
                addError.addressMsg = 'Address should be a number between 1 and 10293';
                addError.address = true;
            } else {
                addError.address = false;
                store.getLoco(locoAddress)
                    .then(() => {
                        addError.addressMsg = 'Address is already in use';
                        addError.address = true;
                    })
                    .catch(() => {
                        addError.address = false;
                    });
            }
        }).then(() => {
            if (!addError.name && !addError.address) {
                socket.emit('config/addLoco', modalValues.name, locoAddress);
                addOpen.value = false;
            }
        });
}

async function editLoco(){
    const locoAddress = Number(modalValues.address);
    new Promise<void>((resolve) => {
        if (modalValues.name !== currentlyEditing.name) {
            store.getLoco(modalValues.name)
                .then(() => {
                    editError.nameMsg = 'Name is already used';
                    editError.name = true;
                    resolve();
                })
                .catch(() => {
                    editError.name = false;
                    resolve();
                });
        } else {
            editError.name = false;
            resolve();
        }
    }).then(() => {

        if (isNaN(locoAddress) || locoAddress <= 0 || locoAddress > 10293) {
            editError.addressMsg = 'Address should be a number between 1 and 10293';
            editError.address = true;
        } else if (modalValues.address !== String(currentlyEditing.address)){
            store.getLoco(locoAddress)
                .then(() => {
                    editError.addressMsg = 'Address is already in use';
                    editError.address = true;
                })
                .catch(() => {
                    addError.address = false;
                });
        } else {
            editError.address = false;
        }
    }).then(() => {
        if (!editError.name && !editError.address) {        const locoAddress = Number(modalValues.address);
            socket.emit('config/editLoco', currentlyEditing.address, modalValues.name, locoAddress);
            editOpen.value = false;
        }
    });
}

function deleteLoco() {
    selectedItems.value.forEach((item) => {
        console.log(item);
        socket.emit('config/deleteLoco', item);
    });
    selectedItems.value = [];
    deleteOpen.value = false;
}

</script>

<template>
    <div
        class="flex h-full w-full flex-col justify-between"
    >
        <div
            class="overflow-y-scroll"
        >
            <div class="flex flex-col border-b-2 border-primary-300 bg-primary-100 px-1">
                <div class="flex w-full text-lg">
                    Throttle settings
                </div>
            </div>
            <div
                v-show="selectedItems.length >= 1"
                class="w-full border-b-2 border-primary-300 pr-1 text-right text-accent-600"
            >
                <a
                    class="cursor-pointer hover:underline"
                    @click="selectedItems = []"
                >Clear selected</a>
            </div>
            <ul>
                <li
                    v-for="loco in store.getAllLocos()"
                    :key="loco.address"
                    class="w-full  pl-2 pr-3 hover:bg-accent-100"
                >
                    <div
                        class="group grid w-full grid-flow-row grid-cols-5 grid-rows-2"
                    >
                        <p class="col-span-4 lg:text-lg">
                            {{ loco.name }}
                        </p>
                        <p class="col-span-1 row-span-2 flex flex-row space-x-3 self-center justify-self-end">
                            <!-- Bootstrap icons: pencil-square -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="cursor-pointer"
                                viewBox="0 0 16 16"
                                @click="openEditLoco(loco.address)"
                            >
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path
                                    fill-rule="evenodd"
                                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                />
                            </svg>
                            <input
                                v-model="selectedItems"
                                :value="loco.address"
                                type="checkbox"
                                class="cursor-pointer"
                            >
                        </p>
                        <p class="col-span-4 text-sm italic">
                            {{ loco.address }}
                        </p>
                        <!-- <p class="text-right">
                            PID
                        </p> -->
                    </div>
                </li>
            </ul>
        </div>


        <!-- Bottom bar -->
        <div class="flex w-full items-center justify-around border-t-2 border-primary-300 py-1">
            <!-- Back Icon -->
            <button
                class="group flex h-7 w-2/12 items-center rounded-full hover:bg-accent-200 active:bg-accent-400 md:hidden"
                @click="router.push('/settings')"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="h-8 w-full group-hover:fill-accent-400"
                    viewBox="0 0 16 16"
                >
                    <path
                        fill-rule="evenodd"
                        d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
                    />
                </svg>
            </button>
            <!-- Add Icon -->
            <button
                class="group flex h-7 w-1/6 items-center rounded-full hover:bg-primary-200 active:bg-green-400"
                @click="openAddLoco()"
            >
                <!-- Boostrap icons: plus -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    class="h-7 w-full group-hover:fill-green-400"
                >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
            </button>
            <!-- Delete Icon -->
            <button
                v-if="selectedItems.length >= 1"
                class="group flex h-7 w-1/6 items-center rounded-full hover:bg-primary-200 active:bg-red-400"
                @click="openDeleteLoco(selectedItems)"
            >
                <!-- Bootstrap icons: trash-fill -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    class="h-5 w-full group-hover:fill-red-500"
                    viewBox="0 0 16 16"
                >
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                </svg>
            </button>
        </div>
    </div>

    <!-- Add a locomotive -->
    <ModalComponent
        v-if="addOpen"
        title="Add a locomotive"
        submit-text="Add"
        @submit="addLoco()"
        @cancel="addOpen = false"
    >
        <div
            class="grid h-full w-full grid-flow-row grid-cols-2 grid-rows-4 gap-y-1 sm:grid-cols-3 sm:grid-rows-2"
        >
            <p
                class="col-span-2 sm:col-span-1"
            >
                Name:
            </p>
            <div class="col-span-2">
                <input
                    v-model="modalValues.name"
                    type="text"
                    class="w-full rounded border-2 border-primary-400 invalid:border-red-600"
                    :class="addError.name ? 'border-red-600' : 'border-primary-400'"
                >
                <p
                    :class="addError.name ? 'visible' : 'invisible'"
                    class="text-red-600"
                >
                    {{ addError.nameMsg }}
                </p>
            </div>
            <p
                class="col-span-2 sm:col-span-1"
            >
                Address:
            </p>
            <div class="col-span-2 w-full">
                <input
                    v-model="modalValues.address"
                    type="number"
                    min="1"
                    max="10293"
                    class="w-full rounded border-2 border-primary-400 invalid:border-red-600"
                    :class="addError.address ? 'border-red-600' : 'border-primary-400'"
                >
                <p
                    :class="addError.address ? 'visible' : 'invisible'"
                    class="text-red-600"
                >
                    {{ addError.addressMsg }}
                </p>
            </div>
        </div>
    </ModalComponent>

    <!-- Edit a locomotive -->
    <ModalComponent
        v-if="editOpen"
        title="Edit a locomotive"
        submit-text="Save"
        @cancel="editOpen = false"
        @submit="editLoco()"
    >
        <div
            class="grid h-full w-full grid-flow-row grid-cols-2 grid-rows-4 gap-y-1 sm:grid-cols-3 sm:grid-rows-2"
        >
            <p
                class="col-span-2 sm:col-span-1"
            >
                Name:
            </p>
            <div class="col-span-2">
                <input
                    v-model="modalValues.name"
                    type="text"
                    class="w-full rounded border-2 border-primary-400 invalid:border-red-600"
                >
                <p
                    class="text-red-600"
                    :class="editError.name ? 'visible' : 'invisible'"
                >
                    {{ editError.nameMsg }}
                </p>
            </div>
            <p
                class="col-span-2 sm:col-span-1"
            >
                Address:
            </p>
            <div class="col-span-2 w-full">
                <input
                    v-model="modalValues.address"
                    type="number"
                    min="1"
                    max="10293"
                    class="w-full rounded border-2 border-primary-400 invalid:border-red-600"
                >
                <p
                    class="text-red-600"
                    :class="editError.address ? 'visible' : 'invisible'"
                >
                    {{ editError.addressMsg }}
                </p>
            </div>
        </div>
    </ModalComponent>

    <!-- Delete a locomotive -->
    <ModalComponent
        v-if="deleteOpen"
        title="Confirm deletion"
        submit-text="Delete"
        @cancel="deleteOpen = false"
        @submit="deleteLoco()"
    >
        <p
            class="whitespace-pre-wrap"
        >
            {{ deleteText }}
        </p>
    </ModalComponent>
</template>