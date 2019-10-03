
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
    levelSelector.init(id, levelData, symbolData).then(function (data) {
      flashcard.start(id, data);
    });
  }

  return {
    init: init
  };
})();
