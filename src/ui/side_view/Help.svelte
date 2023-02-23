<script>
  import Menu from './Menu.svelte';
  import Grammar from './components/Grammar.svelte';
  import Example from './components/Example.svelte';
  import commands from './data/commands.json';

  let current = undefined;

  function select(event) {
    const selection = event.detail;
    current = commands.find(({ command }) => command === selection);
  }
</script>

<Menu on:selection={select} />

{#if current}
  <div class="block">
    <p>
      {@html current.description}
    </p>
    <div class="title">Grammar</div>

    <Grammar {...current.grammar} />

    <div class="title">Examples</div>

    {#each current.examples as { expression, result }}
      <Example {expression} {result} />
    {/each}
  </div>
{/if}

<style>
  .title {
    font-style: italic;
    font-size: larger;
    margin-top: 1em;
    margin-bottom: 1em;
    width: 100%;
    text-align: left;
  }

  .block {
    margin-top: 1.5em;
    font-size: medium;
  }
  code {
    font-size: medium;
  }
</style>
