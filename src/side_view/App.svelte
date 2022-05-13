<script>
  import { onMount } from 'svelte';
  import IconButton from './ui/IconButton.svelte';
  import SerialMenu from './SerialMenu.svelte';

  // Do not need to acquire the API here, as it is in the html of the provider
  // const vscode = acquireVsCodeApi();

  let state = vscode.getState() || {
    initialized: false,
    connected: false,
    portName: '',
    highlight: true,
  };
  let tooltipText = '';

  function reset() {
    state.initialized = false;
    noTooltip();
    disconnectSerial();
    refreshAnnotations();
    vscode.setState(state);
  }

  function tooltip(value) {
    tooltipText = value;
  }

  function noTooltip() {
    tooltipText = '';
  }

  function configureConnection() {
    vscode?.postMessage({ message: 'configureConnection' });
  }

  function connectSerial() {
    vscode?.postMessage({ message: 'connectSerial' });
  }

  function disconnectSerial() {
    vscode?.postMessage({ message: 'disconnectSerial' });
  }

  function uploadSketch() {
    vscode?.postMessage({ message: 'uploadSketch' });
  }

  function refreshAnnotations() {
    vscode?.postMessage({ message: 'refreshAnnotations' });
  }

  function clearAnnotations() {
    vscode?.postMessage({ message: 'clearAnnotations' });
  }

  function toggleHighlight() {
    vscode?.postMessage({ message: 'toggleHighlight' });
  }

  onMount(async () => {
    // Listen to events
    window.addEventListener('message', async (event) => {
      // console.log(event.data);
      const message = event.data.message;

      switch (message) {
        case 'configureConnection':
          state.initialized = true;
          state.portName = event.data.portName;
          break;
        case 'connected':
          state.connected = true;
          break;
        case 'disconnected':
          state.connected = false;
          break;
        case 'toggleHighlight':
          state.highlight = event.data.highlight;
          break;

        default:
          break;
      }
      vscode.setState(state);
    });
  });
</script>

<main>
  {#if !state.initialized}
    <button on:click={configureConnection}>Initialize Serial</button>
  {:else}
    <h3>Menu:</h3>
    <div class="container">
      <div class="flex">
        {#if !state.connected}
          <IconButton
            on:click={connectSerial}
            on:mouseover={() => tooltip('Connect')}
            on:mouseout={noTooltip}
            icon="fa-link"
            red={true} />
        {:else}
          <IconButton
            on:click={disconnectSerial}
            on:mouseover={() => tooltip('Disconnect')}
            on:mouseout={noTooltip}
            icon="fa-link-slash"
            green={true} />
        {/if}
        <IconButton
          on:click={uploadSketch}
          on:mouseover={() => tooltip('Upload sketch')}
          on:mouseout={noTooltip}
          icon="fa-upload" />
        <IconButton
          on:click={refreshAnnotations}
          on:mouseover={() => tooltip('Update annotations')}
          on:mouseout={noTooltip}
          icon="fa-arrows-spin" />
        <IconButton
          on:click={clearAnnotations}
          on:mouseover={() => tooltip('Remove annotations')}
          on:mouseout={noTooltip}
          icon="fa-eraser" />
        <IconButton
          on:click={toggleHighlight}
          on:mouseover={() => tooltip('Toggle line marking')}
          on:mouseout={noTooltip}
          icon="fa-highlighter"
          gray={!state.highlight} />
      </div>
      <span>{tooltipText}</span>
    </div>

    <button on:click={reset}>Reset</button>
    <h3>Serial status</h3>
    <SerialMenu connected={state.connected} portName={state.portName} />
  {/if}
</main>

<style>
  /* your styles go here */
  button {
    margin-top: 1em;
  }

  .container {
    height: 4rem;
  }

  .flex {
    display: flex;
    text-align: center;
    justify-content: space-evenly;
  }

  span {
    font-size: larger;
  }
</style>
