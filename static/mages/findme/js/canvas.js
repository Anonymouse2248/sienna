////////////////////////////////////////////////////////////
// CANVAS
////////////////////////////////////////////////////////////
var stage
var canvasW=0;
var canvasH=0;

/*!
 * 
 * START GAME CANVAS - This is the function that runs to setup game canvas
 * 
 */
function initGameCanvas(w,h){
	var gameCanvas = document.getElementById("gameCanvas");
	gameCanvas.width = w;
	gameCanvas.height = h;
	
	canvasW=w;
	canvasH=h;
	stage = new createjs.Stage("gameCanvas");
	
	createjs.Touch.enable(stage);
	stage.enableMouseOver(20);
	stage.mouseMoveOutside = true;
	
	createjs.Ticker.framerate = 60;
	createjs.Ticker.addEventListener("tick", tick);
}

var guide = false;
var canvasContainer, mainContainer, gameContainer, resultContainer, confirmContainer;
var guideline, bg, logo, buttonOk, result, shadowResult, buttonReplay, buttonFacebook, buttonTwitter, buttonWhatsapp, buttonFullscreen, buttonSoundOn, buttonSoundOff;

$.players = {};

/*!
 * 
 * BUILD GAME CANVAS ASSERTS - This is the function that runs to build game canvas asserts
 * 
 */
function buildGameCanvas(){
	canvasContainer = new createjs.Container();
	mainContainer = new createjs.Container();
	buttonLocalContainer = new createjs.Container();
	gameContainer = new createjs.Container();
	stageContainer = new createjs.Container();
	playersContainer = new createjs.Container();
	playerNameContainer = new createjs.Container();
	shadowContainer = new createjs.Container();
	timerContainer = new createjs.Container();
	statusContainer = new createjs.Container();
	resultContainer = new createjs.Container();
	confirmContainer = new createjs.Container();
	
	
	bg = new createjs.Bitmap(loader.getResult('background'));
	bgP = new createjs.Bitmap(loader.getResult('backgroundP'));
	
	logo = new createjs.Bitmap(loader.getResult('logo'));
	logoP = new createjs.Bitmap(loader.getResult('logoP'));
	buttonStart = new createjs.Bitmap(loader.getResult('buttonStart'));
	centerReg(buttonStart);

	buttonLocal = new createjs.Bitmap(loader.getResult('buttonLocal'));
	centerReg(buttonLocal);

	buttonOnline = new createjs.Bitmap(loader.getResult('buttonOnline'));
	centerReg(buttonOnline);
	
	//game
	timerShapeBg = new createjs.Shape();
	timerShape = new createjs.Shape();
	timerContainer.addChild(timerShapeBg, timerShape);

	itemStatus = new createjs.Bitmap(loader.getResult('itemStatus'));
	centerReg(itemStatus);

	for(var n=0; n<gameData.multi.max; n++){
		$.players[n] = new createjs.Text();
		$.players[n].font = "25px milky_bobaregular";
		$.players[n].lineHeight = 25;
		$.players[n].color = "#000";
		$.players[n].textAlign = "center";
		$.players[n].textBaseline='middle';
		$.players[n].text = "";
	}

	gameStatusTxt = new createjs.Text();
	gameStatusTxt.font = "30px milky_bobaregular";
	gameStatusTxt.lineHeight = 35;
	gameStatusTxt.color = "#fff";
	gameStatusTxt.textAlign = "center";
	gameStatusTxt.textBaseline='middle';
	gameStatusTxt.text = "";
	gameStatusTxt.y = 2;

	gameMultiStatusTxt = new createjs.Text();
	gameMultiStatusTxt.font = "30px milky_bobaregular";
	gameMultiStatusTxt.lineHeight = 35;
	gameMultiStatusTxt.color = "#000";
	gameMultiStatusTxt.textAlign = "center";
	gameMultiStatusTxt.textBaseline='middle';
	gameMultiStatusTxt.text = "";

	statusContainer.addChild(itemStatus, gameStatusTxt);

	scoreTxt = new createjs.Text();
	scoreTxt.font = "50px milky_bobaregular";
	scoreTxt.lineHeight = 35;
	scoreTxt.color = "#000";
	scoreTxt.textAlign = "center";
	scoreTxt.textBaseline='alphabetic';

	fade = new createjs.Bitmap(loader.getResult('background'));
	fadeP = new createjs.Bitmap(loader.getResult('backgroundP'));

	//result
	itemResult = new createjs.Bitmap(loader.getResult('itemPop'));
	itemResultP = new createjs.Bitmap(loader.getResult('itemPopP'));
	
	buttonContinue = new createjs.Bitmap(loader.getResult('buttonContinue'));
	centerReg(buttonContinue);
	
	resultShareTxt = new createjs.Text();
	resultShareTxt.font = "30px milky_bobaregular";
	resultShareTxt.color = '#000';
	resultShareTxt.textAlign = "center";
	resultShareTxt.textBaseline='alphabetic';
	resultShareTxt.text = textDisplay.share;
	
	resultTitleTxt = new createjs.Text();
	resultTitleTxt.font = "58px milky_bobaregular";
	resultTitleTxt.color = '#000';
	resultTitleTxt.textAlign = "center";
	resultTitleTxt.textBaseline='alphabetic';
	resultTitleTxt.text = textDisplay.resultTitle;
	
	resultDescTxt = new createjs.Text();
	resultDescTxt.font = "75px milky_bobaregular";
	resultDescTxt.color = '#000';
	resultDescTxt.textAlign = "center";
	resultDescTxt.textBaseline='alphabetic';
	resultDescTxt.text = '';
	
	
	buttonFacebook = new createjs.Bitmap(loader.getResult('buttonFacebook'));
	buttonTwitter = new createjs.Bitmap(loader.getResult('buttonTwitter'));
	buttonWhatsapp = new createjs.Bitmap(loader.getResult('buttonWhatsapp'));
	centerReg(buttonFacebook);
	createHitarea(buttonFacebook);
	centerReg(buttonTwitter);
	createHitarea(buttonTwitter);
	centerReg(buttonWhatsapp);
	createHitarea(buttonWhatsapp);
	
	buttonFullscreen = new createjs.Bitmap(loader.getResult('buttonFullscreen'));
	centerReg(buttonFullscreen);
	buttonSoundOn = new createjs.Bitmap(loader.getResult('buttonSoundOn'));
	centerReg(buttonSoundOn);
	buttonSoundOff = new createjs.Bitmap(loader.getResult('buttonSoundOff'));
	centerReg(buttonSoundOff);
	buttonSoundOn.visible = false;
	
	buttonExit = new createjs.Bitmap(loader.getResult('buttonExit'));
	centerReg(buttonExit);
	buttonSettings = new createjs.Bitmap(loader.getResult('buttonSettings'));
	centerReg(buttonSettings);
	
	createHitarea(buttonFullscreen);
	createHitarea(buttonSoundOn);
	createHitarea(buttonSoundOff);
	createHitarea(buttonExit);
	createHitarea(buttonSettings);
	optionsContainer = new createjs.Container();
	optionsContainer.addChild(buttonFullscreen, buttonSoundOn, buttonSoundOff, buttonExit);
	optionsContainer.visible = false;
	
	//exit
	itemExit = new createjs.Bitmap(loader.getResult('itemPop'));
	itemExitP = new createjs.Bitmap(loader.getResult('itemPopP'));
	
	buttonConfirm = new createjs.Bitmap(loader.getResult('buttonConfirm'));
	centerReg(buttonConfirm);
	
	buttonCancel = new createjs.Bitmap(loader.getResult('buttonCancel'));
	centerReg(buttonCancel);
	
	popTitleTxt = new createjs.Text();
	popTitleTxt.font = "58px milky_bobaregular";
	popTitleTxt.color = "#000";
	popTitleTxt.textAlign = "center";
	popTitleTxt.textBaseline='alphabetic';
	popTitleTxt.text = textDisplay.exitTitle;
	
	popDescTxt = new createjs.Text();
	popDescTxt.font = "30px milky_bobaregular";
	popDescTxt.lineHeight = 35;
	popDescTxt.color = "#000";
	popDescTxt.textAlign = "center";
	popDescTxt.textBaseline='alphabetic';
	popDescTxt.text = textDisplay.exitMessage;
	
	confirmContainer.addChild(itemExit, itemExitP, popTitleTxt, popDescTxt, buttonConfirm, buttonCancel);
	confirmContainer.visible = false;

	//room
	roomContainer = new createjs.Container();
	nameContainer = new createjs.Container();
	bgRoom = new createjs.Shape();
	bgRoom.graphics.beginFill('#000').drawRect(-(landscapeSize.w/2), -(portraitSize.h/2), landscapeSize.w, portraitSize.h);
	bgRoom.alpha = .6;

	gameLogsTxt = new createjs.Text();
	gameLogsTxt.font = "30px milky_bobaregular";
	gameLogsTxt.color = "#000";
	gameLogsTxt.textAlign = "center";
	gameLogsTxt.textBaseline='alphabetic';
	gameLogsTxt.text = '';
	
	if(guide){
		guideline = new createjs.Shape();	
		guideline.graphics.setStrokeStyle(2).beginStroke('red').drawRect((stageW-contentW)/2, (stageH-contentH)/2, contentW, contentH);
	}
	
	buttonLocalContainer.addChild(buttonLocal, buttonOnline);
	mainContainer.addChild(logo, logoP, buttonStart, buttonLocalContainer);
	stageContainer.addChild(shadowContainer, playersContainer, playerNameContainer);
	gameContainer.addChild(fade, fadeP, timerContainer, statusContainer, gameMultiStatusTxt, scoreTxt);
	resultContainer.addChild(itemResult, itemResultP, buttonContinue, resultTitleTxt, resultDescTxt);
	
	if(shareEnable){
		resultContainer.addChild(resultShareTxt, buttonFacebook, buttonTwitter, buttonWhatsapp);
	}
	
	canvasContainer.addChild(bg, bgP, stageContainer, bgRoom, mainContainer, gameContainer, gameLogsTxt, resultContainer, confirmContainer, optionsContainer, buttonSettings, guideline);
	stage.addChild(canvasContainer);
	
	changeViewport(viewport.isLandscape);
	resizeGameFunc();
}

function changeViewport(isLandscape){
	if(isLandscape){
		//landscape
		stageW=landscapeSize.w;
		stageH=landscapeSize.h;
		contentW = landscapeSize.cW;
		contentH = landscapeSize.cH;
	}else{
		//portrait
		stageW=portraitSize.w;
		stageH=portraitSize.h;
		contentW = portraitSize.cW;
		contentH = portraitSize.cH;
	}
	
	gameCanvas.width = stageW;
	gameCanvas.height = stageH;
	
	canvasW=stageW;
	canvasH=stageH;
	
	changeCanvasViewport();
}

function changeCanvasViewport(){
	if(canvasContainer!=undefined){
		bgRoom.x = canvasW/2;
		bgRoom.y = canvasH/2;

		if(viewport.isLandscape){
			bg.visible = true;
			bgP.visible = false;

			logo.visible = true;
			logoP.visible = false;

			buttonStart.x = canvasW/2;
			buttonStart.y = canvasH/100 * 73;

			buttonLocal.x = canvasW/2 - 90;
			buttonLocal.y = canvasH/100 * 73;

			buttonOnline.x = canvasW/2 + 90;
			buttonOnline.y = canvasH/100 * 73;

			//game
			fade.visible = true;
			fadeP.visible = false;

			stageContainer.x = canvasW/2;
			stageContainer.y = canvasH/2;
			
			//result
			itemResult.visible = true;
			itemResultP.visible = false;
			
			buttonFacebook.x = canvasW/100*44;
			buttonFacebook.y = canvasH/100*57;
			buttonTwitter.x = canvasW/2;
			buttonTwitter.y = canvasH/100*57;
			buttonWhatsapp.x = canvasW/100*56;
			buttonWhatsapp.y = canvasH/100*57;

			buttonContinue.x = canvasW/2;
			buttonContinue.y = canvasH/100 * 67;
	
			resultShareTxt.x = canvasW/2;
			resultShareTxt.y = canvasH/100 * 52;
	
			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 37;
	
			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 45;

			//exit
			itemExit.visible = true;
			itemExitP.visible = false;

			buttonConfirm.x = (canvasW/2) - 78;
			buttonConfirm.y = (canvasH/100 * 65);
			
			buttonCancel.x = (canvasW/2) + 78;
			buttonCancel.y = (canvasH/100 * 65);

			popTitleTxt.x = canvasW/2;
			popTitleTxt.y = canvasH/100 * 37;
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 45;

			//room
			$('#roomWrapper').removeClass('forPortrait');
			$('#notificationHolder').removeClass('forPortrait');
			$('#roomlists').attr('size', 10);
			$('#namelists').attr('size', 10);
			$('#roomLogs').attr('rows', 10);

		}else{
			bg.visible = false;
			bgP.visible = true;

			logo.visible = false;
			logoP.visible = true;

			buttonStart.x = canvasW/2;
			buttonStart.y = canvasH/100 * 73;

			buttonLocal.x = canvasW/2;
			buttonLocal.y = canvasH/100 * 70;

			buttonOnline.x = canvasW/2;
			buttonOnline.y = canvasH/100 * 78;

			//game
			fade.visible = false;
			fadeP.visible = true;

			stageContainer.x = canvasW/2;
			stageContainer.y = canvasH/2;
			
			//result
			itemResult.visible = false;
			itemResultP.visible = true;
			
			buttonFacebook.x = canvasW/100*40;
			buttonFacebook.y = canvasH/100*56;
			buttonTwitter.x = canvasW/2;
			buttonTwitter.y = canvasH/100*56;
			buttonWhatsapp.x = canvasW/100*60;
			buttonWhatsapp.y = canvasH/100*56;

			buttonContinue.x = canvasW/2;
			buttonContinue.y = canvasH/100 * 63;
	
			resultShareTxt.x = canvasW/2;
			resultShareTxt.y = canvasH/100 * 52;
	
			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 40;
	
			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 46;
			
			//exit
			itemExit.visible = false;
			itemExitP.visible = true;

			buttonConfirm.x = (canvasW/2) - 78;
			buttonConfirm.y = (canvasH/100 * 62);
			
			buttonCancel.x = (canvasW/2) + 78;
			buttonCancel.y = (canvasH/100 * 62);

			popTitleTxt.x = canvasW/2;
			popTitleTxt.y = canvasH/100 * 40;
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 48;

			//room
			$('#roomWrapper').addClass('forPortrait');
			$('#notificationHolder').addClass('forPortrait');
			$('#roomlists').attr('size', 8);
			$('#namelists').attr('size', 8);
			$('#roomLogs').attr('rows', 6);
		}
	}
}



/*!
 * 
 * RESIZE GAME CANVAS - This is the function that runs to resize game canvas
 * 
 */
function resizeCanvas(){
 	if(canvasContainer!=undefined){
		
		buttonSettings.x = (canvasW - offset.x) - 50;
		buttonSettings.y = offset.y + 45;
		
		var distanceNum = 65;
		var nextCount = 0;
		if(curPage != 'game'){
			buttonExit.visible = false;
			buttonSoundOn.x = buttonSoundOff.x = buttonSettings.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;
			buttonSoundOn.x = buttonSoundOff.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;

			if (typeof buttonMusicOn != "undefined") {
				buttonMusicOn.x = buttonMusicOff.x = buttonSettings.x;
				buttonMusicOn.y = buttonMusicOff.y = buttonSettings.y+(distanceNum*2);
				buttonMusicOn.x = buttonMusicOff.x;
				buttonMusicOn.y = buttonMusicOff.y = buttonSettings.y+(distanceNum*2);
				nextCount = 2;
			}else{
				nextCount = 1;
			}
			
			buttonFullscreen.x = buttonSettings.x;
			buttonFullscreen.y = buttonSettings.y+(distanceNum*(nextCount+1));
		}else{
			buttonExit.visible = true;
			buttonSoundOn.x = buttonSoundOff.x = buttonSettings.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;
			buttonSoundOn.x = buttonSoundOff.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;

			if (typeof buttonMusicOn != "undefined") {
				buttonMusicOn.x = buttonMusicOff.x = buttonSettings.x;
				buttonMusicOn.y = buttonMusicOff.y = buttonSettings.y+(distanceNum*2);
				buttonMusicOn.x = buttonMusicOff.x;
				buttonMusicOn.y = buttonMusicOff.y = buttonSettings.y+(distanceNum*2);
				nextCount = 2;
			}else{
				nextCount = 1;
			}
			
			buttonFullscreen.x = buttonSettings.x;
			buttonFullscreen.y = buttonSettings.y+(distanceNum*(nextCount+1));
			
			buttonExit.x = buttonSettings.x;
			buttonExit.y = buttonSettings.y+(distanceNum*(nextCount+2));
		}

		resizeGameUI();
		resizeSocketLog();
	}
}

/*!
 * 
 * REMOVE GAME CANVAS - This is the function that runs to remove game canvas
 * 
 */
 function removeGameCanvas(){
	 stage.autoClear = true;
	 stage.removeAllChildren();
	 stage.update();
	 createjs.Ticker.removeEventListener("tick", tick);
	 createjs.Ticker.removeEventListener("tick", stage);
 }

/*!
 * 
 * CANVAS LOOP - This is the function that runs for canvas loop
 * 
 */ 
function tick(event) {
	updateGame();
	stage.update(event);
}

/*!
 * 
 * CANVAS MISC FUNCTIONS
 * 
 */
function centerReg(obj){
	obj.regX=obj.image.naturalWidth/2;
	obj.regY=obj.image.naturalHeight/2;
}

function createHitarea(obj){
	obj.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#000").drawRect(0, 0, obj.image.naturalWidth, obj.image.naturalHeight));	
}