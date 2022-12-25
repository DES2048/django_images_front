<script setup lang="ts">
  defineEmits(["sidenavOpen", "randomImage", "prevImage", "nextImage", "deleteImage", "markImage"])
</script>

<template>
    <div class="buttons-panel">
        <a href="#" class="btn-panel" @click="$emit('sidenavOpen')">
          <!--<img src="{% static 'image_picker/svg/settings.svg' %}" > -->
          &#9881;
        </a>
        <a href="#" class="btn-panel" @click="$emit('randomImage')">random</a>
        <a href="javascript:void(0)" class="btn-panel" @click="$emit('prevImage')">&lt;</a>
        <a href="javascript:void(0)" class="btn-panel" @click="$emit('nextImage')">&gt;</a>
        <a href="javascript:void(0)" class="btn-panel" @click="$emit('deleteImage')">&#10006;</a>
        <a href="javascript:void(0)" class="btn-panel" @click="$emit('markImage')">&#10004;</a>
      </div>
</template>

<style scoped>
    /* buttons panel */
.buttons-panel {
  display: flex;
  justify-content: space-around;
  position: fixed;
  width: 100%;
  bottom: 0;
  left: 0;
  height: auto;
  background-color: rgba(1, 1, 1, 0);
}

.btn-panel {
  font-size: 16px;
  color: aliceblue;
  font-weight: 600;
  text-decoration: none !important;
}

.btn-panel:focus,
.btn-panel:active {
  outline: none !important ;
  box-shadow: none !important ;
}
</style>