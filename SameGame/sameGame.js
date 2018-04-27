// change to fit whether you want to use 2 or 4 colors
var numColors = 4;

var scoreDisplay = document.getElementById("score");
var button = document.getElementById('reset');
var canvas = document.getElementById("sameGame");
var ctx = canvas.getContext("2d");
var squares = new Array();
var colors = ["#8ED6FF", "#FF5162", "#FFFC54", "#54FF62"];
var score = 0;
var squaresDeleted = 0;

class ColorSquare {
	constructor(sColor, isE) {
		this.sColor = sColor;
		this.isEmpty = isE;
	}
}

function deleteSameAround(i, j, colorToDelete) {
  // left
  if (i > 0) {
    if (squares[i - 1][j].sColor === colorToDelete && !squares[i - 1][j].isEmpty) {
      squares[i - 1][j].isEmpty = true;
      squaresDeleted++;
      deleteSameAround(i - 1, j, colorToDelete)
    }
  }
  // right
  if (i < 15) {
    if (squares[i + 1][j].sColor === colorToDelete && !squares[i + 1][j].isEmpty) {
      squares[i + 1][j].isEmpty = true;
      squaresDeleted++;
      deleteSameAround(i + 1, j, colorToDelete);
    }
  }

  // below
  if (j < 15) {
    if (squares[i][j + 1].sColor === colorToDelete && !squares[i][j + 1].isEmpty) {
      squares[i][j + 1].isEmpty = true;
      squaresDeleted++;
      deleteSameAround(i, j + 1, colorToDelete);
    }
  }

  // above
  if (j > 0) {
    if (squares[i][j - 1].sColor === colorToDelete && !squares[i][j - 1].isEmpty) {
      squares[i][j - 1].isEmpty = true;
      squaresDeleted++;
      deleteSameAround(i, j - 1, colorToDelete);
    }
  }
}

function collapseSquares() {
  for (i = 0; i < 16; i++) { // checks columns from left to right
    for (j = 15; j > -1; j--) {
      // checks squares in columns from bottom to top
      if (squares[i][j].isEmpty){
        //collapse down columns
        upJ = j - 1;
        while (upJ > -1) {
          if (!squares[i][upJ].isEmpty) {
            temp = squares[i][j];
            squares[i][j] = squares[i][upJ];
            squares[i][upJ] = temp;
            break;
          } else {
            upJ = upJ - 1;
          }
        }
      }
    }
  }

  // once downward collapse is done, following checks if we need to collapse left
  for (i = 0; i < 16; i++) {
    if (squares[i][15].isEmpty) {
      for (j = i + 1; j < 16; j++) {
        squares[j - 1] = squares[j];
      }
      // empty out last column
      for (j = 0; j < 16; j++) {
        squares[15][j].isEmpty = true;
      }
    }
  }
}

function checkEndGame() {
  if (squares[0][15].isEmpty) {
    alert("Game over - you win! =D");
    return;
  } else {
    // check for any adjacent colors, break/return when one is found
    for (i = 0; i < 16; i++) { // checks columns from left to right
      for (j = 15; j > -1; j--) {
        if (!squares[i][j].isEmpty){
          colorMatch = squares[i][j].sColor;
          if (i > 0) {
            if (squares[i - 1][j].sColor === colorMatch && !squares[i - 1][j].isEmpty) {
              return;
            }
          }
          if (i < 15) {
            if (squares[i + 1][j].sColor === colorMatch && !squares[i + 1][j].isEmpty) {
              return;
            }
          }
          if (j < 15) {
            if (squares[i][j + 1].sColor === colorMatch && !squares[i][j + 1].isEmpty) {
              return;
            }
          }
          if (j > 0) {
            if (squares[i][j - 1].sColor === colorMatch && !squares[i][j - 1].isEmpty) {
              return;
            }
          }
        }
      }
    }
    // if did not return at any point, then game is lost
    alert("Game over - no matching adjacent squares. :-(");
    return;
  }
}

function checkSquare(i, j) {
  squaresDeleted = 0;
  adjacentSameColors = new Array();
  colorSearch = squares[i][j].sColor;
  // check to the left if not on left edge
  if (i > 0) {
    if (squares[i - 1][j].sColor === colorSearch && !squares[i - 1][j].isEmpty) {
      adjacentSameColors.push("left");
    }
  }
  // check to the right if not on right edge
  if (i < 15) {
    if (squares[i + 1][j].sColor === colorSearch && !squares[i + 1][j].isEmpty) {
      adjacentSameColors.push("right");
    }
  }
  // check below if not on bottom edge
  if (j < 15) {
    if (squares[i][j + 1].sColor === colorSearch && !squares[i][j + 1].isEmpty) {
      adjacentSameColors.push("below");
    }
  }
  // check above if not on top edge
  if (j > 0) {
    if (squares[i][j - 1].sColor === colorSearch && !squares[i][j - 1].isEmpty) {
      adjacentSameColors.push("above");
    }
  }
  // if adjacentSameColors is not empty, then square has a same color next to it
  // and can be deleted
  if (adjacentSameColors.length != 0) {
    squares[i][j].isEmpty = true;
    squaresDeleted++;
    deleteSameAround(i, j, colorSearch);
    for(supercheck = 0; supercheck < 10; supercheck++) {
      collapseSquares(); // checks through a few times to be sure
    }
    drawBoard();
    score = score + (squaresDeleted * (squaresDeleted - 1));
		// board and scores have changed, updating storage
		updateStorage();
    scoreDisplay.innerHTML = score;
  }
}

// clicking on a square
canvas.addEventListener("mousedown", getSquare, false);
function getSquare(e) {
  i = e.x - canvas.offsetLeft;
  j = e.y - canvas.offsetTop + window.pageYOffset;
  i = Math.floor((i - 1)/25);
  j = Math.floor((j - 1)/25);

  if (!squares[i][j].isEmpty) {
    checkSquare(i, j);
  }
  checkEndGame();
}

window.onload = function() {
  if (numColors > 4) { numColors = 4}; // just in case
	if(typeof(Storage) !== "undefined") {
		// localstorage keys are score, isEmptyij, and colorij where i and j are their array indices
		if (localStorage.color00) {
			//only need to check one, getting data from localStorage
  		getStorage();
			scoreDisplay.innerHTML = score;
    } else {
      initializeBoard();
    }
		// board is either fetched or created, now draw it
		drawBoard();
  } else {
      document.getElementById("score").innerHTML = "Sorry, your browser does not support web storage...";
  }
}

function initializeBoard() {
  score = 0;
  if (squares.length != 0) {
    squares = new Array();
  }
  for (i = 0; i < 16; i++) {
    row = new Array();
    for (j = 0; j < 16; j++) {
      randNum = Math.floor(Math.random() * numColors);
      row.push(new ColorSquare(colors[randNum], false));
    }
    squares.push(row);
  }
	updateStorage();
}

function reset() {
	// Don't need to check local storage here, it will be overwritten in initializeBoard
  initializeBoard();
  drawBoard();
  scoreDisplay.innerHTML = score;
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#000000";

  for (i = 0; i < 16; i++) {
    for (j = 0; j < 16; j++) {
      if (!squares[i][j].isEmpty) {
        ctx.fillStyle = squares[i][j].sColor;
        ctx.fillRect(i * 25 + 1, j * 25 + 1, 24, 24);
      }
    }
  }
}

function updateStorage() {
	// localstorage keys are score, isEmptyij, and colorij where i and j are their array indices
	localStorage.setItem("score", score);
  for (i = 0; i < 16; i++) {
    for (j = 0; j < 16; j++) {
			tempColorKey = "color" + i.toString() + "_" + j.toString();
			tempEmptyKey = "isEmpty" + i.toString() + "_" + j.toString();
			localStorage.setItem(tempColorKey, squares[i][j].sColor);
			if (squares[i][j].isEmpty) {
				localStorage.setItem(tempEmptyKey, 1);
			} else {
				localStorage.setItem(tempEmptyKey, 0);
			}
    }
  }
}

function getStorage() {
	// localstorage keys are score, isEmptyij, and colorij where i and j are their array indices
	score = Number(localStorage.getItem("score"));
	if (squares.length != 0) {
		squares = new Array();
	}
	for (i = 0; i < 16; i++) {
		row = new Array();
    for (j = 0; j < 16; j++) {
			tempColorKey = "color" + i.toString() + "_" + j.toString();
			tempEmptyKey = "isEmpty" + i.toString() + "_" + j.toString();
			tempSColor = localStorage.getItem(tempColorKey);
			tempEmpty = localStorage.getItem(tempEmptyKey);
			console.log(tempEmptyKey + " gives " + localStorage.getItem(tempEmptyKey));
			if(localStorage.getItem(tempEmptyKey) === "0") {
				row.push(new ColorSquare(tempSColor, false));
			} else {
				row.push(new ColorSquare(tempSColor, true));
			}
		}
		squares.push(row);
	}
}
