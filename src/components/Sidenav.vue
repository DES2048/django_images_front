<script setup lang="ts">
    /*
        Функциональность
        1) открытие/закрытие по пропсу
        2) уведомление о закрытии по кнопке
        3) при открытии загрузка настроек и списка галерей
        4) при сохранении проверка валидности настроек
        5) запись галереи и show_mode в настройки
        6) в вотче очиста списка галерей, при закрытии
    */

    import api from '@/api';
    import { GalleryShowMode, type PickerSettings, type Gallery } from '@/models';
    import { ref, watch } from 'vue';
    import { useSettingsStore } from '@/stores/settings';

    // props
    const props = defineProps<{
        isOpen: boolean
    }>();

    // emits
    const emit = defineEmits(["onSettingsSave", "onClose"]);

    // data
    const settings = ref<PickerSettings>({selectedGallery:"", showMode:GalleryShowMode.All})
    const galleries = ref<Gallery[]>([])
    
    // watch
    watch(()=>props.isOpen, async (openValue) =>{
        if (openValue) {
            const [galls, settingsData] = await Promise.all([
                api.getGalleries(), api.getSettings()
            ]);

            settings.value = settingsData;
            galleries.value = galls;
        } else {
            galleries.value = []
        }
    });
    
    // events
    function handleGalleryClick(gallery_id:string) {
        settings.value.selectedGallery = gallery_id
    }

    async function handleSettingsSave() {
        const settingsStore = useSettingsStore()
        await settingsStore.saveSettings(settings.value);
        
        emit("onSettingsSave");
    }
</script>

<template>
    <div class="sidenav" :class="{'sidenav-open':isOpen}">
      <div class="sidenav-content">
        <div class="sidenav-title">
          <h2>Settings</h2>
          <a href="#" class="closebtn" id="sidenavClose" @click="$emit('onClose')">&times;</a>
        </div>
        <div class="show-mode">
          <span>Show:</span>
          <select id="showMode" v-model="settings.showMode">
            <option value="unmarked">Unmarked</option>
            <option value="marked">Marked</option>
            <option value="all">All</option>
          </select>
        </div>
        <div class="galleries-container">
          <a v-for="gallery in galleries" :key="gallery.slug"
            :class="{selected: gallery.slug === settings.selectedGallery}"
            @click="handleGalleryClick(gallery.slug)">{{gallery.title}}</a>
        </div>
        <a id="btnSave" @click="handleSettingsSave">Save</a>
      </div>
    </div>
</template>

<style scoped>
/* sidenav */

.sidenav {
  height: 100vh; /* 100% Full-height */
  width: 0;
  max-width: 0;
  position: fixed; /* Stay in place */
  z-index: 1; /* Stay on top */
  top: 0; /* Stay at the top */
  left: 0;
  overflow: hidden; /* Disable horizontal scroll */
  transition: 0.5s; /* 0.5 second transition effect to slide in the sidenav */
}
.sidenav-open {
  box-sizing: border-box;
  width: 100%;
  max-width: 430px;
}
.sidenav-content {
  padding: 10px 10px 10px 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: black; /* Black*/
  color: #818181;
}

.sidenav-content a {
  text-decoration: none;
  color: #818181;
  cursor: pointer;
}

.sidenav-content a:hover {
  color: #f1f1f1;
}

.sidenav-title {
  display: flex;
  align-items: center;
  font-size: 25px;
  padding-bottom: 10px;
}
.sidenav-title h2 {
  margin: 0;
  font-size: 25px;
}

/* Position and style the close button (top right corner) */
.sidenav-title .closebtn {
  font-size: 30px;
  margin-left: auto;
  font-weight: 600;
}

.galleries-container {
  flex: 1 1 auto;
  max-height: calc(100vh - 120px);
  /*overflow-y: auto; */
}
/* The navigation menu links */
.galleries-container a {
  padding: 8px 0px 8px 8px;
  font-size: 25px;
  display: block;
  transition: 0.3s;

}

.simplebar-scrollbar::before {
  background-color: #818181;
}
.show-mode {
  display: flex;
  padding: 0 0px 8px 0px;
  align-items: center;
}

.galleries-container a.selected {
  border: 1px solid #f1f1f1;
}
/* When you mouse over the navigation links, change their color */

#btnSave {
  font-size: 30px;
}
.show-mode select {
  flex-grow: 1;
  margin-left: 5px;
}
</style>