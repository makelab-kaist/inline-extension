<script>
  import { onMount } from 'svelte';

  // Do not need to acquire the API here, as it is in the html of the provider
  // const vscode = acquireVsCodeApi();
  

  function connectToSerial() {
    console.log('here');
    vscode?.postMessage({ cmd: 'connectSerial' });
  }

  // function closeSerialPort() {
  //   vscode?.postMessage({ message: 'closeSerialPort' });
  // }

  // function sideBarOpen() {
  //   vscode?.postMessage({ message: 'sideBarOpen' });
  // }

  /*
  onMount(async () => {
    // Notify that the sidebar is open
    sideBarOpen();
    // Listen to events
    window.addEventListener('message', async (event) => {
      const message = event.data.message;
      const params = event.data.params;

      switch (message) {
        case 'connectingSerial':
          spinner = true;
          portName = '';
          break;
        case 'ready':
          connected = true;
          spinner = false;
          portName = params.serialPortName;
          break;
        case 'cancelConnection':
          connected = false;
          spinner = false;
          portName = '';
          break;
        case 'disconnect':
          connected = false;
          portName = 'none';
          break;
        case 'updateMappings':
          mappings = params;
          break;
        case 'errorLogs':
          errorLogs = params;
          break;
        default:
          break;
      }
    });
  });
  */

</script>

<main>
  <button on:click="{connectToSerial}">Connect</button>
  <button>Disonnect</button>
</main>

<style>
  /* your styles go here */
  button{
    margin-top: 1em;
  }
</style>