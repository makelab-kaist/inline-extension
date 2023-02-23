<script>
  import Menu from './Menu.svelte';

  function select(event) {
    console.log(event.detail);
  }
</script>

<Menu on:selection={select} />

<div class="flexContainer">
  <input type="password" class="inputField" />
  <button type="submit">search</button>
</div>

<style>
  .flexContainer {
    display: flex;
  }

  .inputField {
    flex: 1;
  }
</style>
