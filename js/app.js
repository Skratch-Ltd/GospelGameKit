(function(){
  'use strict';
  var module = angular.module('app', ['onsen']);
  var game, topic;
  var settings = localStorage.getItem("ggk-settings") || {music: true, sound: true, instructions: true, timerLegth: 120};
  localStorage.setItem("ggk-settings", settings);

  module.controller('AppController', function($scope, $data) {

    $scope.doSomething = function() {
      setTimeout(function() {
        ons.notification.alert({ message: 'tapped' });
      }, 100);
    };
  });

  module.controller('TopicController', function($scope, $data) {
    $scope.topics = $data.topics;

    $scope.showInstructions = function(index) {
      topic = $scope.topics[index];
      $scope.navi.pushPage("instructions.html", {animation: "lift" });
    }
  });

  module.controller('InstructionController', function($scope, $data) {
    $scope.startGame = function() {
      console.log(game.title + ': ' + topic.title);
      $scope.navi.replacePage("game.html", {animation: "lift" });
    }
  });

  module.controller('GameController', function($scope, $data) {
    debugger;
    var index = 0;
    word_div.innerHTML = topic.words[index];

    $scope.nextWord = function() {
      index++;
      if (index == topic.words.length)
        index = 0;
      word_div.innerHTML = topic.words[index];
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
      data.words = ['Faith','Repentance','Baptism','Holy Ghost'];

      data.topics = [
        {
          title: 'Book of Mormon',
          words: ['1 Nephi','2 Nephi','Jacob','Enos','Jarom','Omni','Words of Mormon','Mosiah','Alma','Helaman','3 Nephi','4 Nephi','Mormon','Ether','Moroni']
        },
        {
          title: 'Church History',
          words: []
        },
        {
          title: 'Doctrine and Covenants',
          words: []
        },
        {
          title: 'Hymns',
          words: []
        },
        {
          title: 'New Testament',
          words: []
        },
        {
          title: 'Old Testament',
          words: []
        },
        {
          title: 'Pearl of Great Price',
          words: ['Moses','Abraham','Joseph Smith-Matthew','Joseph Smith-History','Articles of Faith']
        },
        {
          title: 'Primary Songs',
          words: []
        },
        {
          title: 'Random'
        }
      ]

      return data;
  });
})();
