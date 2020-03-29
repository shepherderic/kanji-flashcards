var levelSelector = (function () {

  // Constants
  const LEVEL_CLASS = 'level-selector';
  const LEVEL_ALL_CLASS = 'level-all';
  const LEVEL_RADICAL_CLASS = 'level-radicals';
  const LEVEL_ITEM_CLASS = 'level-item';
  const LEVEL_SUBMIT_CLASS = 'level-submit';

  let $el;

  // Return a promise with the data
  function init (id, levelData, symbolData) {
    $el = $(`#${id}`);

    const deferred = $.Deferred();

    createSelectionForm(levelData);

    // Wire up form submit event to kick things off
    $el.find(`.${LEVEL_SUBMIT_CLASS}`).click(function () {
      handleSubmit(deferred, symbolData);
    });

    return deferred.promise();
  }

  // Handle the submit button click
  function handleSubmit (deferred, symbolData) {
    const levels = (_.map($(`.${LEVEL_ITEM_CLASS}:checked`), function (item) {
      return item.value;
    }));

    const dataSet = _.filter(symbolData, function (item) {
      return levels.includes(item.level);
    });

    // For now, just create a new data set either filtered or not
    if ($(`.${LEVEL_RADICAL_CLASS}`).prop('checked')) {
      newDataSet = _.filter(dataSet, function (item) {
        return item.radicals && item.radicals.length > 0;
      });
    } else {
      newDataSet = dataSet;
    }

    deferred.resolve(_.shuffle(newDataSet));
  }

  function normalizeText (item) {
    return item.toLowerCase().replace(' ', '');
  }

  function createSelectionForm (levelData) {
    let html = '';

    html += `<input type="checkbox" class="${LEVEL_RADICAL_CLASS}" value="has-radicals">Has Radicals</input>`;

    // Iterate through levels
    _.each(levelData, function (level) {

      html += `<h2>${level.name}</h2>`;
      html += `<div id="flashcard-level-${level.name}">`
      // Make checkboxes including select all
      html += `<input type="checkbox" class="${LEVEL_ALL_CLASS}" value="all-${level.name}">All</input>`;
      _.each(level.levels, function (i) {
        html += `<input type="checkbox" class="${LEVEL_ITEM_CLASS}" value="${i}">${i}</input>`;
      });
      html += `</div>`;

      //html += `<label class="${LABEL_CLASS}" for="for-${normalizeText(level.name)}">`;
      //html += `<span id="flashcard-level-${level.name}">`;
      // Make checkboxes including select all

      //html += `</span>`;
      //html += `</label>`

    });

    html += `<input type="button" class="btn ${LEVEL_SUBMIT_CLASS}" value="Go!"/>`;

    $el.find('.' + LEVEL_CLASS).html(html);

    $el.find('.' + LEVEL_ALL_CLASS).click(function () {
      const boxes = $(this).parent().find(`.${LEVEL_ITEM_CLASS}`);
      boxes.prop('checked', !boxes.prop('checked'));
    });
  }

  return {
    init: init,
    handleSubmit: handleSubmit,
  };
})();
