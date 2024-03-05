import type { GalleriesLocalSettings, GallerySettings } from "./models"
import { DEFAULT_SHOW_MODE } from "./utils"

export function getObjectFromStorage<T>(key:string, defaultValue?:T): T|undefined {
    const str = localStorage.getItem(key)
    if (!str) {
        return defaultValue
    }
    
    return JSON.parse(str) as T
}

export function setObjectToStorage<T>(key:string, obj:T) {
    localStorage.setItem(key, JSON.stringify(obj))
}

export function saveGallerySettings(galleryId:string, settings: Partial<GallerySettings>) {
    let locSettings = getGalleriesSettings()
    
    locSettings[galleryId] = locSettings[galleryId] ? {...locSettings[galleryId], ...settings}
        : {lastShowMode: DEFAULT_SHOW_MODE, shufflePicsWhenLoaded: false, ...settings}

    setObjectToStorage("galleries-settings", locSettings)
}

export function getGalleriesSettings(): GalleriesLocalSettings {
    return getObjectFromStorage<GalleriesLocalSettings>("galleries-settings", {})!
}