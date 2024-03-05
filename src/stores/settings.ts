import { ref } from "vue";
import { defineStore } from "pinia";
import api from '@/api'
import { isPickerSettingsEqual, type PickerSettings } from "@/models";
import { defaultSettings } from "@/utils";

const SETTINGS_KEY = "settings"


export const useSettingsStore = defineStore("settings", () => {
  // state
  let settings = ref<PickerSettings>(defaultSettings());

  // actions
  async function fetchSettings() {
    // get local settings if any
    const settingsStr = localStorage.getItem(SETTINGS_KEY)
    let localSettings;
    let data;
    if (settingsStr) {
      localSettings = <PickerSettings>JSON.parse(settingsStr)
      data = localSettings
    } else {
      data = await api.getSettings();
    }
    
    if (!data.selectedGallery && !data.favoriteImagesMode) {
      throw new Error("Pick gallery in sidenav")
    } else if(!localSettings) { // settings valid
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data))
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
  }

  return { settings, fetchSettings, saveSettings }
}) 