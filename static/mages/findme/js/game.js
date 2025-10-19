////////////////////////////////////////////////////////////
// GAME v1.4
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

//focus player
var player_arr = [
	{src:"assets/focusplayer0.png", regX:30, regY:95},
	{src:"assets/focusplayer1.png", regX:30, regY:95},
	{src:"assets/focusplayer2.png", regX:30, regY:95},
	{src:"assets/focusplayer3.png", regX:30, regY:95},
	{src:"assets/focusplayer4.png", regX:30, regY:95},
	{src:"assets/focusplayer5.png", regX:30, regY:95},
	{src:"assets/focusplayer6.png", regX:30, regY:95},
	{src:"assets/focusplayer7.png", regX:30, regY:95},
]

//crowd player
var players_arr = [
	{src:"assets/player0.png", regX:30, regY:95}
]

//stage settings
var stage_arr = [
	{
		timer:15000,
		score:100,
		total:30,
		audio:[10,30],
		idle:[1,5],
		speed:.5
	},
	{
		timer:14000,
		score:200,
		total:35,
		audio:[10,30],
		idle:[1,5],
		speed:.5
	},
	{
		timer:13000,
		score:300,
		total:45,
		audio:[10,30],
		idle:[1,5],
		speed:.5
	},
	{
		timer:12000,
		score:400,
		total:50,
		audio:[10,30],
		idle:[1,5],
		speed:.5
	},
	{
		timer:11000,
		score:500,
		total:60,
		audio:[10,30],
		idle:[1,5],
		speed:.5
	},
	{
		timer:10000,
		score:600,
		total:65,
		audio:[10,30],
		idle:[1,5],
		speed:.5
	},
	{
		timer:9000,
		score:700,
		total:70,
		audio:[10,30],
		idle:[1,5],
		speed:.45
	},
	{
		timer:8000,
		score:800,
		total:75,
		audio:[10,30],
		idle:[1,5],
		speed:.40
	},
	{
		timer:7000,
		score:900,
		total:80,
		audio:[5,10],
		idle:[1,3],
		speed:.35
	},
	{
		timer:6000,
		score:1000,
		total:100,
		audio:[5,10],
		idle:[1,3],
		speed:.30
	}
]

//multiplayer settings
var multiSettings = {
	timer:16000,
	score:100,
	total:50,
	audio:[10,30],
	idle:[1,5],
	speed:.5,
	findColor:"#000",
	activeColor:"#FF8000",
}

//game settings
var gameSettings = {
	title:{
		total:20,
		audio:[20,50],
		idle:[1,5],
		speed:.5
	},
	move:{
		landscape:{
			x:500,
			y:250
		},
		portrait:{
			x:200,
			y:300
		}
	},
	timer:{
		color:"#000",
		width:400,
		height:5,
		radius:3
	},
	score:{
		speed:1
	}
}

//game text display
var textDisplay = {
					stage:'Stage [NUMBER]',
					stageClear:"Stage clear",
					score:'+[NUMBER]pts',
					round:"Round [NUMBER]/[TOTAL]",
					roundComplete:"Round over",
					activePlayer:"(YOU)",
					findPlayers:'YOUR TURN:\nFind all players',
					hidePlayers:'[PLAYER] TURN:\nStay in the crowd',
					foundScore:'[NUMBER]/[TOTAL]',
					timesup:"Time\'s up!",
					exitTitle:'EXIT GAME',
					exitMessage:'Are you sure\nyou want to\nquit the game?',
					share:'SHARE YOUR SCORE',
					resultTitle:'GAME OVER',
					resultDesc:'[NUMBER]pts'
				}

//Social share, [SCORE] will replace with game score
var shareEnable = true; //toggle share
var shareTitle = 'Highscore on Find Me is [SCORE]PTS';//social share score title
var shareMessage = '[SCORE]PTS is mine new highscore on Find Me Game game! Try it now!'; //social share score message

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
var playerData = {score:0, stage:0};
var gameData = {paused:true, stageNum:0, players:[], player:[], playerIndex:0, totalPlayers:0, shadow:[], playerAudio:0, stage:{timer:0, total:0, speed:0, rangeX:0, rangeY:0, audio:[10,30]}, multi:{max:4, round:0, found:0, spaceX:120, nameY:-80, players:[]}, begin:false, complete:false};
var tweenData = {score:0, tweenScore:0};
var timeData = {enable:false, startDate:null, sessionDate:null, nowDate:null, sessionTimer:0, timer:0, oldTimer:0, accumulate:0};

/*!
 * 
 * GAME BUTTONS - This is the function that runs to setup button event
 * 
 */
function buildGameButton(){
	$(window).focus(function() {
		if(!buttonSoundOn.visible){
			toggleSoundInMute(false);
		}

		if (typeof buttonMusicOn != "undefined") {
			if(!buttonMusicOn.visible){
				toggleMusicInMute(false);
			}
		}
	});
	
	$(window).blur(function() {
		if(!buttonSoundOn.visible){
			toggleSoundInMute(true);
		}

		if (typeof buttonMusicOn != "undefined") {
			if(!buttonMusicOn.visible){
				toggleMusicInMute(true);
			}
		}
	});
	buttonLocal.cursor = "pointer";
	buttonLocal.addEventListener("click", function(evt) {
		playSound('soundButton');
		socketData.online = false;
		goPage('game');
	});

	buttonOnline.cursor = "pointer";
	buttonOnline.addEventListener("click", function(evt) {
		playSound('soundButton');
		checkQuickGameMode();
	});

	buttonStart.cursor = "pointer";
	buttonStart.addEventListener("click", function(evt) {
		playSound('soundButton');
		if ( typeof initSocket == 'function' && multiplayerSettings.enable) {
			if(multiplayerSettings.localPlay){
				toggleMainButton('local');
			}else{
				checkQuickGameMode();
			}
		}else{
			goPage('game');
		}
	});
	
	itemExit.addEventListener("click", function(evt) {
	});
	
	buttonContinue.cursor = "pointer";
	buttonContinue.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('main');
	});
	
	buttonFacebook.cursor = "pointer";
	buttonFacebook.addEventListener("click", function(evt) {
		share('facebook');
	});
	
	buttonTwitter.cursor = "pointer";
	buttonTwitter.addEventListener("click", function(evt) {
		share('twitter');
	});
	buttonWhatsapp.cursor = "pointer";
	buttonWhatsapp.addEventListener("click", function(evt) {
		share('whatsapp');
	});
	
	buttonSoundOff.cursor = "pointer";
	buttonSoundOff.addEventListener("click", function(evt) {
		toggleSoundMute(true);
	});
	
	buttonSoundOn.cursor = "pointer";
	buttonSoundOn.addEventListener("click", function(evt) {
		toggleSoundMute(false);
	});

	if (typeof buttonMusicOff != "undefined") {
		buttonMusicOff.cursor = "pointer";
		buttonMusicOff.addEventListener("click", function(evt) {
			toggleMusicMute(true);
		});
	}
	
	if (typeof buttonMusicOn != "undefined") {
		buttonMusicOn.cursor = "pointer";
		buttonMusicOn.addEventListener("click", function(evt) {
			toggleMusicMute(false);
		});
	}
	
	buttonFullscreen.cursor = "pointer";
	buttonFullscreen.addEventListener("click", function(evt) {
		toggleFullScreen();
	});
	
	buttonExit.cursor = "pointer";
	buttonExit.addEventListener("click", function(evt) {
		togglePop(true);
		toggleOption();
	});
	
	buttonSettings.cursor = "pointer";
	buttonSettings.addEventListener("click", function(evt) {
		toggleOption();
	});
	
	buttonConfirm.cursor = "pointer";
	buttonConfirm.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
		
		stopAudio();
		stopGame();
		goPage('main');
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			exitSocketRoom();
		}
	});
	
	buttonCancel.cursor = "pointer";
	buttonCancel.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
	});

	stage.on("stagemousedown", function(evt) {
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			var pos = playersContainer.globalToLocal(evt.stageX, evt.stageY);
			if(socketData.gameIndex == gameData.multi.round){
				directPlayers(socketData.gameIndex, pos.x, pos.y);
			}else{
				postSocketUpdate('directplayer', {index:socketData.gameIndex, x:pos.x, y:pos.y}, true);
			}
		}
	})

	for(var n=0; n<player_arr.length; n++){
		gameData.player.push(n);
	}
	shuffle(gameData.player);

	gameData.stage.rangeX = gameSettings.move.landscape.x;
	gameData.stage.rangeY = gameSettings.move.landscape.y;
}

/*!
 * 
 * TOGGLE GAME TYPE - This is the function that runs to toggle game type
 * 
 */
function toggleMainButton(con){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable) {
		gameLogsTxt.visible = true;
		gameLogsTxt.text = '';
	}

	buttonStart.visible = false;
	buttonLocalContainer.visible = false;

	if(con == 'start'){
		buttonStart.visible = true;
	}else if(con == 'local'){
		buttonLocalContainer.visible = true;
	}
}

function checkQuickGameMode(){
	socketData.online = true;
	if(!multiplayerSettings.enterName){
		buttonStart.visible = false;
		buttonLocalContainer.visible = false;

		addSocketRandomUser();
	}else{
		goPage('name');
	}
}

function resizeSocketLog(){
	if(curPage == 'main'){
		if(viewport.isLandscape){
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 73;
		}else{
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 75;
		}
	}
}

/*!
 * 
 * TOGGLE POP - This is the function that runs to toggle popup overlay
 * 
 */
function togglePop(con){
	confirmContainer.visible = con;
}


/*!
 * 
 * DISPLAY PAGES - This is the function that runs to display pages
 * 
 */
var curPage=''
function goPage(page){
	curPage=page;

	$('#roomWrapper').hide();
	$('#roomWrapper .innerContent').hide();
	gameLogsTxt.visible = false;
	bgRoom.visible = false;
	
	mainContainer.visible = false;
	gameContainer.visible = false;
	resultContainer.visible = false;
	stopPlayers();
	stopSoundLoop("soundRunning");

	var targetContainer = null;
	switch(page){
		case 'main':
			targetContainer = mainContainer;
			gameData.stage.total = gameSettings.title.total;
			gameData.stage.speed = gameSettings.title.speed;
			gameData.stage.audio = gameSettings.title.audio;
			gameData.stage.idle = gameSettings.title.idle;
			
			if ( typeof initSocket == 'function' && multiplayerSettings.enable) {
				socketData.online = false;
			}
			buildStage();
			toggleMainButton("start");
		break;

		case 'name':
			targetContainer = nameContainer;
			$('#roomWrapper').show();
			$('#roomWrapper .nameContent').show();
			$('#roomWrapper .fontNameError').html('');
			$('#enterName').show();
			bgRoom.visible = true;
		break;
			
		case 'room':
			targetContainer = roomContainer;
			$('#roomWrapper').show();
			$('#roomWrapper .roomContent').show();
			switchSocketRoomContent('lists');
			bgRoom.visible = true;
		break;
		
		case 'game':
			targetContainer = gameContainer;
			startGame();
		break;
		
		case 'result':
			targetContainer = resultContainer;
			stopGame();
			togglePop(false);
			playSound('soundResult');

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				playerData.score = $.players[socketData.gameIndex].score;
			}

			tweenData.tweenScore = 0;
			TweenMax.to(tweenData, .5, {tweenScore:playerData.score, overwrite:true, onUpdate:function(){
				resultDescTxt.text = textDisplay.resultDesc.replace('[NUMBER]', addCommas(Math.floor(tweenData.tweenScore)));
			}});
			saveGame(playerData.score);
		break;
	}
	
	if(targetContainer != null){
		targetContainer.visible = true;
		targetContainer.alpha = 0;
		TweenMax.to(targetContainer, .5, {alpha:1, overwrite:true});
	}
	
	resizeCanvas();
}

/*!
 * 
 * START GAME - This is the function that runs to start game
 * 
 */
function startGame(){
	gameData.stageNum = 0;
	
	gameMultiStatusTxt.text = "";
	statusContainer.alpha = 0;
	playerData.score = 0;
	playerData.stage = 0;

	fade.alpha = fadeP.alpha = 0;
	setupGameStage();

	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		gameData.multi.round = 0;

		if(socketData.host){
			gameData.multi.players = [];
			shuffle(gameData.player);
			for(var n=0; n<gameData.totalPlayers; n++){
				gameData.multi.players.push(gameData.player[n]);
			}
			postSocketUpdate('prepare', {players:gameData.player, multiplayers:gameData.multi.players});
		}
	}else{
		gameData.totalPlayers = 1;
		prepareStage();
	}
}

 /*!
 * 
 * STOP GAME - This is the function that runs to stop play game
 * 
 */
function stopGame(){
	toggleGameTimer(false);
	stopSoundLoop("soundRunning");
	gameData.paused = true;
	TweenMax.killAll(false, true, false);
}

function saveGame(score){
	if ( typeof toggleScoreboardSave == 'function' ) { 
		$.scoreData.score = score;
		if(typeof type != 'undefined'){
			$.scoreData.type = type;	
		}
		toggleScoreboardSave(true);
	}

	/*$.ajax({
      type: "POST",
      url: 'saveResults.php',
      data: {score:score},
      success: function (result) {
          console.log(result);
      }
    });*/
}

function resizeGameUI(){
	if(viewport.isLandscape){
		statusContainer.x = canvasW/2;
		statusContainer.y = canvasH/100 * 85;

		gameMultiStatusTxt.x = canvasW/2;
		gameMultiStatusTxt.y = canvasH/100 * 60;

		timerShape.x = timerShapeBg.x = (canvasW/2) - (gameSettings.timer.width/2);
		timerShape.y = timerShapeBg.y = canvasH/100 * 85;

		scoreTxt.x = canvasW/2;
		scoreTxt.y = canvasH/100 * 84;
		
		gameData.stage.rangeX = gameSettings.move.landscape.x;
		gameData.stage.rangeY = gameSettings.move.landscape.y;

	}else{
		statusContainer.x = canvasW/2;
		statusContainer.y = canvasH/100 * 86;

		gameMultiStatusTxt.x = canvasW/2;
		gameMultiStatusTxt.y = canvasH/100 * 63;

		timerShape.x = timerShapeBg.x = (canvasW/2) - (gameSettings.timer.width/2);
		timerShape.y = timerShapeBg.y = canvasH/100 * 86;

		scoreTxt.x = canvasW/2;
		scoreTxt.y = canvasH/100 * 85;

		gameData.stage.rangeX = gameSettings.move.portrait.x;
		gameData.stage.rangeY = gameSettings.move.portrait.y;

	}

	positionLogoPlayer();
}

/*!
 * 
 * POSITON LOGO PLAYER - This is the function that runs to postion logo player
 * 
 */
function positionLogoPlayer(){
	if(curPage == "main"){
		if(gameData.players.length > 0){
			var focusPlayer = gameData.players[0];
			TweenMax.killTweensOf(focusPlayer);

			if(viewport.isLandscape){
				focusPlayer.x = 60;
				focusPlayer.y = 20;
			}else{
				focusPlayer.x = 0;
				focusPlayer.y = 100;
			}
		}
	}
}

/*!
 * 
 * GAME STAGE - This is the function that runs to setup and prepare game stage
 * 
 */

function setupGameStage(){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		gameData.stage.timer = multiSettings.timer;
		gameData.stage.total = multiSettings.total;
		gameData.stage.speed = multiSettings.speed;
		gameData.stage.audio = multiSettings.audio;
		gameData.stage.idle = multiSettings.idle;
		gameData.stage.score = multiSettings.score;
	}else{
		gameData.stage.timer = stage_arr[gameData.stageNum].timer;
		gameData.stage.total = stage_arr[gameData.stageNum].total;
		gameData.stage.speed = stage_arr[gameData.stageNum].speed;
		gameData.stage.audio = stage_arr[gameData.stageNum].audio;
		gameData.stage.idle = stage_arr[gameData.stageNum].idle;
		gameData.stage.score = stage_arr[gameData.stageNum].score;
	}

	timeData.countdown = gameData.stage.timer;
	timeData.sessionTimer = timeData.countdown;
	updateTimerBar();

	gameData.begin = false;

	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		gameData.paused = true;
	}else{
		gameData.paused = false;
	}
}

function showMultiPlayers(){
	playersContainer.removeAllChildren();
	shadowContainer.removeAllChildren();
	playerNameContainer.removeAllChildren();
	gameData.players = [];
	gameData.shadow = [];

	var pos = {x:0, y:0};
	var spaceX = gameData.multi.spaceX;
	var totalW = spaceX * (gameData.totalPlayers - 1);
	pos.x = -(totalW/2);

	for(var n=0; n<gameData.totalPlayers; n++){
		var newPlayer = getSpriteSheet("player", n);
		playersContainer.addChild(newPlayer);

		newPlayer.x = pos.x;
		newPlayer.y = pos.y;
		newPlayer.data = pos;
		newPlayer.frame = "";
		newPlayer.focus = true;
		getPlayerFrame(newPlayer, "stand");
		
		if(isEven(n)){
			newPlayer.y -= 50;
		}

		pos.x += spaceX;
		gameData.players.push(newPlayer);

		//shadow
		var newShadow = new createjs.Bitmap(loader.getResult('itemShadow'));
		centerReg(newShadow);
		newShadow.x = newPlayer.x;
		newShadow.y = newPlayer.y;
		shadowContainer.addChild(newShadow);
		gameData.shadow.push(newShadow);

		//name
		posPlayerName(n, newPlayer);
		playerNameContainer.addChild($.players[n]);

		if(n == gameData.multi.round){
			$.players[n].color = multiSettings.activeColor;
		}else{
			$.players[n].color = multiSettings.findColor;
		}
	}

	if(socketData.gameIndex == gameData.multi.round){
		showMultiGameStatus("find");
	}else{
		showMultiGameStatus("hide");
	}

	showGameStatus("preround");
	TweenMax.to(playersContainer, 4, {onComplete:function(){
		prepareStage();
	}});
}

function posPlayerName(index, player){
	$.players[index].x = player.x;
	$.players[index].y = (player.y - $.players[index].getMeasuredHeight()) + gameData.multi.nameY;
}

function prepareStage(){
	var fadeOutTween = .5;
	var fadeInTween = 1;
	TweenMax.to(fade, fadeOutTween, {alpha:1, onComplete:function(){
		buildStage();
		TweenMax.to(fade, fadeInTween, {alpha:0, onComplete:function(){
			
		}});
	}});

	TweenMax.to(fadeP, fadeOutTween, {alpha:1, onComplete:function(){
		TweenMax.to(fadeP, fadeInTween, {alpha:0, onComplete:function(){
			
		}});
	}});
}

function buildStage(){
	playersContainer.removeAllChildren();
	shadowContainer.removeAllChildren();
	playerNameContainer.removeAllChildren();
	gameData.players = [];
	gameData.shadow = [];
	gameData.playerAudio = 0;

	for(var n=0; n<gameData.stage.total; n++){
		var newPlayer = getSpriteSheet("player", n);
		playersContainer.addChild(newPlayer);

		var pos = getPlayerPos();
		newPlayer.x = pos.x;
		newPlayer.y = pos.y;
		newPlayer.data = pos;
		newPlayer.index = n;
		newPlayer.frame = "";
		newPlayer.focus = false;
		newPlayer.moveX = pos.x;
		newPlayer.moveY = pos.y;
		getPlayerFrame(newPlayer, "stand");

		var movePlayer = false;
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if(n < gameData.totalPlayers){
				newPlayer.focus = true;
				playerNameContainer.addChild($.players[n]);

				if(n == gameData.multi.round){
					$.players[n].color = multiSettings.activeColor;
				}else{
					$.players[n].color = multiSettings.findColor;
				}
			}

			if(socketData.gameIndex == gameData.multi.round){
				movePlayer = true;
			}
		}else{
			if(n == 0){
				newPlayer.focus = true;
			}
			movePlayer = true;
		}

		if(movePlayer){
			var delay = curPage == "game" ? 2 : 0;
			loopPlayerIdle(newPlayer,delay);
		}
		gameData.players.push(newPlayer);

		newPlayer.cursor = "pointer";
		newPlayer.addEventListener("click", function(evt) {
			checkFocusPlayer(evt.target);
		});

		//shadow
		var newShadow = new createjs.Bitmap(loader.getResult('itemShadow'));
		centerReg(newShadow);
		shadowContainer.addChild(newShadow);
		gameData.shadow.push(newShadow);
	}

	scoreTxt.text = "";
	gameData.paused = false;
	gameData.complete = false;
	gameData.begin = false;
	gameData.multi.found = 0;
	
	if(curPage == "game"){
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			for(var n=0; n<gameData.totalPlayers; n++){
				var focusPlayer = gameData.players[n];
				var targetPlayer = gameData.players[n+4];
				focusPlayer.x = targetPlayer.x;
				focusPlayer.y = targetPlayer.y - 1;
				TweenMax.killTweensOf(gameData.players[n]);

				if(socketData.gameIndex == gameData.multi.round){
					$.players[n].visible = false;
					if(socketData.gameIndex == n){
						$.players[n].visible = true;
					}
				}

				updateMultiScore();
			}
			showGameStatus("round");
		}else{
			var focusPlayer = gameData.players[0];
			var targetPlayer = gameData.players[1];
			focusPlayer.x = targetPlayer.x;
			focusPlayer.y = targetPlayer.y - 1;
			showGameStatus("stage");
		}
		playSound("soundStart");

		TweenMax.to(timerContainer, 2, {onComplete:function(){
			gameData.begin = true;
			playSoundLoop("soundRunning");
			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				if(socketData.gameIndex == gameData.multi.round){
					toggleGameTimer(true);
					toggleGameSessionTimer(true);
				}
			}else{
				toggleGameTimer(true);
				toggleGameSessionTimer(true);
			}
		}});
	}else{
		playSoundLoop("soundRunning");
	}
}

/*!
 * 
 * PLAYER ANIMATION - This is the function that runs to animate player
 * 
 */
function getPlayerPos(){
	var pos = {x:0, y:0};
	pos.x = randomIntFromInterval(-gameData.stage.rangeX, gameData.stage.rangeX);
	pos.y = randomIntFromInterval(-gameData.stage.rangeY, gameData.stage.rangeY);
	return pos; 
}

function loopPlayerIdle(player, delay){
	var randomIdle = randomIntFromInterval(gameData.stage.idle[0],gameData.stage.idle[1]) * 0.3;
	randomIdle = !isNaN(delay) == true ? delay : randomIdle;
	TweenMax.to(player, randomIdle, {onComplete:movePlayer, onCompleteParams:[player]});
}

function movePlayer(player){
	playPlayerAudio();

	var newPos = getPlayerPos();
	var tweenSpeed = getDistance(player.x, player.y, newPos.x, newPos.y) * (gameData.stage.speed * 0.01);
	player.moveX = newPos.x;
	player.moveY = newPos.y;
	TweenMax.to(player, tweenSpeed, {x:newPos.x, y:newPos.y, ease:Linear.easeNone, onComplete:loopPlayerIdle, onCompleteParams:[player]});
}

function directPlayers(index,x,y){
	if(!gameData.begin){
		return;
	}

	var player = gameData.players[index];
	if(player.focus && !gameData.complete && curPage == "game"){
		var tweenSpeed = getDistance(player.x, player.y, x, y) * (gameData.stage.speed * 0.01);
		player.moveX = x;
		player.moveY = y;
		TweenMax.to(player, tweenSpeed, {x:x, y:y, ease:Linear.easeNone});
	}
}

function moveAwayPlayer(player, focusPlayer, con){
	playPlayerAudio();
	TweenMax.killTweensOf(player);

	var randomX = randomIntFromInterval(50, gameData.stage.rangeX/3);
	var randomY = randomIntFromInterval(50, gameData.stage.rangeY/3);
	var newPos = {x:randomX, y:randomY};

	if(player.x < focusPlayer.x){
		newPos.x = -(newPos.x);
		player.x -= 1;
	}else{
		player.x += 1;
	}

	if(player.y < focusPlayer.y){
		newPos.y = -(newPos.y);
		player.y -= 1;
	}else{
		player.y += 1;
	}

	newPos.x = player.x + newPos.x;
	newPos.y = player.y + newPos.y;
	player.moveX = newPos.x;
	player.moveY = newPos.y;

	var tweenSpeed = getDistance(player.x, player.y, newPos.x, newPos.y) * (gameData.stage.speed * 0.01);
	if(con){
		TweenMax.to(player, tweenSpeed, {x:newPos.x, y:newPos.y, ease:Linear.easeNone, onComplete:loopPlayerIdle, onCompleteParams:[player]});
	}else{
		TweenMax.to(player, tweenSpeed, {x:newPos.x, y:newPos.y, ease:Linear.easeNone, onComplete:pointToPlayer, onCompleteParams:[player, focusPlayer]});
	}
}

function playPlayerAudio(){
	if(gameData.playerAudio <= 0){
		gameData.playerAudio = randomIntFromInterval(gameData.stage.audio[0], gameData.stage.audio[1]);

		var randomAudio = Math.floor(Math.random()*5);
		playSound("soundPlayer" + (randomAudio+1));
	}
}

function animateBounce(player){
	TweenMax.to(player, .5, {scaleX:1.2, scaleY:1.2, overwrite:true, onComplete:function(){
		TweenMax.to(player, .5, {scaleX:1, scaleY:1, overwrite:true, onComplete:animateBounce, onCompleteParams:[player]});
	}});
}

/*!
 * 
 * CHECK FOCUS PLAYER - This is the function that runs to to check focus player
 * 
 */
function checkFocusPlayer(player){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(socketData.gameIndex == gameData.multi.round && !gameData.complete && curPage == "game"){
			if(player.index != socketData.gameIndex && player.focus){
				player.focus = false;
				getPlayerFrame(player, "wave");
				$.players[player.index].visible = true;

				gameData.multi.found++;
				updateMultiScore();
				postSocketUpdate('caughtplayer', player.index, true);
			}

			var totalFound = 0;
			for(var n=0; n<gameData.totalPlayers; n++){
				var thisPlayer = gameData.players[n];
				if(thisPlayer.focus == false){
					totalFound++;
				}
			}

			if(totalFound == gameData.totalPlayers-1){
				gameData.complete = true;
				toggleGameSessionTimer(false);
				toggleGameTimer(false);
				postSocketUpdate('endround', timeData.sessionTimer);
			}
		}
	}else{
		if(player.focus && !gameData.complete && curPage == "game"){
			calculateScore();
			toggleGameSessionTimer(false);
			toggleGameTimer(false);
			allPlayersPointToPlayer();
		}
	}
}

function allPlayersPointToPlayer(){
	stopSoundLoop("soundRunning");
	gameData.complete = true;

	var focusPlayer = [];
	for(var n=0; n<gameData.players.length; n++){
		var thisPlayer = gameData.players[n];
		TweenMax.killTweensOf(thisPlayer);
		
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			var isFocusPlayer = false;
			if(n < gameData.totalPlayers && n != gameData.multi.round){
				isFocusPlayer = true;
			}

			if(isFocusPlayer){
				getPlayerFrame(thisPlayer, "wave");
				animateBounce(thisPlayer);
				focusPlayer.push(thisPlayer);
				$.players[n].visible = true;
			}else{
				getPlayerFrame(thisPlayer, "stand");

				var randomFocusPlayer = Math.floor(Math.random() * focusPlayer.length);
				pointToPlayer(thisPlayer, focusPlayer[randomFocusPlayer]);
			}
		}else{
			if(n != 0){
				getPlayerFrame(thisPlayer, "stand");
				var checkDistance = getDistance(focusPlayer[0].x, focusPlayer[0].y, thisPlayer.x, thisPlayer.y)
				if(checkDistance <= 150){
					moveAwayPlayer(thisPlayer, focusPlayer[0], false);
				}else{
					pointToPlayer(thisPlayer, focusPlayer[0]);
				}
			}else{
				getPlayerFrame(thisPlayer, "wave");
				animateBounce(thisPlayer);
				focusPlayer.push(thisPlayer);
			}
		}
	}
}

function pointToPlayer(player, focusPlayer){
	if(focusPlayer == undefined){
		return;
	}

	var direction = getDirection(player.x, player.y, focusPlayer.x, focusPlayer.y);
	
	var tweenSpeed = randomIntFromInterval(1,8) * 0.1;
	TweenMax.to(player, tweenSpeed, {onComplete:function(){
		if(player.x < focusPlayer.x){
			if(direction < 45 ){
				player.gotoAndPlay("pointrightup");
			}else if(direction > 94 ){
				player.gotoAndPlay("pointrightdown");
			}else{
				player.gotoAndPlay("pointright");
			}
		}else{
			if(direction >315 ){
				player.gotoAndPlay("pointleftup");
			}else if(direction < 225 ){
				player.gotoAndPlay("pointleftdown");
			}else{
				player.gotoAndPlay("pointleft");
			}
		}
	}});
}

function stopPlayers(){
	for(var n=0; n<gameData.players.length; n++){
		var thisPlayer = gameData.players[n];
		TweenMax.killTweensOf(thisPlayer);
	}
}

/*!
 * 
 * SPRITE SHEET - This is the function that runs to get sprite sheet
 * 
 */
function getSpriteSheet(type, index){
	var _speed = 1;
	var _frameW = 60;
	var _frameH = 100;
	var _regX = _frameW/2;
	var _regY = _frameH/2;
	var _count = 44;
	var _animations = {};
	var _source = "";
	var _frame = "";

	if(type == "player"){
		var randomPlayer = Math.floor(Math.random()*(players_arr.length));
		_regX = players_arr[randomPlayer].regX;
		_regY = players_arr[randomPlayer].regY;
		_source = 'players'+randomPlayer;

		var renderFocusPlayer = false;
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if(index < gameData.totalPlayers){
				gameData.playerIndex = gameData.multi.players[index];
				renderFocusPlayer = true;
			}
		}else{
			if(index == 0){
				renderFocusPlayer = true;
			}
		}

		if(renderFocusPlayer){
			if(curPage == "main"){
				gameData.playerIndex++;
				if(gameData.playerIndex > player_arr.length-1){
					shuffle(gameData.player);
					gameData.playerIndex = 0;
				}
			}
			randomPlayer = gameData.player[gameData.playerIndex];

			_regX = player_arr[randomPlayer].regX;
			_regY = player_arr[randomPlayer].regY;
			_source = 'player'+randomPlayer;
		}
		_animations = {
			stand:{frames: [10], speed:_speed},
			runleft:{frames: [0,1,2,3,4,3,2,1], speed:_speed},
			runright:{frames: [5,6,7,8,9,8,7,6], speed:_speed},
			pointleft:{frames: [11,12,13], speed:_speed, next:"pointleftstill"},
			pointleftstill:{frames: [13,13,13,14], speed:_speed,},
			pointleftup:{frames: [21,22,23], speed:_speed, next:"pointleftupstill"},
			pointleftupstill:{frames: [23,23,23,24], speed:_speed,},
			pointleftdown:{frames: [31,32,33], speed:_speed, next:"pointleftdownstill"},
			pointleftdownstill:{frames: [33,33,33,34], speed:_speed,},
			pointright:{frames: [16,17,18], speed:_speed, next:"pointrightstill"},
			pointrightstill:{frames: [18,18,18,19], speed:_speed},
			pointrightup:{frames: [26,27,28], speed:_speed, next:"pointrightupstill"},
			pointrightupstill:{frames: [28,28,28,29], speed:_speed},
			pointrightdown:{frames: [36,37,38], speed:_speed, next:"pointrightdownstill"},
			pointrightdownstill:{frames: [38,38,38,39], speed:_speed},
			wave:{frames: [40,41,42,43,42,41], speed:_speed},
		};
		_frame = "stand";
	}

	var _frame = {"regX": _regX, "regY": _regY, "height": _frameH, "width": _frameW, "count": _count};				
	var spriteData = new createjs.SpriteSheet({
		"images": [loader.getResult(_source)],
		"frames": _frame,
		"animations": _animations
	});

	var newSpriteSheet = new createjs.Sprite(spriteData, _frame);
	newSpriteSheet.framerate = 20;
	return newSpriteSheet;
}

/*!
 * 
 * GAME TIMER - This is the function that runs for game timer
 * 
 */
function toggleGameTimer(con){	
	if(con){
		timeData.startDate = new Date();
	}else{
		
	}
	timeData.enable = con;
}

function toggleGameSessionTimer(con){	
	if(con){
		timerShape.alpha = 1;
		timeData.oldTimer = -1;
		timeData.accumulate = 0;
		timeData.sessionDate = new Date();
	}else{
		timeData.accumulate = timeData.countdown - timeData.sessionTimer;
	}
	timeData.enable = con;
}


/*!
 * 
 * UPDATE GAME - This is the function that runs to loop game update
 * 
 */
function updateGame(){
	if(!gameData.paused){
		if(timeData.enable){
			timeData.nowDate = new Date();
			timeData.elapsedTime = Math.floor((timeData.nowDate.getTime() - timeData.startDate.getTime()));
			timeData.timer = (timeData.elapsedTime);

			timeData.elapsedTime = Math.floor((timeData.nowDate.getTime() - timeData.sessionDate.getTime()));
			timeData.sessionTimer = Math.floor((timeData.countdown) - (timeData.elapsedTime));

			updateTimer();
			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				postSocketUpdate('updatetimer', timeData.sessionTimer, true);
			}
		}

		loopPlayerAnimation();
		updateChildrenIndex();

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if(curPage == "game" && !gameData.complete){
				var storePlayers = [];
				for(var n=0; n<gameData.players.length; n++){
					var thisPlayer = gameData.players[n];
					storePlayers.push({x:thisPlayer.x, y:thisPlayer.y, frame:thisPlayer.frame, moveX:thisPlayer.moveX, moveY:thisPlayer.moveY});
				}
				postSocketUpdate('updateplayers', storePlayers);
			}
		}
	}
}

function updateTimer(){
	if(timeData.oldTimer == -1){
		timeData.oldTimer = timeData.sessionTimer;
	}
	
	if(timeData.sessionTimer <= 0){
		//stop
		timeData.sessionTimer = 0;
		playSound('soundTimerEnd');
		showGameStatus("timesup");

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if(socketData.gameIndex == gameData.multi.round){
				gameData.complete = true;
				toggleGameSessionTimer(false);
				toggleGameTimer(false);
				allPlayersPointToPlayer();
			}
			postSocketUpdate('timesup', socketData.gameIndex);
		}else{
			endGame();
		}
	}else{
		if((timeData.oldTimer - timeData.sessionTimer) > 1000){
			if(timeData.sessionTimer < 5000){
				animateTimer()
				playSound('soundTimer');
			}
			timeData.oldTimer = timeData.sessionTimer;
		}
	}

	updateTimerBar();
}

function animateTimer(){
	var tweenSpeed = .8;
	timerShape.alpha = .2;
	TweenMax.to(timerShape, tweenSpeed, {alpha:1});
	timerShapeBg.alpha = 0;
	TweenMax.to(timerShapeBg, tweenSpeed, {alpha:.3});
}

function updateTimerBar(){
	timerShape.graphics.clear();
	timerShape.graphics.beginFill(gameSettings.timer.color);
	
	timerShapeBg.graphics.clear();
	timerShapeBg.graphics.beginFill(gameSettings.timer.color);
	timerShapeBg.alpha = .3;
	
	var totalW = timeData.sessionTimer/timeData.countdown * gameSettings.timer.width;
	totalW = totalW < 5 ? 5 : totalW;
	var radius = gameSettings.timer.radius;
	timerShape.graphics.drawRoundRectComplex(0, 0, totalW, gameSettings.timer.height, radius, radius, radius, radius);
	timerShapeBg.graphics.drawRoundRectComplex(0, 0, gameSettings.timer.width, gameSettings.timer.height, radius, radius, radius, radius);
}

/*!
 * 
 * LOOP PLAYERS - This is the function that runs to loop players
 * 
 */
function loopPlayerAnimation(){
	var renderPlayers = true;

	if(renderPlayers){
		if(gameData.playerAudio > 0){
			gameData.playerAudio--;
		}

		var focusPlayer;
		if(gameData.players.length > 0){
			focusPlayer = gameData.players[0];
		}

		for(var n=0; n<gameData.players.length; n++){
			var thisPlayer = gameData.players[n];


			var updateFrame = true;
			if(gameData.complete && thisPlayer == focusPlayer){
				updateFrame = false;
			}

			if(updateFrame){
				if(thisPlayer.x == thisPlayer.data.x && thisPlayer.y == thisPlayer.data.y){
					getPlayerFrame(thisPlayer, "stand");
				}else{
					var direction = "right";
					if(thisPlayer.x < thisPlayer.data.x){
						direction = "left";
					}
					getPlayerFrame(thisPlayer, "run"+direction);
				}
			}
	
			thisPlayer.data.x = thisPlayer.x;
			thisPlayer.data.y = thisPlayer.y;
			
			//shadow
			var thisShadow = gameData.shadow[n];
			thisShadow.x = thisPlayer.x;
			thisShadow.y = thisPlayer.y;

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				if(n < gameData.totalPlayers){
					posPlayerName(n, thisPlayer);
				}
			}
			
			if(n != 0 && curPage == "main"){
				var checkDistance = getDistance(focusPlayer.x, focusPlayer.y, thisPlayer.x, thisPlayer.y)
				if(checkDistance <= 150){
					moveAwayPlayer(thisPlayer, focusPlayer, true);
				}
			}
		}
	}
}

function getPlayerFrame(player, frame){
	if(player.frame != frame){
		player.frame = frame;
		player.gotoAndPlay(frame);
	}
}

function updateChildrenIndex(){
	playersContainer.sortChildren(sortFunction);
}

var sortFunction = function(obj1, obj2, options) {
	if (obj1.y > obj2.y) { return 1; }
	if (obj1.y < obj2.y) { return -1; }
	return 0;
}

/*!
 * 
 * GAME SCORE - This is the function that runs to show game score
 * 
 */
function calculateScore(){
	playSound("soundClear");
	playSound('soundScore');

	var scorePercentage = gameData.stage.score/gameData.stage.timer;
	TweenMax.to(timeData, gameSettings.score.speed, {sessionTimer:0, overwrite:true, onUpdate:function(){
		var calTimer = timeData.countdown - timeData.sessionTimer;
		var totalScore = Math.floor((calTimer - timeData.accumulate) * scorePercentage);
		scoreTxt.text = textDisplay.score.replace("[NUMBER]", addCommas(totalScore));
		updateTimerBar();
	}, onComplete:function(){
		var calTimer = timeData.countdown - timeData.sessionTimer;
		var totalScore = Math.floor((calTimer - timeData.accumulate) * scorePercentage);
		playerData.score += totalScore;

		TweenMax.to(timerContainer, 1, {overwrite:true, onComplete:function(){
			scoreTxt.text = "";

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				if(socketData.gameIndex == gameData.multi.round){
					$.players[gameData.multi.round].score = playerData.score;
				}
				postSocketUpdate('playersready', socketData.gameIndex);
			}else{
				showGameStatus("clear");
				TweenMax.to(timerContainer, 2, {overwrite:true, onComplete:function(){
					proceedNextStage();
				}});
			}
		}});
	}});
}

function updateMultiScore(){
	var scoreText = textDisplay.foundScore.replace("[NUMBER]", gameData.multi.found);
	scoreText = scoreText.replace("[TOTAL]", gameData.totalPlayers-1);
	scoreTxt.text = scoreText;
}

/*!
 * 
 * GAME STATUS - This is the function that runs to show game status
 * 
 */
function showGameStatus(con){
	var delay = 2;
	if(con == 'timesup'){
		gameStatusTxt.text = textDisplay.timesup;
	}else if(con == 'stage'){
		delay = 1;
		gameStatusTxt.text = textDisplay.stage.replace("[NUMBER]", playerData.stage + 1);
	}else if(con == 'clear'){
		delay = 1;
		gameStatusTxt.text = textDisplay.stageClear;
	}else if(con == 'round'){
		delay = 1;
		var roundText = textDisplay.round.replace("[NUMBER]", gameData.multi.round+1);
		roundText = roundText.replace("[TOTAL]", gameData.totalPlayers);
		gameStatusTxt.text = roundText;
	}else if(con == 'preround'){
		delay = 4;
		var roundText = textDisplay.round.replace("[NUMBER]", gameData.multi.round+1);
		roundText = roundText.replace("[TOTAL]", gameData.totalPlayers);
		gameStatusTxt.text = roundText;
	}else if(con == 'roundcomplete'){
		delay = 1;
		gameStatusTxt.text = textDisplay.roundComplete;
	}

	statusContainer.alpha = 0;
	TweenMax.to(statusContainer, .5, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(statusContainer, .5, {delay:delay, alpha:0, overwrite:true});
	}});
}

function showMultiGameStatus(con){
	var delay = 3;
	if(con == 'find'){
		gameMultiStatusTxt.text = textDisplay.findPlayers.replace("[TOTAL]", gameData.totalPlayers-1);
	}else if(con == 'hide'){
		gameMultiStatusTxt.text = textDisplay.hidePlayers.replace("[PLAYER]", $.players[gameData.multi.round].player);
	}

	gameMultiStatusTxt.alpha = 0;
	TweenMax.to(gameMultiStatusTxt, .5, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(gameMultiStatusTxt, .5, {delay:delay, alpha:0, overwrite:true});
	}});
}

/*!
 * 
 * NEXT STAGE - This is the function that runs for next stage
 * 
 */
function proceedNextStage(){
	playerData.stage++;
	gameData.stageNum++;
	gameData.stageNum = gameData.stageNum > stage_arr.length-1 ? stage_arr.length-1 : gameData.stageNum;
	setupGameStage();
	prepareStage();
}

/*!
 * 
 * END GAME - This is the function that runs for game end
 * 
 */
function endGame(){
	toggleGameSessionTimer(false);
	toggleGameTimer(false);
	allPlayersPointToPlayer();
	playSound("soundFail");

	TweenMax.to(gameContainer, 3, {overwrite:true, onComplete:function(){
		goPage('result');
	}});
}

/*!
 * 
 * MILLISECONDS CONVERT - This is the function that runs to convert milliseconds to time
 * 
 */
function millisecondsToTimeGame(milli) {
	var milliseconds = milli % 1000;
	var seconds = Math.floor((milli / 1000) % 60);
	var minutes = Math.floor((milli / (60 * 1000)) % 60);
	
	if(seconds<10){
		seconds = '0'+seconds;  
	}
	
	if(minutes<10){
		minutes = '0'+minutes;  
	}
	
	return minutes+':'+seconds;
}

/*!
 * 
 * OPTIONS - This is the function that runs to toggle options
 * 
 */

function toggleOption(){
	if(optionsContainer.visible){
		optionsContainer.visible = false;
	}else{
		optionsContainer.visible = true;
	}
}

/*!
 * 
 * OPTIONS - This is the function that runs to mute and fullscreen
 * 
 */
function toggleSoundMute(con){
	buttonSoundOff.visible = false;
	buttonSoundOn.visible = false;
	toggleSoundInMute(con);
	if(con){
		buttonSoundOn.visible = true;
	}else{
		buttonSoundOff.visible = true;	
	}
}

function toggleMusicMute(con){
	buttonMusicOff.visible = false;
	buttonMusicOn.visible = false;
	toggleMusicInMute(con);
	if(con){
		buttonMusicOn.visible = true;
	}else{
		buttonMusicOff.visible = true;	
	}
}

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

/*!
 * 
 * SHARE - This is the function that runs to open share url
 * 
 */
function share(action){
	gtag('event','click',{'event_category':'share','event_label':action});
	
	var loc = 'http://www.hoodamath.com/games/findme.html';
	loc = loc.substring(0, loc.lastIndexOf("/") + 1);
	
	var title = '';
	var text = '';
	
	title = shareTitle.replace("[SCORE]", addCommas(playerData.score));
	text = shareMessage.replace("[SCORE]", addCommas(playerData.score));
	
	var shareurl = '';
	
	if( action == 'twitter' ) {
		shareurl = 'https://twitter.com/intent/tweet?url='+loc+'&text='+text;
	}else if( action == 'facebook' ){
		shareurl = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(loc+'share.php?desc='+text+'&title='+title+'&url='+loc+'&thumb='+loc+'share.jpg&width=590&height=300');
	}else if( action == 'google' ){
		shareurl = 'https://plus.google.com/share?url='+loc;
	}else if( action == 'whatsapp' ){
		shareurl = "whatsapp://send?text=" + encodeURIComponent(text) + " - " + encodeURIComponent(loc);
	}
	
	window.open(shareurl);
}
