var s      = {};
var id     = s.id = 0;

var slice  = Array.prototype.slice;
var pow    = Math.pow;
var sqrt   = Math.sqrt;

var extend = s.extend = function(dest) {
  var key, source, sources = slice.call(arguments, 1);
  for (var i = 0, l = sources.length; i < l; i++) {
    source = sources[i];
    for (key in source) {
      if (source.hasOwnProperty(key)) {
        dest[key] = source[key];
      }
    }
  }
};

var Vector = s.Vector = function(x,y) {
  this.x = x || 0;
  this.y = y || 0;
};

extend(Vector.prototype, {
  toString: function() {
    return 'x: ' + this.x + ' y:' + this.y;
  },

  copy: function() {
    return new Vector(this.x, this.y);
  },

  add: function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  },

  sub: function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  },

  mult: function(v) {
    this.x *= v;
    this.y *= v;
    return this;
  },

  div: function(v) {
    this.x /= v;
    this.y /= v;
    return this;
  },

  dist: function(v) {
    return sqrt(pow(v.x - this.x, 2) + pow(v.y - this.y, 2));
  }
});

var World = s.World = function(options) {
  this._objects = [];
  this._byId    = {};
  this._forces  = {};
  this.damping  = options.damping || 1;
};

extend(World.prototype, {
  addObject: function(obj) {
    if (this._byId[obj.id]) return false;
    this._byId[obj.id] = obj;
    this._objects.push(obj);
    return this;
  },

  removeObject: function(obj) {
    var currentObj;
    for (var i = 0, l = this._objects.length; i < l; i++) {
      currentObj = this._objects[i];
      if (currentObj === obj) {
        this._objects.splice(i,1);
        break;
      }
    }
    delete this._byId[obj.id];
    return this;
  },

  addForce: function(force) {
    this._forces[force.id] = force;
  },

  removeForce: function(force) {
    delete this._forces[force.id];
  },

  solve: function() {
    for (var i = 0, l = this._objects.length, obj; i < l; i++) {
      obj = this._objects[i];
      obj.solve(this._forces, this.damping);
    }
  },

  each: function(callback, context) {
    for (var i = 0, l = this._objects.length, obj; i < l; i++) {
      callback.call(context || this, this._objects[i]);
    }
  }

});

var Spring = s.Spring = function(options) {
  this.id   = id++;
  this.eq   = options.eq;
  this.k    = options.k;
  this.type = 'Spring';
};

var Body = s.Body = function(options) {
  this.id     = id++;
  this.mass   = options.mass   || 0;
  this.acc    = options.acc    || new Vector();
  this.vel    = options.vel    || new Vector();
  this.pos    = options.pos    || new Vector();
  this.forces = options.forces || [];
};

extend(Body.prototype, {
  toString: function() {
    return 'pos:' + this.pos;
  },

  solve: function(externalForces, damping) {
    var allForces = [externalForces, this.forces], forces, force, x, k, f;
    for (var j = 0; j < 2; j++) {
      forces = allForces[j] || [];
      for (var i = 0, l = forces.length; i < l; i++) {
        force = forces[i];
        switch (force.type) {
          case 'Spring':
            f = this.pos.copy().sub(force.eq).mult(-force.k).div(this.mass);
            this.acc.add(f);
            break;
          default:
            this.acc.add(force.copy().div(this.mass));
            break;
        }
      }
    }
    this.vel.add(this.acc);
    this.vel.mult(damping || 1);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
});
