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

  
  onMount(async () => {
    // Listen to events
    window.addEventListener('message', async (event) => {
      // console.log(event.data);
      const message = event.data.cmd;
      
      switch (message) {
        case 'hi':
          console.log('hello');
          break;

        default:
          break;
      }
    });
  });
  

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