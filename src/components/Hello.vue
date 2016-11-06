<template>
  <div class="hello">
    <div class="sjf-scroll" min-height="150">
      <!-- <p v-for="list in lists" v-text="list"></p> -->
      <p>1</p>
      <p>1</p>
      <p>1</p>
      <p>1</p>
      <p>1</p>
      <p>1</p>
      <p>1</p>
      <p>1</p>
      <p>1</p>
      <p>1</p>
    </div>
  </div>
</template>

<script>
import sjfScroll from './../../scroll/model/sjfScroll.js'
export default {
  name: 'hello',
  data () {
    return {
      lists: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
  },
  created () {
    sjfScroll.setScroll()
    sjfScroll.watch(sjfScroll.options)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import './../../scroll/style/sjf-scroll.css';
</style>
