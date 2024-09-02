<script setup lang="ts">
/* __placeholder__ */
import { watchEffect } from 'vue';
import { useUiStore } from '@/stores/ui';
import useImagesFilter from '@/composables/useImagesFilter'

const uiStore = useUiStore()

const {
    tags,
    selectedTags,
    fetchData,
    handleSave,
    resetSelectedTags
} = useImagesFilter()



watchEffect(async () => {
    if (uiStore.openGalleryFilter) {
        fetchData()
    }
})

</script>
<template>
    <v-dialog v-model="uiStore.openGalleryFilter">
        <template v-slot:default>
            <v-form @submit.prevent="handleSave">
                <v-card title="Gallery filter">
                    <v-chip-group v-if="tags.length>0" v-model="selectedTags" selected-class="text-primary" column multiple
                    center-active>
                        <v-chip v-for="tag in tags" :key="tag.id" variant="outlined" filter>
                            {{ tag.images_count }} {{ tag.name }}
                        </v-chip>
                    </v-chip-group>
                    <div v-else>
                        <h4>No tags for this gallery filter</h4>
                    </div>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text="Reset" @click="resetSelectedTags" />
                        <v-btn text="Close" @click="uiStore.closeGalleryFilter" />
                        <v-btn text="Save" @click="handleSave" />
                    </v-card-actions>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>