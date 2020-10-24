
var UTIL = (function () {

  const getState = function () {
    const key = document.location.pathname;
    const item = window.localStorage.getItem(key);
    let obj;

    try {
      obj = JSON.parse(item) || {};
    } catch {
      obj = {};
    }

    return obj;
  }

  const setState = function (set, pos) {
    const key = document.location.pathname;
    const obj = JSON.stringify({set: set, pos: pos});
    window.localStorage.setItem(key, obj);
  }

  return {
    getState: getState,
    setState: setState
  };
})();
