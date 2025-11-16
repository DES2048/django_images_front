<script setup lang="ts">
import type { PickerSettings } from '@/models';
import { useSettingsStore } from '@/stores/settings';
import { defaultSettings } from '@/utils';
import { onBeforeMount, ref } from 'vue';
import { useDialog } from "@/composables/Dialog";

const props = defineProps<{
  guid: string
}>()

const settings = ref<PickerSettings>(defaultSettings())
const settingsStore = useSettingsStore()
const { isOpened, close } = useDialog(props.guid)

onBeforeMount(()=> {
    settings.value = {
    ...settingsStore.settings
    }
})

async function handleSaveSettings() {
  await settingsStore.saveSettings(
    {
      ...settingsStore.settings,
      ...settings.value
    }
  )
  close()
}

</script>

<template>
  <v-dialog v-model="isOpened">
    <v-card title="Settings">
      <v-checkbox v-model="settings.shufflePicsWhenLoaded" label="Shuffle pics when gallery loaded"></v-checkbox>
      <v-card-actions>
        <v-spacer/>
        <v-btn text="Close" @click="close"></v-btn>
        <v-btn text="Save" @click="handleSaveSettings"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
