import { computed, type Ref } from "vue"

export type AddEditParams = {
    title: {
        add: string,
        edit: string
    },
    submitButtonText?: {
        add?: string,
        edit?: string
    }
    isAddMode: Ref<boolean>
}
export default function useAddEdit(params: AddEditParams) {
    const title = computed(() => params.isAddMode ? params.title.add : params.title.edit)
    const submitButtonText = computed(() => params.isAddMode ? params.submitButtonText?.add ||"Add" 
        : params.submitButtonText?.edit || "Save")
    
    return {
        title,
        submitButtonText
    }
}
