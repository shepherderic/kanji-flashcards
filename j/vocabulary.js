
/**
 * Functionality for the Radicals review page
 */
var vocabulary = (function () {

  const symbolData = VOCABULARY; // for now, pull from global in file
  const levelData = VOCABULARY_LEVELS; // for now, pull from global in file

  /**
   * Initializes the Flashcards functionality
   */
  function init (id) {
    levelSelector.init(id, levelData, symbolData).then(function (data, pos, reviewSet) {
      flashcard.start(id, data, pos, reviewSet).then(function () {
        UTIL.clearState();
        init(id); // recurse to start over
      });
    });
  }

  return {
    init: init
  };
})();
