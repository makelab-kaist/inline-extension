<script>
  export let input = '';
  export let command = '';
  export let params = '';
  export let output = '';
</script>

<p class="expression">
  <b>//</b>
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
    background-color: rgb(200, 200, 200);
    align-items: center;
    color: yellow;
    padding: 0.5em;
  }

  .result {
    color: dodgerblue;
    font-style: italic;
  }

  .input {
    color: rgb(90, 90, 90);
  }

  .params {
    color: rgb(90, 90, 90);
  }

  .op {
    margin-left: 0.5em;
    margin-right: 0.5em;
  }
</style>
