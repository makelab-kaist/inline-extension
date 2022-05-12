<script>
  import * as all from '@fortawesome/fontawesome-free/js/all';

  export let icon = 'fa-flask';
  export let green;
  export let red;
</script>

<div
  on:click
  on:mouseover
  on:mouseout
  on:focus
  on:blur
  class="but"
  class:green
  class:red>
  <i class="fa-solid {icon}" />
</div>

<style>
  .but {
    width: 2rem;
    cursor: pointer;
    border: none;
    padding: var(--input-padding-vertical) var(--input-padding-horizontal);
    text-align: center;
    outline: 1px solid transparent;
    outline-offset: 2px !important;
    color: var(--vscode-button-foreground);
    background: var(--vscode-button-background);
    margin: 1px;
  }

  .but:hover {
    cursor: pointer;
    background: var(--vscode-button-hoverBackground);
  }

  .but:focus {
    outline-color: var(--vscode-focusBorder);
  }

  .green {
    background-color: green;
  }

  .red {
    background-color: red;
  }
</style>
