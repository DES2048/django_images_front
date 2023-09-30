<script setup lang="ts">
// props
defineProps<{
    value: any
    toggledValue: any
}>()
// emit
const emit = defineEmits<{
     (e: "onToggle", value: any):void
}>()
</script>

<template>
     <button class="action-button" :class="{active: value === toggledValue}"
            @click="emit('onToggle', value)"><slot></slot></button>
</template>

<style scoped>
.action-button {
    cursor: pointer;
    color: #818181;
    background-color: inherit;
    font-size: 0.75em;
    outline: none;
    border: none;
}

.active {
    border: 2px solid red;
}
</style>