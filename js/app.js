(function(){
  'use strict';
  var module = angular.module('app', ['onsen']);
  var game, topic;
  var settings;
  try {
    settings = JSON.parse(localStorage.getItem("ggk-settings"));
  } catch (e) {
    settings = {music: true, sound: true, instructions: true, timerLength: 120};
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

    if (game.title == 'Catch Phrase' || game.title == 'Heads Up') {
      var transition;
      var timer = setTimeout(function() {
        word_div.innerHTML = 'TIMES UP!';
        transition = setTimeout(function(){
          $scope.navi.pushPage('results.html', {animation: 'lift'});
        }, 2000);
      }, settings.timerLength * 100);//TODO: Change to 1000
      $scope.navi.off('prepop');
      $scope.navi.on('prepop', function(event) {
        if (event.currentPage.name == 'results.html') {
          clearTimeout(transition);
          clearTimeout(timer);
        }
      })
    }

    $scope.nextWord = function() {
      index++;
      if (index == wordList.length)
        index = 0;
      word_div.innerHTML = wordList[index];
    }
  });

  module.controller('ResultsController', function($scope, $data) {

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
          words: ['1 Nephi','2 Nephi','Jacob','Enos','Jarom','Omni','Words of Mormon','Mosiah','Alma','Helaman','3 Nephi','4 Nephi','Mormon','Ether','Moroni','Coriantor','Lehi','Aaron','Abinadi','Adam','Alma the Younger','Amalickiah','Amlici','Amlicites','Ammaron','Ammon','Amulek','Amulon','Anti-Nephi-Lehies','King Benjamin','brother of Jared','Corianton','Coriantumr','Eve','freemen','Gideon','Hagoth','Helaman','Himni','Ishmael','Jacob','Jaredites','Joseph','Joseph Smith Jr.','king-men','Korihor','Laban','Laman','King Laman','Lamanites','King Lamoni','father of King Lamoni','Lehi','Lemuel','King Limhi','Mary','Captain Moroni','King Mosiah','Nehor','Nephi','Nephites','King Noah','Omner','Pahoran','Sam','Samuel the Lamanite','Sariah','Seantum','Seezoram','Sherem','Shiz','sons of Mosiah','Zeezrom','Zeniff','Zerahemnah','Zoram','Zoramites','Jesus Christ','Joseph Smith','altar','angel','arrow','armor','army','baptism','barge','believe','bless','blind','bondage','bow','brass plates','build','captain','club','commandment','covenant','crucify','deaf','destroy','disciple','dream','drunk','escape','eternal life','evil','faith','faithful','famine','fast','forgive','freedom','gold plates','gospel','Great Spirit','heal','heaven','humble','idol','iron rod','join','judge','judgement-seat','king','leader','Liahona','liberty','member','miracle','missionary','obey','ordain','ordinance','peace','persecute','plates','plot','power','pray','priesthood','prison','promise','prophesy','prophet','punish','rebel','repent','resurrect','righteous','robe','sacrament','sacrifice','scalp','servants','shield','sin','slaves','sling','soldier','spear','steal','stone','sword','synagogue','temple','testimony','title of liberty','tower','translate','tree of life','true','understand','Urim and Thummim','valiant','vision','war','weapon','wicked','wilderness','worship','America','Ammonihah','Babel','Bethlehem','Bountiful','Hill Cumorah','Jershon','Jerusalem','promised land','Sidom','Waters of Mormon','Zarahemla','white fruit','star','ship'],
          phrases: ['Mormon father of Mormon','Mormon son of Mormon','Helaman father of Helaman','Alma the elder','Mosiah and Alma','1st and 2nd Nephi','Alma and Helaman','1st Nephi','Helaman son of Helaman','Alma the younger','filled with the Holy Ghost','glad tidings','traveling in the wilderness','buried by people of Ammon','Waters of Mormon','two thousand young warriors','tree of life','title of liberty','Jesus Christ touches stones','Spirit of God','sons','of Mosiah',"sign of Jesus Christ's death","sign of Jesus Christ's birth",'river of Sidon','Zerahemnah is scalped','prison walls fall for Alma and Amulek','pray for forgiveness','pray for help','pray for knowledge or guidance','pray for other people','pray for protection','pray to receive the Holy Ghost','pray for strength','the brass plates','the gold plates','plates of Jaredites','plates of Mormon','plates of Nephi','night without darkness','Nephites attack other Nephites','Nephites attack Lamanites','Nephites become slaves','Nephi breaks bow','brothers tie up Nephi','Nephi builds a ship','Jesus Christ visits Nephi','Nephi kills Laban','Nephi leads the Nephites','Nephi returns for the brass plates','Nephi son of Lehi and Sariah','mothers of 2000 young warriors','dreams of Lehi','Lehi finds the Liahona','Lehi told to leave Jerusalem','Lehi travels in the wilderness','Lehi warns Jerusalem to repent','father of King Lamoni','Lamanites attack the Nephites','Lamanites join the Church','Lamanites repent']
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
