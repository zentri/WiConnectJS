(function (root, factory) {
  if ( typeof define === 'function' && define.amd ) {
    define(['superagent'], function(request) {
      root.WiConnectDevice = factory(request);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    root.WiConnectDevice = factory(superagent);
  }
}(this, function (request) {

  return function(args) {
    args = args || {};

    var device = {
      host:       args.host       || '',
      auth:       args.auth       || null,
      timeout:    args.timeout    || 120000,
      retries:    args.retries    || 1
    };

    var getCommands = [ {adc_take_sample  : 'adc'},
                        {get              : 'get'},
                        {gpio_get         : 'gge'},
                        {gpios_get        : 'gges'},
                        {help             : 'help'},
                        {ls               : 'ls'},
                        {stream_list      : 'list'},
                        {version          : 'ver'},
                        {wlan_scan        : 'scan'},
                        {wlan_get_rssi    : 'rssi'}
                      ];

    var postCommands = [{dac_set_level    : 'dac'},
                        {factory_reset    : 'fac'},
                        {faults_print     : 'faup'},
                        {faults_reset     : 'faur'},
                        {file_delete      : 'fde'},
                        {file_open        : 'fop'},
                        {format_flash     : 'format'},
                        {ghm_activate     : 'gac'},
                        {ghm_capabilities : 'gca'},
                        {ghm_deactivate   : 'gde'},
                        {ghm_message      : 'gme'},
                        {ghm_read         : 'gre'},
                        {ghm_signup       : 'gsi'},
                        {ghm_sync         : 'gsy'},
                        {ghm_write        : 'gwr'},
                        {gpio_dir         : 'gdi'},
                        {gpio_set         : 'gse'},
                        {gpios_dir        : 'gdis'},
                        {gpios_set        : 'gses'},
                        {http_add_header  : 'had'},
                        {http_download    : 'hdo'},
                        {http_get         : 'hge'},
                        {http_head        : 'hhe'},
                        {http_post        : 'hpo'},
                        {http_read_status : 'hre'},
                        {http_upload      : 'hup'},
                        {load             : 'load'},
                        {mdns_discover    : 'mdns'},
                        {network_down     : 'ndo'},
                        {network_lookup   : 'nlo'},
                        {network_up       : 'nup'},
                        {network_verify   : 'nve'},
                        {ota              : 'ota'},
                        {ping             : 'ping'},
                        {pwm_update       : 'pwm'},
                        {reboot           : 'reboot'},
                        {save             : 'save'},
                        {set              : 'set'},
                        {setup            : 'setup'},
                        {sleep            : 'sleep'},
                        {stream_close     : 'close'},
                        {stream_poll      : 'poll'},
                        {stream_read      : 'read'},
                        {tcp_client       : 'tcpc'},
                        {tcp_server       : 'tcps'},
                        {tls_client       : 'tlsc'},
                        {tls_server       : 'tlss'},
                        {udp_client       : 'udpc'},
                        {udp_server       : 'udps'},
                        {wps              : 'wps'}
                      ];


    var uniqueCommands = [{file_create  : 'fcr'},
                          {stream_write : 'write'},
                          {smtp_send    : 'smtp'}
                         ];


    getCommands.forEach(function(cmd){
      var getFn = function(args, callback, attempt) {
        attempt = attempt || 1;

        args = args || {};

        if(typeof callback !== 'function') {
          attempt = Number(callback);
          callback = null;
        }

        if(typeof args === 'function') {
          callback = args;
          args = {};
        }

        var uri = device.host + '/command/' + Object.keys(cmd)[0] + ((typeof args.args !== 'undefined') ? ' ' + args.args : '');

        var xhr = request.get(uri)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .timeout((args.timeout ? Number(args.timeout) : device.timeout));

        if(device.auth) {
          xhr.auth(device.auth.user, device.auth.pass);
        }

        var xhrObj = {};

        xhr.onComplete = function(err, res) {};

        xhr.onSuccess = function(res) {
          if(typeof callback === 'function') {
            return callback(null, res);
          }
        };

        xhr.onFail = function(err, res) {
          if(typeof callback === 'function') {
            return callback(err, res);
          }
        };

        xhrObj.done = function(fn) {
          if(typeof fn !== 'function') {
            return new Error('Object is not a Function.');
          }

          xhr.onSuccess = fn;

          return xhrObj;
        };

        xhrObj.fail = function(fn) {
          if(typeof fn !== 'function') {
            return new Error('Object is not a Function.');
          }

          xhr.onFail = fn;

          return xhrObj;
        };

        xhrObj.always = function(fn) {
          if(typeof fn !== 'function') {
            return new Error('Object is not a Function.');
          }

          xhr.onComplete = fn;

          return xhrObj;
        };

        xhrObj.abort = function() {
          xhr.abort();
        }

        xhr.end(function(err, res) {
          xhr.onComplete(err, res);

          if(!err) {
            return xhr.onSuccess(JSON.parse(res.text));
          }

          if(attempt >= (args.retries ? args.retries : device.retries)) {
            return xhr.onFail(err, res);
          }

          xhrObj = getFn(args, callback, (attempt+1)).done(xhr.onSuccess).fail(xhr.onFail).always(xhr.onAlways);

        });

        return xhrObj;
      };

      device[Object.keys(cmd)[0]] = getFn;

      if(Object.keys(cmd)[0] !== cmd[Object.keys(cmd)[0]]) {
        device[cmd[Object.keys(cmd)[0]]] = getFn;
      }
    });

    postCommands.forEach(function(cmd){
      var postFn = function(args, callback, attempt) {
        attempt = attempt || 1;

        args = args || {};

        if(typeof callback !== 'function') {
          attempt = Number(callback);
          callback = null;
        }

        if(typeof args === 'function') {
          callback = args;
          args = {flags: 0};
        }

        args.flags = args.flags || 0;

        var uri = device.host + '/command';

        var xhr = request.post(uri)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .timeout((args.timeout ? Number(args.timeout) : device.timeout))
                    .send(JSON.stringify({flags: args.flags, command: cmd[Object.keys(cmd)[0]] + ((typeof args.args !== 'undefined') ? ' ' + args.args : '')}));

        if(device.auth) {
          xhr.auth(device.auth.user, device.auth.pass);
        }

        var xhrObj = {};

        xhr.onComplete = function(err, res) {};

        xhr.onSuccess = function(res) {
          if(typeof callback === 'function') {
            return callback(null, res);
          }
        };

        xhr.onFail = function(err, res) {
          if(typeof callback === 'function') {
            return callback(err, res);
          }
        };

        xhrObj.done = function(fn) {
          if(typeof fn !== 'function') {
            return new Error('Object is not a Function.');
          }

          xhr.onSuccess = fn;

          return xhrObj;
        };

        xhrObj.fail = function(fn) {
          if(typeof fn !== 'function') {
            return new Error('Object is not a Function.');
          }

          xhr.onFail = fn;

          return xhrObj;
        };

        xhrObj.always = function(fn) {
          if(typeof fn !== 'function') {
            return new Error('Object is not a Function.');
          }

          xhr.onComplete = fn;

          return xhrObj;
        };

        xhrObj.abort = function() {
          xhr.abort();
        }

        xhr.end(function(err, res) {
          xhr.onComplete(err, res);

          if(!err) {
            return xhr.onSuccess(JSON.parse(res.text));
          }

          if(attempt >= (args.retries ? args.retries : device.retries)){
            return xhr.onFail(err, res);
          }

          xhrObj = postFn(args, callback, (attempt+1)).done(xhr.onSuccess).fail(xhr.onFail).always(xhr.onAlways);
        });

        return xhrObj;
      };

      device[Object.keys(cmd)[0]] = postFn;

      if(Object.keys(cmd)[0] !== cmd[Object.keys(cmd)[0]]) {
        device[cmd[Object.keys(cmd)[0]]] = postFn;
      }
    });


    // helper functions
    device.crc = function(data) {
      // computes CCITT CRC-16 value
      // modified from http://www.zorc.breitbandkatze.de/crc.html
      // data as ArrayBuffer

      var dataView = new DataView(data);

      var i, j, k;
      var bit, len, actchar, flag, counter, c, ch;
      var crc = new Array (8+1);
      var mask = new Array (8);
      var hexnum = new Array ("0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F");

      var order, direct, reverseDataBytes, reverseFinal;
      var polynom = new Array (8);
      var init = new Array (8);
      var xor = new Array (8);

      var reflectByte = function(inbyte) {
        // reflect one byte
        var outbyte=0;
        var i=0x01;
        var j;

        for (j=0x80; j; j>>=1) {
          if(inbyte & i) {
            outbyte|=j;
          }
          i<<=1;
        }
        return outbyte;
      };

      var reflect = function(crc, bitnum, startLSB) {
        var i, j, k, iw, jw, bit;

        // reflect 'bitnum' bits starting at lowest bit = startLSB
        for (k=0; k+startLSB<bitnum-1-k; k++) {

          iw=7-((k+startLSB)>>3);
          jw=1<<((k+startLSB)&7);
          i=7-((bitnum-1-k)>>3);
          j=1<<((bitnum-1-k)&7);

          bit = crc[iw] & jw;
          if(crc[i] & j){ crc[iw] |= jw;}
          else{ crc[iw] &= (0xff-jw);}
          if(bit) { crc[i] |= j;}
          else{ crc[i] &= (0xff-j);}
        }

        return crc;
      };

      var a2hBytes = function(input, order) {
        // convert from ascii to hexadecimal value (stored as byte sequence)
        var i, j;
        var len;
        var actchar;
        var polynom = new Array (0,0,0,0,0,0,0,0);
        var brk = new Array (-1,0,0,0,0,0,0,0);

        // convert crc value into byte sequence
        len = input.length;
        for (i=0; i < len; i++) {
          actchar = parseInt(input.charAt(i), 16);
          if(isNaN(actchar) === true) {
            return brk;
          }
          actchar &= 15;

          for(j=0; j<7; j++) {
            polynom[j] = ((polynom [j] << 4) | (polynom [j+1] >> 4)) & 255;
          }

          polynom[7] = ((polynom[7] <<4) | actchar) & 255;
        }

        // compute and check crc order
        var count = 64;
        for (i=0; i<8; i++) {
          for (j=0x80; j; j>>=1) {
            if(polynom[i] & j) {
              break;
            }
            count--;
          }
          if(polynom[i] & j) {
            break;
          }
        }

        if (count > order) {
          return brk;
        }

        return polynom;
      };

      //CCITT CRC-16
      order=16;
      polynom = a2hBytes('1021', order);
      init = a2hBytes('FFFF', order);
      xor = a2hBytes('00', order);
      direct = true;
      reverseDataBytes = true;
      reverseFinal = false;

      len=0;

      // generate bit mask
      counter = order;
      for (i=7; i>=0; i--) {
        if (counter>=8) {
          mask[i] = 255;
        } else {
          mask[i]=(1<<counter)-1;
        }
        counter -= 8;

        if(counter<0) {
          counter=0;
        }
      }

      crc = init;

      if(!direct) {    // nondirect
        crc[8] = 0;

        for (i=0; i<order; i++) {
          bit = crc[7-((order-1)>>3)] & (1<<((order-1)&7));
          for (k=0; k<8; k++) {
            crc[k] = ((crc[k] << 1) | (crc[k+1] >> 7)) & mask[k];
            if (bit) {
              crc[k]^= polynom[k];
            }
          }
        }
      }

      crc[8]=0;

      // main loop, algorithm is fast bit by bit type
      for(i=0; i<dataView.byteLength; i++) {
        c = dataView.getUint8(i);
        if(dataView.getUint8(i) === '%') {        // unescape byte by byte (%00 allowed)

          ch = parseInt(dataView.getUint8(++i), 16);

          c = parseInt(dataView.getUint8(++i), 16);

          c = (c&15) | ((ch&15)<<4);
        }

        // perform revin
        if(reverseDataBytes) {
          c = reflectByte(c);
        }

        // rotate one data byte including crcmask
        for(j=0; j<8; j++) {
          bit=0;
          if (crc[7-((order-1)>>3)] & (1<<((order-1)&7))) {
            bit=1;
          }
          if (c&0x80) {
            bit^=1;
          }
          c<<=1;
          for(k=0; k<8; k++) {   // rotate all (max.8) crc bytes
            crc[k] = ((crc[k] << 1) | (crc[k+1] >> 7)) & mask[k];
            if(bit) {
              crc[k]^= polynom[k];
            }
          }
        }

        len++;
      }

      // perform revout
      if(reverseFinal) {
        crc = reflect(crc, order, 0);
      }

      // perform xor value
      for (i=0; i<8; i++) {
        crc[i] ^= xor[i];
      }

      // write result
      var crcStr = '';

      flag=0;
      for(i=0; i<8; i++) {
        actchar = crc[i]>>4;

        if(flag || actchar) {
          crcStr = crcStr + hexnum[actchar];
          flag=1;
        }

        actchar = crc[i] & 15;
        if(flag || actchar || i===7) {
          crcStr = crcStr + hexnum[actchar];
          flag=1;
        }
      }

      return crcStr;
    };

    // node & IE dont have window.btoa method
    // https://gist.github.com/jonleighton/958841
    var base64ArrayBuffer = function(arrayBuffer) {
      var base64    = '';
      var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

      var bytes         = new Uint8Array(arrayBuffer);
      var byteLength    = bytes.byteLength;
      var byteRemainder = byteLength % 3;
      var mainLength    = byteLength - byteRemainder;

      var a, b, c, d;
      var chunk;

      for(var i = 0; i < mainLength; i = i + 3) {
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        a = (chunk & 16515072) >> 18;
        b = (chunk & 258048)   >> 12;
        c = (chunk & 4032)     >>  6;
        d = chunk & 63;
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
      }
      if(byteRemainder == 1) {
        chunk = bytes[mainLength];
        a = (chunk & 252) >> 2;
        b = (chunk & 3)   << 4;
        base64 += encodings[a] + encodings[b] + '==';
      } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
        a = (chunk & 64512) >> 10;
        b = (chunk & 1008)  >>  4;
        c = (chunk & 15)    <<  2;
        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
      }
      return base64;
    }



    // unique functions
    var writeFn = function(args, callback) {

      if(typeof args !== 'object'){
        return new Error('invalid arguments');
      }

      if(!(args.data instanceof ArrayBuffer)) {
        return new Error('data should be type ArrayBuffer');
      }

      if(typeof callback !== 'function') {
        callback = null;
      }

      args = args || {flags: 4, retries: device.retries || 3};
      args.flags = 4; // ensure base64 encoded data flag set

      // max 4k for WiConnect requests - take 2560 bytes at a time - 2.5k => ~3.5k base64 string
      var chunkSize = 2560;
      var chunks = Math.ceil(args.data.byteLength / chunkSize);
      var finalChunkSize = args.data.byteLength % chunkSize;
      var i = 1;

      var uri = device.host + '/command';

      var xhrObj = {},
          writer = {};

      writer.onComplete = function(err, res) {};

      writer.onSuccess = function(res) {
        if(typeof callback === 'function') {
          return callback(null, res);
        }
      };

      writer.onFail = function(err, res) {
        if(typeof callback === 'function') {
          return callback(err, res);
        }
      };

      writer.end = function(err, res) {
        writer.onComplete(err, res);
        if(err) {
          return writer.onFail(err, res);
        }
        writer.onSuccess(JSON.parse(res.text));
      }

      var writeChunk = function(attempt) {
        attempt = attempt || 0;

        var byteFrom = (i-1) * chunkSize;
        var byteTo = i * chunkSize;

        if(i === chunks && finalChunkSize > 0){
          byteTo = byteFrom + finalChunkSize;
        }

        var data = base64ArrayBuffer(args.data.slice(byteFrom, byteTo));

        writer.xhr = request.post(uri)
                        .set('Content-Type', 'application/json')
                        .set('Accept', 'application/json')
                        .timeout((args.timeout ? Number(args.timeout) : device.timeout))
                        .send(JSON.stringify({
                          command: 'write ' + args.args + ' ' + ((i === chunks && finalChunkSize > 0) ? finalChunkSize : chunkSize),
                          flags: args.flags,
                          data: data
                        }))
                        .end(function(err, res) {
                          if(err){
                            if(attempt >= args.retries){
                              //fail
                              return writer.end(new Error('error writing file'), res);
                            }
                            // retry chunk
                            return writeChunk(attempt+1);
                          }

                          try {
                            var response = JSON.parse(res.text).response.replace('\r\n','');
                            if(response === 'Command failed') {
                              if(attempt >= args.retries){
                                //fail
                                return writer.end(new Error('error writing file'), res);
                              }
                              // retry chunk
                              return writeChunk(attempt+1);
                            }

                            // send next chunk
                            if(i < chunks){
                              i++;
                              return writeChunk();
                            }

                            // was last chunk
                            writer.end(null, res);
                          }
                          catch(e) {
                            return writer.end(e);
                          }
                        });
      };


      xhrObj.done = function(fn) {
        if(typeof fn !== 'function') {
          return new Error('Object is not a Function.');
        }
        writer.onSuccess = fn;
        return xhrObj;
      };

      xhrObj.fail = function(fn) {
        if(typeof fn !== 'function') {
          return new Error('Object is not a Function.');
        }
        writer.onFail = fn;
        return xhrObj;
      };

      xhrObj.always = function(fn) {
        if(typeof fn !== 'function') {
          return new Error('Object is not a Function.');
        }
        writer.onComplete = fn;
        return xhrObj;
      };

      xhrObj.abort = function() {
        writer.xhr.abort();
      };

      xhrObj.progress = function() {
        return Number(writer.chunksComplete);
      };

      xhrObj.total = function() {
        return Number(writer.totalChunks);
      };

      writeChunk();

      return xhrObj;
    };



    var fileFn = function(args, callback) {
      if(typeof args !== 'object') {
        return new Error('invalid arguments');
      }

      if(!(args.hasOwnProperty('filename')) || !(args.data instanceof ArrayBuffer)) {
        return new Error('invalid arguments');
      }

      if(typeof callback !== 'function') {
        callback = null;
      }

      var fileStream = '';

      var uri = device.host + '/command';

      var xhrObj = {},
          fcr = {};

      fcr.onComplete = function(err, res) {};

      fcr.onSuccess = function(res) {
        if(typeof callback === 'function') {
          return callback(null, res);
        }
      };

      fcr.onFail = function(err, res) {
        if(typeof callback === 'function') {
          return callback(err, res);
        }
      };

      fcr.end = function(err, res) {
        fcr.onComplete(err, res);
        if(err) {
          return fcr.onFail(err, res);
        }
        fcr.onSuccess(JSON.parse(res.text));
      };

      // create a file in open mode and start sending chunks
      var openFile = function(attempt) {
        attempt = attempt || 1;

        fcr.xhr = request.post(uri)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .timeout((args.timeout ? Number(args.timeout) : device.timeout))
                    .send(JSON.stringify({
                      flags: 0,
                      command: 'fcr' + ((typeof args.args !== 'undefined') ? ' ' + args.args : '') + ' -o ' + args.filename + ' ' + args.data.byteLength + ' 1.0.0.0 0xFE ' + device.crc(args.data)
                    }))
                    .end(function(err, res){
                      if(err){
                        if(attempt >= args.retries) {
                          return fcr.end(err, res);
                        }
                        return openFile(attempt+1);
                      }

                      try {
                        fileStream = JSON.parse(res.text).response.replace('\r\n','');
                        if(fileStream === 'Command failed') {
                          if(attempt >= args.retries) {
                            return fcr.end(new Error('error creating file stream'));
                          }
                          return openFile(attempt+1);
                        }
                        // write
                        args.args = fileStream
                        fcr.writer = device.write(args, callback).done(fcr.onSuccess).fail(fcr.onFail).always(fcr.onComplete);
                      }
                      catch(e) {
                        // fail
                        return fcr.end(e);
                      }
                    });
      }


      xhrObj.done = function(fn) {
        if(typeof fn !== 'function') {
          return new Error('Object is not a Function.');
        }
        fcr.onSuccess = fn;
        return xhrObj;
      };

      xhrObj.fail = function(fn) {
        if(typeof fn !== 'function') {
          return new Error('Object is not a Function.');
        }
        fcr.onFail = fn;
        return xhrObj;
      };

      xhrObj.always = function(fn) {
        if(typeof fn !== 'function') {
          return new Error('Object is not a Function.');
        }
        fcr.onComplete = fn;
        return xhrObj;
      };

      xhrObj.abort = function() {
        if(fcr.writer){
         fcr.writer.abort()
        }
        fcr.xhr.abort();
      };

      openFile();

      return xhrObj;
    };

    device['stream_write']  = writeFn;
    device['write']         = writeFn;
    device['file_create']   = fileFn;
    device['fcr']           = fileFn;

    return device;
  };
}));
