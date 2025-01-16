<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useWebRTC } from '@/composables/useWebRTC';
import { useWebRTCStore } from '@/stores/webrtcStore';
import { useRouter } from 'vue-router';

const webRTC = reactive(useWebRTC())
const store = useWebRTCStore()
const router = useRouter()

const id = ref('')

async function connect() {
  await webRTC.connectToPeer(id.value.trim());
  router.push('/estimate')
}
</script>

<template>
  <main
    class="max-h-screen max-w-screen h-screen w-screen bg-gradient-to-br from-[#353b68] to-[#212543] flex flex-col justify-start items-center relative">
    <h1 class="mt-20 text-3xl font-bold text-white ">♠️ Ace Teamate</h1>

    <div class="absolute flex flex-row items-center justify-center space-x-2 top-2 left-2" v-if="store.isInitialized">
      <img :src="`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${store.username}`"
        class="max-w-10 rounded-2xl  shadow-[#191c35] w-full">
      <p class="text-white">{{ store.username }}</p>
    </div>

    <div class="flex flex-col items-center justify-start w-full h-full pt-16 space-y-6" v-if="!store.isInitialized">
      <img :src="`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${store.username}`"
        class="max-w-40 rounded-2xl shadow-lg shadow-[#191c35] w-full">

      <input type="text"
        class="bg-[#40477a] shadow-2xl outline-none font-bold text-sm text-white shadow-[#191c35] py-2 px-6 rounded-lg"
        v-model="store.username" placeholder="Enter your name ...">

      <button @click="webRTC.initialize" :class="{ 'bg-[#266092]': store.username.length == 0 }"
        :disabled="store.username.length == 0"
        class="text-white text-bold bg-[#46a6f8] px-4 py-2 rounded-lg">Enter</button>
    </div>

    <div class="flex flex-col items-center justify-start w-full h-full pt-12 space-y-8" v-else>
      <div class="flex flex-col items-center justify-center w-full space-y-6">
        <img :src="store.qrcode" alt="QR Code" class="max-w-40 rounded-3xl shadow-lg shadow-[#191c35] w-full">

        <div class="flex flex-row items-center justify-center w-full space-x-1">
          <input type="text"
            class="bg-[#40477a] shadow-2xl outline-none font-bold text-sm text-white shadow-[#191c35] py-2 px-6 rounded-lg w-5/6"
            v-model="id" placeholder="Enter the host id ...">

          <button @click="connect"
            class="text-white aspect-square text-sm text-bold font-extrabold bg-[#6a59ff] rounded-lg shadow-2xl shadow-[#191c35] p-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54"
                stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2 12H14.88" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M12.65 8.6499L16 11.9999L12.65 15.3499" stroke="#ffffff" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <button @click="connect"
          class="text-white text-xl text-bold font-extrabold bg-[#794DE3] px-14 py-2 rounded-lg shadow-2xl shadow-[#191c35] flex flex-row items-center space-x-2 justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M2 9V6.5C2 4.01 4.01 2 6.5 2H9" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M15 2H17.5C19.99 2 22 4.01 22 6.5V9" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M22 16V17.5C22 19.99 19.99 22 17.5 22H16" stroke="#ffffff" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9 22H6.5C4.01 22 2 19.99 2 17.5V15" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
            <path
              d="M8.5 11C9.88071 11 11 9.88071 11 8.5C11 7.11929 9.88071 6 8.5 6C7.11929 6 6 7.11929 6 8.5C6 9.88071 7.11929 11 8.5 11Z"
              stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path
              d="M7.5 18C8.32843 18 9 17.3284 9 16.5C9 15.6716 8.32843 15 7.5 15C6.67157 15 6 15.6716 6 16.5C6 17.3284 6.67157 18 7.5 18Z"
              stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path
              d="M16.5 9C17.3284 9 18 8.32843 18 7.5C18 6.67157 17.3284 6 16.5 6C15.6716 6 15 6.67157 15 7.5C15 8.32843 15.6716 9 16.5 9Z"
              stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path
              d="M15.5 18C16.8807 18 18 16.8807 18 15.5C18 14.1193 16.8807 13 15.5 13C14.1193 13 13 14.1193 13 15.5C13 16.8807 14.1193 18 15.5 18Z"
              stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>Scan room</span>
        </button>

      </div>
      <span class="text-[#626a9e] font-medium">Or</span>

      <button @click="router.push('/estimate')"
        class="text-white text-xl text-bold font-extrabold bg-[#46a6f8] px-14 py-2 rounded-lg shadow-2xl shadow-[#191c35] flex flex-row items-center space-x-2 justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M23 18C23 18.75 22.79 19.46 22.42 20.06C22.21 20.42 21.94 20.74 21.63 21C20.93 21.63 20.01 22 19 22C17.78 22 16.69 21.45 15.97 20.59C15.95 20.56 15.92 20.54 15.9 20.51C15.78 20.37 15.67 20.22 15.58 20.06C15.21 19.46 15 18.75 15 18C15 16.74 15.58 15.61 16.5 14.88C17.19 14.33 18.06 14 19 14C20 14 20.9 14.36 21.6 14.97C21.72 15.06 21.83 15.17 21.93 15.28C22.59 16 23 16.95 23 18Z"
            stroke="#ffffff" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M20.49 17.98H17.51" stroke="#ffffff" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"
            stroke-linejoin="round" />
          <path d="M19 16.52V19.51" stroke="#ffffff" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"
            stroke-linejoin="round" />
          <path d="M3.17004 7.43994L12 12.5499L20.7701 7.46991" stroke="#ffffff" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round" />
          <path d="M12 21.6099V12.5399" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round" />
          <path
            d="M21.61 9.17V14.83C21.61 14.88 21.61 14.92 21.6 14.97C20.9 14.36 20 14 19 14C18.06 14 17.19 14.33 16.5 14.88C15.58 15.61 15 16.74 15 18C15 18.75 15.21 19.46 15.58 20.06C15.67 20.22 15.78 20.37 15.9 20.51L14.07 21.52C12.93 22.16 11.07 22.16 9.93001 21.52L4.59001 18.56C3.38001 17.89 2.39001 16.21 2.39001 14.83V9.17C2.39001 7.79 3.38001 6.11002 4.59001 5.44002L9.93001 2.48C11.07 1.84 12.93 1.84 14.07 2.48L19.41 5.44002C20.62 6.11002 21.61 7.79 21.61 9.17Z"
            stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Create room</span>
      </button>
    </div>
  </main>
</template>
