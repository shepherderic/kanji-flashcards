
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

  const setState = function (set, pos, review) {
    const key = document.location.pathname;
    const obj = JSON.stringify({set: set, pos: pos, review: review});
    window.localStorage.setItem(key, obj);
  }

  const clearState = function () {
    const key = document.location.pathname;
    window.localStorage.removeItem(key);
  }

  return {
    getState: getState,
    setState: setState,
    clearState: clearState
  };
})();
