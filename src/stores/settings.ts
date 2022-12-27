import { defineStore } from "pinia";
import api from '@/api'
import { GalleryShowMode, isPickerSettingsEqual, type PickerSettings } from "@/models";
import { ref } from "vue";

export const useSettingsStore = defineStore("settings", () => {
    // state
    let settings = ref<PickerSettings>({selectedGallery:'', showMode:GalleryShowMode.All});

    // actions
  async function fetchSettings() {
    const data = await api.getSettings();
    if (!data.selectedGallery) {
      throw new Error("Pick gallery in sidenav")
    }
    settings.value = data;
  }

  async function saveSettings(newSettings:PickerSettings) {
    if (isPickerSettingsEqual(settings.value, newSettings)) {
      return;
    }

    settings.value = await api.saveSettings(newSettings);

  }
  return {settings, fetchSettings, saveSettings}
}) 