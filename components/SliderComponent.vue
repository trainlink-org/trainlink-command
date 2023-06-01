<script setup lang="ts">
// import { computed } from 'vue';

const props = defineProps({
    speed: {type: Number, required: true}
});

const emit = defineEmits<{
    (e: 'update:speed', value: number): void
}>();

const value = computed({
    get() {
        return props.speed.toString();
    },
    set(value){
        const intValue = parseInt(value);
        emit('update:speed', intValue);
    }
});

</script>

<template>
    <input
        v-model="value"
        class="slider"
        type="range"
        min="0"
        max="126"
    >
</template>

<style scoped>
.slider {
    height: 32px;
    -webkit-appearance: none;
    margin: 10px 0;
    width: 100%;
}
.slider:focus {
    outline: none;
}
.slider::-webkit-slider-runnable-track {
    /* width: 98%; */
    height: 16px;
    cursor: pointer;
    box-shadow: 0px 0px 0px #000000;
    background: #B6B6B6;
    border-radius: 25px;
    border: 1px solid #8A8A8A;
    -webkit-appearance: none;
}
.slider:focus::-webkit-slider-runnable-track {
    background: #B6B6B6;
}

.slider::-moz-range-track {
    /* width: 98%; */
    height: 16px;
    cursor: pointer;
    box-shadow: 0px 0px 0px #000000;
    background: #B6B6B6;
    border-radius: 25px;
    border: 1px solid #8A8A8A;
}
.slider:disabled::-moz-range-track {
    background: #A6A6A6;
}

.slider::-moz-range-progress {
    background: #60a5fa;
    height: 16px;
    border-radius: 25px;
}
.slider::-webkit-slider-thumb {
    border: 1px solid #8A8A8A;
    height: 24px;
    width: 35px;
    border-radius: 6px;
    background: #DADADA;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -5px;
}
.slider:disabled::-webkit-slider-thumb {
    background: #CACACA;
}
.slider::-moz-range-thumb {
    border: 1px solid #8A8A8A;
    height: 24px;
    width: 35px;
    border-radius: 6px;
    background: #DADADA;
    cursor: pointer;
}
.slider:disabled::-moz-range-thumb {
    background: #CACACA;
}


.slider::-ms-fill-lower {
    background: #B6B6B6;
    border: 1px solid #8A8A8A;
    border-radius: 50px;
    box-shadow: 0px 0px 0px #000000;
}
.slider::-ms-fill-upper {
    background: #B6B6B6;
    border: 1px solid #8A8A8A;
    border-radius: 50px;
    box-shadow: 0px 0px 0px #000000;
}
.slider::-ms-thumb {
    margin-top: 1px;
    box-shadow: 1px 1px 1px #828282;
    border: 1px solid #8A8A8A;
    height: 24px;
    width: 35px;
    border-radius: 6px;
    background: #DADADA;
    cursor: pointer;
}
.slider::-ms-track {
    width: 98%;
    height: 16px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
}
.slider:focus::-ms-fill-lower {
    background: #B6B6B6;
}
.slider:focus::-ms-fill-upper {
    background: #B6B6B6;
}
</style>