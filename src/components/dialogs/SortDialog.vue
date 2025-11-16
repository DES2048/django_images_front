<script setup lang="ts">
import { useDialog } from '@/composables/Dialog';
import { onBeforeMount, ref } from 'vue';

const props = defineProps<{
  guid:string,
  sortFields: string[],
  selField: string
}>()

const  emit = defineEmits<{
  submit: [field:string]
}>();

const {isOpened, close } = useDialog(props.guid)
const selField = ref("")

onBeforeMount(()=>{
  selField.value = props.selField
})

function handle() {
  emit("submit", selField.value)
  close()
}
</script>

<<template>
  <v-dialog v-model="isOpened">
    <v-card title="Sort settings">
      <v-card-text>
        <v-select :items="props.sortFields" v-model="selField" label="Field"></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text="Close" @click="close"></v-btn>
        <v-btn text="OK" @click="handle"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
