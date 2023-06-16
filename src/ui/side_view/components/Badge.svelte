<script>
  export let active = true;
  export let color = 'blue';
</script>

<div
  on:click
  on:keydown
  on:keyup
  on:keypress
  class="badge defaultColor"
  class:blue={color === 'blue'}
  class:red={color === 'red'}
  class:green={color === 'green'}
  class:lightgreen={color === 'lightgreen'}
  class:orange={color === 'orange'}
  class:pink={color === 'pink'}
  class:purple={color === 'purple'}
  class:disabled={!active}
>
  <slot />
</div>

<style>
  .badge {
    display: inline-block;
    padding: 0.25em 0.55em;
    font-size: 1.2em;
    font-weight: 700;
    line-height: 1;
    color: white;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.375rem;
    cursor: pointer;
  }

  .defaultColor {
    background-color: black;
  }

  .blue {
    background-color: dodgerblue;
  }
  .red {
    background-color: brown;
  }
  .green {
    background-color: green;
  }
  .lightgreen {
    background-color: rgb(23, 197, 55);
  }
  .orange {
    background-color: rgb(235, 112, 5);
  }
  .pink {
    background-color: plum;
  }
  .purple {
    background-color: purple;
  }

  .disabled {
    background-color: grey;
    opacity: 0.6;
  }
</style>
