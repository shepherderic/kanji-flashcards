
var UTIL = (function () {

  const debug = function (message) {
    try {
      let debugEl = document.getElementById('debugger').getElementsByTagName('p')[0];
      debugEl.innerHTML = message;
    } catch {}
  }

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

  const checkIfState = function (deferred) {
    if (!_.isEmpty(getState())) {
      // we have stuff to maybe review, give user the option
      $('body').prepend('<div id="state-switcher"></div>');
      $('#state-switcher').append(`<p>There is a flashcard set in progress, choose whether to continue or reset:</p>`);
      $('#state-switcher').append(`<button id="state-reset">Reset</button>`);
      $('#state-switcher').append(`<button id="state-continue">Continue</button>`);
    } else {
      $('#state-switcher').remove();
    }

    $('#state-continue').on('click', function () {
      const state = getState();
      deferred.resolve(state.set, state.pos, state.review);
    });

    $('#state-reset').on('click', function () {
      clearState();
    });
  }

  return {
    getState: getState,
    setState: setState,
    clearState: clearState,
    checkIfState: checkIfState,
    debug: debug
  };
})();
