# Serial Server

Client side

```js
import io from 'socket.io-client';
const socket = io('http://localhost:3000', {
  reconnection: true,
});

socket.on('connect', function () {
  console.log('Connected!');
  socket.emit('listSerials');
});

socket.on('listSerialsData', function (ports: string[]) {
  console.log(ports);
});
```
