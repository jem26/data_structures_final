"use strict";

var canvas;
var gl;

var finished = false;
var delay = 25;

var width = 10;
var height = 10;
var WIDTH = 10;
var HEIGHT = 10;

var numberOfPoints = 10;
var numberReached = 0;
var iter = 0;
var xPositions = [];
var yPositions = [];

var lowest;
var xLowest;
var yLowest;

var baseColorLoc;
var vertices = [];
var radius = 0.5;

// Matrices
var ctm;
var ctmLoc;
var circleMat;
var blockMats = [];

var sm;
var tm;
var rm;

// Scaling values
var circleScaling = 0.1;
var blockScaling = 0.1;

// Translation values
var blockTranslation = 0.9;
var xCircleTranslation;
var yCircleTranslation;

var grid = [
    // [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    // [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    // [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    // [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    // [0, 1, 0, 0, 0, 0, 0, 1, 1, 1],
    // [1, 1, 0, 1, 1, 1, 0, 0, 0, 0],
    // [1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    // [1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    // [1, 1, 0, 1, 0, 1, 2, 1, 1, 1],
    // [1, 1, 1, 1, 0, 1, 1, 1, 1, 1]
];
var distances = [
    // [20, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    // [19, 18, 19, 20, 0, 24, 25, 26, 27, 28, 0],
    // [18, 17, 18, 19, 0, 25, 26, 27, 28, 29, 30],
    // [17, 16, 17, 18, 0, 26, 27, 28, 29, 30, 31],
    // [0, 15, 0, 0, 0, 0, 0, 29, 30, 31],
    // [15, 14, 0, 6, 5, 4, 0, 0, 0, 0],
    // [14, 13, 0, 5, 4, 3, 2, 3, 4, 5],
    // [13, 12, 0, 6, 0, 2, 1, 2, 3, 4],
    // [12, 11, 0, 7, 0, 1, 999, 1, 2, 3],
    // [11, 10, 9, 8, 0, 2, 1, 2, 3, 4]
];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Randomly plot blocks
    for (var i = 0; i < width; i++)
        grid [i] = [];
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
        	if (Math.floor(Math.random()*10) < 2)
        		grid[i][j] = 0;
        	else
            	grid[i][j] = 1;
        }
    }    
    var xTarget = Math.floor(Math.random() * (width - 1));
	var yTarget = Math.floor(Math.random() * (height - 1));
	grid[xTarget][yTarget] = 2;

	// Initially plot dots
	for (var i = 0; i < numberOfPoints; i++) {
		var xTemp = Math.floor(Math.random() * (width - 1));
		var yTemp = Math.floor(Math.random() * (height - 1));
		if (grid[xTemp][yTemp] !== 0 && grid[xTemp][yTemp] !== 2) {
			xPositions.push(xTemp);
			yPositions.push(yTemp);
		} else {
			i--;
		}
	}

	findPath();

    // Add circle coordinates
    var xCenter = 0.0;
    var yCenter = 0.0;
    vertices.push(xCenter);
    vertices.push(yCenter);

    for( var i=0; i<=360; i+=4){
      vertices.push(radius*Math.cos(i*Math.PI/180) - xCenter);
      vertices.push(radius*Math.sin(i*Math.PI/180) + yCenter);
    }

    // Add marker coordinates
    vertices.push(-1);
    vertices.push(1);
    vertices.push(1);
    vertices.push(1);
    vertices.push(1);
    vertices.push(-1);
    vertices.push(-1);
    vertices.push(-1);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    baseColorLoc = gl.getUniformLocation( program, "baseColor" );
    ctmLoc = gl.getUniformLocation( program, "ctMatrix" );

    var pmLoc = gl.getUniformLocation( program, "projMatrix" );
    var pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
    gl.uniformMatrix4fv(pmLoc, false, flatten(pm));

    // Blocks
    sm = scalem(blockScaling, blockScaling, blockScaling);
    var increment = 0.2;
    for (var i = 0; i < height; i++) {      // Create blocks
        for (var j = 0; j < width; j++) {
            tm = translate(-blockTranslation + increment * i, blockTranslation - increment * j, 0.0);
            ctm = mat4();
            ctm = mult(sm, ctm);    // Scale
            ctm = mult(tm, ctm);    // Translate
            blockMats.push(ctm);
        }
    }

    // Turn walls on and off by mouse click
    canvas.addEventListener("mousedown", function(event){
        var xClick = 2*(event.clientX - event.target.getBoundingClientRect().left)/canvas.width - 1;
        var yClick = 2*(canvas.height - (event.clientY - event.target.getBoundingClientRect().top))/canvas.height - 1;
        xClick += 1;
        yClick -= 1;
        xClick /= 2;
        yClick /= 2;
        xClick = Math.floor(xClick * 10);
        yClick = Math.floor(yClick * 10) * (-1) - 1;
        if (grid[xClick][yClick] === 0)
            grid[xClick][yClick] = 1;
        else if (grid[xClick][yClick] === 1) 
            grid[xClick][yClick] = 0;
        findPath();
    });
    document.getElementById("refresh").onclick = function () {};

    for (var i = 0; i < 10; i++)
    console.log(grid[i]);

    render();
};


function render() {

	gl.clear( gl.COLOR_BUFFER_BIT );

 	for (var i = 0; i < numberOfPoints; i++) {
	    lowest = -1;
	    xLowest;
	    yLowest;
	    if (distances[xPositions[i]][yPositions[i]] !== 999)
	    	findNext(xPositions[i], yPositions[i], iter);
	    if (lowest !== -1 && iter === 10) {
	    	xPositions[i] = xLowest;
	    	yPositions[i] = yLowest;
	    } 
	    drawCircle(xLowest, yLowest); 		
 	}

 	if (iter === 10)
 		iter = 0;
 	else
 		iter++;

 	drawBlocks();

	document.getElementById('print').innerHTML = 'Number of dots that have reached target: ' + numberReached.toString();

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}

function findNext(xPos, yPos, iter) {
	// console.log(xPos + ", " + yPos);
	if (document.getElementById("simOn").checked == true) {
        // Check above, below, left, and right for lowest distance
        if (yPos > 0) {             // Above
            if (distances[xPos][yPos-1] === 999) {
                lowest = 0;
                xLowest = xPos;
                yLowest = yPos - 0.1 * iter;
                if (iter === 10)
                	numberReached++;
            } else if (lowest === -1 && distances[xPos][yPos-1] !== 0) {
                lowest = distances[xPos][yPos-1];
                xLowest = xPos;
                yLowest = yPos - 0.1 * iter;
            } else if (distances[xPos][yPos-1] !== 0 && distances[xPos][yPos-1] < lowest) {
                lowest = distances[xPos][yPos-1];
                xLowest = xPos;
                yLowest = yPos - 0.1 * iter;
            }
        } 
        if (yPos < 9) {     // Below
            if (distances[xPos][yPos+1] === 999) {
                lowest = 0;
                xLowest = xPos;
                yLowest = yPos + 0.1 * iter;
                if (iter === 10)
                	numberReached++;
            } else if (lowest === -1 && distances[xPos][yPos+1] !== 0) {
                lowest = distances[xPos][yPos+1];
                xLowest = xPos;
                yLowest = yPos + 0.1 * iter;
            } else if (distances[xPos][yPos+1] !== 0 && distances[xPos][yPos+1] < lowest) {
                lowest = distances[xPos][yPos+1];
                xLowest = xPos;
                yLowest = yPos + 0.1 * iter;
            }
        }
        if (xPos > 0) {     // Left
            if (distances[xPos-1][yPos] === 999) {
                lowest = 0;
                xLowest = xPos - 0.1 * iter;
                yLowest = yPos;
                if (iter === 10)
                	numberReached++;
            } else if (lowest === -1 && distances[xPos-1][yPos] !== 0) {
                lowest = distances[xPos-1][yPos];
                xLowest = xPos - 0.1 * iter;
                yLowest = yPos;
            } else if (distances[xPos-1][yPos] !== 0 && distances[xPos-1][yPos] < lowest) {
                lowest = distances[xPos-1][yPos];
                xLowest = xPos - 0.1 * iter;
                yLowest = yPos;
            }
        }
        if (xPos < 9) {     // Right
            if (distances[xPos+1][yPos] === 999) {
                lowest = 0;
                xLowest = xPos + 0.1 * iter;
                yLowest = yPos;
                if (iter === 10)
                	numberReached++;
            } else if (lowest === -1 && distances[xPos+1][yPos] !== 0) {
                lowest = distances[xPos+1][yPos];
                xLowest = xPos + 0.1 * iter;
                yLowest = yPos;
            } else if (distances[xPos+1][yPos] !== 0 && distances[xPos+1][yPos] < lowest) {
                lowest = distances[xPos+1][yPos];
                xLowest = xPos + 0.1 * iter;
                yLowest = yPos;
            }
        }
    } else {
    	xLowest = xPos;
    	yLowest = yPos;
    }	
}

function drawCircle(xPos, yPos) {
	// console.log(xPos + ", " + yPos);
    circleMat = mat4();
    sm = scalem(circleScaling, circleScaling, circleScaling);

    xCircleTranslation = -1.0 + blockScaling + (0.2 * xPos);
    yCircleTranslation = 1.0 - blockScaling - (0.2 * yPos);

    tm = translate(xCircleTranslation, yCircleTranslation, 0.0);
    circleMat = mult(sm, circleMat);
    circleMat = mult(tm, circleMat);

    // Draw Circle
    gl.uniform3fv( baseColorLoc, vec3( 0.0, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(ctmLoc, false, flatten(circleMat));
    gl.drawArrays( gl.TRIANGLE_FAN, 0, (vertices.length - 8) / 2 );	
}

function drawBlocks() {
    // Draw Blocks
    var count = 0;
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            if (grid[i][j] === 0) {
                gl.uniform3fv( baseColorLoc, vec3( 0.0, 0.0, 1.0 ) );
                gl.uniformMatrix4fv(ctmLoc, false, flatten(blockMats[count]));
                gl.drawArrays( gl.TRIANGLE_FAN, (vertices.length - 8) / 2, 4);
            } else if (grid[i][j] === 2) {
                gl.uniform3fv( baseColorLoc, vec3( 1.0, 0.0, 0.0 ) );
                gl.uniformMatrix4fv(ctmLoc, false, flatten(blockMats[count]));
                gl.drawArrays( gl.TRIANGLE_FAN, (vertices.length - 8) / 2, 4);
            }
            count++;
        }
    }	
}


function findPath() {
	var i, j, a;
	var start;
	distances = [];
	var graph = [];
	for (i = 0; i < HEIGHT; i++) {
		var line = [];
		for (j = 0; j < WIDTH; j++) {
			if (grid[i][j] === 2) {
				start = {
					"row": i,
					"col": j,
					"access": grid[i][j],
					"dist": 0
				}
				line.push(start);
			} else {
				var temp = {
					"row": i,
					"col": j,
					"access": grid[i][j],
					"dist": 0
				}
				line.push(temp);
			}
		}
		graph.push(line);
	}
	findDistances(graph, start, WIDTH, HEIGHT);
}

function findDistances(g, start, WIDTH, HEIGHT) {
	var frontier = [];
	frontier.push(start);
	var distance = [];
	var found;

	while (frontier.length >= 1) {
		var current = frontier.pop();
		var x = current.row;
		var y = current.col;

		if (x > 0) {
			found = false;
			var up = g[x-1][y];
			if (up.access === 1) {
				if (!checkCellExistence(distance, up)) {
					up.dist = current.dist + 1;
					g[x-1][y].dist = up.dist;
					frontier.push(up);
					frontier.sort(comp);
				}
			}
			distance.push(up);
		}

		if (y < WIDTH - 1) {
			found = false;
			var right = g[x][y+1];
			if (right.access === 1) {
				if (!checkCellExistence(distance, right)) {
					right.dist = current.dist + 1;
					g[x][y+1].dist = right.dist;
					frontier.push(right);
					frontier.sort(comp);
				}
			}
			distance.push(right);
		}

		if (y > 0) {
			found = false;
			var left = g[x][y-1];
			if (left.access === 1) {
				if (!checkCellExistence(distance, left)) {
					left.dist = current.dist + 1;
					g[x][y-1].dist = left.dist;
					frontier.push(left);
					frontier.sort(comp);
				}
			}
			distance.push(left);
		}

		if (x < HEIGHT - 1) {
			found = false;
			var down = g[x+1][y];
			if (down.access === 1) {
				if (!checkCellExistence(distance, down)) {
					down.dist = current.dist + 1;
					g[x+1][y].dist = down.dist;
					frontier.push(down);
					frontier.sort(comp);
				}
			}
			distance.push(down);
		}
	}
	g[start.row][start.col].dist = 999;
	printVec(g, WIDTH, HEIGHT);
}

function checkCellExistence (d, c) {
	var n = d.length;
	for (var i = 0; i < n; i++) {
		if ((d[i].row === c.row) && (d[i].col === c.col))
			return true;
	}
	return false;
}

function printVec (graph, WIDTH, HEIGHT) {
	var i, j;
	// for (i = 0; i < HEIGHT; i++)
	// 	console.log(graph[i]);
	for (i = 0; i < HEIGHT; i++) {
		var line = [];
		for (j = 0; j < WIDTH; j++) {
			line.push(graph[i][j].dist);
		}
		distances.push(line);
		console.log(distances[i]);
	}
}

function comp (a, b) {
	return ((a.row < b.row) && (a.col < b.col));
}