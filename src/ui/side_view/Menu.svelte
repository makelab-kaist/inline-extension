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
  <!-- <div class="container">
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
      on:click={() => toggle('lpfilter')}
      active={!active || active == 'lpfilter'}
      color="red">lpfilter</Badge
    > 
    <Badge
      on:click={() => toggle('save')}
      active={!active || active == 'save'}
      color="pink">save</Badge
    >
    <Badge
      on:click={() => toggle('count')}
      active={!active || active == 'count'}
      color="pink">count</Badge
    >
    <Badge
      on:click={() => toggle('add')}
      active={!active || active == 'add'}
      color="pink">add</Badge
    >
    <Badge
      on:click={() => toggle('print')}
      active={!active || active == 'print'}
      color="green">print</Badge
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
    <Badge
      on:click={() => toggle('log')}
      active={!active || active == 'log'}
      color="green">log</Badge
    >
    <Badge
      on:click={() => toggle('map')}
      active={!active || active == 'map'}
      color="purple">map</Badge
    >
    <Badge
      on:click={() => toggle('filter')}
      active={!active || active == 'filter'}
      color="purple">filter</Badge
    >
    <Badge
      on:click={() => toggle('$$')}
      active={!active || active == '$$'}
      color="orange">$$</Badge
    >
  </div> -->
  <h3>Identity</h3>
  <div class="container">
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
  </div>
  <h3>Range</h3>
  <div class="container">
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
  </div>
  <h3>Storing variables</h3>
  <div class="container">
    <Badge
      on:click={() => toggle('save')}
      active={!active || active == 'save'}
      color="pink">save</Badge
    >
    <Badge
      on:click={() => toggle('count')}
      active={!active || active == 'count'}
      color="pink">count</Badge
    >
    <Badge
      on:click={() => toggle('add')}
      active={!active || active == 'add'}
      color="pink">add</Badge
    >
  </div>
  <h3>Ouput</h3>
  <div class="container">
    <Badge
      on:click={() => toggle('print')}
      active={!active || active == 'print'}
      color="green">print</Badge
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
    <Badge
      on:click={() => toggle('log')}
      active={!active || active == 'log'}
      color="green">log</Badge
    >
  </div>
  <h3>Advanced</h3>
  <div class="container">
    <Badge
      on:click={() => toggle('map')}
      active={!active || active == 'map'}
      color="purple">map</Badge
    >
    <Badge
      on:click={() => toggle('filter')}
      active={!active || active == 'filter'}
      color="purple">filter</Badge
    >
  </div>
  <h3>Variables</h3>
  <div class="container">
    <Badge
      on:click={() => toggle('$$')}
      active={!active || active == '$$'}
      color="orange">$$</Badge
    >
    <Badge
      on:click={() => toggle('$x')}
      active={!active || active == '$x'}
      color="orange">$x</Badge
    >
    <Badge
      on:click={() => toggle('$0')}
      active={!active || active == '$0'}
      color="orange">$0</Badge
    >
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 3;
    gap: 0.5em 0.5em;
    margin-bottom: 0.5rem;
  }
  h3 {
    margin: 0.2rem;
  }
</style>
