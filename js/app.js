(function(){
  'use strict';
  var module = angular.module('app', ['onsen']);
  var game, topic;
  var settings;
  try {
    settings = JSON.parse(localStorage.getItem("ggk-settings"));
  } catch (e) {
    settings = {music: true, sound: true, instructions: true, timerLegth: 120};
  }
  localStorage.setItem("ggk-settings", JSON.stringify(settings));
  var bgMusic = new Audio('audio/countdown.mp3');
  bgMusic.loop = true;
  if (settings.music) bgMusic.play();

  function updateSettings() {
    localStorage.setItem("ggk-settings", JSON.stringify(settings));
  }

  function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  module.controller('AppController', function($scope, $data) {
    $scope.changeSound = function() {
      settings.sound = checkSound.checked;
      updateSettings();
    };

    $scope.changeMusic = function() {
      settings.music = checkMusic.checked;
      updateSettings();
      if (settings.music) {
        bgMusic.play();
      } else {
        bgMusic.pause();
      }
    };

    $scope.changeInstructions = function() {
      settings.instructions = checkInstructions.checked;
      updateSettings();
    };

    $scope.playSound = function(file) {
      if (!settings.sound) return;
      var audio = new Audio(file);
      audio.play();
    }
  });

  module.controller('TopicController', function($scope, $data) {
    $scope.topics = $data.topics;

    $scope.showInstructions = function(index) {
      topic = $scope.topics[index];
      if (settings.instructions) {
        $scope.navi.pushPage("instructions.html", {animation: "lift" });
      } else {
        $scope.navi.pushPage("game.html", {animation: "lift" })
      }
    }
  });

  module.controller('InstructionController', function($scope, $data) {
    $scope.startGame = function() {
      console.log(game.title + ': ' + topic.title);
      $scope.navi.replacePage("game.html", {animation: "lift" });
    }
  });

  module.controller('GameController', function($scope, $data) {
    var index = 0;
    var wordList = [];
    var addPhrases = game.title != 'Password';
    if (topic.title != 'Hymns' && topic.title != 'Primary Songs') {
      wordList = wordList.concat($data.words);
      if (addPhrases) wordList = wordList.concat($data.phrases);
    }
    if (topic.title != 'Random') {
      wordList = wordList.concat(topic.words);
      if (addPhrases) wordList = wordList.concat(topic.phrases);
    } else {
      for (var i = 0; i < $data.topics.length - 1; i++) {
        wordList = wordList.concat($data.topics[i].words);
        if (addPhrases) wordList = wordList.concat($data.topics[i].phrases);
      }
    }
    shuffle(wordList);
    word_div.innerHTML = wordList[index];

    $scope.nextWord = function() {
      index++;
      if (index == wordList.length)
        index = 0;
      word_div.innerHTML = wordList[index];
    }
  });

  module.controller('MasterController', function($scope, $data) {
    $scope.games = $data.games;

    $scope.showTopic = function(index) {
      game = $data.games[index];
      $scope.navi.pushPage("topics.html", {animation: "lift" });
    };

    $scope.changeGame = function(index) {
      gameCarousel.setActiveCarouselItemIndex(index);
    }

    ons.createPopover('popover.html').then(function(popover) {
      $scope.popover = popover;
    });

    $scope.showPopover = function(e) {
      $scope.popover.show(e);
      checkSound.checked = settings.sound;
      checkMusic.checked = settings.music;
      checkInstructions.checked = settings.instructions;
    }
  });

  module.factory('$data', function() {
      var data = {};

      data.games = [
          {
              icon: 'images/catch-phrase-icon.png',
              title: 'Catch Phrase',
              desc: 'Get your team to guess the phrase without using any of the words in the phrase, then pass it on. The team whose turn it is when the time runs out will lose the round.',
              color: 'rgb(114,190,68)'
          },
          {
              icon: 'images/charades-icon.png',
              title: 'Charades',
              desc: 'Get your team to guess the phrase without saying a word. The first team to guess the the phrase will win the round.',
              color: 'rgb(238,64,47)'
          },
          {
              icon: 'images/password-icon.png',
              title: 'Password',
              desc: 'Get your team to guess the password by giving a one word clue. If your team is unsuccessful then the next team has a turn. Each wrong guess reduces the amount of points awarded to the winning team.',
              color: 'rgb(0,184,241)'
          },
          {
              icon: 'images/heads-up-icon.png',
              title: 'Heads Up',
              desc: 'Your team gets you to guess the phrase without using any of the words in the phrase. Guess as many as you can in the time limit. Tilt the screen forward for a correct guess or tilt it back to pass.',
              color: 'rgb(252,184,19)'
          }
      ];

      //Words that could be in all of the topic lists except for hymns and primary songs
      data.words = ['Faith','Repentance','Baptism'];
      //Phrases that could be in all of the topic lists except for hymns and primary songs
      data.phrases = ['Holy Ghost'];

      data.topics = [
        {
          title: 'Book of Mormon',
          words: ['1 Nephi','2 Nephi','Jacob','Enos','Jarom','Omni','Words of Mormon','Mosiah','Alma','Helaman','3 Nephi','4 Nephi','Mormon','Ether','Moroni'],
          phrases: []
        },
        {
          title: 'Church History',
          words: [],
          phrases: []
        },
        {
          title: 'Doctrine and Covenants',
          words: [],
          phrases: []
        },
        {
          title: 'Hymns',
          words: [],
          phrases: []
        },
        {
          title: 'New Testament',
          words: [],
          phrases: []
        },
        {
          title: 'Old Testament',
          words: [],
          phrases: ['Battle of Jericho']
        },
        {
          title: 'Pearl of Great Price',
          words: ['Moses','Abraham','Joseph Smith-Matthew','Joseph Smith-History','Articles of Faith'],
          phrases: []
        },
        {
          title: 'Primary Songs',
          words: [],
          phrases: []
        },
        {
          title: 'Random'
        }
      ]

      return data;
  });
})();
