
/**
 * Functionality for the Radicals review page
 */
var duoVocabulary = (function () {

  const symbolData = VOCABULARY; // for now, pull from global in file
  const levelData = DUO_KANJI; // for now, pull from global in file

  const kanjiData = KANJI; // for now, pull from global in file

  /**
   * Initializes the Flashcards functionality
   */
  function init (id) {
    duoSelector.init(id, levelData, symbolData, kanjiData).then(function (data) {
      flashcard.start(id, data).then(function () {
        init(id); // recurse to start over
      });
    });
  }

  return {
    init: init
  };
})();
