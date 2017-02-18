<template>
  <div class="hello">
    <div sjf-scroll max-height="200" class="sjf-scroll">
      <p v-for="list in lists" v-text="list"></p>
    </div>
    <div sjf-scroll max-height="150" class="sjf-scroll">
      <p v-for="test in tests" v-text="test"></p>
    </div>
  </div>
</template>

<script>
import sjfScroll from './../../scroll/model/sjfScroll.js'
export default {
  name: 'hello',
  data () {
    return {
      lists: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      tests: [0, 1, 2]
    }
  },
  methods: {
    add () {
      this.lists.push('a')
    }
  },
  mounted () {
    let self = this
    sjfScroll.initScroll()
    sjfScroll.scroll(function () {
      self.add()
    })
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
    // margin-top: 400px;
    p {
      color: red
    }
  }
</style>
