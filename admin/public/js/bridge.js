/*! bridge.js build:0.0.1, development. Copyright(c) 2011 Flotype <team@flotype.com> MIT Licensed */
var log;
if(window.console && console.log) {
  log = function () {
    console.log.apply(console, arguments);
  };
} else {
  log = function noop () {};
}


var util = {
  hasProp: function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(Object(obj), prop);
  },
  extend: function(child, parent) {
    if(child === undefined || parent === undefined) return child;
    for (var key in parent) {
      if (util.hasProp(parent, key)) child[key] = parent[key];
    }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  },
  generateGuid: function() {
    var S4 = function() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return "" + S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
  },
  typeOf: function(value) {
    var s = typeof value;
    if (s === 'object') {
      if (value) {
        if (typeof value.length === 'number' &&
          !(value.propertyIsEnumerable('length')) &&
          typeof value.splice === 'function') {
          s = 'array';
        }
      } else {
        s = 'null';
      }
    }
    return s;
  },
  
  // Ignore private methods
  isValid: function(name) {
    return name.charAt(0) !== '_';
  },

  inherit: function (ctor, ctor2) {
    var f = function () {};
    f.prototype = ctor2.prototype;
    ctor.prototype = new f;
  },
  
  findKeys: function(pivot) {
    var operations = [];
    for (key in pivot) {
      if ( typeof(pivot[key]) === 'function' && util.isValid(key) ) {
        operations.push(key);
      }
    }
    return operations;
  },

  stringify: JSON.stringify,
  parse: JSON.parse,

  log: log,

  error: function(){
    util.log.apply(this, arguments);
  },
  warn: function(){
    util.log.apply(this, arguments);
  },
  info: function(){
    util.log.apply(this, arguments);
  },
  
  setLogLevel: function(level) {
    if(level < 3) {
      util.info = function(){};
    }
    if(level < 2) {
      util.warn = function(){};
    }
    if(level < 1) {
      util.error = function(){};
    }
  }
};


var Ref = function (bridgeRoot, pathchain, operations) {
  function Ref() {
    var args = [].slice.apply(arguments);
    Ref.call.apply(Ref, args);
  }
  Ref._fixOps = function() {
    for (var x in Ref._operations) {
      var op = Ref._operations[x];
      if (op !== null) {
        Ref[op] = Ref.get(op).call;
      }
    }
  };
  Ref._getRef = function(operations) {
    return Ref;
  };
  Ref._setOps = function(operations) {
    Ref._operations = operations;
    Ref._fixOps();
    return Ref;
  };
  Ref._toDict = function() {
    return {'ref': Ref._pathchain, 'operations': Ref._operations};
  };

  Ref.get = function(pathadd) {
    pathadd = pathadd.split('.');
    return Ref._bridgeRoot.getPathObj( Ref._pathchain.concat(pathadd) );
  };
  Ref.call = function() {
    var args = [].slice.apply(arguments);
    util.info('Calling', Ref._pathchain, args);
    return Ref._bridgeRoot.send(args, Ref);
  };
  Ref.getLocalName = function() {
    return Ref._pathchain[2];
  };

  Ref._operations = operations || [];
  Ref._bridgeRoot = bridgeRoot;
  Ref._pathchain = pathchain;
  Ref._fixOps();

  return Ref;
};


var Serializer = {
  serialize: function(bridgeRoot, pivot) {
    var typ = util.typeOf(pivot);
    var result;
    switch(typ) {
      case 'object':
        var needs_wrap = false;
        var recurse_queue = [];
        var operations = [];
        var key, val;
        for (key in pivot) {
          var val = pivot[key];
          if ( typeof(val) === 'function' && util.isValid(key) ) {
            operations.push(key);
            needs_wrap = true;
          } else {
            recurse_queue.push(key);
          }
        }
        if ( pivot._getRef && util.typeOf(pivot._getRef) === 'function' ) {
          needs_wrap = true;
        }
        if (needs_wrap) {
          var ref;
          if (pivot._getRef && util.typeOf(pivot._getRef) === 'function') {
            ref = pivot._getRef();
          } else {
            ref = bridgeRoot.createCallback(pivot);
          }
          var target = ref._setOps(operations)._toDict();          
          result = target;
        } else {
          var tmp = {};
          for (pos in recurse_queue) {
            var key = recurse_queue[pos];
            var val = pivot[key];
            tmp[key] = Serializer.serialize(bridgeRoot, val);
          }
          result = tmp;
        }
        break;
      case 'array':
        var tmp = [];
        for (pos in pivot) {
          var val = pivot[pos];
          tmp.push(Serializer.serialize(bridgeRoot, val));
        }
        result = tmp;
        break;
      case 'function':
        var target;
        if ( pivot._getRef && util.typeOf(pivot._getRef) === 'function' ) {
          target = pivot._getRef()._toDict();
        } else {
          var wrap = function WrapDummy(){};
          wrap.callback = pivot;
          var ref = bridgeRoot.createCallback(wrap);
          target = ref.get('callback')._toDict();
        }
        result = target;
        break;
      default:
        result = pivot;
    }
    return result;
  },
  unserialize: function(bridgeRoot, obj) {
    for(var key in obj) {
      var el = obj[key]
      if(typeof el === "object") {
        if(util.hasProp(el, 'ref')) {
          obj[key] = bridgeRoot.getPathObj(el['ref'])._setOps(el['operations']);
        } else {
          Serializer.unserialize(bridgeRoot, el);
        }
      }
    }
  }
};


function Connection(Bridge) {
  var self = this;
  // Set associated Bridge object
  this.Bridge = Bridge;
  // Set options
  this.options = Bridge.options;
  if (!this.options.host || !this.options.port) {
    // Find host and port with redirector
    if (this.options.tcp) {
      var redirector = url.parse(this.options.redirector);
      http.get({
        host: redirector.hostname,
        port: redirector.port,
        path: '/redirect/' + this.options.apiKey
      }, function(res) {
        var data = "";
        res.on('data', function(chunk){
          data += chunk;
        });
        res.on('end', function(){
          try {
            var info = JSON.parse(data);
            self.options.host = info.data.bridge_host;
            self.options.port = info.data.bridge_port;
            if (!self.options.host || !self.options.port) {
              throw "Could not find host and port in JSON";
            }
            self.establishConnection();
          } catch (e) {
            util.error('Unable to parse redirector response ' + data);
          }
        });
      }).on('error', function(e) {
      throw e
        util.error('Unable to contact redirector');
      });
    } else {
      // JSONP
      window.bridgeHost = function(status, host, port){ 
        self.options.host = host;
        self.options.port = parseInt(port, 10);
        self.establishConnection();
        delete window.bridgeHost;
      };
      var s = document.createElement('script');
      s.setAttribute('src', this.options.redirector + '/redirect/' + this.options.apiKey + '/jsonp');
      document.getElementsByTagName('head')[0].appendChild(s);
    }
  } else {
    // Host and port is specified
    this.establishConnection();
  }

  

}

Connection.prototype.reconnect = function () {
  util.info("Attempting reconnect");
  var self = this;
  if (!this.connected && this.interval < 12800) {
    setTimeout(function(){self.establishConnection()}, this.interval *= 2);
  }
};

Connection.prototype.establishConnection = function () {
  var self = this,
      Bridge = this.Bridge;
  // Select between TCP and SockJS transports
  if (this.options.tcp) {
    util.info('Starting TCP connection', this.options.host, this.options.port);
    this.sock = new TCP(this.options).sock;
  } else {
    util.info('Starting SockJS connection');
    this.sock = new SockJS(this.options.protocol + this.options.host + ':' + this.options.port + '/bridge', this.options.protocols, this.options.sockjs);
  }
  
  this.sock.Bridge = Bridge;

  this.sock.onmessage = function (message) {
    var handleMessage = function(message){
      try {
        message = util.parse(message.data);
        util.info('Received', message);
        Bridge.onMessage(message);
      } catch (e) {
        util.error("Message parsing failed: ", e.message, e.stack);
      }
    };
    
    util.info("clientId and secret received", message.data);
    var ids = message.data.toString().split('|');
    if(ids.length !== 2) {
      handleMessage(message);
    } else {
      self.clientId = ids[0];
      self.secret = ids[1];
      self.interval = 400;
      self.sock.onmessage = handleMessage;
      Bridge.onReady();
    }
  };

  this.sock.onopen = function () {
    util.info("Beginning handshake");
    var msg = {command: 'CONNECT', data: {session: [self.clientId || null, self.secret || null], api_key: self.options.apiKey}};
    msg = util.stringify(msg);
    
    // If TCP use _send to force send bypassing connect check
    if (self.sock._send) {
      self.sock._send(msg);
    } else {
      self.sock.send(msg);
    }
    
  };

  this.sock.onclose = function () {
    util.warn("Connection closed");
    self.connected = false;
    if (self.options.reconnect) {
      // do reconnect stuff. start at 100 ms.
      self.reconnect();
    }
  };
};

Connection.prototype.send = function (args, destination) {
  var msg = {command: 'SEND', data: { 'args': Serializer.serialize(this.Bridge, args), 'destination': Serializer.serialize(this.Bridge, destination)}};
  msg = util.stringify(msg);
  util.info('Sending', msg);
  this.sock.send(msg);
};

Connection.prototype.publishService = function (name, callback) {
  util.info('Joining worker pool', name);
  var msg = {command: 'JOINWORKERPOOL', data: {name: name, callback: Serializer.serialize(this.Bridge, callback)} };
  msg = util.stringify(msg);
  this.sock.send(msg);
};

Connection.prototype.getService = function (name, callback) {
  // Adding other client is not supported
  var msg = {command: 'GETOPS', data: {name: name, callback: Serializer.serialize(this.Bridge, callback)} };
  msg = util.stringify(msg);
  this.sock.send(msg);
};

Connection.prototype.getChannel = function (name, callback) {
  var self = this;
  // Adding other client is not supported
  var msg = {command: 'GETCHANNEL', data: {name: name, callback: Serializer.serialize(this.Bridge, function(service, err) {
    if(err) {
      callback(null, err);
      return;
    }
    // Callback with channel ref
    callback(self.Bridge.getPathObj(['channel', name, 'channel:' + name])._setOps(service._operations), name);

  }) }};
  msg = util.stringify(msg);
  this.sock.send(msg);
};

Connection.prototype.joinChannel = function (name, handler, callback) {
  // Adding other client is not supported
  var msg = {command: 'JOINCHANNEL', data: {name: name, handler: Serializer.serialize(this.Bridge, handler), callback: Serializer.serialize(this.Bridge, callback)} };
  msg = util.stringify(msg);
  this.sock.send(msg);
};

Connection.prototype.leaveChannel = function (name, handler, callback) {
  // Adding other client is not supported
  var msg = {command: 'LEAVECHANNEL', data: {name: name, handler: Serializer.serialize(this.Bridge, handler), callback: Serializer.serialize(this.Bridge, callback)} };
  msg = util.stringify(msg);
  this.sock.send(msg);
};
var defaultOptions = {
  protocol: 'http://',
  /*host: 'localhost',
  port: 8091,*/
  redirector: 'http://redirector.flotype.com',
  reconnect: true,
  log: 2,
  tcp: false
};




function Bridge(options) {

  var self = this;

  // Initialize system call service
  var system = {
    hook_channel_handler: function(name, handler, callback){
      self.children['channel:' + name] = self.children[handler._getRef()._pathchain[2]];
      if (callback) {
        var ref = self.getPathObj(['channel', name, 'channel:' + name]);
        ref._setOps(util.findKeys(self.children['channel:' + name]));
        callback.call( ref, name );
      }
    },
    getservice: function(name, callback){
      if (util.hasProp(self.children, name)) {
        callback.call(self.children[name]);
      } else {
        callback.call(null, "Cannot find service " + name);
      }
    },
    remoteError: function(msg) {
      util.warn(msg);
      self.emit('remoteError', [msg]);
    }
  };

  // Set configuration options
  this.options = util.extend(defaultOptions, options);

  // Set logging level
  util.setLogLevel(this.options.log);

  // Contains references to shared references
  this.children = {system: system};

  // Indicate whether connected
  this.connected = false;

  // Communication layer
  this.connection = new Connection(this);

  // Store event handlers
  this._events = {};
}

// Event emitter functions
Bridge.prototype.on = function (name, fn) {
  if (!(util.hasProp(this._events, name))) {
    this._events[name] = [];
  }
  this._events[name].push(fn);
  return this;
};

Bridge.prototype.emit = function (name, args) {
  if (util.hasProp(this._events, name)) {
    var events = this._events[name].slice(0);
    for (var i = 0, ii = events.length; i < ii; i++) {
      events[i].apply(this, args === undefined ? [] : args);
    }
  }
  return this;
};

Bridge.prototype.removeEvent = function (name, fn) {
  if (util.hasProp(this._events, name)) {
    for (var a = 0, l = this._events[name].length; a < l; a++) {
      if (this._events[name][a] === fn) {
        this._events[name].splice(a, 1);
      }
    }
  }
  return this;
};


Bridge.prototype.onReady = function() {
  util.info('Handshake complete');
  if(!this.connected) {
    this.connected = true;
    this.emit('ready');
  }
};

Bridge.prototype.onMessage = function(message) {
  Serializer.unserialize(this, message);
  var unser = message;
  var destination = unser.destination;
  // util.info('DECODED: ', unser.args );
  if (!destination) {
    util.warn('No destination in message', unser);
    return;
  }
  var pathchain = unser.destination._pathchain;
  var args = unser.args;

  this.execute(pathchain, args);
};

Bridge.prototype.execute = function(pathchain, args) {
  var obj = this.children[pathchain[2]];
  var func = obj[pathchain[3]];


  if (func) {
    func.apply( obj, args );
  } else {
    // TODO: Throw exception
    util.warn('No Func nor Default Handler for', pathchain);
  }
};


Bridge.prototype.publishService = function(name, service, callback) {

  if(name === "system") {
    util.error("Invalid service name: " + name);
    return;
  }

  var self = this;

  if ( (!service._getRef) || (util.typeOf(service._getRef) !== 'function') ) {
    service._getRef = function() { return self.getPathObj( ['named', name, name] ); };
    this.connection.publishService(name, callback);
  } else {
    util.error("Service can't be renamed! " + name + ' old ' +  service._getRef().getLocalName() );
    return;
  }
  this.children[name] = service;
  return service._getRef();
};

Bridge.prototype.createCallback = function(service) {
  var self = this;
  var name;
  var ref;
  if ( (!service._getRef) || (util.typeOf(service._getRef) !== 'function') ) {
    name = util.generateGuid();
    ref = self.getPathObj( ['client', self.getClientId(), name] );
    this.children[name] = service;
  } else {
    ref = service._getRef();
  }
  return ref;
};

Bridge.prototype.joinChannel = function(name, handler, callback) {
  this.connection.joinChannel(name, handler, callback);
};

Bridge.prototype.leaveChannel = function(name, handler, callback) {
  this.connection.leaveChannel(name, handler, callback);
};

Bridge.prototype.send = function(args, destination) {
  this.connection.send(args, destination);
};

Bridge.prototype.getPathObj = function(pathchain) {
  return new Ref(this, pathchain);
};

Bridge.prototype.getRootRef = function() {
  return this.getPathObj(['client', this.getClientId()]);
};

Bridge.prototype.get = function(pathStr)  {
  var pathchain = pathStr.split('.');
  return this.getPathObj(pathchain, true);
};


/* Public APIs */
Bridge.prototype.ready = function(func) {
  if(!this.connected) {
    this.on('ready', func);
  } else {
    func();
  }
};

Bridge.prototype.getClientId = function() {
  return this.connection.clientId;
};

Bridge.prototype.getService = function(name, callback) {
  this.connection.getService(name, callback);
};


Bridge.prototype.getChannel = function(name, callback) {
  this.connection.getChannel(name, callback);
};

