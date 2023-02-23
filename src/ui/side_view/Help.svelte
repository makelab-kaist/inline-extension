<script>
  import Menu from './Menu.svelte';
  import Textfield from './components/Textfield.svelte';
  import Grammar from './components/Grammar.svelte';
  import Example from './components/Example.svelte';

  function select(event) {
    console.log(event.detail);
  }

  let grammar = {
    input: 'any',
    command: 'assert',
    params: '',
    output: '❌ or ✅',
  };
</script>

<Menu on:selection={select} />

<div class="block">
  <p>
    <code>assert</code> verifies whether an expression is true. It returns a ✅
    if it is <b>true</b> or a ❌ if the expression is
    <b>false</b>.
  </p>
  <div class="title">Grammar</div>

  <Grammar {...grammar} />

  <div class="title">Examples</div>

  <Example expression="// 2 == 2 | assert" result="✅" />
  <Example expression="// 0 | assert" result="❌" />
</div>

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
