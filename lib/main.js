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
      host:     args.host     || '',
      auth:     args.auth     || null
    };

    var getCommands = [ {adc_take_sample  : 'adc'},
                        {get              : 'get'},
                        {gpio_get         : 'gge'},
                        {help             : 'help'},
                        {ls               : 'ls'},
                        {stream_list      : 'list'},
                        {version          : 'ver'},
                        {wlan_scan        : 'scan'}
                      ];

    var postCommands = [{dac_set_level    : 'dac'},
                        {factory_reset    : 'fac'},
                        {file_create      : 'fcr'},
                        {file_delete      : 'fde'},
                        {file_open        : 'fop'},
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
                        {ota              : 'ota'},
                        {ping             : 'ping'},
                        {pwm_update       : 'pwm'},
                        {reboot           : 'reboot'},
                        {reformat_sflash  : 'reformat'},
                        {save             : 'save'},
                        {set              : 'set'},
                        {setup            : 'setup'},
                        {sleep            : 'sleep'},
                        {stream_close     : 'close'},
                        {stream_poll      : 'poll'},
                        {stream_read      : 'read'},
                        {stream_write     : 'write'},
                        {tcp_client       : 'tcpc'},
                        {tcp_server       : 'tcps'},
                        {tls_client       : 'tlsc'},
                        {tls_server       : 'tlss'},
                        {udp_client       : 'udpc'},
                        {udp_server       : 'udps'},
                        {wlan_get_rssi    : 'rssi'},
                        {wps              : 'wps'}
                      ];

    getCommands.forEach(function(cmd){
      var getFn = function(args, callback) {

        args = args || {};

        if(typeof callback !== 'function') {
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
                    .timeout((args.timeout ? Number(args.timeout) : 120000));

        if(device.auth) {
          xhr.auth(device.auth.user, device.auth.pass);
        }

        xhr.onComplete = function(resp) {};

        xhr.onSuccess = function(resp) {
          if(typeof callback === 'function') {
            return callback(null, resp);
          }
        };

        xhr.onFail = function(err, resp) {
          if(typeof callback === 'function') {
            return callback(err, resp);
          }
        };

        xhr.done = function(fn) {
          if(typeof fn !== 'function') {
            throw new Error('Object is not a Function.');
          }

          xhr.onSuccess = fn;
        };

        xhr.fail = function(fn) {
          if(typeof fn !== 'function') {
            throw new Error('Object is not a Function.');
          }

          xhr.onFail = fn;
        };

        xhr.always = function(fn) {
          if(typeof fn !== 'function') {
            throw new Error('Object is not a Function.');
          }

          xhr.onComplete = fn;

          return xhr;
        };

        xhr.end(function(err, resp) {
          xhr.onComplete(resp);

          if(err) {
            return xhr.onFail(err, resp);
          }

          xhr.onSuccess(JSON.parse(resp.text));
        });

        return xhr;
      };

      device[Object.keys(cmd)[0]] = getFn;

      if(Object.keys(cmd)[0] !== cmd[Object.keys(cmd)[0]]) {
        device[cmd[Object.keys(cmd)[0]]] = getFn;
      }
    });

    postCommands.forEach(function(cmd){
      var postFn = function(args, callback) {

        args = args || {flags: 0};

        if(typeof callback !== 'function') {
          callback = null;
        }

        if(typeof args === 'function') {
          callback = args;
          args = {flags: 0};
        }

        var uri = device.host + '/command';

        var xhr = request.post(uri)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .timeout((args.timeout ? Number(args.timeout) : 120000))
                    .send(JSON.stringify({flags: args.flags, command: cmd[Object.keys(cmd)[0]] + ((typeof args.args !== 'undefined') ? ' ' + args.args : '')}));

        if(device.auth) {
          xhr.auth(device.auth.user, device.auth.pass);
        }

        xhr.onComplete = function(resp) {};

        xhr.onSuccess = function(resp) {
          if(typeof callback === 'function') {
            return callback(null, resp);
          }
        };

        xhr.onFail = function(err, resp) {
          if(typeof callback === 'function') {
            return callback(err, resp);
          }
        };

        xhr.done = function(fn) {
          if(typeof fn !== 'function') {
            throw new Error('Object is not a Function.');
          }

          xhr.onSuccess = fn;

          return xhr;
        };

        xhr.fail = function(fn) {
          if(typeof fn !== 'function') {
            throw new Error('Object is not a Function.');
          }

          xhr.onFail = fn;

          return xhr;
        };

        xhr.always = function(fn) {
          if(typeof fn !== 'function') {
            throw new Error('Object is not a Function.');
          }

          xhr.onComplete = fn;

          return xhr;
        };

        xhr.end(function(err, resp) {
          xhr.onComplete(resp);

          if(err) {
            return xhr.onFail(err, resp);
          }

          xhr.onSuccess(JSON.parse(resp.text));
        });

        return xhr;
      };

      device[Object.keys(cmd)[0]] = postFn;

      if(Object.keys(cmd)[0] !== cmd[Object.keys(cmd)[0]]) {
        device[cmd[Object.keys(cmd)[0]]] = postFn;
      }
    });

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

    return device;
  };
}));
