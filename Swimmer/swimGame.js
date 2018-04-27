  // Class to keep track of data
  class Square {
	
	constructor(x, y, state) {
	  this.x = x;
	  this.y = y;
	  this.state = state;
	}
	
  }
  
  // Game board made up of squares
  var squares = [
	new Square(-1, -1, -1), 
	new Square(0, 0, 1), 
	new Square(0, 1, 0), 
	new Square(0, 2, 0), 
	new Square(0, 3, 3), 
	new Square(0, 4, 2), 
	new Square(1, 0, 3), 
	new Square(1, 1, 3), 
	new Square(1, 2, 0), 
	new Square(1, 3, 3), 
	new Square(1, 4, 0), 
	new Square(2, 0, 0), 
	new Square(2, 1, 0), 
	new Square(2, 2, 0), 
	new Square(2, 3, 3), 
	new Square(2, 4, 0), 
	new Square(3, 0, 0), 
	new Square(3, 1, 3), 
	new Square(3, 2, 3), 
	new Square(3, 3, 3), 
	new Square(3, 4, 0), 
	new Square(4, 0, 0), 
	new Square(4, 1, 0), 
	new Square(4, 2, 0), 
	new Square(4, 3, 0), 
	new Square(4, 4, 0)
  ];
  
  // Game board functions
  function loadGame() {
	
	for (var i = 1; i < squares.length; ++i) {
	  
	  var currentSquare = squares[i];
	  
	  var currentX = currentSquare.x;
	  var currentY = currentSquare.y;
	  var currentState = currentSquare.state;
	  var currentDrag = "false";
	  
	  var stateImage = "../images/water.jpg";
	  
	  if      (currentState == 1) { stateImage = "../images/sand.jpg" }
	  else if (currentState == 2) { stateImage = "../images/swimmer.jpg"; currentDrag = "true"; }
	  else if (currentState == 3) { stateImage = "../images/shark.png"; }
	  
	  var imageHTML = '<img id="' + currentX + '' + currentY + stateImage + '" src="' + stateImage + '" draggable="' + currentDrag + '" ondragstart="drag(event)" width="100" height="100">';
	  
	  document.getElementById("" + currentX + "" + currentY).innerHTML = imageHTML;
	  
	}
	
  }
  
  function updateSquares() {
	
	for (var i = 1; i < squares.length; ++i) {
	  
	  if (squares[i].state == 2) {
		document.getElementById("" + squares[i].x + "" + squares[i].y + "").firstChild.draggable = true;
	  }
	  else {
		document.getElementById("" + squares[i].x + "" + squares[i].y + "").firstChild.draggable = false;
	  }
	  
	}
	
  }
  
  function checkIfWon() {
	if (squares[1].state == 2) {
	  alert("You win!");
	  document.getElementById("00").firstChild.draggable = false;
	}
  }
  
  function saveGame() {
	//TODO: implement
  }
  
  // Functions for drag and drop functionality
  function allowDrop(ev) {
	ev.preventDefault();
  }
  
  function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
  }
  
  function drop(ev) {
	ev.preventDefault();
	
	var targetX = Number(ev.target.id.substr(0,1));
	var targetY = Number(ev.target.id.substr(1,1));
	
	var targetSquare = null;
	var targetSquareIndex = -1;
	for (var i = 1; squares.length; ++i) {
	  if (squares[i].x == targetX && squares[i].y == targetY) { targetSquare = squares[i]; targetSquareIndex = i; break; }
	}
	
	// Only water or sand tiles can be dragged on
	if (targetSquare.state > 1) { return; }
	
	// Only ADJACENT water or sand tiles can be dragged on
	var data = ev.dataTransfer.getData("text");
	
		// X direction
	var xDistance = targetX - Number(data.substr(0,1));
	if (xDistance < -1 || xDistance > 1) { return; }
	
		// Y direction
	var yDistance = targetY - Number(data.substr(1,1));
	if (yDistance < -1 || yDistance > 1) { return; }
	
	// Switch squares (swimmer and water img sources)
	ev.target.src = (document.getElementById(data)).src;
	
	var sourceID = data.substr(0,1) + "" + data.substr(1,1);
	document.getElementById(sourceID).firstChild.src = "../images/water.jpg";
	
	// Update state information
		// Target div
	squares[targetSquareIndex].state = 2;
	
		// Source div
	for (var i = 1; i < squares.length; ++i) {
	  
	  var nextX = squares[i].x;
	  var nextY = squares[i].y;
	  
	  if ( nextX == Number(sourceID.substr(0,1)) && nextY == Number(sourceID.substr(1,1)) ) { squares[i].state = 0; break; }
	  
	}
	
	updateSquares();
	
	checkIfWon();
	
	//saveGame();
  }
  
  loadGame();