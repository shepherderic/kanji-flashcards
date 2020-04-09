/**
 * Functionality for the Radicals review page
 */
var kanji = (function () {

  const symbolData = KANJI; // for now, pull from global in file
  const levelData = KANJI_LEVELS; // for now, pull from global in file

  /**
   * Initializes the Flashcards functionality
   */
  function init (id) {

    levelSelector.init(id, levelData, symbolData).then(function (data) {
      flashcard.start(id, data).then(function () {
        init(id); // recurse to start over
      });
    });

  }

  return {
    init: init
  };
})();
