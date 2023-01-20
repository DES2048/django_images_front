import { defineStore } from "pinia";
import { ref } from "vue";

export const useSidenavStore = defineStore("sidenav", ()=> {
    const open = ref(false)
    return {
        open
    }
})