import { beforeEach, describe, it, expect, vi, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useImagesStore, compareValues } from './images'
import { useSettingsStore } from './settings'
import { GalleryShowMode, type ImageInfo } from '@/models';



beforeAll(() => {
    vi.mock("@/api", () => {
        const apiMock = {
            getImages: vi.fn(async (g: string, ss: GalleryShowMode) => {
                if (g === 'empty') {
                    return Promise.resolve([] as ImageInfo[])
                }
                return Promise.resolve([
                    {
                        name: "1",
                        url: "1.jpg",
                        marked: false,
                        mod_date: 1000
                    },
                    {
                        name: "2",
                        url: "2.jpg",
                        marked: false,
                        mod_date: 2000
                    }
                ] as ImageInfo[])
            }),
            markImage: vi.fn(async (g: string, name: string) => {
                return Promise.resolve({
                    name,
                    url: "1.jpg",
                    marked: true,
                    mod_date: 1000
                });
            }),
            deleteImage: vi.fn(async (g: string, ss: GalleryShowMode) => {
                return { ok: true }
            })
        }
        return { default: apiMock }
    });
    return () => {
        vi.unmock("@/api")
    }
});

describe("images store", () => {

    beforeEach(() => {
        // creates a fresh pinia and make it active so it's automatically picked
        // up by any useStore() call without having to pass it to it:
        // `useStore(pinia)`
        setActivePinia(createPinia())
    })

    it("compareValues()", () => {
        // compare numbers
        expect(compareValues(1, 1)).toBe(0)
        expect(compareValues(1, 2)).toBe(-1)
        expect(compareValues(2, 1)).toBe(1)

        // compare numbers inverted
        expect(compareValues(1, 1, true)).toBe(0)
        expect(compareValues(1, 2, true)).toBe(1)
        expect(compareValues(2, 1, true)).toBe(-1)
    })
    it("initial state", () => {
        const imagesStore = useImagesStore()
        expect(imagesStore.images).toStrictEqual([])
        expect(imagesStore.currentImageIndex).toBe(-1)
        expect(imagesStore.currentImage).toBe(undefined)
    })

    it("fetch images smoke", async () => {
        const imagesStore = useImagesStore()

        await imagesStore.fetchImages("hello", GalleryShowMode.Unmarked);
        // check images is loading
        expect(imagesStore.images.length).toBe(2)
        //check sorting
        expect(imagesStore.images[0].mod_date).toBe(2000);
        expect(imagesStore.images[1].mod_date).toBe(1000);
        //check current imageIndex
        expect(imagesStore.currentImageIndex).toBe(0);
        //check current image
        expect(imagesStore.currentImage.name).toBe("2");
    })

    it("fetch empty gallery", async () => {
        const imagesStore = useImagesStore()

        await expect(imagesStore.fetchImages("empty", GalleryShowMode.Unmarked)).rejects
            .toThrowError("selected gallery did't return any image");

    })

    it("next image", async () => {
        const imagesStore = useImagesStore()

        await imagesStore.fetchImages("hello", GalleryShowMode.Unmarked);

        imagesStore.nextImage();
        expect(imagesStore.currentImageIndex).toBe(1);
        // check last index
        imagesStore.nextImage();
        expect(imagesStore.currentImageIndex).toBe(1);
    })

    it("prev image", async () => {
        const imagesStore = useImagesStore()

        await imagesStore.fetchImages("hello", GalleryShowMode.Unmarked);

        imagesStore.nextImage();
        imagesStore.prevImage();
        expect(imagesStore.currentImageIndex).toBe(0);
        // check first index not change
        imagesStore.prevImage();
        expect(imagesStore.currentImageIndex).toBe(0);
    })

    it("mark current image show all", async () => {
        const imagesStore = useImagesStore()
        const settingsStore = useSettingsStore()

        await imagesStore.fetchImages("hello", GalleryShowMode.All);
        settingsStore.settings = {
            showMode: GalleryShowMode.All,
            selectedGallery: "hello"
        }

        await imagesStore.markCurrentImage();
        // check image is marked
        expect(imagesStore.images[0].marked).toBe(true)

    })

    it("mark current image show unmarked", async () => {
        const imagesStore = useImagesStore()
        const settingsStore = useSettingsStore()

        await imagesStore.fetchImages("hello", GalleryShowMode.Unmarked);
        settingsStore.settings = {
            showMode: GalleryShowMode.Unmarked, // only unmarked shown
            selectedGallery: "hello"
        }

        await imagesStore.markCurrentImage();
        // check lenght is 0
        expect(imagesStore.images.length).toBe(1);

    })

    it("delete image", async () => {
        const imagesStore = useImagesStore()

        await imagesStore.fetchImages("hello", GalleryShowMode.Unmarked);
        const initialImagesLength = imagesStore.images.length;
        const imageForDelete = imagesStore.currentImage

        // delete from index 0
        await imagesStore.deleteCurrentImage()

        // check length decreased by 1
        expect(imagesStore.images.length).toBe(initialImagesLength - 1);
        // check no deleted image in images
        expect(imagesStore.images.find(el => el.name === imageForDelete.name)).toBe(undefined);
    })
})