<script>
  import { onMount } from 'svelte';
  import IconButton from './components/IconButton.svelte';
  import Help from './Help.svelte';
  import SerialMenu from './SerialMenu.svelte';

  // Do not need to acquire the API here, as it is in the html of the provider
  // const vscode = acquireVsCodeApi();

  let state = vscode.getState() || {
    initialized: false,
  };
  let highlight = true;
  let portName = '';
  let connected = false;
  let tooltipText = '';
  let needRefresh = false;

  function reset() {
    state.initialized = false;
    vscode.setState(state);
    noTooltip();
    disconnectSerial();
    refreshAnnotations();
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

  function uploadRelease() {
    vscode?.postMessage({ message: 'uploadRelease' });
  }

  onMount(async () => {
    // Listen to events
    window.addEventListener('message', async (event) => {
      // console.log(event.data);
      const message = event.data.message;

      switch (message) {
        case 'configureConnection':
          state.initialized = true;
          vscode.setState(state);
          portName = event.data.portName;
          break;
        case 'connected':
          connected = true;
          break;
        case 'disconnected':
          connected = false;
          break;
        case 'toggleHighlight':
          highlight = event.data.highlight;
          break;
        case 'codeDirty':
          needRefresh = event.data.value;
          break;
        case 'reset':
          reset();
          break;

        default:
          break;
      }
    });
  });
</script>

<main>
  {#if !state.initialized}
    <button on:click={configureConnection}>Initialize Serial</button>
  {:else}
    <h2>Menu</h2>
    <div class="container">
      <div class="flex">
        {#if !connected}
          <IconButton
            on:click={connectSerial}
            on:mouseover={() => tooltip('Connect')}
            on:mouseout={noTooltip}
            icon="fa-link"
            gray={true}
          />
        {:else}
          <IconButton
            on:click={disconnectSerial}
            on:mouseover={() => tooltip('Disconnect')}
            on:mouseout={noTooltip}
            icon="fa-link-slash"
          />
        {/if}
        <IconButton
          on:click={uploadSketch}
          on:mouseover={() => tooltip('Upload sketch')}
          on:mouseout={noTooltip}
          icon="fa-upload"
          red={needRefresh}
          green={!needRefresh}
        />
        <IconButton
          on:click={refreshAnnotations}
          on:mouseover={() => tooltip('Update annotations')}
          on:mouseout={noTooltip}
          icon="fa-arrows-spin"
        />
        <IconButton
          on:click={clearAnnotations}
          on:mouseover={() => tooltip('Disable annotations')}
          on:mouseout={noTooltip}
          icon="fa-eraser"
        />
        <IconButton
          on:click={toggleHighlight}
          on:mouseover={() => tooltip('Toggle line marking')}
          on:mouseout={noTooltip}
          icon="fa-highlighter"
          gray={!highlight}
        />
      </div>
      <span>{tooltipText}</span>
    </div>

    <button on:click={uploadRelease}>Upload Release</button>
    <button on:click={reset}>Reset</button>

    <!-- Serial status -->
    <div class="mtb">
      <SerialMenu {connected} {portName} />
    </div>

    <h2>Expressions help</h2>
    <Help />
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
    font-size: large;
  }

  .mtb {
    margin-top: 1em;
    margin-bottom: 2em;
  }
</style>
