<script setup lang="ts">
interface Prop {
    name: string
}
defineProps<Prop>()
</script>

<template>
    <div class="flex flex-col items-center">
        <img :src="`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${name}`"
            class="max-w-10 rounded-2xl shadow-lg shadow-[#191c35] w-full">
        <span class="text-[#bcbfd8] font-bold text-xs">{{ name }}</span>
    </div>
</template>