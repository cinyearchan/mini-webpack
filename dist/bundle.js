(function (modules) {
  function require(filePath) {
    const fn = modules[filePath];

    const module = {
      exports: {},
    };
    fn(require, module, module.exports);

    return module.exports;
  }

  require(0);
})({
  
    "0": function (require, module, exports) {
      "use strict";

var _foo = require("./foo.js");

var _foo2 = _interopRequireDefault(_foo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _foo2.default)();
console.log("main.js");
    },
  
    "1": function (require, module, exports) {
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var foo = function foo() {
  console.log("foo");
};

exports.default = foo;
    },
  
});
