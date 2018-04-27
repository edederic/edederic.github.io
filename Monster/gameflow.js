$(document).ready(function() {

/* Global varibables */

/*
	*****************************************************************************************************
	** ACTUALLY USED VARIABLES **
	*****************************************************************************************************
*/

	// Getting the canvas
var canvas = document.getElementById("gameScreen");
var context = canvas.getContext("2d");
var cowHeadImage = document.getElementById("cow_head");
var monsterImage = document.getElementById("monster");
var coordinateRatio = 0.12;

	// Game variables
var difficulty = 0;
var playerIsMonster = true;
var playerScore = 0;
var computerScore = 0;
var totalCowsKilled = 0;
var totalMonstersKilled = 0;

	// Game phases
var monsterSettingUp = false;
var monstersSelected = 0;
var monsterKilling = false;
var cowsThatCanBeKilled = [];
var movingCows = false;
var selectingValidCow = false;
var selectingValidSpace = false;
var selectedCow = -1;
var selectedSpace = -1;
var cowsThatNeedToMove = [];

var roundOneOver = false;

var playerPlacingCows = false;
var cowsPlaced = 0;
//var computerMonsterKillsCow = false;
var playerChooseCowToKill = false;
var passVisible = false;

var roundTwoOver = false;


/*
	*****************************************************************************************************
	** NOT USED VARIABLES **
	*****************************************************************************************************
*/

	// Game turn variables
var lastClickedCoordinates = [-1, -1];
var lastKilledCow = -1;


	// Game phases
var farmerSettingUp = false;
var monsterDecidesCowToKill = false;
var monsterMovesCows = false;
var farmerGuessesHiddenMonster = false;

var beenMoved = [];

/*
	*****************************************************************************************************
	** NOT USED CODE **
	*****************************************************************************************************
*/

	// Game spaces
class Space {
	constructor(x, y, state, adjacentSpaces, selected) {
		this.x = x;
		this.y = y;
		this.state = state;
		this.adjacentSpaces = adjacentSpaces;
		this.selected = selected;
	}
}

var spaces = [
	new Space(1, 2, "empty", [1, 3, 4], false),
	new Space(1, 4, "empty", [0, 2, 4, 5], false),
	new Space(1, 6, "empty", [1, 5, 6], false),
	new Space(2, 1, "empty", [0, 4, 7, 10], false),
	new Space(2, 3, "empty", [0, 1, 3, 5, 7, 8], false),
	new Space(2, 5, "empty", [1, 2, 4, 6, 8, 9], false),
	new Space(2, 7, "empty", [2, 5, 9, 13], false),
	new Space(3, 2, "empty", [3, 4, 8, 10, 11], false),
	new Space(3, 4, "empty", [4, 5, 7, 9, 11, 12], false),
	new Space(3, 6, "empty", [5, 6, 8, 12, 13], false),
	new Space(4, 1, "empty", [3, 7, 11, 14, 17], false),
	new Space(4, 3, "empty", [7, 8, 10, 12, 14, 15], false),
	new Space(4, 5, "empty", [8, 9, 11, 13, 15, 16], false),
	new Space(4, 7, "empty", [6, 9, 12, 16, 20], false),
	new Space(5, 2, "empty", [10, 11, 15, 17, 18], false),
	new Space(5, 4, "empty", [11, 12, 14, 16, 18, 19], false),
	new Space(5, 6, "empty", [12, 13, 15, 19, 20], false),
	new Space(6, 1, "empty", [10, 14, 18, 21], false),
	new Space(6, 3, "empty", [14, 15, 17, 19, 21, 22], false),
	new Space(6, 5, "empty", [15, 16, 18, 20, 22, 23], false),
	new Space(6, 7, "empty", [13, 16, 19, 23], false),
	new Space(7, 2, "empty", [17, 18, 22], false),
	new Space(7, 4, "empty", [18, 19, 21, 23], false),
	new Space(7, 6, "empty", [19, 20, 22], false)
];

// Drawing functions
function drawScreen() {

	// "Clear" arc
	context.beginPath();
	context.arc(0, 0, 0, 0, 2 * Math.PI);
	context.closePath();

	// Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

	// Black background
    //context.fillStyle = "#000000";
    //context.fillRect(0, 0, canvas.width, canvas.height);

	// Draw connectors

	context.strokeStyle = "#663300";
	context.lineWidth = 3;

	for (var i = 0; i < 24; ++i) {

		var currentSpace = spaces[i];
		var currentAdjacentSpaces = currentSpace.adjacentSpaces;



		for (var j = 0; j < currentAdjacentSpaces.length; ++j) {

			context.moveTo(canvas.width * coordinateRatio * currentSpace.x, canvas.height * coordinateRatio * currentSpace.y);
			context.lineTo(canvas.width * coordinateRatio * spaces[currentAdjacentSpaces[j]].x, canvas.height * coordinateRatio * spaces[currentAdjacentSpaces[j]].y);
			context.stroke();
		}

	}

	context.lineWidth = 1;
	/*
	// Draw spaces
	for (var i = 0; i < 24; ++i) {

		var currentSpace = spaces[i];

		// Location
		context.beginPath();
		context.arc(canvas.width * coordinateRatio * currentSpace.x, canvas.height * coordinateRatio * currentSpace.y, 15, 0, 2 * Math.PI);
		context.closePath();

		// Fill with color
		var currentSpaceState = currentSpace.state;

		if (currentSpaceState == "empty") { context.fillStyle = "#ffffff"; }
		else if (currentSpaceState == "cow") { context.fillStyle = "#aaffaa"; }
		else if (currentSpaceState == "monster" && playerIsMonster) { context.fillStyle = "#aaaaff"; }
		else if (currentSpaceState == "monster" && !playerIsMonster) { context.fillStyle = "#aaffaa"; }
		else if (currentSpaceState == "deadCow") { context.fillStyle = "#ffaaaa"; }
		else if (currentSpaceState == "deadMonster") { context.fillStyle = "#ffaaaa"; }
		else { context.fillStyle = "#000000"; }
		context.fill();

		// Fill with image
		if (currentSpaceState == "cow") {
			context.drawImage(cowHeadImage, canvas.width * coordinateRatio * currentSpace.x - 15,  canvas.height * coordinateRatio * currentSpace.y - 15, 30, 30);
		}
		else if (currentSpaceState == "monster" && playerIsMonster) {
			context.drawImage(monsterImage, canvas.width * coordinateRatio * currentSpace.x - 15,  canvas.height * coordinateRatio * currentSpace.y - 15, 30, 30);
		}
		else if (currentSpaceState == "monster" && !playerIsMonster) {
			context.drawImage(cowHeadImage, canvas.width * coordinateRatio * currentSpace.x - 15,  canvas.height * coordinateRatio * currentSpace.y - 15, 30, 30);
		}
		else if (currentSpaceState == "deadCow") {
			context.drawImage(cowHeadImage, canvas.width * coordinateRatio * currentSpace.x - 15,  canvas.height * coordinateRatio * currentSpace.y - 15, 30, 30);

			context.strokeStyle = "#ff5555";
			context.lineWidth = 3;

			context.moveTo(canvas.width * coordinateRatio * currentSpace.x - 15, canvas.height * coordinateRatio * currentSpace.y - 15);
			context.lineTo(canvas.width * coordinateRatio * currentSpace.x + 15, canvas.height * coordinateRatio * currentSpace.y + 15);
			context.stroke();

			context.moveTo(canvas.width * coordinateRatio * currentSpace.x + 15, canvas.height * coordinateRatio * currentSpace.y - 15);
			context.lineTo(canvas.width * coordinateRatio * currentSpace.x - 15, canvas.height * coordinateRatio * currentSpace.y + 15);
			context.stroke();

			context.lineWidth = 1;
		}
		else if (currentSpaceState == "deadMonster") {
			context.drawImage(monsterImage, canvas.width * coordinateRatio * currentSpace.x - 15,  canvas.height * coordinateRatio * currentSpace.y - 15, 30, 30);

			context.strokeStyle = "#ff5555";
			context.lineWidth = 3;

			context.moveTo(canvas.width * coordinateRatio * currentSpace.x - 15, canvas.height * coordinateRatio * currentSpace.y - 15);
			context.lineTo(canvas.width * coordinateRatio * currentSpace.x + 15, canvas.height * coordinateRatio * currentSpace.y + 15);
			context.stroke();

			context.moveTo(canvas.width * coordinateRatio * currentSpace.x + 15, canvas.height * coordinateRatio * currentSpace.y - 15);
			context.lineTo(canvas.width * coordinateRatio * currentSpace.x - 15, canvas.height * coordinateRatio * currentSpace.y + 15);
			context.stroke();

			context.lineWidth = 1;
		}
	}
	*/
}

// Initiate canvas
//drawScreen();


// Click location function
function checkMousePositionInCanvas(event) {

    // Get x and y coordinates in canvas
    var x = event.x - canvas.offsetLeft;
    var y = event.y - canvas.offsetTop;

    lastClickedCoordinates = [x, y];
}

// Add mouse listener to canvas
canvas.addEventListener("mousedown", checkMousePositionInCanvas, false);

///////// Start of computer AI functions /////////
/*
 * difficulty will either be set to 0, 1, or 2 at the beginning of the game.
 * comPlaceCows will implement differently depending on the difficulty level.
 * No matter the method used. Function will place all of the cow pieces
 * on the board.
 */
function comPlaceCows() {
	switch (difficulty) {
		case 0:	// easy mode
			// grouped cows near center
			spaces[2].state = "cow";
			spaces[5].state = "cow";
			spaces[6].state = "cow";
			spaces[7].state = "cow";
			spaces[8].state = "cow";
			spaces[9].state = "cow";
			spaces[10].state = "cow";
			spaces[11].state = "cow";
			spaces[12].state = "cow";
			spaces[13].state = "cow";
			spaces[14].state = "cow";
			spaces[15].state = "cow";
			spaces[16].state = "cow";
			spaces[17].state = "cow";
			spaces[18].state = "cow";
			spaces[19].state = "cow";
			spaces[20].state = "cow";
			spaces[21].state = "cow";
			break;
		case 1: // normal mode
			for (i = 0; i < 18; i++) {
				//pick a random space that isn't a cow
				var index = Math.floor(Math.random() * 24);
				while(spaces[index].state == "cow") {
					index = Math.floor(Math.random() * 24);
				}
				spaces[index].state = "cow";
			}
			break;
		case 2: // hard mode
			// Figure 8 form I like to implement when play Nancy Drew
			spaces[0].state = "cow";
			spaces[1].state = "cow";
			spaces[2].state = "cow";
			spaces[3].state = "cow";
			spaces[6].state = "cow";
			spaces[7].state = "cow";
			spaces[8].state = "cow";
			spaces[9].state = "cow";
			spaces[10].state = "cow";
			spaces[13].state = "cow";
			spaces[14].state = "cow";
			spaces[15].state = "cow";
			spaces[16].state = "cow";
			spaces[17].state = "cow";
			spaces[20].state = "cow";
			spaces[21].state = "cow";
			spaces[22].state = "cow";
			spaces[23].state = "cow";
	}
}

/*
 * difficulty will either be set to 0, 1, or 2 at the beginning of the game.
 * comPlaceCows will implement differently depending on the difficulty level.
 * No matter the method used. Function will place all of the cow pieces
 * on the board.
 */
function comSelectMonsters() {
	// randomly selects three cows
	for (i = 0; i < 3; i++) {
		//pick a random space that isn't a cow
		var index = Math.floor(Math.random() * 24);
		while(spaces[index].state != "cow") {
			index = Math.floor(Math.random() * 24);
		}
		spaces[index].state = "monster";
	}
}

/*
* Selects cow to kill depending on difficulty level
*/
function computerMonster() {
	if(killPossible()) {
		var cowKilled = spaces[0];
		switch (difficulty) {
			case 0:	// easy mode
				/* randomly chosen from living cows connected to the first monster
				* found in the array that is still alive and has an available kill
				*/
				var mon = 0;
				var liveCowFound = false;
				for (i = 0; i < 24; i++) {
					if (spaces[i].state == "monster") {
						for (j = 0; j < spaces[i].adjacentSpaces.length; j++) {
							if (spaces[spaces[i].adjacentSpaces[j]].state == "cow"){
								liveCowFound = true;
								mon = i;
							}
						}
						if (liveCowFound) {
							break;
						}
					}
				}
				var index = Math.floor(Math.random() * spaces[mon].adjacentSpaces.length);
				while(spaces[index].state != "cow") {
					index = Math.floor(Math.random() * spaces[mon].adjacentSpaces.length);
				}
				spaces[index].state = "deadCow";
				cowKilled = spaces[index];
				break;
			case 1: // normal mode
			case 2: // hard mode
				// finds available cows for killing
				cowsThatCanBeKilled = [];
				for(var i = 0; i < 24; ++i) {
					var currentSpace = spaces[i];
					if (currentSpace.state == "monster") {
						var adjacentSpaces = currentSpace.adjacentSpaces;
						for (var j = 0; j < adjacentSpaces.length; ++j) {
							var currentAdjacentSpace = spaces[ adjacentSpaces[j] ];
							if (currentAdjacentSpace.state == "cow") {
								var addToArray = true;
								for (var k = 0; k < cowsThatCanBeKilled.length; ++k) {
									if (cowsThatCanBeKilled[k] == adjacentSpaces[j]) {
										addToArray = false;
										break;
									}
								}
								if (addToArray) {
									cowsThatCanBeKilled.push(adjacentSpaces[j]);
								}
							}
						}
					}
				}
				// randomly choose from cows connected to any monster(s)
				var cow = Math.floor(Math.random() * cowsThatCanBeKilled.length);
				var index = cowsThatCanBeKilled[cow];
				while(spaces[index].state != "cow") {
					cow = Math.floor(Math.random() * cowsThatCanBeKilled.length);
					index = cowsThatCanBeKilled[cow];
				}
				spaces[index].state = "deadCow";
				drawSpaces();
				cowKilled = spaces[index];
				break;
		}
		// moves cows/monsters connected to killedCow
		for (var i = 0; i < cowKilled.adjacentSpaces.length; i++) {
			var movingCow = spaces[cowKilled.adjacentSpaces[i]];
				if (movingCow.state != "deadCow" && movingCow.state != "deadMonster" && movingCow.state != "empty") {
					var newPos = Math.floor(Math.random() * 24);
				while(spaces[newPos].state != "empty") {
					newPos = Math.floor(Math.random() * 24);
				}
				spaces[newPos].state = movingCow.state;
				movingCow.state = "empty";

				$("#space" + newPos).css("border", "5px solid orange");
			}
		}
		drawSpaces();
		return 1;
	} else {
		return 0;
	}
}

function computerFarmer(monstersRemaining) {
	var kills = {cowKills: 0, monsterKills: 0}; // object to be returned

	// computer kills a cow to guess monster
	// picks randomly from cows most recently moved

	var index = 0;
	var movedIndex = 0;
	if (beenMoved.length > 0){
		movedIndex = Math.floor(Math.random() * (beenMoved.length));
		index = beenMoved[movedIndex];
	}
	else {
		for (var i = 0; i < 24; i++) {
			if(spaces[i].state == "cow" || spaces[i].state == "monster" ){
				index = i;
			}
		}
		//index = Math.floor(Math.random() * 24);
		//while(spaces[index].state != "monster" && spaces[index].state != "cow") {
			//index = Math.floor(Math.random() * 24);
		//}
	}

	if (spaces[index].state == "cow") {
		spaces[index].state = "deadCow";
		++totalCowsKilled;
		//alert("Total cows killed: " + totalCowsKilled);
	}
	else {
		spaces[index].state = "deadMonster";
		++totalMonstersKilled;
		//alert("Total monsters killed: " + totalMonstersKilled);
	}

	drawSpaces();

	if(spaces[index].state == "deadMonster"){
		kills.monsterKills++;
		if (beenMoved.length > 0) {beenMoved.splice(movedIndex, 1);}
		if (monstersRemaining - kills.monsterKills > 0 && beenMoved.length > 0) { // round continues
			var moreKills = computerFarmer(monstersRemaining - 1);
			kills.monsterKills = kills.monsterKills + moreKills.monsterKills;
			kills.cowKills = kills.cowKills + moreKills.cowKills;
		}
	}
	else {
		kills.cowKills++;
	}

	$("footer").html("<p>The farmer has attacked livestock in an attempt to get rid of the monsters.</p>");

	return kills;
}
///////// End of computer AI functions /////////

///////// Start of player functions /////////
function playerPickMonster() {

	//alert("Player picking monsters");
	// check for mouse click
	// check if mouse click was on pasture occupied by a cow
	// if so, make the cow a monster

	var cowSpaces = [];

	for (var i = 0; i < 24; ++i) {

		var currentSpace = spaces[i];

		if (currentSpace.state == "cow") {
			cowSpaces.push(i);
		}
	}

	var monstersSelected = 0;

	lastClickedCoordinates = [-1, -1];

	function loop() {

		for (var i = 0; i < cowSpaces.length; ++i) {

			var spaceX = canvas.width * coordinateRatio * spaces[cowSpaces[i]].x;
			var spaceY = canvas.height * coordinateRatio * spaces[cowSpaces[i]].y;

			var dx = lastClickedCoordinates[0] / 4 - spaceX;
			var dy = lastClickedCoordinates[1] / 4 - spaceY;

			if (dx * dx + dy * dy <= 15 * 15) {
				spaces[cowSpaces[i]].state = "monster";
				++monstersSelected;
				drawScreen();
				lastClickedCoordinates = [-1, -1];
			}
		}
		if (monstersSelected < 3) {
			setTimeout(loop, 0);
		}
		else {
			alert("Time to kill!");
			chooseCowToKill();
		}
	}

	loop();

}
function playerPlaceCow() {
	// check for mouse click
	// check if mouse click was on empty pasture
	// if empty pasture, add a cow

	var cowsPlaced = 0;

	lastClickedCoordinates = [-1, -1];

	function loop() {

		for (var i = 0; i < 24; ++i) {

			var spaceX = canvas.width * coordinateRatio * spaces[i].x;
			var spaceY = canvas.height * coordinateRatio * spaces[i].y;

			var dx = lastClickedCoordinates[0] / 4 - spaceX;
			var dy = lastClickedCoordinates[1] / 4 - spaceY;

			if (dx * dx + dy * dy <= 15 * 15 && spaces[i].state == "empty") {
				//alert(dx * dx + dy * dy + " state: " + spaces[i].state);
				spaces[i].state = "cow";
				++cowsPlaced;
				drawScreen();
			}
		}
		if (cowsPlaced < 18) {

			setTimeout(loop, 0);
		}
		else {
			//alert("Leaving...");
		}
	}

	loop();

}
///////// End of player functions /////////


///////// Start of game flow functions /////////
/*
 * playerIsMonster is either true or false, depending on if the player is the monster
 * I am assuming that the actual game board variables will be updated in the functions where
 * the player/computer is placing cows/choosing monsters.
 */
function setupGame(playerIsMonster) {
	var numCows = 18;
	var numMonsters = 3;

	if (playerIsMonster) {
		// have computer place cows
		comPlaceCows();
		drawSpaces();
		monsterSettingUp = true;
		//player selects three cows to become secret monsters
		//$("#message").html("Your opponent will play as the farmer and has placed their cows. You will be playing as the monster this round. Please select 3 cows to become your secret monsters.");
		//playerPickMonster();
		$("footer").html("<p>Your opponent will play as the farmer and has placed their cows. You will be playing as the monster this round. Please select 3 cows to become your secret monsters.</p>");
	}/* else {
		alert("Before playerPlaceCow()");
		$("footer").text("Now it's your turn to be the farmer. Please select 18 slots to place your cows in.");
		playerPlaceCow();
		$("footer").empty();
		alert("After playerPlaceCow()");

		// have computer choose monsters
		comSelectMonsters();
	}*/
}

function killPossible() {
	// returns true if there is a cow adjacent to a monster
	for (var i = 0; i < 24; ++i) {

		var currentSpace = spaces[i];

		if (currentSpace.state != "monster") {
			continue;
		}

		var currentAdjacentSpaces = currentSpace.adjacentSpaces;

		for (var j = 0; j < currentAdjacentSpaces.length; ++j) {

			var adjacentSpaceStatus = spaces[ currentAdjacentSpaces[j] ].state;

			if (adjacentSpaceStatus == "cow") {
				return true;
			}
		}
	}
	return false;
}

function chooseCowToKill() {

	cowsThatCanBeKilled = [];

	for(var i = 0; i < 24; ++i) {

		var currentSpace = spaces[i];

		if (currentSpace.state == "monster") {

			var adjacentSpaces = currentSpace.adjacentSpaces;

			for (var j = 0; j < adjacentSpaces.length; ++j) {

				var currentAdjacentSpace = spaces[ adjacentSpaces[j] ];

				if (currentAdjacentSpace.state == "cow") {

					/*
					context.beginPath();
					context.arc(canvas.width * coordinateRatio * currentAdjacentSpace.x, canvas.height * coordinateRatio * currentAdjacentSpace.y, 15, 0, 2 * Math.PI);
					context.closePath();

					context.lineWidth = 2;
					context.strokeStyle = "#cc33ff";
					context.stroke();
					context.lineWidth = 1;
					*/
					var addToArray = true;
					for (var k = 0; k < cowsThatCanBeKilled.length; ++k) {
						if (cowsThatCanBeKilled[k] == adjacentSpaces[j]) {
							addToArray = false;
							break;
						}
					}

					if (addToArray) {
						$("#space" + adjacentSpaces[j]).css("border", "5px solid red");
						cowsThatCanBeKilled.push(adjacentSpaces[j]);
					}

				}
			}
		}
	}
	/*
	if (cowsThatCanBeKilled.length == 0) {
		beenMoved = [];
		computerFarmer();
		alert("Checking game");
		if (totalMonstersKilled == 3 || totalCowsKilled == 15) {
			alert("GAME OVER");
			computerScore = 15 - totalCowsKilled;

			playerIsMonster = false;
			totalCowsKilled = 0;
			totalMonstersKilled = 0;

			//alert("Clearing board");

			for(var v = 0; v < 24; v++) {
				spaces[v].state = "empty";
			}

			alert("Done clearing board");

			drawScreen();

			//setupGame(false);
			//playRound();
			playerPlaceCow();
		}
		else {
			chooseCowToKill();
		}
	}

	lastClickedCoordinates = [-1, -1];

	function loop() {
		if(lastClickedCoordinates[0] == -1) {
			setTimeout(loop, 0);
		}
		else {

			var validCow = false;

			for (var i = 0; i < cowsThatCanBeKilled.length; ++i) {

				var spaceX = canvas.width * coordinateRatio * spaces[cowsThatCanBeKilled[i]].x;
				var spaceY = canvas.height * coordinateRatio * spaces[cowsThatCanBeKilled[i]].y;

				var dx = lastClickedCoordinates[0] / 4 - spaceX;
				var dy = lastClickedCoordinates[1] / 4 - spaceY;

				if (dx * dx + dy * dy <= 15 * 15) {
					spaces[cowsThatCanBeKilled[i]].state = "deadCow";
					validCow = true;
					++totalCowsKilled;
					lastKilledCow = cowsThatCanBeKilled[i];
					drawScreen();
					lastClickedCoordinates = [-1, -1];
					moveCowsAfterDeath();
				}
			}
			if (!validCow) {
				lastClickedCoordinates = [-1, -1];
				setTimeout(loop, 0);
			}
		}
	}

	loop();
	*/
}

function moveCowsAfterDeath(repeat) {

	if (!repeat) {

		beenMoved = [];

		cowsThatNeedToMove = spaces[lastKilledCow].adjacentSpaces;

		var indecesToKeep = [];

		for (var i = 0; i < cowsThatNeedToMove.length; ++i) {

			var currentAdjacentSpace = spaces[cowsThatNeedToMove[i]];

			if (currentAdjacentSpace.state == "cow" || currentAdjacentSpace.state == "monster") {

				$("#space" + cowsThatNeedToMove[i]).css("border", "5px solid purple");

				indecesToKeep.push(cowsThatNeedToMove[i]);
			}
		}

		cowsThatNeedToMove = indecesToKeep;
	}
	else {
		for (var i = 0; i < cowsThatNeedToMove.length; ++i) {

			var currentAdjacentSpace = spaces[cowsThatNeedToMove[i]];

			if (currentAdjacentSpace.state == "cow" || currentAdjacentSpace.state == "monster") {

				$("#space" + cowsThatNeedToMove[i]).css("border", "5px solid purple");

			}
		}
	}


	/*
	function loop() {
		if (cowsThatNeedToMove.length > 0) {
			var validCowSelected = false;
			var cowSelected = -1;
			var cowSelectedIndex = -1;

			for (var i = 0; i < cowsThatNeedToMove.length; ++i) {

				var spaceX = canvas.width * coordinateRatio * spaces[cowsThatNeedToMove[i]].x;
				var spaceY = canvas.height * coordinateRatio * spaces[cowsThatNeedToMove[i]].y;

				var dx = lastClickedCoordinates[0] / 4 - spaceX;
				var dy = lastClickedCoordinates[1] / 4 - spaceY;

				if (dx * dx + dy * dy <= 15 * 15) {
					validCowSelected = true;
					cowSelected = cowsThatNeedToMove[i];
					cowSelectedIndex = i;
				}
			}

			if (!validCowSelected) {
				setTimeout(loop, 0);
			}
			else {

				function loop2() {
					var validSpaceSelected = false;
					var selectedSpace = -1;

					for (var j = 0; j < 24; ++j) {

						var spaceX = canvas.width * coordinateRatio * spaces[j].x;
						var spaceY = canvas.height * coordinateRatio * spaces[j].y;

						var dx = lastClickedCoordinates[0] / 4 - spaceX;
						var dy = lastClickedCoordinates[1] / 4 - spaceY;

						if (dx * dx + dy * dy <= 15 * 15 && spaces[j].state == "empty") {

							validSpaceSelected = true;
							selectedSpace = j;
						}
					}

					if (validSpaceSelected) {
						beenMoved.push(selectedSpace);

						if (spaces[cowSelected].state == "cow") {
							spaces[selectedSpace].state = "cow";
						}
						else {
							spaces[selectedSpace].state = "monster";
						}

						spaces[cowSelected].state = "empty";

						cowsThatNeedToMove.splice(cowSelectedIndex, 1);

						if (cowsThatNeedToMove.length > 0) {
							drawScreen();

							for (var i = 0; i < cowsThatNeedToMove.length; ++i) {

								var currentCowToMove = spaces[cowsThatNeedToMove[i]];

								context.beginPath();
								context.arc(canvas.width * coordinateRatio * currentCowToMove.x, canvas.height * coordinateRatio * currentCowToMove.y, 15, 0, 2 * Math.PI);
								context.closePath();

								context.lineWidth = 2;
								context.strokeStyle = "#cc33ff";
								context.stroke();
								context.lineWidth = 1;

							}

							setTimeout(loop, 0);
						}
						else {
							drawScreen();
							alert("Checking game 2");
							if (totalMonstersKilled == 3 || totalCowsKilled == 15) {
								alert("GAME OVER 2");
								computerScore = 15 - totalCowsKilled;

								playerIsMonster = false;
								totalCowsKilled = 0;
								totalMonstersKilled = 0;

								alert("Clearing board");

								for(var v = 0; v < 24; v++) {
									spaces[v].state = "empty";
								}

								alert("Done clearing board");

								drawScreen();

								//setupGame(false);
								//playRound();
								playerPlaceCow();
							}

							alert("Farmers chooses cow");
							computerFarmer(3 - totalMonstersKilled);
							chooseCowToKill();
						}
					}
					else {
						setTimeout(loop2, 0);
					}
				}

				loop2();

			}
		}
		else {

		}
	}

	loop();
	*/
}

// killedCow is the cow that was just killed by the farmer
// this function shouldn't be necessary, it's just here for completeness purposes
function wasCowMonster() {

	if(spaces[lastKilledCow].state == "deadCow") {
		return false;
	}
	else {
		return true;
	}

}

// returns 1 if a kill was made, 0 otherwise. The return value is used to adjust the number of cows
function humanMonster() {
	if(killPossible()) {
		// handle choosing which cow to kill
		chooseCowToKill();
		// handle moving cows
		moveCowsAfterDeath();

	} else {

	}
}

function farmerChooseCowToKill() {

	var cowsThatCanBeKilled = [];

	for (var i = 0; i < 24; ++i) {

		var currentSpace = spaces[i];

		if (currentSpace.state == "cow" || currentSpace.state == "monster") {
			cowsThatCanBeKilled.push(i);
		}

	}

	/*

	lastClickedCoordinates = [-1, -1];

	function loop() {
		if(lastClickedCoordinates[0] == -1) {
			setTimeout(loop, 0);
		}
		else {

			var validCow = false;

			for (var i = 0; i < cowsThatCanBeKilled.length; ++i) {

				var spaceX = canvas.width * coordinateRatio * spaces[cowsThatCanBeKilled[i]].x;
				var spaceY = canvas.height * coordinateRatio * spaces[cowsThatCanBeKilled[i]].y;

				var dx = lastClickedCoordinates[0] / 4 - spaceX;
				var dy = lastClickedCoordinates[1] / 4 - spaceY;

				if (dx * dx + dy * dy <= 15 * 15) {

					if (spaces[cowsThatCanBeKilled[i]].state == "cow" || spaces[cowsThatCanBeKilled[i]].state == "monster") {
						validCow = true;
						if (spaces[cowsThatCanBeKilled[i]].state == "cow") {
							spaces[cowsThatCanBeKilled[i]].state = "deadCow";
							++totalCowsKilled;
						}
						else {
							spaces[cowsThatCanBeKilled[i]].state = "deadMonster";
							++totalMonstersKilled;
						}

						lastKilledCow = cowsThatCanBeKilled[i];

					}

					drawScreen();
					lastClickedCoordinates = [-1, -1];

					if (spaces[cowsThatCanBeKilled[i]].state == "deadMonster") {

						if (totalMonstersKilled < 3) {
							confirm("You found a monster! Guess again?");
							humanFarmer();
						}
					}
				}
			}
			if (!validCow) {
				lastClickedCoordinates = [-1, -1];
				setTimeout(loop, 0);
			}
		}
	}

	loop();
	*/
}

/*
 * Handles the human farmer turn, mostly.
 * The returned value is an object containing the number of cows killed and
 * the number of monsters killed during the farmer's turn
 */
function humanFarmer() {

	// force farmer to kill a cow
	if (totalMonstersKilled < 3) {
		farmerChooseCowToKill();
	}

}

/*
 * This function handles the playing of one round
 * playerIsMonster is the same variable passed to setupGame()
 * The function returns an object containing whether or not the player won the round,
 * and how many cows were left at the end of the round
 */
function playRound(playerIsMonster) {

	// the logic in the loop should take care of ending the game properly, the loop is to handle turn-taking during the round
	while (true) {
		// determine which function to call based on whether the human is the monster or not
		if (playerIsMonster) {
			if (totalCowsKilled === 15) {
				// round over, human monster wins
				return 15 - totalCowsKilled;
			}

			var kills = computerFarmer(); // computerFarmer() returns an object containing the number of cows/monsters killed
			if (totalCowsKilled === 15) {
				// human monster won
				return 15 - totalCowsKilled;
			}
			if (totalCowsKilled === 15) {
				// computer player won
				return 15 - totalCowsKilled;
			}
		} else {
			if (totalCowsKilled === 15) {
				// round over, computer monster wins
				return 15 - totalCowsKilled;
			}

			if (totalCowsKilled === 15) {
				// computer monster won
				return 15 - totalCowsKilled;
			}
			if (totalCowsKilled === 15) {
				// human player won
				return 15 - totalCowsKilled;
			}
		}
	}
}

/*
 * Handles the actual playing of the game.
 * Begins by setting up the game board and plays a round.
 * After the first round, it sets up the game board again and plays the second round.
 * Once both rounds have been played, it compares the scores and determines who won.
 *
 * Returns finalScore for the user to be added to the high score API
 */
function playGame() {
	// This variable was moved to the top as a global variable for the drawing functions
	//var playerIsMonster = false;
	var finalScore;
	// ask player to chose level

	// player is monster round (computerScore gained first)
	setupGame(true);/*
	var computerScore = playRound(true);

	// player is farmer round (playerScore gained)
	setupGame(false);
	var playerScore = playRound(playerIsMonster);

	if (playerScore > computerScore) {
		finalScore = playerScore - computerScore;
		switch(difficulty) {
			case 1: // normal mode
				finalScore = finalScore * 2;
				break;
			case 2: // hard mode
				finalScore = finalScore * 3;
				break;
			default:
				// no change to finalScore
		}
	}
	else {
		// player loses
		finalScore = 0;
	}
	return finalScore;*/
}
///////// End of game flow functions /////////

/*
	*****************************************************************************************************
	** USED CODE **
	*****************************************************************************************************
*/

function resetSpaces() {

	for (var i = 0; i < 24; ++i) {
		$("#space" + i).css("border", "2px solid black");
	}

}

function clearSpaces() {

	resetSpaces();

	for (var i = 0; i < 24; ++i) {
		spaces[i].state = "empty";
	}
}

function drawSpaces() {

	for (var i = 0; i < 24; ++i) {

		var currentSpaceState = spaces[i].state;

		if (currentSpaceState == "empty") {
			$("#space" + i).css("background-color", "white");
			document.getElementById("space" + i).innerHTML = "";
		}
		else if (currentSpaceState == "cow") {
			$("#space" + i).css("background-color", "green");
			document.getElementById("space" + i).innerHTML = "<img width='60' height='60' src='../images/cow_head.png' alt='A cute cow head'>";
		}
		else if (currentSpaceState == "monster" && playerIsMonster) {
			$("#space" + i).css("background-color", "blue");
			document.getElementById("space" + i).innerHTML = "<img width='60' height='60' src='../images/monster.png' alt='A ferocious monster'>";
		}
		else if (currentSpaceState == "monster" && !playerIsMonster) {
			$("#space" + i).css("background-color", "green");
			document.getElementById("space" + i).innerHTML = "<img width='60' height='60' src='../images/cow_head.png' alt='A cute cow head'>";
		}
		else if (currentSpaceState == "deadCow") {
			$("#space" + i).css("background-color", "red");
			document.getElementById("space" + i).innerHTML = "<img width='60' height='60' src='../images/cow_head.png' alt='A cute cow head'>";
		}
		else if (currentSpaceState == "deadMonster") {
			$("#space" + i).css("background-color", "red");
			document.getElementById("space" + i).innerHTML = "<img width='60' height='60' src='../images/monster.png' alt='A ferocious monster'>";
		}

	}

}

$(".level").click(function(){
	switch ($(this).text()) {
		case "Easy":
			difficulty = 0;
			break;
		case "Medium":
			difficulty = 1;
			break;
		case "Hard":
			difficulty = 2;
			break;
		default:
	}
	$(".level").remove();
	//$("h1").text("");
	$("footer").css("font-size", "150%");
	$("footer").css("font-weight", "bold");
	playGame();

});

$(".space").click(function() {

	var spaceID = parseInt(this.id.substr(5));

	if (monsterSettingUp) {

		for (var i = 0; i < 24; ++i) {

			var currentSpaceState = spaces[i].state;

			if (i == spaceID && currentSpaceState == "cow") {

				spaces[i].state = "monster";
				$(this).css("background-color", "blue");
				this.innerHTML = "<img width='60' height='60' src='../images/monster.png' alt='A ferocious monster'>";
				++monstersSelected;
				if (monstersSelected  == 3) {
					monsterSettingUp = false;
					monsterKilling = true;
					chooseCowToKill();
					$("footer").html("<p>Now, which cow will your monster(s) attack?</p>");
				}
				break;
			}
		}
	}
	else if (monsterKilling) {

		for (var i = 0; i < 24; ++i) {

			var currentSpaceState = spaces[i].state;

			if (i == spaceID && currentSpaceState == "cow" && cowsThatCanBeKilled.indexOf(i) != -1) {

				spaces[i].state = "deadCow";
				++totalCowsKilled;
				$(this).css("background-color", "red");
				this.innerHTML = "<img width='60' height='60' src='../images/cow_head.png' alt='A cute cow head'>";
				lastKilledCow = i;
				monsterKilling = false;

				//alert("Total cows killed: " + totalCowsKilled);

				if (totalCowsKilled == 15 || totalMonstersKilled == 3) {
					roundOneOver = true;

					alert("Round one is over!");

					computerScore = 15 - totalCowsKilled;

					playerIsMonster = false;
					clearSpaces();
					drawSpaces();
					totalCowsKilled = 0;
					totalMonstersKilled = 0;
					playerPlacingCows = true;

					$("footer").html("<p>It's your turn to be the farmer. Place your 18 cows on the board.</p>");
				}
				else {
					movingCows = true;
					selectingValidCow = true;
					resetSpaces();
					moveCowsAfterDeath(false);
					$("footer").html("<p>The surrounding cows have been spooked! Move them and your surrounding monsters to empty spaces.</p>");
				}
				break;
			}
		}
	}
	else if (movingCows) {

		if (selectingValidCow) {

			for (var i = 0; i < 24; ++i) {

				var currentSpaceState = spaces[i].state;

				if (i == spaceID && cowsThatNeedToMove.indexOf(i) != -1) {

					selectedCow = i;
					cowsThatNeedToMove.splice(cowsThatNeedToMove.indexOf(i), 1);
					resetSpaces();
					$(this).css("border", "5px solid yellow");
					selectingValidCow = false;
					selectingValidSpace = true;
					break;
				}
			}
		}
		else if (selectingValidSpace) {
			for (var i = 0; i < 24; ++i) {

				var currentSpaceState = spaces[i].state;

				if (i == spaceID && currentSpaceState == "empty") {

					selectedSpace = i;
					resetSpaces();

					spaces[selectedSpace].state = spaces[selectedCow].state;
					spaces[selectedCow].state = "empty";
					beenMoved.push(selectedSpace);
					drawSpaces();
					selectingValidSpace = false;
					selectedCow = -1;
					selectedSpace = -1;

					if (cowsThatNeedToMove.length > 0) {
						selectingValidCow = true;
						moveCowsAfterDeath(true);
					}
					else {
						movingCows = false;

						if (totalCowsKilled == 15 || totalMonstersKilled == 3) {

							drawSpaces();

							setTimeout(function() {

								roundOneOver = true;

								alert("Round one is over!");

								computerScore = 15 - totalCowsKilled;

								playerIsMonster = false;
								clearSpaces();
								drawSpaces();
								totalCowsKilled = 0;
								totalMonstersKilled = 0;
								playerPlacingCows = true;

								$("footer").html("<p>It's your turn to be the farmer. Place your 18 cows on the board.</p>");

							}, 500);

						}
						else {

							computerFarmer(3 - totalMonstersKilled);

							if (totalCowsKilled == 15 || totalMonstersKilled == 3) {

								drawSpaces();

								setTimeout(function() {

									roundOneOver = true;

									alert("Round one is over!");

									computerScore = 15 - totalCowsKilled;

									playerIsMonster = false;
									clearSpaces();
									drawSpaces();
									totalCowsKilled = 0;
									totalMonstersKilled = 0;
									playerPlacingCows = true;

									$("footer").html("<p>It's your turn to be the farmer. Place your 18 cows on the board.</p>");

								}, 500);

							}
							else {

								chooseCowToKill();

								if (cowsThatCanBeKilled.length == 0) {

									$("footer").html("<p>Your monsters cannot reach any cows! The farmer closes in on you...</p>");

									while (totalCowsKilled != 15 && totalMonstersKilled != 3) {
										computerFarmer(3 - totalMonstersKilled);
									}

									if (totalCowsKilled == 15 || totalMonstersKilled == 3) {

										drawSpaces();

										setTimeout(function() {

											roundOneOver = true;

											alert("Round one is over!");

											computerScore = 15 - totalCowsKilled;

											playerIsMonster = false;
											clearSpaces();
											drawSpaces();
											totalCowsKilled = 0;
											totalMonstersKilled = 0;
											playerPlacingCows = true;

											$("footer").html("<p>It's your turn to be the farmer. Place your 18 cows on the board.</p>");

										}, 500);

									}
								}
								else {
									monsterKilling = true;
									$("footer").html( $("footer").html() + "<p>Now, which cow will your monster(s) attack?</p>" );
								}
							}
						}
					}
					break;
				}
			}

		}
	}
	else if (playerPlacingCows) {

		for (var i = 0; i < 24; ++i) {

			var currentSpaceState = spaces[i].state;

			if (i == spaceID && currentSpaceState == "empty") {

				spaces[i].state = "cow";
				++cowsPlaced;
				drawSpaces();

				if (cowsPlaced == 18) {
					playerPlacingCows = false;

					//playerIsMonster = true;

					comSelectMonsters();
					drawSpaces();
					computerMonster();
					playerChooseCowToKill = true;
					farmerChooseCowToKill();
					$("footer").html("<p>The computer has chosen their 3 hidden monsters and attacked a cow! Which cow do you think is a monster? (Highlighted cows were just spooked.)</p>");
				}
				break;
			}
		}

	}

	else if (playerChooseCowToKill) {

		for (var i = 0; i < 25; ++i) {

			if ( i == 24 ) {
				if ( i == spaceID ) {
					resetSpaces();
					computerMonster();
					farmerChooseCowToKill();
					$("footer").html("<p>A hidden monster has attacked your cows! Which cow do you think is a monster? (Highlighted cows were just spooked.)</p>");
					$("#space24").toggle();
					passVisible = false;
				}
				continue;
			}

			var currentSpaceState = spaces[i].state;

			if ( (i == spaceID) && (currentSpaceState == "cow" || currentSpaceState == "monster") ) {

				if (passVisible) { $("#space24").toggle(); passVisible = false; }
				//

				if (currentSpaceState == "cow") {
					spaces[i].state = "deadCow";
					drawSpaces();
					++totalCowsKilled;

					resetSpaces();//

					if (totalCowsKilled == 15 || totalMonstersKilled == 3) {
						playerChooseCowToKill = false;
						roundTwoOver = true;

						playerScore = 15 - totalCowsKilled;

						alert("Game over!");

						var finalScore = playerScore - computerScore - 1;
						if (finalScore < 0) { finalScore = 0; }

						alert("Final score: " + finalScore);

						highscore(finalScore);

						$("footer").html("<p>Thanks for playing!</p>");
					}
					else {
						computerMonster();

						if (totalCowsKilled == 15 || totalMonstersKilled == 3) {
							playerChooseCowToKill = false;
							roundTwoOver = true;

							playerScore = 15 - totalCowsKilled;

							alert("Game over!");

							var finalScore = playerScore - computerScore - 1;
							if (finalScore < 0) { finalScore = 0; }

							alert("Final score: " + finalScore);

							highscore(finalScore);

							$("footer").html("<p>Thanks for playing!</p>");
						}
						else {
							farmerChooseCowToKill();

							$("footer").html("<p>A hidden monster has attacked your cows! Which cow do you think is a monster? (Highlighted cows were just spooked.)</p>");
						}
					}
				}
				else {
					spaces[i].state = "deadMonster";
					drawSpaces();
					++totalMonstersKilled;

					if (totalCowsKilled == 15 || totalMonstersKilled == 3) {
						playerChooseCowToKill = false;
						roundTwoOver = true;

						playerScore = 15 - totalCowsKilled;

						alert("Game over!");

						var finalScore = playerScore - computerScore - 1;
						if (finalScore < 0) { finalScore = 0; }

						alert("Final score: " + finalScore);

						highscore(finalScore);

						$("footer").html("<p>Thanks for playing!</p>");

						break;
					}
					else {

						if (totalMonstersKilled < 3) {
							farmerChooseCowToKill();
							$("footer").html("<p>You found a monster! Would you like to guess once more in a row?");
							$("#space24").toggle();
							passVisible = true;
						}
						else {
							playerChooseCowToKill = false;
							roundTwoOver = true;

							playerScore = 15 - totalCowsKilled;

							alert("Game over!");

							var finalScore = playerScore - computerScore - 1;
							if (finalScore < 0) { finalScore = 0; }

							alert("Final score: " + finalScore);

							highscore(finalScore);

							$("footer").html("<p>Thanks for playing!</p>");

							break;
						}
					}
				}
				//playerChooseCowToKill = false;
			}
			else {

			}
		}

	}
	else if (roundTwoOver) {
		//alert("Round two over");
	}
	else {
		//alert("Out of bounds");
	}

});

drawScreen();



});
