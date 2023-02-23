<script>
  import Badge from './components/Badge.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  let active = undefined;

  function toggle(selection) {
    if (!active || selection !== active) {
      active = selection;
    } else if (selection == active) {
      active = undefined;
    }
    dispatch('selection', active);
  }
</script>

<div class="flex">
  <div class="container">
    <Badge
      on:click={() => toggle('$$')}
      active={!active || active == '$$'}
      color="orange">$$</Badge
    >
    <Badge
      on:click={() => toggle('assert')}
      active={!active || active == 'assert'}
      color="blue">assert</Badge
    >
    <Badge
      on:click={() => toggle('is')}
      active={!active || active == 'is'}
      color="blue">is</Badge
    >
    <Badge
      on:click={() => toggle('above')}
      active={!active || active == 'above'}
      color="red">above</Badge
    >
    <Badge
      on:click={() => toggle('below')}
      active={!active || active == 'below'}
      color="red">below</Badge
    >
    <Badge
      on:click={() => toggle('between')}
      active={!active || active == 'between'}
      color="red">between</Badge
    >
    <Badge
      on:click={() => toggle('filter')}
      active={!active || active == 'filter'}
      color="red">filter</Badge
    >
    <Badge
      on:click={() => toggle('save')}
      active={!active || active == 'save'}
      color="green">save</Badge
    >
    <Badge
      on:click={() => toggle('log')}
      active={!active || active == 'log'}
      color="green">log</Badge
    >
    <Badge
      on:click={() => toggle('graph')}
      active={!active || active == 'graph'}
      color="green">graph</Badge
    >
    <Badge
      on:click={() => toggle('hist')}
      active={!active || active == 'hist'}
      color="green">hist</Badge
    >
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 3;
    gap: 0.5em 0.5em;
  }
</style>
