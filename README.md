# Installation

WiconnectJS can be installed with either [NPM](https://www.npmjs.com/) or [Bower](http://bower.io)

```
npm install wiconnectjs
```

```
bower install wiconnectjs
```

# Using WiConnectJS

### Configure WiConnect Device
```javascript
//join network
nup -s
//set wlan autoconnect
set wl o e 1
//enable http server
set ht s e 1
//set http server CORS origin to wildcard to allow remote requests
set ht s c *
//save config & reboot
save
reboot
```

### Instantiating a device

```javascript
var device = new WiConnectDevice({host: 'http://[deviceIP]' [, auth: {user: 'username', pass: 'password'}]});
```

example:
```javascript
var device = new WiConnectDevice({host: 'http://12.34.56.78'});
```

### Issue command to device

```javascript
device.[command]([{args: 'command_arguments' [, flags: 0]}]);
```

example:
```javascript
//issue a 'ver' command
device.ver();

//issue a 'ls' command
device.ls();

//issue 'ls -v' command
device.ls({args: '-v'});
```

An object will be returned each time a command is issued to a device and can be stored for later use.

example:
```javascript
var versionRequest = device.ver();
```

### Issue command to device defining callback function
```javascript
device.[command]([{args: 'command_arguments' [, flags: 0]} [, callback(error, response){}]|[callback(error, response){}]]);
```
example:
```javascript
device.ver(function(err, resp){ console.log(resp); });

device.ls(function(err, resp){ console.log(resp); });

device.ls({args: '-v'}, function(err, resp){ console.log(resp); });

device.reboot();
```
The response from the first three commands will be logged to the javascript console once each command has completed.

### Issue command to device using promise return functions

```javascript
device.[command]([{args: 'command_arguments' [, flags: 0]}])[.done(function(response){})][.fail( function(response){})][.always( function(response){})];
```
`.done(function(response){})` function to run when command returns with a successful response

`.fail(function(error, response){})` function to run when command returns with a failure response

`.always(function(error, response){})` function to run when command response completes no matter whether success or failure

example:
```javascript
var versionRequest = device.ver();

//setup function to always log to console no matter whether failure or success
versionRequest.always(function(resp) {
  console.log('request complete.');
});

//setup success function for when response received
versionRequest.done(function(err, resp) {
  console.log('success!');
  console.log('response: ', resp);
  console.log('WiConnect Version:', resp.response);
});

//setup failure function for when HTTP error received
versionRequest.fail(function(err, resp) {
  console.log('fail!');
  console.log('error:', err);
});
```
### Set request timeout

A timeout argument can be specified for commands to invoke a timeout error on the request after the specified number of milliseconds.

example:
```javascript
//set an extremely small timeout period of 5milliseconds to ensure timeout error occurs
device.ver({timeout: 5}).fail(function(){console.log('no response after 5 milliseconds')});
```
### Abort command request

`.abort()` immediately abort request

example:
```javascript
var versionRequest = device.ver();

//lets not wait for the response and abort the request immediately
versionRequest.abort();
```
# Using WebSockets

###Connect to a device
```javascript
var ws = new WebSocket('ws://[deviceIP]/stream');
```
example:
```javascript
var ws = new WebSocket('ws://12.34.56.78/stream');
```
###WebSocket methods

`.onopen` handle for WebSocket open event

`.onmessage` handler for WebSocket message received event

`.onclose` handler for WebSocket close event

`.send([message_data])` Send a WebSocket message to the device

`.close()` Initiate WebSocket close handshake

example:
```javascript
var ws = new WebSocket('ws://12.34.56.78/stream');

// log a message once WebSocket connection handshake is complete
ws.onopen = function() {
  console.log('WebSocket open to WiConnect device!');
};

// log a message to the console to inform when WiConnect closes the websocket connection
ws.onclose = function() {
  console.log('WebSocket has been closed!');
};

// log the message binary blob data to the console when we receive a WebSocket message
ws.onmessage = function(event) {
  var reader;
  if(event.data instanceof Blob) {
    reader = new FileReader();
    reader.onload = function() {
      return console.log(reader.result);
    };
    return reader.readAsText(event.data);
  }
}

// send a WebSocket message to the WiConnect device
ws.send('I am a teapot.');

// close the WebSocket connection
ws.close();
```