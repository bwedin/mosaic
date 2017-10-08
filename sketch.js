// sketch.js
var rgbGVal = 0;
var tuple = [255, 0, 200];
var shape = "triangle";
var colorsetCount = 2;
var colorsetColorCount = {"colorset-1": 3, "colorset-2": 3, "colorset-3": 3, "colorset-4": 3, "colorset-5": 3}
var INIT_COLORS = 3;
var INIT_COLORSETS = 2;
var MAX_COLORS = 8;
var MAX_COLORSETS = 5;
var activeObject;

var circleTest;
var leftBezier;
var rightBezier;

var shapesToDraw = [];
var clickableObjects = [];

$(document).ready(function(){



    // $(function() {
    //     $('#colorset-1-color-1').colorpicker({
    //         format: 'rgb'
    //     });
    // });

    // $(function() {
    //     $('#colorset-1-color-1').colorpicker().on('hidePicker', function(e) {
    //     		console.log(e);
    //         rgba = e.color.toRGB();
    //         tuple = [rgba.r, rgba.g, rgba.b];
    //         console.log(tuple);
    //     });
    // });

    // hide all ones we don't want
    for(i=1; i<=MAX_COLORSETS; i++) {
        if(i>INIT_COLORSETS) {
            let colorsetDiv = '#colorset-' + i;
            $(colorsetDiv).toggle();
        }
        for (j=1; j<=MAX_COLORS; j++) {
            let colorpickerDiv = '#colorset-' + i + '-color-' + j;
            if (j>INIT_COLORS) {
                $(colorpickerDiv).toggle();
            }
            else {
                $(function() {
                    $(colorpickerDiv).colorpicker({
                        format: 'rgb',
                        color: '#FFFFFF'
                    });
                });
            }
        }
    }

});

function removeColor(colorsetDiv) {
    $('#add-'+colorsetDiv).prop('disabled', false);
    let removeColorNum = colorsetColorCount[colorsetDiv];
    if(removeColorNum>1) {
        let newDiv = '#' + colorsetDiv + '-color-' + removeColorNum;
        $(newDiv).toggle(); 
        colorsetColorCount[colorsetDiv]--;
    }
    if(colorsetColorCount[colorsetDiv] == 1) {
        $('#remove-'+colorsetDiv).prop('disabled', true);
    }
}

function addColor(colorsetDiv) {
    $('#remove-'+colorsetDiv).prop('disabled', false);
	let newColorNum = colorsetColorCount[colorsetDiv] + 1;
    console.log(newColorNum);
	if(newColorNum <= MAX_COLORS) {
        colorsetColorCount[colorsetDiv]++;
		let newDiv = '#' + colorsetDiv + '-color-' + newColorNum;
        $(newDiv).toggle();  
        $(newDiv).colorpicker({
            format: 'rgb',
            color: '#FFFFFF'
        });
	}
    if(colorsetColorCount[colorsetDiv] == MAX_COLORS) {
        $('#add-'+colorsetDiv).prop('disabled', true);
    }
}

function removeColorset() {
    $('#add-colorset').prop('disabled', false);
    $('#colorset-1').collapse('hide');

    if(colorsetCount>1) {
        let removeDiv = '#colorset-' + colorsetCount;
        $(removeDiv).toggle(); 
        colorsetCount--;
    }
    if(colorsetCount == 1) {
        $('#remove-colorset').prop('disabled', true);
    }
}

function addColorset() {
    $('#remove-colorset').prop('disabled', false);
    if(colorsetCount < MAX_COLORSETS) {
        colorsetCount++;
        let newDiv = '#colorset-' + colorsetCount;
        $(newDiv).toggle();
    }
    if(colorsetCount == MAX_COLORSETS) {
        $('#add-colorset').prop('disabled', true);
    }
}

// setup p5
function setup() {
    var canvas = createCanvas(500, 500);
    canvas.parent('sketch-holder');
    background(tuple);
    background(tuple);
    c = color('#00ff00');
    drawTriangle(30,300,300,1,c,0.6);
    c = color('#0000ff');
    drawTriangle(30,400,350,-1,c,0.6);
    c = color('#ff0000');
    leftBezier = movingBezierHorizontal(100,400,200,200,c);
    shapesToDraw.push(leftBezier);
    rightBezier = movingBezierHorizontal(200,200,400,400,c);
    shapesToDraw.push(rightBezier);
    circleTest =  movingCircleMidpoint(200,200,10,c,0.1,leftBezier,rightBezier);
    shapesToDraw.push(circleTest);
    clickableObjects.push(circleTest);
    
}

function drawTriangle(sideLength, bottomPosX, bottomPosY, xDirection, color, opacity) {
    fill(color,opacity);
    noStroke();
    // Math.sqrt(3)/2
    xMid = bottomPosX+((sideLength*xDirection)*Math.sqrt(3)/2)
    yMid = bottomPosY-sideLength/2;
    xLast = bottomPosX; 
    yLast = bottomPosY-sideLength;
    triangle(bottomPosX,bottomPosY,xMid,yMid,xLast,yLast);
    return;
}

const clickableCircle = (obj) => ({
    isMouseInside: () => {
        var d = dist(mouseX, mouseY, obj.xPos, obj.yPos);
        if (d < obj.radius) {
            return true;
        } 
        else {
            return false;
        }
    }
});

const moveableXY = (obj) => ({
    setPosition: (x,y) => {
        obj.xPos = x;
        obj.yPos = y;
    }
});

const moveableXYMidpointHorizontal = (obj) => ({
    setPosition: (x,y) => {
        obj.yPos = y;
        if(!obj.leftObj.setEnd(x,y) || !obj.rightObj.setStart(x,y)) {
            obj.leftObj.setEnd(obj.xPos,obj.yPos);
            obj.rightObj.setStart(obj.xPos,obj.yPos);
        }
        else {
            obj.xPos = x;
        }
    }
});

const drawableCircle = (obj) => ({
    draw: () => {
        fill(obj.color,obj.opacity);
        noStroke();
        ellipse(obj.xPos, obj.yPos, obj.radius*2, obj.radius*2);
    }
});

const movingCircleMidpoint = (xPos,yPos,radius,color,opacity,leftObj,rightObj)  => {
    var state = {
        xPos,yPos,radius,color,opacity,leftObj,rightObj
    }
    leftObj.setEnd(xPos,yPos);
    rightObj.setStart(xPos,yPos);
    return Object.assign(
        {},
        clickableCircle(state),
        drawableCircle(state),
        moveableXYMidpointHorizontal(state)
    )
};

const drawableBezierHorizontal = (obj) => ({
    draw: () => {
        noFill();
        xLength = obj.xPosEnd-obj.xPosStart;
        stroke(obj.color);
        bezier(obj.xPosStart, obj.yPosStart, obj.xPosEnd-xLength/4, obj.yPosStart, obj.xPosStart+xLength/4, obj.yPosEnd, obj.xPosEnd, obj.yPosEnd);
    }
});

const moveableStartEndXYHorizontal = (obj) => ({
    setStart: (x,y) => {
        obj.yPosStart = y;
        if(obj.xPosEnd<x){
            return false;
        }
        else {
            obj.xPosStart = x;
            return true;
        }
    },
    setEnd: (x,y) => {
        obj.yPosEnd = y;
        if(obj.xPosStart>x){
            return false;
        }
        else {
            obj.xPosEnd = x;
            return true;
        }
    }
});

const movingCircle = (xPos,yPos,radius,color,opacity)  => {
    var state = {
        xPos,yPos,radius,color,opacity
    }
    return Object.assign(
        {},
        clickableCircle(state),
        drawableCircle(state),
        moveableXY(state)
    )
};

const movingBezierHorizontal = (xPosStart,yPosStart,xPosEnd,yPosEnd,color)  => {
    var state = {
        xPosStart,yPosStart,xPosEnd,yPosEnd,color
    }
    return Object.assign(
        {},
        moveableStartEndXYHorizontal(state),
        drawableBezierHorizontal(state)
    )
};

// const barker = (state) => ({
//   bark: () => {
//     console.log('Woof, I am ' + state.name);
//     console.log('second line')
//     }
// })
// const driver = (state) => ({
//   drive: () => 
//     state.position = state.position + state.speed
// })

// const murderRobotDog = (name)  => {
//   let state = {
//     name,
//     speed: 100,
//     position: 0
//   }
//   return Object.assign(
//         {},
//         barker(state),
//         driver(state)
//     )
// }


// need a collection of all "interactable objects"
// anytime there's a mouse press, do some function to check all xpos, ypos of these objects
// 

// dist function helps for circles, can do box if rect

function mousePressed() {
  // Check if mouse is inside the circle
  clickableObjects.forEach( function(obj) {
    if(obj.isMouseInside()) {
        activeObject = obj;
        console.log('found!')
        return;
    }
  })
  return;
}

function mouseReleased() {
    activeObject = null;
}

function mouseDragged() {
    if(activeObject) {
        console.log('draggin');
        activeObject.setPosition(mouseX,mouseY);
    }
}

function windowResized() {
    if(windowWidth<1350) {
        resizeCanvas(700,150+700*(9/16));
    }
    else if(windowWidth>=1350 && windowWidth<1600) {
        resizeCanvas(1000,150+1000*(9/16));
    }
    else {
        resizeCanvas(1200,150+1200*(9/16));
    }
}

// main p5 loop
function draw() {
    background(200);
    shapesToDraw.forEach( function (shape) {
        shape.draw();
    })
	shape = $('#shape-toggle input:radio:checked').val();
	tuple[1] = tuple[1]+1;
    noFill();
    stroke(0, 0, 0);
    var first = [10,85]
    var second = [85,10];
    bezier(first[0], first[1], second[0]-20, first[1], first[0]+20, second[1], second[0], second[1]);
    bezier(first[0], first[1], first[0], first[1], second[0], second[1], second[0], second[1]);

}