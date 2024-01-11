import api from "@/api";
import type { GalleryShowMode, Gallery, PickerSettings } from "@/models";
import { ref } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { defaultSettings } from "@/utils";

// types
export interface SidenavGallery extends Gallery {
  showMode: GalleryShowMode;
}

export default function useSidenav() {
  // data
  const settings = ref<PickerSettings>(defaultSettings());
  const galleries = ref<SidenavGallery[]>([]);

  // store
  const settingsStore = useSettingsStore();
  //const {settings} = storeToRefs(settingsStore)

  // methods
  function sortGalleries(galleries: SidenavGallery[]): SidenavGallery[] {
    const outGalleries: SidenavGallery[] = [];
    // move selected on top if any
    if (settings.value.selectedGallery !== "") {
      const idx = galleries.findIndex(
        (g) => g.slug === settings.value.selectedGallery
      );
      if (idx >= 0) {
        outGalleries[0] = galleries.splice(idx, 1)[0];
      }
    }
    // move pinned next if any
    const pinned = galleries.filter((g) => g.pinned);
    if (pinned.length > 0) {
      outGalleries.push(...pinned);
    }
    // add rest of galleries
    const rest = galleries.filter((g) => !g.pinned);
    if (rest.length > 0) {
      outGalleries.push(...rest);
    }
    return outGalleries;
  }

  async function fetchData() {
    let [galls, settingsData] = await Promise.all([
      api.getGalleries(),
      api.getSettings(),
    ]);
    settings.value = settingsData;

    // set show mode from settings and sort
    galleries.value = sortGalleries(
      galls.map(
        (g): SidenavGallery => ({ ...g, showMode: settings.value.showMode })
      )
    );

    /* if selected gallery present move it on top of list
      if (settings.value.selectedGallery !== "") {
        const idx = galls.findIndex((g)=>g.slug===settings.value.selectedGallery)
        if (idx>=0) {
          const elem = galls[idx]
          galls.splice(idx,1)
          galls.unshift(elem)
        }
      } */
  }

  // events
  function selectGallery(gallery_id: string) {
    settings.value.favoriteImagesMode = false;
    settings.value.selectedGallery = gallery_id;
    settings.value.showMode = galleries.value.find(
      (g) => g.slug === gallery_id
    )!.showMode;
  }

  function selectGalleryShowMode(
    gallery_id: string,
    showMode: GalleryShowMode
  ) {
    galleries.value.find((g) => g.slug === gallery_id)!.showMode = showMode;

    settings.value.selectedGallery = gallery_id;
    settings.value.showMode = showMode;
  }

  async function pinUnpinGallery(gallery_id: string, pin: boolean) {
    const gallery = await api.pinUnpinGallery(gallery_id, pin);
    galleries.value.find((g) => g.slug === gallery_id)!.pinned = gallery.pinned;
    galleries.value = sortGalleries(galleries.value);
  }

  async function saveSettings() {
    if (!settings.value.selectedGallery && !settings.value.favoriteImagesMode) {
      return;
    }

    await settingsStore.saveSettings(settings.value);
  }

  return {
    settings,
    galleries,
    selectGallery,
    selectGalleryShowMode,
    fetchData,
    saveSettings,
    pinUnpinGallery,
  };
}
