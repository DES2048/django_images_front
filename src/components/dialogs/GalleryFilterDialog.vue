<script setup lang="ts">
/* __placeholder__ */
import { tagsApi } from '@/api';
import { GalleryShowMode, type TagWithCount } from '@/models';
import { useDialog } from '@/composables/Dialog';
import { useImagesStore } from '@/stores/images';
import { onBeforeMount, ref } from 'vue';
import { getGalleriesSettings, saveGallerySettings } from '@/storage';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  guid: string,
  galleryId: string
}>()

// stores
const imagesStore = useImagesStore()
const settingsStore = useSettingsStore()
const { isOpened,close } = useDialog(props.guid)

// data
const tags = ref<TagWithCount[]>([])
const selectedTags = ref<number[]>([])

onBeforeMount(async () => {
        // get gallery show_mode for tags image count stat
  const galleryId = props.galleryId

        const show_mode = settingsStore.settings.selectedGallery == galleryId ?
            settingsStore.settings.showMode : GalleryShowMode.All

        let tagsData = await tagsApi.list(galleryId, show_mode) as TagWithCount[]
        
        // get selected tags id from settings
        const galleriesSettings = getGalleriesSettings()
        const selTags = galleriesSettings[galleryId]?.filter?.tags

        tagsData = tagsData.filter((t:TagWithCount)=>t.images_count >0 || (selTags && selTags.includes(t.id)))
        
        if (selTags) {

            // fill selected tags
            for(let tagId of selTags){
                const idx = tagsData.findIndex((t)=>t.id ===tagId)
                if(idx>=0) {
                    selectedTags.value.push(idx)
                }
            }
        }

        tags.value = tagsData

})

function resetTags() {
    selectedTags.value = []
}

async function handle() {
    const tagsToUpdate = selectedTags.value.map((t)=>tags.value[t].id)
    saveGallerySettings(props.galleryId, {filter: {
        tags: tagsToUpdate
    }})
    imagesStore.imagesFilter.selectedTags = tagsToUpdate
    //await imagesStore.fetchImages()
  close()
}

</script>
<template>
    <v-dialog v-model="isOpened">
        <template v-slot:default>
            <v-form @submit.prevent="handle">
                <v-card title="Gallery filter">
                    <v-card-text>
                    <v-chip-group v-if="tags.length>0" v-model="selectedTags" selected-class="text-primary" column multiple
                    center-active>
                        <v-chip v-for="tag in tags" :key="tag.id" variant="outlined" filter>
                            {{ tag.images_count }} {{ tag.name }}
                        </v-chip>
                    </v-chip-group>
                    <div v-else>
                        <h4>No tags for this gallery filter</h4>
                    </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text="Reset" @click="resetTags" />
                        <v-btn text="Close" @click="close" />
                        <v-btn text="Save" @click="handle" />
                    </v-card-actions>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>
