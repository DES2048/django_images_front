import { defineStore } from "pinia";
import { readonly, ref } from "vue";

export const useUiStore = defineStore("sidenav", () => {
  const openSidenav = ref(false)
  const _panelsVisible = ref(true)
  const panelsVisible = readonly(_panelsVisible)

  function togglePanels() {
    _panelsVisible.value = !panelsVisible.value
  }

  return {
    openSidenav, togglePanels, panelsVisible,
  }
})
