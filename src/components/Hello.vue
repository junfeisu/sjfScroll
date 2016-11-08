<template>
  <div class="hello">
    <div class="sjf-scroll" max-height="150">
      <p v-for="list in lists" v-text="list"></p>
    </div>
    <div class="sjf-scroll" max-height="200">
      <p v-for="list in lists" v-text="list"></p>
    </div>
  </div>
</template>

<script>
import sjfScroll from './../../scroll/model/sjfScroll.js'
export default {
  name: 'hello',
  data () {
    return {
      lists: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
  },
  mounted () {
    sjfScroll.initScroll()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import './../../scroll/style/sjf-scroll.css';
  .hello {
    display: flex;
    justify-content: center;
  }

  .sjf-scroll {
    width: 50%;
  }
</style>
