import { ref } from "vue";
import { defineStore } from "pinia";
import api from '@/api'
import { isPickerSettingsEqual, type PickerSettings } from "@/models";
import { defaultSettings } from "@/utils";
import { getObjectFromStorage, saveGallerySettings, setObjectToStorage } from "@/storage";

const SETTINGS_KEY = "settings"


export const useSettingsStore = defineStore("settings", () => {
  // state
  let settings = ref<PickerSettings>(defaultSettings());

  // actions
  async function fetchSettings() {
    // get local settings if any

    let data;
    const localSettings = getObjectFromStorage<PickerSettings>(SETTINGS_KEY)
    if (localSettings) {
      data = localSettings
    } else {
      data = await api.getSettings();
    }

    if (!data.selectedGallery && !data.favoriteImagesMode) {
      throw new Error("Pick gallery in sidenav")
    }

    if (!localSettings) { // settings valid
      setObjectToStorage(SETTINGS_KEY, data)
    }
    // set gallery settings
    if (!data.favoriteImagesMode) {
      saveGallerySettings(data.selectedGallery, {
        lastShowMode: data.showMode,
      })
    }

    settings.value = data;
  }

  async function saveSettings(newSettings: PickerSettings) {
    if (isPickerSettingsEqual(settings.value, newSettings)) {
      return;
    }

    settings.value = await api.saveSettings(newSettings);
    // store settings to local storage
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value));
    if(!settings.value.favoriteImagesMode) {
      saveGallerySettings(settings.value.selectedGallery, {
        lastShowMode: settings.value.showMode})
    }
  }

  return { settings, fetchSettings, saveSettings }
}) 