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
    $scope.game = game;
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
        if (event.currentPage.name == 'game.html') {
          clearTimeout(transition);
          clearTimeout(timer);
        }
      });
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
      $scope.navi.pushPage("game.html", {animation: "lift", onTransitionEnd: function() {
        var pages = $scope.navi.getPages();
        pages[pages.length - 2].destroy();
      }});
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
    /*Puts color line at bottom of home page
      works, but looks laggy when changing color
    ons.ready(function() {
      gameCarousel.on('postchange', function(event) {
        homePage.style.borderColor = $scope.games[event.activeIndex].color;
      });
    });*/
  });

  module.factory('$data', function() {
      var data = {};

      data.games = [
          {
              icon: 'images/catch-phrase-icon.png',
              title: 'Catch Phrase',
              desc: 'Get your team to guess the phrase without using any of the words in the phrase, then pass it on. The team whose turn it is when the time runs out will lose the round.',
              color: 'rgb(114,190,68)',
              instructions: 'Get your team to guess the phrase without using any of the words in the phrase, then pass it on. The team whose turn it is when the time runs out will lose the round.'
          },
          {
              icon: 'images/charades-icon.png',
              title: 'Charades',
              desc: 'Get your team to guess the phrase without saying a word. The first team to guess the the phrase will win the round.',
              color: 'rgb(238,64,47)',
              instructions: 'Get your team to guess the phrase without saying a word. The first team to guess the the phrase will win the round.'
          },
          {
              icon: 'images/password-icon.png',
              title: 'Password',
              desc: 'Get your team to guess the password by giving a one word clue. If your team is unsuccessful then the next team has a turn. Each wrong guess reduces the amount of points awarded to the winning team.',
              color: 'rgb(0,184,241)',
              instructions: 'Get your team to guess the password by giving a one word clue. If your team is unsuccessful then the next team has a turn. Each wrong guess reduces the amount of points awarded to the winning team.'
          }/*,
          {
              icon: 'images/heads-up-icon.png',
              title: 'Heads Up',
              desc: 'Your team gets you to guess the phrase without using any of the words in the phrase. Guess as many as you can in the time limit. Tilt the screen forward for a correct guess or tilt it back to pass.',
              color: 'rgb(252,184,19)',
              instructions: 'Your team gets you to guess the phrase without using any of the words in the phrase. Guess as many as you can in the time limit. Tilt the screen forward for a correct guess or tilt it back to pass.'
          }*/
      ];

      //Words that could be in all of the topic lists except for hymns and primary songs
      data.words = ['Faith','Repentance','Baptism'];
      //Phrases that could be in all of the topic lists except for hymns and primary songs
      data.phrases = ['Holy Ghost'];

      data.topics = [
        {
          title: 'Book of Mormon',
          words: ['1 Nephi','2 Nephi','Jacob','Enos','Jarom','Omni','Words of Mormon','Mosiah','Alma','Helaman','3 Nephi','4 Nephi','Mormon','Ether','Moroni','Coriantor','Lehi','Aaron','Abinadi','Adam','Alma the Younger','Amalickiah','Amlici','Amlicites','Ammaron','Ammon','Amulek','Amulon','Anti-Nephi-Lehies','King Benjamin','Brother of Jared','Corianton','Coriantumr','Eve','Freemen','Gideon','Hagoth','Helaman','Himni','Ishmael','Jacob','Jaredites','Joseph','Joseph Smith Jr.','King-men','Korihor','Laban','Laman','King Laman','Lamanites','King Lamoni','Father of King Lamoni','Lehi','Lemuel','King Limhi','Mary','Captain Moroni','King Mosiah','Nehor','Nephi','Nephites','King Noah','Omner','Pahoran','Sam','Samuel the Lamanite','Sariah','Seantum','Seezoram','Sherem','Shiz','Sons of Mosiah','Zeezrom','Zeniff','Zerahemnah','Zoram','Zoramites','Jesus Christ','Joseph Smith','Altar','Angel','Arrow','Armor','Army','Baptism','Barge','Believe','Bless','Blind','Bondage','Bow','Brass Plates','Build','Captain','Club','Commandment','Covenant','Crucify','Deaf','Destroy','Disciple','Dream','Drunk','Escape','Eternal Life','Evil','Faith','Faithful','Famine','Fast','Forgive','Freedom','Gold Plates','Gospel','Great Spirit','Heal','Heaven','Humble','Idol','Iron Rod','Join','Judge','Judgement-Seat','King','Leader','Liahona','Liberty','Member','Miracle','Missionary','Obey','Ordain','Ordinance','Peace','Persecute','Plates','Plot','Power','Pray','Priesthood','Prison','Promise','Prophesy','Prophet','Punish','Rebel','Repent','Resurrect','Righteous','Robe','Sacrament','Sacrifice','Scalp','Servants','Shield','Sin','Slaves','Sling','Soldier','Spear','Steal','Stone','Sword','Synagogue','Semple','Testimony','Title of Liberty','Tower','Translate','Tree of Life','True','Understand','Urim and Thummim','Valiant','Vision','War','Weapon','Wicked','Wilderness','Worship','America','Ammonihah','Babel','Bethlehem','Bountiful','Hill Cumorah','Jershon','Jerusalem','Promised Land','Sidom','Waters of Mormon','Zarahemla','White Fruit','Star','Ship','Darkness','Curse'],
          phrases: ["Mormon, Father of Mormon","Mormon, Son of Mormon","Helaman, Father of Helaman",'Alma the Elder','Mosiah and Alma','1st and 2nd Nephi','Alma and Helaman','1st Nephi','Helaman Son of Helaman','Alma the Younger','Filled with the Holy Ghost','Glad Tidings','Traveling in the Wilderness','The People of Ammon','Waters of Mormon','Two Thousand Young Warriors','Tree of Life','Title of Liberty','Jesus Christ Touches Stones','Spirit of God','Sons of Mosiah',"Sign of Christ's Death","Sign of Christ's Birth",'River of Sidon','Zerahemnah is Scalped','Prison Walls Fall','Pray for Forgiveness','Pray for Help','Pray for Knowledge','Pray for Guidance','Pray for Other People','Pray for Protection','Pray to Receive the Holy Ghost','Pray for Strength','The Brass Plates','The Gold Plates','Plates of Jaredites','Plates of Mormon','Plates of Nephi','Night Without Darkness','Nephites Attack Other Nephites','Nephites Attack Lamanites','Nephites Become Slaves','Nephi Breaks Bow','Brothers Tie Up Nephi','Nephi Builds a Ship','Jesus Christ Visits Nephi','Nephi kills Laban','Nephi Leads the Nephites','Nephi Returns for the Brass Plates','Nephi Son of Lehi','Mothers of Strippling Warriors',"Lehi's Dreams",'Lehi Finds the Liahona','Lehi Told to leave Jerusalem','Lehi Travels in the Wilderness','Lehi Warns Jerusalem to Repent','Father of King Lamoni','Lamanites Attack the Nephites','Lamanites Join the Church','Lamanites Repent','Joseph Brother of Nephi','Jesus Christ Appears','Jesus Christ Blesses the Children','Jesus Christ Heals','Jesus Christ Ordains His Disciples','Jesus Christ Prays','Jesus Christ as Savior','Jesus Christ Teaches the Nephites','Ishmael and His Family','Land of Ishmael','The Iron Rod','Filled with the Holy Ghost','Listening to the Holy Ghost','Receiving the Holy Ghost','Gadianton Robbers','Flocks of King Lamoni','The Liahona Works by Faith','People of Ammon Bury Weapons',"Building in Lehi's Dream",'Brother of Jared','Bow of Nephi','Land of Bountiful',"Christ's Disciples Baptize",'Tower of Babel',"Ammon cuts off Robbers' Arms","Nephi puts on Laban's Armor",'Anti-Christ','Angels Comfort the Lamanites','Angels Encircle the Nephite Children',"Angels Minister to Jesus' Disciples",'Alma the Younger Repents','Angel Appears to Alma the Younger','People of Alma',"Alma Believes Abinadi's Teachings",'Alma Escapes from King Noah']
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
          words: ['Altar','Angel','Anoint','Anointed','Ark','Army','Armies','Baptized','Barley','Barrel','Basket','Battle','Beat','Beating','Beautiful','Believe','Believed','Blessed','Blessing','Bow','Bull','Bury','Calf','Camel','Candlesticks','Captain','Captured','Cave','Choose','Chosen','Commandments','Crucify','Crucified','Curtains','Daughter','Den','Destroy','Destroyed','Divided','Earrings','Earthquake','Elders','Enough','Escape','Escaped','Evil','Faith','Famine','Fasted','Flood','Forgive','Furnace','Garden','Giant','Gift','Gospel','Heal','Husband','Idol','Jar','Judge','Kingdom','Language','Lead','Leader','Leper','Lice','Lies','Married','Miracle','Mountain','Obey','Obeyed','Pottage','Power','Pray','Prayed','Priesthood','Priests','Prison','Promise','Promised','Prophet','Punished','Quails','Rainbow','Ram','Repent','Repented','Resurrected','Righteous','Rod','Sabbath','Sacrifice','Sacrificed','Save','Servant','Servants','Shepherd','Slaves','Sling','Soldiers','Spies','Spirits','Store','Stored','Swallowed','Sword','Suffer','Suffered','Tabernacle','Teach','Taught','Temple','Tested','Thirsty','Tithing','Travel','Traveled','Tribe','Trouble','Trusted','Vision','Well','Wheat','Wicked','Wilderness','Wise','Worship','Yard','Young','Youngest','America','Babylon','Bethlehem','Canaan','Earth','Egypt','Garden of Eden','Heaven','Israel','Jericho','Jerusalem','Jordan River','Kingdom of Israel','Kingdom of Judah','Moab','Mount Sinai','Nineveh','Promised land','Red Sea','Ur','Zion','Aaron','Abed-nego','Abel','Abraham','Adam','Ahab','Baal','Bathsheba','Boaz','Cain','Cyrus','Daniel','Darius','David','Devil','Egyptians','Eli','Elijah','Elisha','Enoch','Esau','Esther','Eve','Ezra','God','Goliath','Haman','Hannah','Heavenly Father','Holy Ghost','Isaac','Isaiah','Israel','Israel','Israelites','Jacob','Jaredites','Jeremiah','Jeroboam','Jesse','Jesus','Jews','Jezebel','Job','Jonah','Joseph','Joshua','Laban','Leah','Lehi','Lucifer','Melchizedek','Meshach','Micah','Miriam','Mordecai','Moses','Naaman','Naomi','Nathan','Nehemiah','Noah','Obed','Orpah','Philistines','Potiphar','Rachel','Rebekah','Rehoboam','Ruth','Samuel','Sarah','Satan','Saul','Seth','Shadrach','Solomon','Uriah','Zechariah'],
          phrases: ['Battle of Jericho','Flesh-and-Blood Bodies','Spirit Bodies','Ark of the Covenant','Giving A Blessing','Birthright Blessing']
        },
        {
          title: 'Pearl of Great Price',
          words: ['Moses','Abraham','Joseph Smith-Matthew','Joseph Smith-History','Articles of Faith'],
          phrases: []
        },
        {
          title: 'Primary Songs',
          words: [],
          phrases: ["A Child's Prayer",'A Happy Family','A Happy Helper','A Prayer','Prayer So','Smile Is like the Sunshine','A Song of Thanks','A Special Gift Is Kindness','A Young Man Prepared','All Things Bright and Beautiful','An Angel Came to Joseph Smith','Army of Helaman','Autumn Day','Away in a Manger','Baptism','Be Happy!','Beautiful Savior','Beauty Everywhere','Because God Loves Me',"Because It's Spring",'Before I Take the Sacrament','Birds in the Tree','Book of Mormon Stories','Called to Serve','Can a Little Child like Me?','Children All Over the World','Choose the Right Way','Christmas Bells','Come with Me to Primary','Covered Wagons',"Daddy's Homecoming",'Dare to Do Right',"Dearest Mother, I Love You",'Did Jesus Really Live Again?',"Do As I'm Doing",'Each Sunday Morning','Easter Hosanna','Every Star Is Different','Faith','Falling Snow','Families Can Be Together Forever','Family History - I Am Doing It','Family Night','Family Prayer','Father Up Above',"Father, I Will Reverent Be","Father, please hear us sing","Father, We Thank Thee for the Night",'Fathers','Feliz Cumpleaños','Follow the Prophet','For Health and Strength','For Thy Bounteous Blessings','Friends Are Fun','Fun to Do','"Give," Said the Little Stream','Go the Second Mile','God Is Watching Over All',"God's Love",'Grandmother','Had I Been a Child','Happy Song',"Happy, Happy Birthday",'Have a Very Happy Birthday!','Have a Very Merry Christmas!','He Died That We Might Live Again','He Sent His Son',"Head, Shoulders, Knees, and Toes","Healthy, Wealthy, and Wise","Heavenly Father, Now I Pray","Heavenly Father, While I Pray",'Hello Song',"Hello, Friends!","Help Me, Dear Father","Help Us, O God, to Understand",'Here We Are Together','Hinges','Home','Hosanna','How Dear to God Are Little Children','How Will They Know?','Hum Your Favorite Hymn','I Am a Child of God','I Am Glad for Many Things','I Am like a Star','I Believe in Being Honest',"I Feel My Savior's Love",'I Have a Family Tree','I Have Two Ears','I Have Two Little Hands','I Hope They Call Me on a Mission','I Know My Father Lives','I Like My Birthdays','I Lived in Heaven','I Love to Pray','I Love to See the Temple','I Need My Heavenly Father','I Often Go Walking','I Pledge Myself to Love the Right','I Pray in Faith',"I Thank Thee, Dear Father",'I Think the World Is Glorious','I Want to Be a Missionary Now','I Want to Be Reverent','I Want to Give the Lord My Tenth','I Want to Live the Gospel','I Wiggle','I Will Be Valiant',"I Will Follow God's Plan",'I Will Try to Be Reverent','If with All Your Heart',"If You're Happy","I'll Walk with You","I'm Glad to Pay a Tithing","I'm Thankful to Be Me","I'm Trying to Be like Jesus",'If on occasion you have found','If with All Your Hearts',"If You're Happy",'In the Leafy Treetops','Jesus has Risen','Jesus Is Our Loving Friend','Jesus Loved the Little Children','Jesus Once Was a Little Child','Jesus Said Love Everyone','Jesus Wants Me for a Sunbeam','Keep the Commandments','Kindness Begins with Me','Latter-day Prophets','Lift Up Your Voice and Sing',"Listen, Listen",'Little Jesus','Little Lambs So White and Fair','Little Pioneer Children','Little Purple Pansies','Little Seeds Lie Fast Asleep','Love Is Spoken Here','Love One Another','Loving Shepherd',"Mary's Lullaby",'Morning Prayer','Mother Dear',"Mother, I Love You","Mother, Tell Me the Story",'My Country','My Dad',"My Flag, My Flag",'My Hands','My Heart Ever Faithful','My Heavenly Father Loves Me','My Mother Dear',"Nephi's Courage",'O Rest in the Lord',"Oh, How We Love to Stand","Oh, Hush Thee, My Baby","Oh, What Do You Do in the Summertime?",'On a Golden Springtime','Once There Was a Snowman','Once within a Lowly Stable','Our Bishop','Our Chapel Is a Sacred Place','Our Door Is Always Open','Our Primary Colors','Picture a Christmas','Pioneer Children Sang As They Walked','Pioneer Children Were Quick to Obey','Popcorn Popping',"Quickly I'll Obey",'Rain Is Falling All Around','Remember the Sabbath Day','Repentance','Reverence','Reverence Is Love',"Reverently, Quietly",'Roll Your Hands','Samuel Tells of the Baby Jesus','Saturday',"Search, Ponder, and Pray",'Seek the Lord Early','Shine On','Sing a Song','Sing Your Way Home',"Sleep, Little Jesus",'Smiles','Springtime Is Coming','Stand for the Right','Stand Up','Stars Were Gleaming','Teach Me to Walk in the Light',"Teacher, Do You Love Me?",'Tell Me the Stories of Jesus',"Tell Me, Dear Lord",'Thank Thee for Everything',"Thank Thee, Father",'Thanks to Our Father','Thanks to Thee','The Books in the Book of Mormon','The Books in the New Testament','The Books in the Old Testament','The Chapel Doors','The Church of Jesus Christ','The Commandments','The Dearest Names','The Eighth Article of Faith','The Eleventh Article of Faith','The Family','The Fifth Article of Faith','The First Article of Faith','The Fourth Article of Faith','The Golden Plates','The Handcart Song','The Holy Ghost','The Lord Gave Me a Temple','The Nativity Song','The Ninth Article of Faith','The Oxcart','The Priesthood Is Restored','The Prophet Said to Plant a Garden','The Sacrament','The Sacred Grove','The Second Article of Faith','The Seventh Article of Faith',"The Shepherd's Carol",'The Sixth Article of Faith','The Still Small Voice','The Tenth Article of Faith','The Things I Do','The Third Article of Faith','The Thirteenth Article of Faith','The Twelfth Article of Faith','The Wise Man and the Foolish Man','The Word of Wisdom','The World Is So Big','The World Is So Lovely','There Was Starlight on the Hillside',"This Is God's House","This Is My Beloved Son",'To a Wild Rose','To Be a Pioneer','To Get Quiet','To Think about Jesus','Truth from Elijah','Two Happy Feet','Two Little Eyes','We Are Different','We Are Reverent','We Bow Our Heads','When Grandpa Comes','When He Comes Again','When I Am Baptized','When I Go to Church','When Jesus Christ Was Baptized','When Joseph Went to Bethlehem','When pioneers moved to the West',"When We're Helping",'Whenever I Think about Pioneers','Where Love Is','Who Is the Child?',"You've Had a Birthday",'Your Happy Birthday']
        },
        {
          title: 'Random'
        }
      ]

      return data;
  });
})();
