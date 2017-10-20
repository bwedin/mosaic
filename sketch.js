// sketch.js
var rgbGVal = 0;
var tuple = [255, 0, 200];
var shape = "triangle";
var colorsetCount = 2;
var colorsetColorCount = {"colorset-1": 3, "colorset-2": 3, "colorset-3": 3, "colorset-4": 3, "colorset-5": 3};
var CIRCLE_RADIUS = 6;
var INIT_COLORS = 3;
var INIT_COLORSETS = 2;
var MAX_COLORS = 8;
var MAX_COLORSETS = 5;
var NUM_EQ_NODES = 6;
var activeObject;

var width;
var height;

var COLORSET_EQ_BOTTOM = 8;
var COLORSET_EQ_TOP = 140;

var COLORSET_COLOR_1 = "#048ad1";
var COLORSET_COLOR_2 = "#812050";
var COLORSET_COLOR_3 = "#8ddc1c";
var COLORSET_COLOR_4 = "#fd8f2f";
var COLORSET_COLOR_5 = "#f0e746";
var COLORSET_ARRAY = [COLORSET_COLOR_1, COLORSET_COLOR_2, COLORSET_COLOR_3, COLORSET_COLOR_4, COLORSET_COLOR_5];

var colorsetObjects = {};

var circleTest;
var leftBezier;
var rightBezier;

var shapesToDraw = [];
var movingCircleArray = [];
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
    document.getElementById('colorset-1-dot').style.color = COLORSET_COLOR_1;
    document.getElementById('colorset-2-dot').style.color = COLORSET_COLOR_2;
    document.getElementById('colorset-3-dot').style.color = COLORSET_COLOR_3;
    document.getElementById('colorset-4-dot').style.color = COLORSET_COLOR_4;
    document.getElementById('colorset-5-dot').style.color = COLORSET_COLOR_5;

});

function calculateColorsetProportions(steps) {
    let stepIncrement = width/steps;
    let probsByColorset = [];
    // how to evaluate:
    for(let c=1; c<=colorsetCount; c++) {
        colorsetProbs = [];
        // all curves are already sorted from left to right, start with leftmost
        curves = colorsetObjects[c].bezier;
        let activeBezier = 0;
        for(let i=0; i<steps; i++) {
            // get pixel values you need to evaluate on
            // determine which bezier curve applies, then evaluate
            while(curves[activeBezier].getXEnd()<(i*stepIncrement)) {
                activeBezier++;
            }
            let y = curves[activeBezier].getYFromX(i*stepIncrement)
            let prob = Math.round(height-COLORSET_EQ_BOTTOM-y);
            colorsetProbs.push(prob);
        }
        probsByColorset.push(colorsetProbs);
    }
    // now reduce these to probabilities relative to each other (e.g. convert .9,.45,.9 to .4,.2,.4)
    for(let i=0; i<steps; i++) {
        let sumArray = [0];
        let sum = 0;
        probsByColorset.forEach(function(array) {
            sum += array[i];
            sumArray.push(array[i]+sumArray[sumArray.length-1]);
        });
        if(sum>=1) {
            sumArray = sumArray.map(function(num) {
                return num/sum;
            });
        }
        else {
            for(let j=1; j<sumArray.length; j++) {
                console.log('why?')
                sumArray[j] = j*(1/(sumArray.length-1));
            }
        }
        console.log(sumArray);
    }

}

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
        shownObjects = colorsetObjects[colorsetCount];
        shownObjects.bezier.forEach(function(obj) { obj.hide();})
        shownObjects.circle.forEach(function(obj) { obj.hide();})

        let removeDiv = '#colorset-' + colorsetCount;
        $(removeDiv).toggle(); 
        colorsetCount--;
    }
    if(colorsetCount == 1) {
        $('#remove-colorset').prop('disabled', true);
    }
    calculateColorsetProportions(20);
}

function addColorset() {
    $('#remove-colorset').prop('disabled', false);
    if(colorsetCount < MAX_COLORSETS) {
        colorsetCount++;
        let newDiv = '#colorset-' + colorsetCount;
        $(newDiv).toggle();
        hiddenObjects = colorsetObjects[colorsetCount];
        hiddenObjects.bezier.forEach(function(obj) { obj.show();})
        hiddenObjects.circle.forEach(function(obj) { obj.show();})
    }
    if(colorsetCount == MAX_COLORSETS) {
        $('#add-colorset').prop('disabled', true);
    }
}

// setup p5
function setup() {
    var canvas = createCanvas(500, 500);
    windowResized();
    canvas.parent('sketch-holder');
    // need a string of bezier curves

    // hide all ones we don't want
    for(i=1; i<=MAX_COLORSETS; i++) {
        //adding colorpickers
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

        //adding bezier curves/EQ circles to canvas
        // draw all beziers, add to array
        // bezier array rhymes, maybe?
        // add start, iterate through length of beziers-1, add end
        let bezierArray = [];
        let circleArray = [];
        c = color(COLORSET_ARRAY[i-1]);
        for(let j=0; j<NUM_EQ_NODES-1; j++) {
            bezierObj = MovingBezierHorizontal(0,0,width,0,c);
            shapesToDraw.push(bezierObj);
            bezierArray.push(bezierObj);
            if (i>INIT_COLORSETS) { bezierObj.hide(); }
        }
        circleObj =  MovingCircleStartpoint(0,height-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,c,bezierArray[0]);
        shapesToDraw.push(circleObj);
        clickableObjects.push(circleObj);
        movingCircleArray.push(circleObj);
        circleArray.push(circleObj);
        if (i>INIT_COLORSETS) { circleObj.hide(); }
        for(let j=0; j<bezierArray.length-1; j++) {
            circleObj =  MovingCircleMidpoint(width*((j+1)/5),height-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,c,bezierArray[j],bezierArray[j+1]);
            shapesToDraw.push(circleObj);
            clickableObjects.push(circleObj);
            movingCircleArray.push(circleObj);
            circleArray.push(circleObj);
            if (i>INIT_COLORSETS) { circleObj.hide(); }
        }
        circleObj =  MovingCircleEndpoint(width,height-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,c,bezierArray[bezierArray.length-1]);
        shapesToDraw.push(circleObj);
        clickableObjects.push(circleObj);
        movingCircleArray.push(circleObj);
        circleArray.push(circleObj);
        if (i>INIT_COLORSETS) { circleObj.hide(); }
        colorsetObjects[i] = {'bezier': bezierArray, 'circle': circleArray};
    }
}

// width is a scaling transform, height is a vertical offset relative to the bottom
function repositionMovingCircles(oldWidth, oldHeight) {
    // windowWidth
    // windowHeigh
    let newHeight = height;
    let newWidth = width;
    movingCircleArray.forEach( function(obj) {
        if(obj.lock) {
            obj.unlock();
            obj.setPosition(obj.getX()*(newWidth/oldWidth),newHeight-(oldHeight-obj.getY()));
            obj.lock();
        }
        else {
            obj.setPosition(obj.getX()*(newWidth/oldWidth),newHeight-(oldHeight-obj.getY()));
        }
    })
}

function drawTriangle(sideLength, bottomPosX, bottomPosY, xDirection, color) {
    fill(color);
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

const gettableXY = (obj) => ({
    getX: () => {
        return obj.xPos;
    },
    getY: () => {
        return obj.yPos;
    },
});

const gettableBezierXY = (obj) => ({
    getXStart: () => {
        return obj.xPosStart;
    },
    getXEnd: () => {
        return obj.xPosEnd;
    },
    getYFromX: (x) => {
        let pct = (x-obj.xPosStart)/(obj.xPosEnd-obj.xPosStart);
        return bezierPoint(obj.yPosStart, obj.yPosStart, obj.yPosEnd, obj.yPosEnd, pct);
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
    },
    rescalePosition: (x,y) => {
        obj.yPos = y;
        obj.leftObj.setEnd(window.canvas,y);
        obj.rightObj.setStart(0,y);
        obj.leftObj.setEnd(x,y);
        obj.rightObj.setStart(x,y);
        obj.xPos = x;
    }
});

const moveableXYStartpointHorizontal = (obj) => ({
    setPosition: (x,y) => {
        obj.yPos = y;
        if(!obj.rightObj.setStart(obj.xPos,y)) {
            obj.leftObj.setEnd(obj.xPos,y)
        }
        else if(obj.lock) {
            obj.leftObj.setEnd(obj.xPos,y)
        }
        else {
            obj.xPos = x;
        }
        // don't move x, it should be anchored
    },
    hasLock: () => {
        return true;
    },
    unlock: () => {
        obj.lock = false;
    },
    lock: () => {
        obj.lock = true;
    }
});

const moveableXYEndpointHorizontal = (obj) => ({
    setPosition: (x,y) => {
        obj.yPos = y;
        if(!obj.leftObj.setEnd(x,y)) {
            obj.leftObj.setEnd(obj.xPos,y)
        }
        else if(obj.lock) {
            obj.leftObj.setEnd(obj.xPos,y)
        }
        else {
            obj.xPos = x;
        }
    },
    hasLock: () => {
        return true;
    },
    unlock: () => {
        obj.lock = false;
    },
    lock: () => {
        obj.lock = true;
    }
});

const drawableCircle = (obj) => ({
    draw: () => {
        fill(obj.color);
        noStroke();
        ellipse(obj.xPos, obj.yPos, obj.radius*2, obj.radius*2);
    }
});

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
            console.log('aaa')
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
            console.log('bbb')
            return false;
        }
        else {
            obj.xPosEnd = x;
            return true;
        }
    }
});

const hideable = (obj) => ({
    isShown: () => {
        return obj.shown;
    },
    show: () => {
        obj.shown = true;
    },
    hide: () => {
        obj.shown = false;
    },
});

const MovingCircle = (xPos,yPos,radius,color)  => {
    var state = {
        xPos,yPos,radius,color,
        shown: true
    }
    return Object.assign(
        {},
        clickableCircle(state),
        drawableCircle(state),
        moveableXY(state),
        gettableXY(state),
        hideable(state)
    )
};

const MovingCircleStartpoint = (xPos,yPos,radius,color,rightObj)  => {
    var state = {
        xPos,yPos,radius,color,rightObj,
        shown: true,
        lock: true
    }
    rightObj.setStart(xPos,yPos);
    return Object.assign(
        {},
        clickableCircle(state),
        drawableCircle(state),
        moveableXYStartpointHorizontal(state),
        gettableXY(state),
        hideable(state)
    )
};

const MovingCircleEndpoint = (xPos,yPos,radius,color,leftObj)  => {
    var state = {
        xPos,yPos,radius,color,leftObj,
        shown: true,
        lock: true
    }
    leftObj.setEnd(xPos,yPos);
    return Object.assign(
        {},
        clickableCircle(state),
        drawableCircle(state),
        moveableXYEndpointHorizontal(state),
        gettableXY(state),
        hideable(state)
    )
};

const MovingCircleMidpoint = (xPos,yPos,radius,color,leftObj,rightObj)  => {
    var state = {
        xPos,yPos,radius,color,leftObj,rightObj,
        shown: true
    }
    leftObj.setEnd(xPos,yPos);
    rightObj.setStart(xPos,yPos);
    return Object.assign(
        {},
        clickableCircle(state),
        drawableCircle(state),
        moveableXYMidpointHorizontal(state),
        gettableXY(state),
        hideable(state)
    )
};

const MovingBezierHorizontal = (xPosStart,yPosStart,xPosEnd,yPosEnd,color)  => {
    var state = {
        xPosStart,yPosStart,xPosEnd,yPosEnd,color,
        shown: true
    }
    return Object.assign(
        {},
        moveableStartEndXYHorizontal(state),
        drawableBezierHorizontal(state),
        hideable(state),
        gettableBezierXY(state)
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
    if(obj.isMouseInside() && obj.isShown()) {
        activeObject = obj;
        return;
    }
  })
  return;
}

function mouseReleased() {
    activeObject = null;
}

function mouseDragged() {
    if (mouseY>height-COLORSET_EQ_BOTTOM) {
        mouseY = height-COLORSET_EQ_BOTTOM;
    }
    else if (mouseY<height-COLORSET_EQ_TOP) {
        mouseY = height-COLORSET_EQ_TOP;
    }
    if (mouseX<0) {
        mouseX = 0;
    }
    else if (mouseX>width) {
        mouseX = width;
    }
    if(activeObject) {
        activeObject.setPosition(mouseX,mouseY);
    }
}

function windowResized() {
    oldHeight = height;
    oldWidth = width;
    if(windowWidth<1350) {
        resizeCanvas(700,150+700*(9/16));
    }
    else if(windowWidth>=1350 && windowWidth<1600) {
        resizeCanvas(1000,150+1000*(9/16));
    }
    else {
        resizeCanvas(1200,150+1200*(9/16));
    }
    if(width>oldWidth) {
        movingCircleArray.sort(function(a, b) {
            return b.getX() - a.getX();
        });
        repositionMovingCircles(oldWidth,oldHeight);
    }
    else if(width<oldWidth) {
        movingCircleArray.sort(function(a, b) {
            return a.getX() - b.getX();
        });
        repositionMovingCircles(oldWidth,oldHeight);
    }
}

function drawProportionBox() {
    let dashedLineLength = 10;
    let gapX = 20;
    let fontSize=12;
    let nudge = 2;
    let strokeWeightVar = 1;
    stroke(30);
    strokeWeight(strokeWeightVar);
    noFill();
    // top line segment, 0 space, second line segment
    line(0,height-COLORSET_EQ_TOP,gapX-dashedLineLength,height-COLORSET_EQ_TOP);
    line(gapX+dashedLineLength*2,height-COLORSET_EQ_TOP,width-strokeWeightVar,height-COLORSET_EQ_TOP);
    // bottom line segment, 100 space, second line segment
    line(0,height-COLORSET_EQ_BOTTOM,gapX-dashedLineLength,height-COLORSET_EQ_BOTTOM);
    line(gapX+dashedLineLength*2,height-COLORSET_EQ_BOTTOM,width-strokeWeightVar,height-COLORSET_EQ_BOTTOM);
    // left and right line segments
    line(0,height-COLORSET_EQ_TOP,0,height-COLORSET_EQ_BOTTOM)
    line(width-strokeWeightVar,height-COLORSET_EQ_TOP,width-strokeWeightVar,height-COLORSET_EQ_BOTTOM)
    //25,50,75 - 10 pixels on, 10 pixels off
    let end = 0;
    
    pct25Y = (height-COLORSET_EQ_BOTTOM)-(COLORSET_EQ_TOP-COLORSET_EQ_BOTTOM)*.25;
    pct50Y = (height-COLORSET_EQ_BOTTOM)-(COLORSET_EQ_TOP-COLORSET_EQ_BOTTOM)*.50;
    pct75Y = (height-COLORSET_EQ_BOTTOM)-(COLORSET_EQ_TOP-COLORSET_EQ_BOTTOM)*.75;
    while(end<width) {
        if(end!=gapX) {
            line(end,pct25Y,end+dashedLineLength,pct25Y);
            line(end,pct50Y,end+dashedLineLength,pct50Y);
            line(end,pct75Y,end+dashedLineLength,pct75Y);
        }
        end += dashedLineLength*2;
    }
    fill(0)
    textSize(12);
    textAlign("left");
    text("0", gapX-nudge, height-COLORSET_EQ_BOTTOM+fontSize/3);
    text("25", gapX-nudge, pct25Y+fontSize/3);
    text("50", gapX-nudge, pct50Y+fontSize/3);
    text("75", gapX-nudge, pct75Y+fontSize/3);
    text("100", gapX-nudge, height-COLORSET_EQ_TOP+fontSize/3);

    // rect(0+strokeWeightVar/2,height-COLORSET_EQ_TOP,width-strokeWeightVar,COLORSET_EQ_TOP-COLORSET_EQ_BOTTOM);
    strokeWeight(1);

}

// main p5 loop
function draw() {
    background(245);
    drawProportionBox();
    shapesToDraw.forEach( function (shape) {
        if(shape.isShown()) {
            shape.draw();
        }
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