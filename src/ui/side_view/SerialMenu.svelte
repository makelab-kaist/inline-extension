<script>
  export let connected = false;
  export let portName = '/dev/tty.usbserial-14610';
</script>

<div>
  <span class="dot not-connected" class:connected />
  {#if connected}
    <b>Connected</b>
    <div>
      <i>{portName}</i>
    </div>
  {:else}
    <b>Not connected</b>
  {/if}
</div>

<style>
  .dot {
    margin-right: 1rem;
    height: 10px;
    width: 10px;
    border-radius: 50%;
    display: inline-block;
  }
  .not-connected {
    background-color: red;
  }
  .connected {
    background-color: rgba(40, 252, 93, 0.61);
  }
</style>
