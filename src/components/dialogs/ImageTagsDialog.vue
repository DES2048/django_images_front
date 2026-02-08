<script setup lang="ts">
/* __placeholder__ */
import api, { tagsApi } from '@/api';
import type { Tag } from '@/models';
import { useDialog } from '@/composables/Dialog';
import { useImagesStore } from '@/stores/images';
import { onBeforeMount, ref } from 'vue';

const props = defineProps<{
  guid: string,
}>()

// stores
const imagesStore = useImagesStore()
// data
const tags = ref<Tag[]>([])
const selectedTags = ref<number[]>([])
const { isOpened,close } = useDialog(props.guid)

onBeforeMount( async()=> {
        tags.value = await tagsApi.list()
        const tagsData = await api.getImageTags(imagesStore.currentGallery, imagesStore.currentImage.name)

        for(let tag of tagsData){
            const idx = tags.value.findIndex((t)=>t.id ===tag.id)
            if(idx>=0) {
                selectedTags.value.push(idx)
            }
        }

})

async function handle() {
    const tagsToUpdate = selectedTags.value.map((t)=>tags.value[t])
    await api.updateImageTags(imagesStore.currentGallery, imagesStore.currentImage.name, tagsToUpdate)

  close()
}

</script>
<template>
    <v-dialog v-model="isOpened">
        <template v-slot:default="{ isActive }">
                <v-card title="Edit tags">
                  <v-divider/>
                  <v-card-text>
                    <v-chip-group v-model="selectedTags" selected-class="text-primary" column multiple
                    center-active>
                        <v-chip v-for="tag in tags" :key="tag.id" variant="outlined" filter>
                            {{ tag.name }}
                        </v-chip>
                    </v-chip-group>
                  </v-card-text>
                  <v-divider/>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text="Close" @click="close" />
                        <v-btn text="Save" @click="handle" />
                    </v-card-actions>
                </v-card>
        </template>
    </v-dialog>
</template>
