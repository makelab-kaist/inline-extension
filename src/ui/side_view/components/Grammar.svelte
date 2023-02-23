<script>
  export let input = '';
  export let command = '';
  export let params = '';
  export let output = '';
</script>

<p class="expression">
  <b class="op">//</b>
  <em class="input">{input}</em>
  <b class="op">{input ? '|' : ''}</b>
  <code>{command}</code>
  <em class="params">{params}</em>
  <b class="op">?</b>
  <span class="result">{output}</span>
</p>

<style>
  code {
    font-size: medium;
  }

  .expression {
    background-color: black;
    color: yellow;
    padding: 0.5em;
  }

  .result {
    color: dodgerblue;
    font-style: italic;
  }

  .input {
    color: grey;
  }

  .params {
    color: grey;
  }

  .op {
    margin-left: 0.5em;
    margin-right: 0.5em;
  }
</style>
