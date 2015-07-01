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
* `acceptCommandFailed` boolean - optional flag to specify if an error should be returned when WiConnect response with `Command Failed\r\n` - default `true`

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

# Writing files

### `file_create` or `fcr`

The `file_create`  command accepts two additional arguments `filename` and `data`  for writing a file to the WiConnect device. The `data` argument is expected to be of type [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

example:
```javascript
// http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
var stringToArrayBuffer = function(str){
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

var fileData = stringToArrayBuffer("Hello World!");

// create file on WiConnect device
device.file_create({filename: 'testFile.txt', data: fileData}, function(err, res){
  if(err) {
    // error creating file
    console.log('Error writing testFile.txt');
    return;
  }

  // file created successfully
  console.log('testFile.txt created successfully on WiConnect device');
});
```

The WiConnectJS API is able to manage files of any size.

The WiConnect HTTP server has a maximum request size limit of 4KB per request. WiConnectJS handles this limit for you by calculating the file CRC, creating a new file and requesting an open stream handle, then writing file chunks to the open file stream. If you are inspecting network requests while using `file_create` you will see multiple requests being sent to the WiConnect Device.

### `stream_write` or `write`

The `stream_write` command accepts the additional argument `data`  for writing a data to an open stream on the WiConnect device. The `data` argument is expected to be of type [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

example:
```javascript
// ID of open stream on WiConnect device
var stream_id = 0;

// data to write to stream
// stringToArrayBuffer function from previous example
var streamData = stringToArrayBuffer("hello");

// write 0 5
device.stream_write({
    args: stream_id + " " + streamData.byteLength,
    data: streamData
  },
  function(err, res){
    if(err) {
      // error writing to stream
      console.log('Error writing to stream ' + stream_id);
      return;
    }

    // data written successfully
    console.log(streamData.byteLength + ' bytes of data written to stream ' + stream_id);

  });
```

The WiConnectJS API is able to writing data of any size to open streams.

The WiConnect HTTP server has a maximum request size limit of 4KB per request. WiConnectJS handles this limit by writing data chunks sequentially to the open file stream. If you are inspecting network requests while using `stream_write` you will see multiple requests being sent to the WiConnect Device.

# Reading files

example:

```javascript
var streamID;

device.file_open({args: 'testFile.txt'},
  function(err, res){
    if(err){
      console.log('file could not be opened');
      return;
    }

    // the open stream ID will be returned in response property of res
    // remove new line characters from response
    streamID = res.response.replace('\r\n', '');

    // now we have the open stream id, read 5 bytes of data from it
    var bytesToRead = 5;

    device.read({args: streamID + ' ' + bytesToRead}, // read 0 5
      function(err, res){
      if(err){
      console.log('Reading stream ' + streamID + ' failed');
      return;
      }

      var bytesFromStream = res.response;

      // output the bytes read
      console.log(bytesToRead + ' bytes read: ' + bytesFromStream);
      });
  });
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

// function to execute once the websocket has been closed
ws.onclose = function() {
  // log a message to the console when the websocket is closed
  console.log('WebSocket has been closed!');
};

// function to execute each time a message is received via the websocket
ws.onmessage = function(event) {
  var reader;

  // log the message binary blob data to the console when we receive a websocket message
  if(event.data instanceof Blob) {
    reader = new FileReader();
    reader.onload = function() {
      return console.log(reader.result);
    };
    return reader.readAsText(event.data);
  }
}

// function to execute when the socket has been opened successfully
ws.onopen = function() {
  // log a message once websocket connection handshake is complete
  console.log('WebSocket open to WiConnect device!');

  // use 'list' command using a serial terminal, or using WiConnectJS
  // open streams on the device will be displayed including a 'WEBS' stream
  // indicating the open websocket
  // e.g. using serial terminal
  // > list
  // ! # Type  Info
  // # 0 WEBS  12.34.56.78:80 12.34.56.78:54460

  // now that the websocket is connected, send a message to the WiConnect device
  ws.send('I am a teapot.');

  // using a serial terminal, or using WiConnectJS read the stream
  // e.g. using serial terminal
  // > read 0 14
  // I am a teapot.

  // close the websocket
  ws.close();

  // note: the websocket will not be immediately closed
  // WiConnect will keep the websocket open until all stream data has been read
  // e.g.
  // > read 0 1
  // > [2015-03-23 | 03:21:37: Closed: 0]
};
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

