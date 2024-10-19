import api, { tagsApi } from "@/api";
import type { GalleryShowMode, Gallery, PickerSettings, TagWithCount } from "@/models";
import { ref, watch, computed } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { DEFAULT_SHOW_MODE, defaultSettings } from "@/utils";
import { getGalleriesSettings } from "@/storage";

// types
export interface SidenavGallery extends Gallery {
  showMode: GalleryShowMode;
  isFilter:  boolean
}

export interface FavGallery  {
  showMode: GalleryShowMode;
  isFilter:  boolean
}

export default function useSidenav() {
  // data
  const settings = ref<PickerSettings>(defaultSettings());
  const galleries = ref<SidenavGallery[]>([]);
  const favGallery = ref<FavGallery>({showMode: DEFAULT_SHOW_MODE, isFilter:false})

  const tags = ref<TagWithCount[]>()
  const selectedTags = ref<number[]>([])
  const multiSelectTags = ref(false)

  const currentTab = ref<"galleries" | "filter">("galleries")
  const filterShowMode = ref<GalleryShowMode>(DEFAULT_SHOW_MODE)

  // store
  const settingsStore = useSettingsStore();
  //const {settings} = storeToRefs(settingsStore)

  // watchers
  watch(()=>selectedTags.value.length>0, ()=>{
    settings.value.selectedGallery = ""
    settings.value.showMode = DEFAULT_SHOW_MODE
    settings.value.favoriteImagesMode = false
  })

  watch(filterShowMode, async ()=> {
    tags.value = await tagsApi.list("*", filterShowMode.value) as TagWithCount[] 
  })

  watch(multiSelectTags, ()=> {
    if (!multiSelectTags) {
      if(selectedTags.value.length >1) {
        selectedTags.value.length = 1
      }
    }
  })

  // computed
  const multiSelectTagsLabel = computed(()=>{
    return multiSelectTags.value ? "Many": "One"
  })
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
    settings.value = await api.getSettings()
    
    favGallery.value.showMode = settings.value.showMode
    filterShowMode.value = settings.value.showMode

    switch (currentTab.value) {
      case "galleries":
        const galls = await api.getGalleries()
        // set show mode from settings and sort
        const galleriesSettings = getGalleriesSettings()
        
        galleries.value = sortGalleries(
          galls.map(
            (g): SidenavGallery => {
              return { ...g, showMode: galleriesSettings[g.slug]?.lastShowMode || DEFAULT_SHOW_MODE,
                isFilter: galleriesSettings[g.slug]?.filter?.tags?.length || 0 > 0 ? true: false
               }
            })
        )
        break;
      case "filter":
        tags.value = await tagsApi.list("*", settings.value.showMode) as TagWithCount[] 
        //filter tags by id
        if (!selectedTags.value.length) {
          const ss:number[] = []
          for(let [idx, tag] of tags.value.entries()) {
            
            if (settings.value.selectedTags.includes(tag.id)) {
              ss.push(idx)
            }
          }
          selectedTags.value = ss
        }
        break;
      default:
        break;
    }





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
    // disable selected tags
    selectedTags.value = []
  }

  // selects certain gallery show mode
  function selectGalleryShowMode(
    gallery_id: string,
    showMode: GalleryShowMode
  ) {
    galleries.value.find((g) => g.slug === gallery_id)!.showMode = showMode;

    // TODO why??
    //settings.value.selectedGallery = gallery_id;
    //settings.value.showMode = showMode;
  }

  function selectFavShowMode(showMode: GalleryShowMode) {
    favGallery.value.showMode = showMode
  }

  function selectFav() {
    settings.value.favoriteImagesMode = true;
    settings.value.showMode = favGallery.value.showMode
    settings.value.selectedGallery = ""
    selectedTags.value = []
  }

  async function pinUnpinGallery(gallery_id: string, pin: boolean) {
    const gallery = await api.pinUnpinGallery(gallery_id, pin);
    galleries.value.find((g) => g.slug === gallery_id)!.pinned = gallery.pinned;
    galleries.value = sortGalleries(galleries.value);
  }

  async function saveSettings() {
    
    if(settings.value.selectedGallery) {
      // fill show mode from selected gallery
      settings.value.showMode = galleries.value.find(
        (g) => g.slug === settings.value.selectedGallery
      )!.showMode;
    } else if (settings.value.favoriteImagesMode) {
      settings.value.showMode = favGallery.value.showMode
    } else {
      settings.value.showMode = filterShowMode.value
    }
    settings.value.selectedTags = selectedTags.value.map(t=>tags.value![t].id)
    await settingsStore.saveSettings(settings.value);
  }

  return {
    settings,
    galleries,
    favGallery,
    selectGallery,
    selectGalleryShowMode,
    selectFavShowMode,
    selectFav,
    fetchData,
    saveSettings,
    pinUnpinGallery,
    tags,
    selectedTags,
    currentTab,
    filterShowMode,
    multiSelectTags,
    multiSelectTagsLabel,
  };
}
