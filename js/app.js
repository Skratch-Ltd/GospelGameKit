(function(){
  'use strict';
  var module = angular.module('app', ['onsen']);
  var game, topic;
  var settings;
  settings = JSON.parse(localStorage.getItem("ggk-settings"));
  if (!settings) {
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

    $scope.changeTimerLength = function() {
      settings.timerLength = timerRange.value;
      updateSettings();
    }

    $scope.playSound = function(file) {
      if (!settings.sound) return;
      var audio = new Audio(file);
      audio.play();
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
    $scope.game = game;

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
      if (addPhrases || topic.title == 'Hymns' || topic.title == 'Primary Songs')
        wordList = wordList.concat(topic.phrases);
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
        $data.playlist = wordList.slice(0, index + 1);
        word_div.innerHTML = 'TIMES UP!';
        nextButton.remove();
        transition = setTimeout(function(){
          $scope.navi.replacePage('results.html', {animation: 'lift'});
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
    $scope.playlist = $data.playlist;

    if (game.title == 'Catch Phrase') {
      scoreDiv.innerHTML = 'List';
    } else if (game.title == 'Heads Up') {
      scoreDiv.innerHTML = 'Score: ' + $data.headsUpScore;
    }

    $scope.back = function() {
      $scope.navi.popPage();
    }

    $scope.play = function() {
      $scope.navi.popPage();
      $scope.navi.pushPage("game.html", {animation: "lift" });
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
  });

  module.factory('$data', function() {
      var data = {};

      data.games = [
          {
              icon: 'images/catch-phrase-icon.png',
              title: 'Catch Phrase',
              desc: 'Get your team to guess the phrase without using any of the words in the phrase, then pass it on. The team whose turn it is when the time runs out will lose the round.',
              color: 'rgb(114,190,68)',
              instructions: 'Here are some instructions for Catch Phrase'
          },
          {
              icon: 'images/charades-icon.png',
              title: 'Charades',
              desc: 'Get your team to guess the phrase without saying a word. The first team to guess the the phrase will win the round.',
              color: 'rgb(238,64,47)',
              instructions: 'Here are some instructions for Charades'
          },
          {
              icon: 'images/password-icon.png',
              title: 'Password',
              desc: 'Get your team to guess the password by giving a one word clue. If your team is unsuccessful then the next team has a turn. Each wrong guess reduces the amount of points awarded to the winning team.',
              color: 'rgb(0,184,241)',
              instructions: 'Here are some instructions for Password'
          },
          {
              icon: 'images/heads-up-icon.png',
              title: 'Heads Up',
              desc: 'Your team gets you to guess the phrase without using any of the words in the phrase. Guess as many as you can in the time limit. Tilt the screen forward for a correct guess or tilt it back to pass.',
              color: 'rgb(252,184,19)',
              instructions: 'Here are some instructions for Heads Up'
          }
      ];

      //Words that could be in all of the topic lists except for hymns and primary songs
      data.words = ['Faith','Repentance','Baptism'];
      //Phrases that could be in all of the topic lists except for hymns and primary songs
      data.phrases = ['Holy Ghost'];

      data.topics = [
        {
          title: 'Book of Mormon',
          words: ['1 Nephi','2 Nephi','Jacob','Enos','Jarom','Omni','Words of Mormon','Mosiah','Alma','Helaman','3 Nephi','4 Nephi','Mormon','Ether','Moroni','Coriantor','Lehi','Aaron','Abinadi','Adam','Alma the Younger','Amalickiah','Amlici','Amlicites','Ammaron','Ammon','Amulek','Amulon','Anti-Nephi-Lehies','King Benjamin','brother of Jared','Corianton','Coriantumr','Eve','freemen','Gideon','Hagoth','Helaman','Himni','Ishmael','Jacob','Jaredites','Joseph','Joseph Smith Jr.','king-men','Korihor','Laban','Laman','King Laman','Lamanites','King Lamoni','father of King Lamoni','Lehi','Lemuel','King Limhi','Mary','Captain Moroni','King Mosiah','Nehor','Nephi','Nephites','King Noah','Omner','Pahoran','Sam','Samuel the Lamanite','Sariah','Seantum','Seezoram','Sherem','Shiz','sons of Mosiah','Zeezrom','Zeniff','Zerahemnah','Zoram','Zoramites','Jesus Christ','Joseph Smith','altar','angel','arrow','armor','army','baptism','barge','believe','bless','blind','bondage','bow','brass plates','build','captain','club','commandment','covenant','crucify','deaf','destroy','disciple','dream','drunk','escape','eternal life','evil','faith','faithful','famine','fast','forgive','freedom','gold plates','gospel','Great Spirit','heal','heaven','humble','idol','iron rod','join','judge','judgement-seat','king','leader','Liahona','liberty','member','miracle','missionary','obey','ordain','ordinance','peace','persecute','plates','plot','power','pray','priesthood','prison','promise','prophesy','prophet','punish','rebel','repent','resurrect','righteous','robe','sacrament','sacrifice','scalp','servants','shield','sin','slaves','sling','soldier','spear','steal','stone','sword','synagogue','temple','testimony','title of liberty','tower','translate','tree of life','true','understand','Urim and Thummim','valiant','vision','war','weapon','wicked','wilderness','worship','America','Ammonihah','Babel','Bethlehem','Bountiful','Hill Cumorah','Jershon','Jerusalem','promised land','Sidom','Waters of Mormon','Zarahemla','white fruit','star','ship','darkness','curse'],
          phrases: ['Mormon father of Mormon','Mormon son of Mormon','Helaman father of Helaman','Alma the elder','Mosiah and Alma','1st and 2nd Nephi','Alma and Helaman','1st Nephi','Helaman son of Helaman','Alma the younger','filled with the Holy Ghost','glad tidings','traveling in the wilderness','buried by people of Ammon','Waters of Mormon','two thousand young warriors','tree of life','title of liberty','Jesus Christ touches stones','Spirit of God','sons of Mosiah',"sign of Jesus Christ's death","sign of Jesus Christ's birth",'river of Sidon','Zerahemnah is scalped','prison walls fall for Alma and Amulek','pray for forgiveness','pray for help','pray for knowledge or guidance','pray for other people','pray for protection','pray to receive the Holy Ghost','pray for strength','the brass plates','the gold plates','plates of Jaredites','plates of Mormon','plates of Nephi','night without darkness','Nephites attack other Nephites','Nephites attack Lamanites','Nephites become slaves','Nephi breaks bow','brothers tie up Nephi','Nephi builds a ship','Jesus Christ visits Nephi','Nephi kills Laban','Nephi leads the Nephites','Nephi returns for the brass plates','Nephi son of Lehi and Sariah','mothers of 2000 young warriors','dreams of Lehi','Lehi finds the Liahona','Lehi told to leave Jerusalem','Lehi travels in the wilderness','Lehi warns Jerusalem to repent','father of King Lamoni','Lamanites attack the Nephites','Lamanites join the Church','Lamanites repent','Joseph brother of Nephi','Jesus Christ appears','Jesus Christ blesses the children','Jesus Christ heals','Jesus Christ ordains his disciples','Jesus Christ Prays','Jesus Christ as Savior','Jesus Christ teaches the Nephites','Ishmael and his family','land of Ishmael','the iron rod','filled with the Holy Ghost','listening to the Holy Ghost','receiving the Holy Ghost','Gadianton robbers','flocks of King Lamoni','Liahona works by faith','people of Ammon bury weapons',"building in Lehi's dream",'brother of Jared','bow of Nephi','land of Bountiful','Moroni explains who can be baptized',"Christ's disciples baptize",'Tower of Babel',"Ammon cuts off robbers' arms","Nephi puts on Laban's armor",'anti-Christ','angels comfort the Lamanites','angels encircle the Nephite children',"angels minister to Jesus' disciples",'Alma the Younger repents','angel appears to Alma the Younger','people of Alma',"Alma believes Abinadi's teachings",'Alma escapes from King Noah']
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
          phrases: ["A Child's Prayer",'A Happy Family','A Happy Helper','A Prayer','Prayer So','Smile Is like the Sunshine','A Song of Thanks','A Special Gift Is Kindness','A Young Man Prepared','All Things Bright and Beautiful','An Angel Came to Joseph Smith','Army of Helaman','Autumn Day','Away in a Manger','Baptism','Be Happy!','Beautiful Savior','Beauty Everywhere','Because God Loves Me',"Because It's Spring",'Before I Take the Sacrament','Birds in the Tree','Book of Mormon Stories','Called to Serve','Can a Little Child like Me?','Children All Over the World','Choose the Right Way','Christmas Bells','Come with Me to Primary','Covered Wagons',"Daddy's Homecoming",'Dare to Do Right',"Dearest Mother, I Love You",'Did Jesus Really Live Again?',"Do As I'm Doing",'Each Sunday Morning','Easter Hosanna','Every Star Is Different','Faith','Falling Snow','Families Can Be Together Forever','Family History - I Am Doing It','Family Night','Family Prayer','Father Up Above',"Father, I Will Reverent Be","Father, please hear us sing","Father, We Thank Thee for the Night",'Fathers','Feliz Cumpleaños','Follow the Prophet','For Health and Strength','For Thy Bounteous Blessings','Friends Are Fun','Fun to Do','"Give," Said the Little Stream','Go the Second Mile','God Is Watching Over All',"God's Love",'Grandmother','Had I Been a Child','Happy Song',"Happy, Happy Birthday",'Have a Very Happy Birthday!','Have a Very Merry Christmas!','He Died That We Might Live Again','He Sent His Son',"Head, Shoulders, Knees, and Toes","Healthy, Wealthy, and Wise","Heavenly Father, Now I Pray","Heavenly Father, While I Pray",'Hello Song',"Hello, Friends!","Help Me, Dear Father","Help Us, O God, to Understand",'Here We Are Together','Hinges','Home','Hosanna','How Dear to God Are Little Children','How Will They Know?','Hum Your Favorite Hymn','I Am a Child of God','I Am Glad for Many Things','I Am like a Star','I Believe in Being Honest',"I Feel My Savior's Love",'I Have a Family Tree','I Have Two Ears','I Have Two Little Hands','I Hope They Call Me on a Mission','I Know My Father Lives','I Like My Birthdays','I Lived in Heaven','I Love to Pray','I Love to See the Temple','I Need My Heavenly Father','I Often Go Walking','I Pledge Myself to Love the Right','I Pray in Faith',"I Thank Thee, Dear Father",'I Think the World Is Glorious','I Think When I Read That Sweet Story','I Want to Be a Missionary Now','I Want to Be Reverent','I Want to Give the Lord My Tenth','I Want to Live the Gospel','I Wiggle','I Will Be Valiant',"I Will Follow God's Plan",'I Will Try to Be Reverent','If with All Your Heart',"If You're Happy","I'll Walk with You","I'm Glad to Pay a Tithing","I'm Thankful to Be Me","I'm Trying to Be like Jesus",'If on occasion you have found','If with All Your Hearts',"If You're Happy",'In the Leafy Treetops','Jesus has Risen','Jesus Is Our Loving Friend','Jesus Loved the Little Children','Jesus Once Was a Little Child','Jesus Said Love Everyone','Jesus Wants Me for a Sunbeam','Keep the Commandments','Kindness Begins with Me','Latter-day Prophets','Lift Up Your Voice and Sing',"Listen, Listen",'Little Jesus','Little Lambs So White and Fair','Little Pioneer Children','Little Purple Pansies','Little Seeds Lie Fast Asleep','Love Is Spoken Here','Love One Another','Loving Shepherd',"Mary's Lullaby",'Morning Prayer','Mother Dear',"Mother, I Love You","Mother, Tell Me the Story",'My Country','My Dad',"My Flag, My Flag",'My Hands','My Heart Ever Faithful','My Heavenly Father Loves Me','My Mother Dear',"Nephi's Courage",'O Rest in the Lord',"Oh, How We Love to Stand","Oh, Hush Thee, My Baby","Oh, What Do You Do in the Summertime?",'On a Golden Springtime','Once There Was a Snowman','Once within a Lowly Stable','Our Bishop','Our Chapel Is a Sacred Place','Our Door Is Always Open','Our Primary Colors','Picture a Christmas','Pioneer Children Sang As They Walked','Pioneer Children Were Quick to Obey','Popcorn Popping',"Quickly I'll Obey",'Rain Is Falling All Around','Remember the Sabbath Day','Repentance','Reverence','Reverence Is Love',"Reverently, Quietly",'Roll Your Hands','Samuel Tells of the Baby Jesus','Saturday',"Search, Ponder, and Pray",'Seek the Lord Early','Shine On','Sing a Song','Sing Your Way Home',"Sleep, Little Jesus",'Smiles','Springtime Is Coming','Stand for the Right','Stand Up','Stars Were Gleaming','Teach Me to Walk in the Light',"Teacher, Do You Love Me?",'Tell Me the Stories of Jesus',"Tell Me, Dear Lord",'Thank Thee for Everything',"Thank Thee, Father",'Thanks to Our Father','Thanks to Thee','The Books in the Book of Mormon','The Books in the New Testament','The Books in the Old Testament','The Chapel Doors','The Church of Jesus Christ','The Commandments','The Dearest Names','The Eighth Article of Faith','The Eleventh Article of Faith','The Family','The Fifth Article of Faith','The First Article of Faith','The Fourth Article of Faith','The Golden Plates','The Handcart Song','The Holy Ghost','The Lord Gave Me a Temple','The Nativity Song','The Ninth Article of Faith','The Oxcart','The Priesthood Is Restored','The Prophet Said to Plant a Garden','The Sacrament','The Sacred Grove','The Second Article of Faith','The Seventh Article of Faith',"The Shepherd's Carol",'The Sixth Article of Faith','The Still Small Voice','The Tenth Article of Faith','The Things I Do','The Third Article of Faith','The Thirteenth Article of Faith','The Twelfth Article of Faith','The Wise Man and the Foolish Man','The Word of Wisdom','The World Is So Big','The World Is So Lovely','There Was Starlight on the Hillside',"This Is God's House",'This Is My Beloved Son','To be Wild Rose','To Be a Pioneer','To Get Quiet','To Think about Jesus','Truth from Elijah','Two Happy Feet','Two Little Eyes','We Are Different','We Are Reverent','We Bow Our Heads','When Grandpa Comes','When He Comes Again','When I Am Baptized','When I Go to Church','When Jesus Christ Was Baptized','When Joseph Went to Bethlehem','When pioneers moved to the West',"When We're Helping",'Whenever I Think about Pioneers','Where Love Is','Who Is the Child?',"You've Had a Birthday",'Your Happy Birthday']
        },
        {
          title: 'Random'
        }
      ]

      return data;
  });
})();
