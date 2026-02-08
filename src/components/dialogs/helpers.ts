import { useDialogStore } from "@/stores";
import AddEditGalleryDialog from "./AddEditGalleryDialog.vue";
import GalleryFilterDialog from "./GalleryFilterDialog.vue";


export function createAddEditGalleryDialog(props: { galleryId?: string, addMode: boolean }) {
  const dialogStore = useDialogStore()
  dialogStore.createDialog(AddEditGalleryDialog, {
    galleryId: props.galleryId,
    addMode: props.addMode
  })
}

export function createGalleryFilterDialog(props: { galleryId: string }) {
  const dialogStore = useDialogStore()
  dialogStore.createDialog(GalleryFilterDialog, { galleryId: props.galleryId })
}
