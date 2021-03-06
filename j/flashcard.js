// TODO: only allow adding to review set once
// TODO: extract the templates for each to minimize if blocks
// TODO: rephrase - "review" is now overloaded as the main cards and the flagged set

/* SCRAPING CODE

var arr = [];
$('.character-item').each(function (i, item) {
  let thisOne;
  const kanji = $(item).find('.character').text().trim();
  const name = $(item).find('ul li:last').text();
  const reading = $(item).find('ul li:first').text().trim();
  const level = $(item).closest('section').get(0).id.split('-')[1];

  thisOne = {
    symbol: kanji,
    name: name,
    reading: reading,
    level: level
  };
  arr.push(thisOne);
});

*/

var flashcard = (function () {

  // Constants
  const LEVEL_CLASS = 'level-selector';
  const LEVEL_ALL_CLASS = 'level-all';
  const LEVEL_ITEM_CLASS = 'level-item';
  const LEVEL_SUBMIT_CLASS = 'level-submit';
  const CONTENT_CLASS = 'flashcard-content';
  const NUMBER_CLASS = 'number';
  const CARD_CLASS = 'flashcard';
  const OVERLAY_CLASS = 'overlay';
  const TIP_CLASS = 'temp-show';
  const FLAG_CLASS = 'flagged';
  const SHOW_TIP_CLASS = 'show-tip';
  const FLASHCARD_ACTIVATED_CLASS = 'flashcard-activated';

  // We shall have some global state
  const GLOBALS = {
    $el: null,
    pos: 0,
    count: 0,
    followUpReviewSet: [],
    hammerInstance: null,
    deferred: $.Deferred(),
  };

  function start (id, data, startPosition, storedSetToReview) {
    startPosition = startPosition || 0;
    if (storedSetToReview) {
      GLOBALS.followUpReviewSet = storedSetToReview;
    }
    GLOBALS.pos = startPosition; // ugly for now

    GLOBALS.$el = $(`#${id}`);

    const reviewSet = startPosition === 0 ? _.shuffle(data) : data;
    GLOBALS.count = reviewSet.length;

    // Initial state storage
    UTIL.setState(reviewSet, startPosition, GLOBALS.followUpReviewSet);

    // Start
    GLOBALS.count > 0 && review(reviewSet, startPosition);

    return GLOBALS.deferred.promise(); // so the caller can re-initialize
  }

  /*
   * Makes an HTML image if we need one, because template shouldn't care and JS templates are dumb
   */
  function decorateImage (item) {
    if (item.symbolImage) {
      item.symbol = `<img src="${item.symbolImage}"/>`
    }
    return item;
  }

  /*
   * Creates the HTML for a single card
   */
  function makeCard (item, number) {
    const decoratedItem = decorateImage(item);

    let html = `<div class="${CARD_CLASS}">`;
    html += `<h3 class="${NUMBER_CLASS}">${decoratedItem.level}–${number + 1}/${GLOBALS.count}</h3>`;
    html += `<dl>`;
    html += `<dt>${decoratedItem.name}</dt>`;
    html += `<dd lang="ja">${decoratedItem.symbol}</dd>`;
    if (decoratedItem.reading) {
      html += `<dd lang="ja" class="reading">${decoratedItem.reading}</dd>`;
    }
    if (decoratedItem.radicals) {
      html += `<dd class="composing-radicals">`;
      // Now this breaks vocab since it has radicals only as an array
      // We will eventually need multiple templates but fuck it for now
      if (typeof decoratedItem.radicals === 'object') {
        _.each(_.keys(decoratedItem.radicals), function (key) {
          html += `${key}:${decoratedItem.radicals[key]}<br />`;
        });
      } else { // string
        html += decoratedItem.radicals;
      }
      html += `</dd>`;
    }
    html += `</dl>`;
    html += `</div>`;
    return html;
  }

  /*
   * Displays a given card
   */
  function showCard (item, i) {
    const html = makeCard(item, i);
    GLOBALS.$el.find(`.${CONTENT_CLASS}`).html(html);
  }

  /*
   * Resets everything so we can start over with a new data set
   */
  function reset () {
    GLOBALS.$el.find(`.${CONTENT_CLASS}`).hide();
    GLOBALS.pos = 0;
    GLOBALS.$el.find(`.${CONTENT_CLASS}`).off();
    $(document).off('keydown').off('keyup');
    GLOBALS.hammerInstance.off('doubletap tap swipe press');
    GLOBALS.$el.find(`.${OVERLAY_CLASS}`).fadeOut();
    GLOBALS.$el.removeClass(FLASHCARD_ACTIVATED_CLASS);
    GLOBALS.count = 0;
  }

  /*
   * Moves forward one card
   */
  function forward (set) {
    GLOBALS.pos += 1;

    UTIL.setState(set, GLOBALS.pos, GLOBALS.followUpReviewSet);

    if (set.length > GLOBALS.pos) {
      showCard(set[GLOBALS.pos], GLOBALS.pos);
    } else {
      reset();

      // Review flagged cards if there are any which currently will go on forever now...
      if (GLOBALS.followUpReviewSet.length) {

        GLOBALS.count = GLOBALS.followUpReviewSet.length;

        // what the hell we'll just hack the ever living fuck out of it right now
        const newSet = _.clone(GLOBALS.followUpReviewSet);
        GLOBALS.followUpReviewSet = [];

        // log for review just in case it's wanted
        console.log('Set to review:');
        console.log(JSON.stringify(_.map(newSet, function (item) {
          return item.symbol;
        })));

        // start again with new set
        review(newSet, 0);
      } else {
        // back to square 1
        GLOBALS.deferred.resolve();
      }
    }
  }

  /*
   * Moves backward one card
   */
  function backward (set) {
    GLOBALS.pos -= 1;

    UTIL.setState(set, GLOBALS.pos, GLOBALS.followUpReviewSet);

    if (GLOBALS.pos >= 0) {
      showCard(set[GLOBALS.pos], GLOBALS.pos);
    } else {
      reset();
      GLOBALS.deferred.resolve();
    }
  }

  /*
   * Shows an answer on a card
   */
  function showAnswer () {
    GLOBALS.$el.find(`.${CARD_CLASS} dt`).addClass(TIP_CLASS);
    GLOBALS.$el.addClass(SHOW_TIP_CLASS);
  }

  /*
   * Hides an answer on a card
   */
  function hideAnswer () {
    GLOBALS.$el.find(`.${CARD_CLASS} dt`).removeClass(TIP_CLASS);
    GLOBALS.$el.removeClass(SHOW_TIP_CLASS);
  }

  /**
   * Flags a card for review
   */
  function flag (item) {
    // get position, mark interval
    GLOBALS.followUpReviewSet.push(item);
    GLOBALS.$el.find(`.${CARD_CLASS}`).addClass(FLAG_CLASS);
  }

  /*
   * Starts reviewing the given set of cards and wires up the relevant key/mouse events
   */
  function review (set, startPosition) {

    GLOBALS.$el.find(`.${OVERLAY_CLASS}`).fadeIn();
    GLOBALS.$el.addClass(FLASHCARD_ACTIVATED_CLASS);

    showCard(set[GLOBALS.pos], startPosition || GLOBALS.pos);

    GLOBALS.$el.find(`.${CONTENT_CLASS}`).show();

    // Set up touch
    GLOBALS.hammerInstance = new Hammer(GLOBALS.$el.get(0));
    GLOBALS.hammerInstance.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });

    GLOBALS.hammerInstance.on('press', function () {
      flag(set[GLOBALS.pos]);
      const answerShown = GLOBALS.$el.hasClass(SHOW_TIP_CLASS);
      if (!answerShown) {
        showAnswer();
      }
    });

    GLOBALS.hammerInstance.on('tap', function () {
      const answerShown = GLOBALS.$el.hasClass(SHOW_TIP_CLASS);
      answerShown ? hideAnswer() : showAnswer();
    });

    GLOBALS.hammerInstance.on('swipe', function (data) {
      if (data.isFinal) {
        hideAnswer();
        if (data.deltaX < 0) {
          forward(set);
        } else if (data.deltaX > 0) {
          backward(set);
        }
      }
    });

    // Set up key
    $(document).keydown(function (e) {
      if (e.code === 'KeyI' || e.code === 'ArrowUp') {
        showAnswer();
        return false;
      }
      if (e.code === 'ArrowRight') {
        forward(set);
      }
      if (e.code === 'ArrowLeft') {
        backward(set);
      }
      if (e.code === 'ArrowDown') {
        flag(set[GLOBALS.pos]);
        return false;
      }
      if (e.code === 'Escape') {
        reset(set);
        GLOBALS.deferred.resolve();
      }
    }).keyup(function (e) {
      if (e.code === 'KeyI' || e.code === 'ArrowUp') {
        hideAnswer();
      }
    });

  }

  return {
    start: start,
  };
})();
