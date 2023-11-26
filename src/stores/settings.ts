import { ref } from "vue";
import { defineStore } from "pinia";
import api from '@/api'
import { isPickerSettingsEqual, type PickerSettings } from "@/models";
import { defaultSettings } from "@/utils";


export const useSettingsStore = defineStore("settings", () => {
  // state
  let settings = ref<PickerSettings>(defaultSettings());

  // actions
  async function fetchSettings() {
    const data = await api.getSettings();
    if (!data.selectedGallery && !data.favoriteImagesMode) {
      throw new Error("Pick gallery in sidenav")
    }
    settings.value = data;
  }

  async function saveSettings(newSettings: PickerSettings) {
    if (isPickerSettingsEqual(settings.value, newSettings)) {
      return;
    }

    settings.value = await api.saveSettings(newSettings);

  }
  return { settings, fetchSettings, saveSettings }
}) 