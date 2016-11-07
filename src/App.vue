<template>
  <div id="app">
    <img class="logo" src="./assets/sparrow.png">
    <h1>SjfScroll</h1>
    <h2>This is a simple custom scroll js framework</h2>
    <hello></hello>
  </div>
</template>

<script>
  import Hello from './components/Hello'

  export default {
    name: 'app',
    components: {
      Hello
    }
  }
</script>

<style lang="scss">
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }

  .logo {
    width: 100px;
    height: 100px;
  }
</style>
