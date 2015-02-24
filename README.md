# Overview of the WiConnect JavaScript API

The WiConnect JavaScript API provides a framework for controlling a WiConnect device using the HTTP RESTful API. JavaScript using the WiConnect JavaScript API can run on a page served by the device HTTP Server, or, with the appropriate CORS configuration, on a page served by a remote server.

Using the WiConnect JavaScript API you can run any command on the device, and process the command response as desired.

The WiConnect Web App provides an example of a full-featured JavaScript application using the WiConnect JavaScript API.


For details of WiConnect commands, see [WiConnect Documentation](http://wiconnect.ack.me).

To use the WiConnect JavaScript API, you create a WiConnectDevice object, then run WiConnect command methods on the object, with callbacks to handle the command responses.

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

### Instantiating a WiConnectDevice Object
A WiConnectDevice object has a function corresponding to each of the WiConnect commands, as well as the properties:

* `host` string - hostname or IP address of the WiConnect Device to communicate with - default `""` (localhost)
* `timeout` integer - maximum amount of time to wait for response from the device - default `120000` (milliseconds)
* `retries` integer - number of attempts to issue command when a command request fails - default `1`
* `auth` object `{user: "username", pass: "password"}` - HTTP basic auth credentials - default `null`

To create a WiConnectDevice object, the syntax is:

```javascript
var device = new WiConnectDevice({host: 'http://[deviceIP]' [, auth: {user: 'username', pass: 'password'}]|[, timeout: 20000]|[, retries: 5]});
```

example:
```javascript
var device = new WiConnectDevice({host: 'http://12.34.56.78'});
```



### Issue command to device

To call a WiConnect command, run `device.cmd()`, where `cmd` is the name of the WiConnect command.

```javascript
device.cmd([{args: 'command_arguments' [, flags: 0]}]);
```


The first argument of the ``device.cmd()`` method is an optional arguments object, with the following structure:

#### arguments
* `args` string - string of command arguments - default `""`
* `flags` integer - [WiConnect HTTP flag](http://wiconnect.ack.me/2.1/networking_and_security#http_library) - default `0`
* `timeout` integer - maximum amount of time to wait for response from the device - default `120000` (milliseconds)
* `retries` integer - number of attempts to issue this command when a command request fails - default `1`

example:
```javascript
//issue a 'ver' command
device.ver();

//issue a 'ls' command
device.ls();

//issue 'ls -v' command
device.ls({args: '-v'});
```

A WiConnect command request object will be returned each time a command is issued to a device, and can be stored for later use, with the following methods:

* `done()` - set promise function to be executed when a successful response is received (see below)
* `fail()` - set promise function to be executed when a request fails (see below)
* `always()` - set promise function to be exectuted on completion of a command request (see below)
* `abort()` - abort the command request immediately

example:
```javascript
var versionRequest = device.ver();
```

To process the WiConnect command response, you need to either set a callback function, or set promise functions for parsing the response from the command request.

### Issue command to device defining callback function

The callback function can be provided as the second argument (or first if a command arguments object is not being supplied) to the device commmand method call, using the following syntax:

```javascript
device.[command]([{args: 'command_arguments' [, flags: 0]} [, callback(error, response){}]|[callback(error, response){}]]);
```
example:
```javascript
device.ver(function(err, res){ /* process response here */ });

device.ls(function(err, res){ console.log(res); });

device.ls({args: '-v'}, function(err, res){
  if(err){
    /* process error here */
    return;
  }

  /*process successful response here */
});

device.reboot();
```

### Issue command to device using promise return functions

```javascript
device.[command]([{args: 'command_arguments' [, flags: 0]}])[.done(function(response){})][.fail( function(response){})][.always( function(response){})];
```
`.done(function(response){})` optional function to run when command returns with a successful response. Note that the `done` function has no `err` argument.

`.fail(function(error, response){})` optional function to run when command returns with a failure response.

`.always(function(error, response){})` optional function to run when command response completes no matter whether success or failure.

example:
```javascript
var versionRequest = device.ver();

//setup function to always log to console no matter whether failure or success
versionRequest.always(function(res) {
  console.log('request complete.');
});

//setup success function for when response received
versionRequest.done(function(err, res) {
  console.log('success!');
  console.log('response: ', res);
  console.log('WiConnect Version:', res.response);
});

//setup failure function for when HTTP error received
versionRequest.fail(function(err, res) {
  console.log('fail!');
  console.log('error:', err);
});
```

`done` `fail` and  `always` promise functions can also optionally be defined in the command arguments object.

example:
```javascript
//predefine promise functions
var myDoneFunction = function(res) {
  console.log("Done! here's the response:", res);
};

var myFailFunction = function(err, res){
  console.log("Command failed :(", err);
};

var myAlwaysFunction = function(err, res){
  console.log("Command request complete.");
};

//issue commands to device with promise functions in command arguments object
device.ls({
  done: myDoneFunction,
  fail: myFailFunction,
  always: myAlwaysFunction
});

device.scan({
  args: '-v',
  retries: 3,
  done: myDoneFunction,
  fail: myFailFunction,
  always: myAlwaysFunction
});

```


### Specifying `timeout` and `retries` for individual commands

A timeout argument can be specified for commands to invoke a timeout error on the request after the specified number of milliseconds.

example:
```javascript
//set an extremely small timeout period of 5milliseconds
//to ensure timeout error occurs
device.ver({timeout: 5}).fail(function(){
  console.log('no response after 5 milliseconds');
});

//set retries for individual command to allow up to 5 attempts before failure
device.scan({retries: 5}, function(err, res) {
  if(err){
    //failed after 5 retries
    return console.log('Device failed to return scan results after 5 attempts');
  }

  //command success
  console.log(res);
})
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

### Connect to a device
```javascript
var ws = new WebSocket('ws://[deviceIP]/stream');
```
example:
```javascript
var ws = new WebSocket('ws://12.34.56.78/stream');
```
### WebSocket methods

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

## Licence

WiConnect Web App, WiConnect JS API Library & WiConnect JS Build System

Copyright (C) 2015, Sensors.com, Inc.
All Rights Reserved.

The WiConnect Web App, WiConnect JavaScript API and WiConnect JS build system
are provided free of charge by Sensors.com. The combined source code, and
all derivatives, are licensed by Sensors.com SOLELY for use with devices
manufactured by ACKme Networks, or devices approved by Sensors.com.

Use of this software on any other devices or hardware platforms is strictly
prohibited.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR AS IS AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
OF SUCH DAMAGE.

