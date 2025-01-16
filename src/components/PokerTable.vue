<script setup lang="ts">
import { computed } from 'vue';
import PokerPlayer from './PokerPlayer.vue'
import type { PeerInfo } from "@/types/webrtc.ts";
import { useWebRTCStore } from '@/stores/webrtcStore';

interface Prop {
    users: PeerInfo[]
}
const props = defineProps<Prop>()
const store = useWebRTCStore()

const playersAlignment = computed(() => {
    let left: typeof props.users = [],
        center: typeof props.users = [],
        right: typeof props.users = []

    center.push({
        peerId: store.myPeerId,
        username: store.username
    })

    props.users.forEach((_, i) => {
        if (i === 0) {
            center.push(props.users[i])
        } else if (i % 2 === 0) {
            left.push(props.users[i])
        } else {
            right.push(props.users[i])
        }
    });

    return {
        left,
        center,
        right
    }
})

function spaceClass(count: number) {
    if (count === 2) return 'space-y-40'
    if (count === 3) return 'space-y-20'
    if (count === 4) return 'space-y-10'
    if (count >= 5) return 'space-y-5'
    return 'space-y-1'
}
</script>

<template>
    <div
        class="relative bg-gradient-to-b from-[#363c67] to-[#343966] w-3/4 h-4/5 shadow-2xl shadow-[#191c35] rounded-full p-1">
        <div class="bg-gradient-to-b from-[#343964] to-[#2b3057] w-full h-full shadow-inner rounded-full p-4">
            <div class="bg-gradient-to-b from-[#40477a] to-[#303762] w-full h-full shadow-sm shadow-[#191c35] rounded-full"
                id="board">
                <div
                    class="w-full h-full bg-gradient-to-b from-[#40477a] to-transparent from-[-50%] to-[150%] rounded-full">
                </div>
            </div>
        </div>

        <div class="absolute -top-[14px] -left-[18px] flex flex-row w-[112%] h-[108%]">
            <div :class="['flex flex-col items-start justify-center w-full', spaceClass(playersAlignment.left.length)]">
                <PokerPlayer v-for="user in playersAlignment.left" :key="user.peerId" :name="user.username" />
            </div>

            <div class="flex flex-col-reverse items-center justify-between w-full">
                <PokerPlayer v-for="user in playersAlignment.center" :key="user.peerId" :name="user.username" />
            </div>

            <div :class="['flex flex-col items-end justify-center w-full', spaceClass(playersAlignment.right.length)]">
                <PokerPlayer v-for="user in playersAlignment.right" :key="user.peerId" :name="user.username" />
            </div>
        </div>
    </div>
</template>