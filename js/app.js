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
  /*var bgMusic = new Audio('audio/countdown.mp3');
  bgMusic.loop = true;
  if (settings.music) bgMusic.play();*/

  function updateSettings() {
    localStorage.setItem("ggk-settings", JSON.stringify(settings));
  }

  function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  function playSound(file) {
    if (!settings.sound) return;
    var audio = new Audio(file);
    audio.play();
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

    ons.createPopover('popover.html').then(function(popover) {
      $scope.popover = popover;
    });

    $scope.showPopover = function(e) {
      playSound('audio/buttonpush.mp3');
      $scope.popover.show(e);
      checkSound.checked = settings.sound;
      checkMusic.checked = settings.music;
      checkInstructions.checked = settings.instructions;
    }
  });

  module.controller('TopicController', function($scope, $data) {
    $scope.topics = $data.topics;

    $scope.back = function() {
      playSound('audio/buttonpush.mp3');
    }

    $scope.showInstructions = function(index) {
      playSound('audio/buttonpush.mp3');
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

    $scope.back = function() {
      playSound('audio/buttonpush.mp3');
    }

    $scope.startGame = function() {
      playSound('audio/buttonpush.mp3');
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
    document.getElementById('word_div').innerHTML = wordList[index];

    if (game.title == 'Catch Phrase' || game.title == 'Heads Up') {
      var transition;
      var timer = setTimeout(function() {
        playSound('audio/timerstop.mp3');
        $data.playlist = wordList.slice(0, index + 1);
        document.getElementById('word_div').innerHTML = 'TIMES UP!';
        document.getElementById('nextButton').style.display = 'none'
        transition = setTimeout(function(){
          $scope.navi.replacePage('results.html', {animation: 'lift'});
        }, 2000);
      }, settings.timerLength * 1000);//TODO: Change to 1000
      $scope.navi.off('prepop');
      $scope.navi.on('prepop', function(event) {
        if (event.currentPage.name == 'game.html') {
          clearTimeout(transition);
          clearTimeout(timer);
        }
      });
    }

    $scope.nextWord = function() {
      playSound('audio/buttonpush.mp3');
      index++;
      if (index == wordList.length)
        index = 0;
      document.getElementById('word_div').innerHTML = wordList[index];
    }

    $scope.back = function() {
      playSound('audio/buttonpush.mp3');
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
      playSound('audio/buttonpush.mp3');
      $scope.navi.popPage();
    }

    $scope.play = function() {
      playSound('audio/buttonpush.mp3');
      $scope.navi.pushPage("game.html", {animation: "lift", onTransitionEnd: function() {
        var pages = $scope.navi.getPages();
        pages[pages.length - 2].destroy();
      }});
    }
  });

  module.controller('MasterController', function($scope, $data) {
    $scope.games = $data.games;

    $scope.showTopic = function(index) {
      playSound('audio/buttonpush.mp3');
      game = $data.games[index];
      $scope.navi.pushPage("topics.html", {animation: "lift" });
    };

    $scope.changeGame = function(index) {
      playSound('audio/buttonpush.mp3');
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
          words: ['1 Nephi','2 Nephi','Jacob','Enos','Jarom','Omni','Words of Mormon','Mosiah','Alma','Helaman','3 Nephi','4 Nephi','Mormon','Ether','Moroni','Coriantor','Lehi','Aaron','Abinadi','Adam','Alma the Younger','Amalickiah','Amlici','Amlicites','Ammaron','Ammon','Amulek','Amulon','Anti-Nephi-Lehies','King Benjamin','Brother of Jared','Corianton','Coriantumr','Eve','Freemen','Gideon','Hagoth','Helaman','Himni','Ishmael','Jacob','Jaredites','Joseph','Joseph Smith Jr.','King-men','Korihor','Laban','Laman','King Laman','Lamanites','King Lamoni','Father of King Lamoni','Lehi','Lemuel','King Limhi','Mary','Captain Moroni','King Mosiah','Nehor','Nephi','Nephites','King Noah','Omner','Pahoran','Sam','Samuel the Lamanite','Sariah','Seantum','Seezoram','Sherem','Shiz','Sons of Mosiah','Zeezrom','Zeniff','Zerahemnah','Zoram','Zoramites','Jesus Christ','Joseph Smith','Altar','Angel','Arrow','Armor','Army','Baptism','Barge','Believe','Bless','Blind','Bondage','Bow','Brass Plates','Build','Captain','Club','Commandment','Covenant','Crucify','Deaf','Destroy','Disciple','Dream','Drunk','Escape','Eternal Life','Evil','Faith','Faithful','Famine','Fast','Forgive','Freedom','Gold Plates','Gospel','Great Spirit','Heal','Heaven','Humble','Idol','Iron Rod','Join','Judge','Judgement-Seat','King','Leader','Liahona','Liberty','Member','Miracle','Missionary','Obey','Ordain','Ordinance','Peace','Persecute','Plates','Plot','Power','Pray','Priesthood','Prison','Promise','Prophesy','Prophet','Punish','Rebel','Repent','Resurrect','Righteous','Robe','Sacrament','Sacrifice','Scalp','Servants','Shield','Sin','Slaves','Sling','Soldier','Spear','Steal','Stone','Sword','Synagogue','Temple','Testimony','Title of Liberty','Tower','Translate','Tree of Life','True','Understand','Urim and Thummim','Valiant','Vision','War','Weapon','Wicked','Wilderness','Worship','America','Ammonihah','Babel','Bethlehem','Bountiful','Hill Cumorah','Jershon','Jerusalem','Promised Land','Sidom','Waters of Mormon','Zarahemla','White Fruit','Star','Ship','Darkness','Curse'],
          phrases: ["Mormon, Father of Mormon","Mormon, Son of Mormon","Helaman, Father of Helaman",'Alma the Elder','Mosiah and Alma','1st and 2nd Nephi','Alma and Helaman','1st Nephi','Helaman Son of Helaman','Alma the Younger','Filled with the Holy Ghost','Glad Tidings','Traveling in the Wilderness','The People of Ammon','Waters of Mormon','Two Thousand Young Warriors','Tree of Life','Title of Liberty','Jesus Christ Touches Stones','Spirit of God','Sons of Mosiah',"Sign of Christ's Death","Sign of Christ's Birth",'River of Sidon','Zerahemnah is Scalped','Prison Walls Fall','Pray for Forgiveness','Pray for Help','Pray for Knowledge','Pray for Guidance','Pray for Other People','Pray for Protection','Pray to Receive the Holy Ghost','Pray for Strength','The Brass Plates','The Gold Plates','Plates of Jaredites','Plates of Mormon','Plates of Nephi','Night Without Darkness','Nephites Attack Other Nephites','Nephites Attack Lamanites','Nephites Become Slaves','Nephi Breaks Bow','Brothers Tie Up Nephi','Nephi Builds a Ship','Jesus Christ Visits Nephi','Nephi kills Laban','Nephi Leads the Nephites','Nephi Returns for the Brass Plates','Nephi Son of Lehi','Mothers of Strippling Warriors',"Lehi's Dreams",'Lehi Finds the Liahona','Lehi Told to leave Jerusalem','Lehi Travels in the Wilderness','Lehi Warns Jerusalem to Repent','Father of King Lamoni','Lamanites Attack the Nephites','Lamanites Join the Church','Lamanites Repent','Joseph Brother of Nephi','Jesus Christ Appears','Jesus Christ Blesses the Children','Jesus Christ Heals','Jesus Christ Ordains His Disciples','Jesus Christ Prays','Jesus Christ as Savior','Jesus Christ Teaches the Nephites','Ishmael and His Family','Land of Ishmael','The Iron Rod','Filled with the Holy Ghost','Listening to the Holy Ghost','Receiving the Holy Ghost','Gadianton Robbers','Flocks of King Lamoni','The Liahona Works by Faith','People of Ammon Bury Weapons',"Building in Lehi's Dream",'Brother of Jared','Bow of Nephi','Land of Bountiful',"Christ's Disciples Baptize",'Tower of Babel',"Ammon cuts off Robbers' Arms","Nephi puts on Laban's Armor",'Anti-Christ','Angels Comfort the Lamanites','Angels Encircle the Nephite Children',"Angels Minister to Jesus' Disciples",'Alma the Younger Repents','Angel Appears to Alma the Younger','People of Alma',"Alma Believes Abinadi's Teachings",'Alma Escapes from King Noah']
        },
        {
          title: 'Church History',
          words: ['The First Vision','Grove of Trees','Palmyra','Manchester Townships','New York','Hill Cumorah','Joseph Smith','Oliver Cowdery','Harmony, Pennsylvania','Peter','James','John','Susquehanna River','Colesville, New York','Lamanites','Native Americans','Ohio',"Independence, Missouri",'Sidney Rigdon','Frederick G. Williams','Mobs',"Jackson County, Missouri",'Missouri River','Clay County',"Kirtland, Ohio","Zion’s Camp",'Relief to Saints','Jesus Christ appeared','Moses','Elias','Elijah','Baptism by proxy','Nauvoo Saints','Ship Brooklyn','Mormon Battalion','President Brigham Young','Elder Heber C. Kimball','Elder Willard Richards','First Presidency','Richard Ballantyne','Family Home Evening'],
          phrases: ['The Quorum of the Twelve Apostles','First Quorum of the Seventy',"The Family: A Proclamation to the World",'President Joseph Fielding Smith','New Church magazines','Ensign','New Era','The Friend','President Harold B. Lee','President Spencer W. Kimball','Revelations added to Pearl of Great Price','Priesthood to every worthy male member','LDS edition of King James Bible','President Ezra Taft Benson','President Howard W. Hunter','President Gordon B. Hinckley','Willie and Martin Handcart Companies','Rescue Party',"Young Ladies’ Retrenchment Association","Young Women's program","Young Men’s Mutual Improvement Association","Young Men's program",'Aurelia Spencer Rogers','John Taylor',"Organization of the Seventies",'Wilford Woodruff sustained as President','President Lorenzo Snow','President Joseph F. Smith','President Heber J. Grant','Assisted the poor','Church Welfare Program','President George Albert Smith','David O. McKay sustained as President','Crickets devastated the crops','Sunday School was organized','Translation of the Book of Mormon','The Three Witnesses','The Eight Witnesses','Received the Melchizedek Priesthood','Peter, James, and John','The Aaronic Priesthood Restored','Visited by angel Moroni','Obtained the gold plates','Fayette Township, New York','Relief Society organized','Martyred in Carthage Jail']
        },
        {
          title: 'Doctrine and Covenants',
          words: ['Adopted','Alcohol','Ancestors','Angel','Apostle','Arrested','Attacked','Baptized','Beautiful','Believe','Bishop','Blamed','Borrow','Bragged','Bridge','Bugle','Buried','Captain','Captured','Choices','Choose','Commandments','Conference','Counselors','Covenant','Created','Crops','Crucified','Dam','Deacons','Dedicate','Destroy','Disciple','Earn','Elders','Endowment','Enemy','Escape','Evil','Evil spirits','Faith','Fast','Forgive','Gather','Gifts','Gospel','Governor','Heal','Jail','Joined','Language','Lead','Married','Mission','Missionary','Obey','Ocean','Ordained','Oxen','Patriarch','Poison','Pray','Preached','Presidency','President','Priesthood','Priests','Printer','Prison','Prophet','Protect','Quail','Repent','Resurrection','Revelation','Righteous','Sabbath','Sacrament','Sacred','Saint','Save','Scriptures','Share',"Soldiers",'Spirit','Steal','Suffer','Swear','Swore','Tar','Temple','Tempt','Tithing','Tobacco','Translated','Truth','Testimony','Trappers','Vision','Witnesses','Worship','Wound','Adam-ondi-Ahman','America','Arizona','California','Carthage','Colorado','Council Bluffs','Egypt','Far West','Fayette','Harmony','Haun’s Mill','Heaven','Hill Cumorah','Idaho','Illinois','Independence','Jackson County','Jerusalem','Kirtland','Liberty','Mississippi River','Missouri','Nauvoo','New York','Ohio','Pacific Ocean','Palmyra','Pennsylvania','Quincy','Rocky Mountains','Salt Lake City','United States','Utah','Vermont','Winter Quarters','Wyoming','Zion','John C. Bennett','Captain Allen','Leman Copley','Oliver Cowdery','Elias','Elijah','Governor Boggs','Martin Harris','Orson Hyde','Indians','James','John','John the Baptist','Heber C. Kimball','Sarah Kimball','Spencer W. Kimball','Newel Knight','Lamanites','Melchizedek','Moroni','Moses','Mr. Chandler','Mr. Hale','Noah','Hiram Page','Edward Partridge','Peter','William W. Phelps','Pioneers','Parley P. Pratt','Willard Richards','Sidney Rigdon','Alvin Smith','Emma Smith','Hyrum Smith','Joseph Smith','Joseph Smith Sr.','Lucy Smith','Eliza R. Snow ','Taylor, John','David Whitmer','Peter Whitmer','Newel K. Whitney','Frederick G. Williams','Brigham Young','Phineas Young'],
          phrases: ['Baptismal font','Telestial Kingdom','Terrestrial Kingdom','Garden of Gethsemane','Celestial Kingdom']
        },
        {
          title: 'Hymns',
          words: [],
          phrases: ['A Key Was Turned in Latter Days','A Mighty Fortress Is Our God','A Poor Wayfaring Man of Grief',"Abide with Me; 'Tis Eventide",'Abide with Me!','Adam-ondi-Ahman','Again We Meet around the Board','Again, Our Dear Redeeming Lord','All Creatures of Our God and King','All Glory, Laud, and Honor','America the Beautiful','An Angel from on High','An Angel from on High','Arise, O Glorious Zion','Arise, O God, and Shine','As I Search the Holy Scriptures','As Now We Take the Sacrament','As Sisters in Zion','As the Dew from Heaven Distilling','As the Shadows Fall',"As Zion's Youth in Latter Days",'Awake and Arise','Awake, Ye Saints of God, Awake!','Away in a Manger','Battle Hymn of the Republic','Be Still, My Soul','Be Thou Humble','Beautiful Zion, Built Above','Because I Have Been Given Much','Before Thee, Lord, I Bow My Head','Behold the Great','Redeemer Die','Behold Thy Sons and Daughters, Lord','Behold, the Mountain of the Lord','Behold! A Royal Army','Bless Our Fast, We Pray',"Brightly Beams Our Father's Mercy",'Called to Serve','Carry On','Cast Thy Burden upon the Lord','Children of Our Heavenly Father','Choose the Right','Christ the Lord Is Risen Today','Come Along, Come Along','Come Away to the Sunday School','Come unto Him','Come unto Jesus','Come, All Whose Souls Are Lighted','Come, All Ye Saints of Zion','Come, All Ye Saints Who Dwell on Earth','Come, All Ye Sons of God','Come, Come, Ye Saints','Come, Come, Ye Saints','Come, Follow Me','Come, Let Us Anew','Come, Let Us Sing an Evening Hymn',"Come, Listen to a Prophet's Voice",'Come, O Thou King of Kings','Come, O Thou King of Kings','Come, Rejoice','Come, Sing to the Lord','Come, Thou Glorious Day of Promise','Come, We That Love the Lord','Come, Ye Children of the Lord','Come, Ye Disconsolate','Come, Ye Thankful People','Count Your Blessings','Dear to the Heart of the Shepherd','Dearest Children, God Is Near You','Did You Think to Pray?','Do What Is Right','Does the Journey Seem Long?','Each Life That Touches Ours for Good','Faith of Our Fathers','Families Can Be Together Forever',"Far, Far Away on Judea's Plains",'Father in Heaven','Father in Heaven, We Do Believe','Father, Cheer Our Souls Tonight','Father, This Hour Has Been One of Joy','Father, Thy Children to Thee Now Raise','For All the Saints','For the Beauty of the Earth','For the Strength of the Hills','From All That Dwell below the Skies','From Homes of Saints Glad Songs Arise','Gently Raise the Sacred Strain','Glorious Things Are Sung of Zion','Glorious Things of Thee Are Spoken','Glory to God on High','Go Forth with Faith','Go, Ye Messengers of Glory','Go, Ye Messengers of Heaven','God Be with You Till We Meet Again','God Bless Our Prophet Dear','God Is in His Holy Temple','God Is Love','God Is Love','God Loved Us, So He Sent His Son','God Moves in a Mysterious Way',"God of Our Fathers, Known of Old","God of Our Fathers, We Come unto Thee","God of Our Fathers, Whose Almighty Hand","God of Power, God of Right","God Save the King",'God Speed the Right',"God, Our Father, Hear Us Pray","God's Daily Care","Great God, Attend While Zion Sings","Great God, to Thee My Evening Song",'Great Is the Lord','Great King of Heaven','Guide Me to Thee',"Guide Us, O Thou Great Jehovah","Hail to the Brightness of Zion's Glad Morning!","Hark, All Ye Nations!",'Hark! The Herald Angels Sing','Have I Done Any Good?','He Died! The Great Redeemer Died','He Is Risen!',"Hear Thou Our Hymn, O Lord",'Help Me Teach with Inspiration','High on the Mountain Top','High on the Mountain Top','Holy Temples on Mount Zion','Home Can Be a Heaven on Earth','Hope of Israel',"How Beautiful Thy Temples, Lord",'How Firm a Foundation',"How Gentle God's Commands",'How Great the Wisdom and the Love','How Great Thou Art',"How Long, O Lord Most Holy and True",'How Wondrous and Great','I Am a Child of God','I Believe in Christ','I Have Work Enough to Do','I Heard the Bells on Christmas Day','I Know My Father Lives','I Know That My Redeemer Lives','I Need Thee Every Hour','I Need Thee Every Hour','I Saw a Mighty Angel Fly','I Stand All Amazed',"I'll Go Where You Want Me to Go","I'm a Pilgrim, I'm a Stranger",'If You Could Hie to Kolob','Improve the Shining Moments','In Fasting We Approach Thee',"In Humility, Our Savior",'In Hymns of Praise','In Memory of the Crucified','In Our Lovely Deseret','In Remembrance of Thy Suffering',"Israel, Israel, God Is Calling",'It Came upon the Midnight Clear',"Jehovah, Lord of Heaven and Earth","Jesus of Nazareth, Savior and King","Jesus, Lover of My Soul","Jesus, Mighty King in Zion","Jesus, Once of Humble Birth","Jesus, Savior, Pilot Me","Jesus, the Very Thought of Thee","Jesus, the Very Thought of Thee","Joseph Smith's First Prayer",'Joy to the World','Keep the Commandments',"Know This, That Every Soul Is Free",'Lead Me into Life Eternal',"Lead, Kindly Light",'Lean on My Ample Arm',"Let Earth's Inhabitants Rejoice",'Let the Holy Spirit Guide','Let Us All Press On','Let Us Oft Speak Kind Words','Let Zion in Her Beauty Rise','Like Ten Thousand Legions Marching',"Lo, the Mighty God Appearing!","Lord, Accept into Thy Kingdom","Lord, Accept Our True Devotion","Lord, Dismiss Us with Thy Blessing","Lord, I Would Follow Thee","Lord, We Ask Thee Ere We Part","Lord, We Come before Thee Now",'Love at Home','Love One Another',"Master, the Tempest Is Raging",'Men Are That They Might Have Joy','More Holiness Give Me',"My Country, 'Tis of Thee",'My Redeemer Lives',"Nay, Speak No Ill","Nearer, Dear Savior, to Thee","Nearer, My God, to Thee",'Now Let Us Rejoice','Now Thank We All Our God','Now the Day Is Over',"Now We'll Sing with One Accord","O God, Our Help in Ages Past","O God, the Eternal Father",'O Home Beloved','O Little Town of Bethlehem','O Lord of Hosts','O Love That Glorifies the Son','O My Father','O Saints of Zion',"O Savior, Thou Who Wearest a Crown",'O Thou Kind and Gracious Father','O Thou Rock of Our Salvation',"O Thou, Before the World Began",'O Ye Mountains High',"Oh Say, What Is Truth?","Oh Say, What Is Truth?","Oh, Come, All Ye Faithful","Oh, Holy Words of Truth and Love","Oh, May My Soul Commune with The","Oh, What Songs of the Heart",'On This Day of Joy and Gladness',"Once in Royal David's City","Onward, Christian Soldier","Our Father, by Whose Name",'Our Mountain Home So Dear',"Our Savior's Love","Praise God, from Whom All Blessings Flow",'Praise the Lord with Heart and Voice',"Praise to the Lord, the Almighty",'Praise to the Man','Praise Ye the Lord',"Prayer Is the Soul's Sincere Desire",'Prayer of Thanksgiving',"Precious Savior, Dear Redeemer","Press Forward, Saints",'Put Your Shoulder to the Wheel','Raise Your Voices to the Lord','Redeemer of Israel',"Rejoice, the Lord Is King!","Rejoice, Ye Saints of Latter Days",'Rejoice! A Glorious Sound Is Heard','Reverently and Meekly Now',"Ring Out, Wild Bells","Rise Up, O Men of God","Rise Up, O Men of God","Rise, Ye Saints, and Temples Enter",'Rock of Ages','Sabbath Day',"Saints, Behold How Great Jehovah","Savior, Redeemer of My Soul",'Scatter Sunshine','School Thy Feelings','Secret Prayer','See the Mighty Priesthood Gathered',"See, the Mighty Angel Flying",'Should You Feel Inclined to Censure','Silent Night','Sing Praise to Him','Sing We Now at Parting','Softly Beams the Sacred Dawning','Softly Now the Light of Day',"Sons of Michael, He Approaches",'Sweet Hour of Prayer','Sweet Is the Peace the Gospel Brings','Sweet Is the Work','Sweet Is the Work',"'Tis Sweet to Sing the Matchless Love","'Tis Sweet To Sing the Matchless Love",'Twas Witnessed in the Morning Sky','Teach Me to Walk in the Light','Testimony','Thanks for the Sabbath School','That Easter Morn','The Day Dawn Is Breaking','The First Noel','The Glorious Gospel Light Has Shone','The Happy Day at Last Has Come','The Iron Rod','The Light Divine','The Lord Be with Us','The Lord Is My Light','The Lord Is My Shepherd','The Lord Is My Shepherd','The Lord My Pasture Will Prepare','The Morning Breaks','The Priesthood of Our Lord','The Spirit of God','The Star-Spangled Banner','The Time Is Far Spent','The Voice of God Again Is Heard','The Wintry Day, Descending to Its Close','There Is a Green Hill Far Away','There Is Sunshine in My Soul Today',"They, the Builders of the Nation",'This House We Dedicate to Thee','Though Deepening Trials','Thy Holy Word','Thy Servants Are Prepared','Thy Servants Are Prepared',"Thy Spirit, Lord, Has Stirred Our Souls","Thy Will, O Lord, Be Done","Today, While the Sun Shines",'True to the Faith','Truth Eternal','Truth Reflects upon Our Senses','Turn Your Hearts',"Up, Awake, Ye Defenders of Zion",'Upon the Cross of Calvary','We Are All Enlisted','We Are Marching On to Glory','We Are Sowing','We Ever Pray for Thee','We Ever Pray for Thee','We Give Thee But Thine Own','We Have Partaken of Thy Love',"We Listen to a Prophet's Voice","We Love Thy House, O God",'We Meet Again as Sisters','We Meet Again in Sabbath School',"We Meet, Dear Lord","We Thank Thee, O God, for a Prophet",'We Will Sing of Zion',"We'll Sing All Hail to Jesus' Name","We're Not Ashamed to Own Our Lord","Welcome, Welcome, Sabbath Morning",'What Glorious Scenes Mine Eyes Behold','What Was Witnessed in the Heavens?','When Faith Endures','Where Can I Turn for Peace?','While of These Emblems We Partake','While of These Emblems We Partake','While Shepherds Watched Their Flocks',"Who's on the Lord's Side?",'With All the Power of Heart and Tongue','With Humble Heart','With Songs of Praise','With Wondering Awe','Ye Elders of Israel','Ye Simple Souls Who Stray','Ye Who Are Called to Labor','You Can Make the Pathway Bright','Zion Stands with Hills Surrounded']
        },
        {
          title: 'New Testament',
          words: ['Altar','Angel','Authority','Baptism','Believe','Bless','Blessing','Blind','Bow','Bridegroom','Bury','Capture','Cave','Celebrate','Coin','Command','Commandment','Counselor','Crucify','Deaf','Desert','Devil','Disciple','Drown','Earthquake','Eternal life','Everlasting','Evil','Faith','Famine','Fast','Feast','Follow','Forgive','Gift','Gospel','Guard','Heal','Heaven','Holy','Honeycomb','Hymn','Inn','Innkeeper','Join','Kneel','Lazy','Lead','Leader','Leper','Lie','Locust','Manger','Member','Miracle','Mission','Missionary','Mock','Mount','Neighbor','Obey','Ordain','Organize','Parable','Passover','Peacemaker','Power','Praise','Pray','Prayer','Priest','Priesthood','Prison','Produce','Promise','Prophet','Repent','Resurrect','Revelation','Righteous','Robe','Sabbath','Sacrament','Sacred','Sacrifice','Saint','Salvation','Save','Scriptures','Sermon','Servant','Shepherd','Sin','Sinner','Soldier','Sore','Spirit','Steal','Suffer','Synagogue','Tax','Temple','Tempt','Testify','Testimony','Thief','Thorn','Tithing','Tomb','Transfiguration','Translate','Travel','Trial','Truth','Vine','Vision','War','Wedding','Whip','Wicked','Wilderness','Wine','Wise','Wise Men','Worship','America','Earth','Egypt','Heaven','Holy Land','Rome','Agrippa','Ananias','Anna','Caiaphas','Elias','Elisabeth','Gabriel','God','Heavenly Father','Herod','Holy Ghost','Isaiah','Jairus','James','Jesus Christ','Jews','John','John the Baptist','Joseph','Judas Iscariot','Lazarus','Mary','Mary and Martha','Mary Magdalene','Matthias','Messiah','Moses','Nicodemus','Paul','Peter','Pharisees','Pontius Pilate','Romans','Samaritans','Satan','Saul','Savior','Silas','Simeon','Simon','Stephen','Tabitha','Zacharias  the','Damascus','Caesarea Philippi','Galilee','Capernaum','Cana','Nazareth','Samaria','Jericho','Jerusalem','Bethany','Bethlehem','Golgotha'],
          phrases: ['Body of Flesh and Blood','Sisters of Lazarus','Second Coming','Loaves of Bread','Kingdom of God','Gift of the Holy Ghost','Filled with the Holy Ghost','Crown of Thorns','Sea of Galilee','Garden of Gethsemane','Mount of Olives','House of Caiaphas','Upper Room','Jordan River','Garden Tomb','Pool of Bethesda']
        },
        {
          title: 'Old Testament',
          words: ['Altar','Angel','Anoint','Anointed','Ark','Army','Armies','Baptized','Barley','Barrel','Basket','Battle','Beat','Beating','Beautiful','Believe','Believed','Blessed','Blessing','Bow','Bull','Bury','Calf','Camel','Candlesticks','Captain','Captured','Cave','Choose','Chosen','Commandments','Crucify','Crucified','Curtains','Daughter','Den','Destroy','Destroyed','Divided','Earrings','Earthquake','Elders','Enough','Escape','Escaped','Evil','Faith','Famine','Fasted','Flood','Forgive','Furnace','Garden','Giant','Gift','Gospel','Heal','Husband','Idol','Jar','Judge','Kingdom','Language','Lead','Leader','Leper','Lice','Lies','Married','Miracle','Mountain','Obey','Obeyed','Pottage','Power','Pray','Prayed','Priesthood','Priests','Prison','Promise','Promised','Prophet','Punished','Quails','Rainbow','Ram','Repent','Repented','Resurrected','Righteous','Rod','Sabbath','Sacrifice','Sacrificed','Save','Servant','Servants','Shepherd','Slaves','Sling','Soldiers','Spies','Spirits','Store','Stored','Swallowed','Sword','Suffer','Suffered','Tabernacle','Teach','Taught','Temple','Tested','Thirsty','Tithing','Travel','Traveled','Tribe','Trouble','Trusted','Vision','Well','Wheat','Wicked','Wilderness','Wise','Worship','Yard','Young','Youngest','America','Babylon','Bethlehem','Canaan','Earth','Egypt','Garden of Eden','Heaven','Israel','Jericho','Jerusalem','Jordan River','Kingdom of Israel','Kingdom of Judah','Moab','Mount Sinai','Nineveh','Promised land','Red Sea','Ur','Zion','Aaron','Abed-nego','Abel','Abraham','Adam','Ahab','Baal','Bathsheba','Boaz','Cain','Cyrus','Daniel','Darius','David','Devil','Egyptians','Eli','Elijah','Elisha','Enoch','Esau','Esther','Eve','Ezra','God','Goliath','Haman','Hannah','Heavenly Father','Holy Ghost','Isaac','Isaiah','Israel','Israel','Israelites','Jacob','Jaredites','Jeremiah','Jeroboam','Jesse','Jesus','Jews','Jezebel','Job','Jonah','Joseph','Joshua','Laban','Leah','Lehi','Lucifer','Melchizedek','Meshach','Micah','Miriam','Mordecai','Moses','Naaman','Naomi','Nathan','Nehemiah','Noah','Obed','Orpah','Philistines','Potiphar','Rachel','Rebekah','Rehoboam','Ruth','Samuel','Sarah','Satan','Saul','Seth','Shadrach','Solomon','Uriah','Zechariah'],
          phrases: ['Battle of Jericho','Flesh-and-Blood Bodies','Spirit Bodies','Ark of the Covenant','Giving A Blessing','Birthright Blessing']
        },
        {
          title: 'Pearl of Great Price',
          words: ['Moses','Abraham','Joseph Smith-Matthew','Persecution','Joseph Smith-History','Articles of Faith','Lucifer','God','Cain','Enoch','Noah','Jehovah','Pharaoh','Visions','Destruction','Moroni','Priesthood','Facsimiles'],
          phrases: ['Plan of Salvation','The Angel Moroni','The First Vision','An Unusual Excitement','The Second Coming','Destruction of Jerusalem','End of the World','Time to Prepare','Creation of the Earth','Physical Creation','Spiritual Creation','Jesus Christ Prophesied','Abraham Taught the Egyptians','The Premortal Existence','The Stars and Moon','King of Egypt',"Abraham's Journey",'The Abrahamic Covenant','Blessings of the Fathers','Filled with Wickedness','Language of Power','From the Beginning','Adam and Eve','The Fall','How Lucifer Became the Devil','Husband and Wife',"God's Work",'God Revealed Himself']
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
