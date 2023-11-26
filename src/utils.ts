import { GalleryShowMode, type PickerSettings } from "./models";

export function compareValues<T extends number | string >(a: T, b: T, invert?: boolean): number {
  let cmp_result = 0;
  if (a == b) {
    cmp_result = 0;
  } else if (a < b) {
    cmp_result = -1;
  } else {
    cmp_result = 1;
  }
  // if need inversion return inverted value, ottherwise return cmp_result itself
  return (cmp_result && invert) ? -cmp_result : cmp_result;
}

export function shuffleArray(array: any[]) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function defaultSettings(): PickerSettings {
  return {
    selectedGallery: '', 
    showMode: GalleryShowMode.All,
    favoriteImagesMode: false
  }
}