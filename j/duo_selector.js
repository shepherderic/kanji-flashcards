// TODO: MAKE IT RESUBMITTABLE, currently the promise implemention is preventing that

var duoSelector = (function () {

  // Constants
  const LEVEL_CLASS = 'level-selector';
  const LEVEL_ALL_CLASS = 'level-all';
  const LEVEL_ALL_LEVELS_CLASS = 'level-all-levels';
  const LEVEL_ITEM_CLASS = 'level-item';
  const LEVEL_SUBMIT_CLASS = 'level-submit';
  const SHOW_READINGS_CLASS = 'flashcard-show-readings';

  let $el;

  // Return a promise with the data
  function init (id, levelData, symbolData) {
    $el = $(`#${id}`);

    const deferred = $.Deferred();

    createSelectionForm(levelData);

    // Wire up form submit event to kick things off
    $el.find(`.${LEVEL_SUBMIT_CLASS}`).click(function () {
      handleSubmit(deferred, levelData, symbolData);
    });

    return deferred.promise();
  }

  // Handle the submit button click
  function handleSubmit (deferred, levelData, symbolData) {

    const levels = (_.map($(`.${LEVEL_ALL_CLASS}:checked`), function (item) {
      return parseInt(item.value.split('duo-level-')[1], 10);
    }));

    // Show readings persistently if user requests, otherwise hide until up arrow
    const showReadings = $el.find('.flashcard-show-readings').prop('checked');

    if (showReadings) {
      $el.addClass('always-show-readings');
    }

    // which words do we need, and flatten into a single array
    const words = _.flatten(
      _.map(levels, function (level) {
        return _.find(levelData, function (entry) {
          return entry.level === level;
        }).words;
      })
    );

    // get the word data
    const dataSet = _.shuffle(
      _.uniqBy(
        _.filter(symbolData, function (item) {
          return _.includes(words, item.symbol);
        }), 'symbol' // filter out duplicates because the data set is bad
      )
    );

    deferred.resolve(dataSet);
  }

  function createSelectionForm (levelData) {
    let html = '';

    // Select all
    html += `<div id="flashcard-level-all">`;
    html += `<input type="checkbox" class="${LEVEL_ALL_LEVELS_CLASS}" value="duo-level-all">All Levels</input>`;
    html += `</div>`;

    // Show readings dynamically or always?
    html += `<div id="flashcard-show-readings">`;
    html += `<input type="checkbox" class="${SHOW_READINGS_CLASS}" value="duo-show-readings">Show Readings</input>`;
    html += `</div>`;

    // Iterate through levels
    _.each(levelData, function (level) {

      if (level.words.length) {
        html += `<div class="selection-level-container">`;
        html += `<h2>${level.name}</h2>`;
        html += `<div id="flashcard-level-${level.name}">`;
        // Make checkboxes including select all
        html += `<input type="checkbox" class="${LEVEL_ALL_CLASS}" value="duo-level-${level.level}">All</input>`;
        html += `</div>`;
        html += `</div>`;
      }
    });

    html += `<div><input type="button" class="btn ${LEVEL_SUBMIT_CLASS}" value="Go!"/></div>`;

    $el.find(`.${LEVEL_CLASS}`).html(html);

    $el.find(`.${LEVEL_ALL_LEVELS_CLASS}`).click(function () {
      const boxes = $(this).parents().find(`.${LEVEL_ALL_CLASS}`);
      boxes.prop('checked', !boxes.prop('checked'));
    });

    $el.find(`.${LEVEL_CLASS}`).click(function (ev) {
      const target = ev.target;
      const box = $(target).find(`.${LEVEL_ALL_CLASS}`);
      box.prop('checked', !box.prop('checked'));
    })
  }

  return {
    init: init,
    handleSubmit: handleSubmit,
  };
})();
