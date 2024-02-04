<script setup lang="ts">
import type { PickerSettings } from '@/models';
import { useSettingsStore } from '@/stores/settings';
import { useUiStore } from '@/stores/ui';
import { defaultSettings } from '@/utils';
import { ref, watch } from 'vue';

const settings = ref<PickerSettings>(defaultSettings())
const settingsStore = useSettingsStore()
const uiStore = useUiStore()

watch(()=>uiStore.openSettings, (value)=> {
  if(value) {
    settings.value = {
    ...settingsStore.settings
    }
  }
}, {immediate: true})

async function handleSaveSettings() {
  uiStore.openSettings = false;
  await settingsStore.saveSettings(
    {
      ...settingsStore.settings,
      ...settings.value
    }
  )
}
</script>

<template>
  <v-dialog v-model="uiStore.openSettings">
        <template v-slot:default="{ isActive }">
          <v-card title="Settings">
            
            <v-checkbox v-model="settings.shufflePicsWhenLoaded" label="Shuffle pics when gallery loaded"></v-checkbox>
            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn text="Close" @click="isActive.value = false"></v-btn>
              <v-btn text="Save" @click="handleSaveSettings"></v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
</template>