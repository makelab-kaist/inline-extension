<script>
  export let expression = '';
  export let result = '';

  function copyToClipboard() {
    console.log(expression);
    navigator.clipboard.writeText(expression + ' ?');
  }
</script>

<p class="expression">
  {expression}
  <span class="result">
    <b class="op">?</b>
    {result}</span
  >
  <button on:click={copyToClipboard}>copy</button>
</p>

<style>
  p {
    display: flex;
    margin: 0px;
    margin-bottom: 0.2em;
  }

  .expression {
    background-color: rgb(200, 200, 200);
    align-items: center;
    color: rgb(90, 90, 90);
    padding: 0.5em;
    flex-grow: 4;
  }

  .result {
    color: dodgerblue;
  }

  .op {
    margin-left: 0.3em;
    margin-right: 0.5em;
  }

  button {
    width: auto;
    border-radius: 20%;
    margin-left: auto;
  }

  button:hover {
    background-color: dodgerblue;
  }
</style>
