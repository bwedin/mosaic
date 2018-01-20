// todo bw: have a few different presets, randomly pick between the 7-8?

// sketch.js
var fullCanvas = null;
var shape = "diamond";
var columnVal = 60;
var shapeFieldReady = false;
// colorset variables
var INIT_COLORS = 3;
var INIT_COLORSETS = 2;
var MAX_COLORS = 8;
var MAX_COLORSETS = 5;
var WINDOW_BOTTOM_PADDING = 10;
var colorsetCount = 2;
var colorsetColorCount = {"colorset-1": 3, "colorset-2": 3, "colorset-3": 3, "colorset-4": 3, "colorset-5": 3};
var colorArray = {};
var alphaArray = {};
var colorset_color_1 = "#812050";
var colorset_color_2 = "#048ad1" ;
var colorset_color_3 = "#8ddc1c";
var colorset_color_4 = "#9159de";
var colorset_color_5 = "#fd8f2f";
var colorsetColorKey = {1: colorset_color_1, 2: colorset_color_2, 3: colorset_color_3,
  4: colorset_color_4, 5: colorset_color_5};
var colorsetObjects = {};
// some default colors
var fallColorset = ["rgb(232,19,19)", "rgb(235,182,38)", "rgb(246,238,0)", "rgb(28,9,9)",
  "rgb(227,174,140)", "rgb(151,92,48)", "rgb(156,26,84)", "rgb(228,105,129)"];
var winterColorset = ["rgb(50,49,238)", "rgb(77,17,148)", "rgb(119,209,253)", "rgb(141,87,255)",
  "rgb(89,250,234)", "rgb(71,111,216)", "rgb(22,146,148)", "rgb(92,108,131)"];
var springColorset = ["rgb(221,61,202)", "rgb(169,104,210)", "rgb(252,194,251)", "rgb(88,37,105)",
  "rgb(191,214,250)", "rgb(246,86,139)", "rgb(242,145,128)", "rgb(97,8,232)"];
var summerColorset = ["rgb(11,83,19)", "rgb(42,150,86)", "rgb(87,226,76)", "rgb(195,239,178)",
  "rgb(11,19,6)", "rgb(200,242,81)", "rgb(53,224,169)", "rgb(134,151,100)"];
// shape drawing (proportion box)
var shapesToDraw = [];
// proportion box variables
var COLORSET_EQ_BOTTOM = 8;
var COLORSET_EQ_TOP = 140;
var CIRCLE_RADIUS = 8;
var NUM_EQ_NODES = 6;
var movingCircleArray = [];
var clickableObjects = [];
var colorTiles = {};
var activeObject;
// refresh variables
var START_TIME = new Date() / 1000;
var refreshRate = null;
var historyFraction = 0.75;
var nextTime = START_TIME+refreshRate;
var nowTime = START_TIME;
var isFrozen = false;
$(document).ready(function(){
    let elements = null;
    // for(let i=0;i<elements.length;i++){
    //   elements[i].style.color = colorset_color_1;
    // };
    // document.getElementById('colorset-1').style.color = colorset_color_1;
    // document.getElementById('colorset-2').style.color = colorset_color_2;
    // document.getElementById('colorset-3').style.color = colorset_color_3;
    // document.getElementById('colorset-4').style.color = colorset_color_4;
    // document.getElementById('colorset-5').style.color = colorset_color_5;
    $('#num-columns').on('input change', function(e) {
        $('#num-columns-display').text(e.target.value);
    });
    $('#smoothing').on('input change', function(e) {
      updateSmoothing();
    });
    $('#refresh-seconds').on('change', function(e) {
      updateRefreshRate('#refresh-seconds');
    });
    $('#refresh-per-minute').on('change', function(e) {
        updateRefreshRate('#refresh-per-minute');
    });
    updateSmoothing();
    updateRefreshRate('#refresh-per-minute');
    $('#num-columns-display').text($('#num-columns').val());
});
function setColors(colorset,name,isRandom) {
  let colorsToUse = null;
  if (name==='fall') {
    colorsToUse = fallColorset;
  }
  else if (name==='winter') {
    colorsToUse = winterColorset;
  }
  else if (name==='spring') {
    colorsToUse = springColorset;
  }
  else {
    colorsToUse = summerColorset;
  }

  if(isRandom) {
    colorsToUse = colorsToUse.shuffle();
  }
  colorsToUse = colorsToUse.slice();
  for(var i=1; i<=MAX_COLORS; i++) {
    let colorpickerDiv = '#'+colorset+'-color-'+i;
    $(colorpickerDiv).colorpicker().data('colorpicker').setValue(colorsToUse[i-1]);
  }
}
function getYPosFromPercent(pct) {
  pct=pct/100;
  // find bottom position (0%), then offset an additional amount by (colorset eq width)*pct
  return height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM-pct*(COLORSET_EQ_TOP-COLORSET_EQ_BOTTOM);
}
function getXPosFromPercent(pct) {
  pct=pct/100;
  // find bottom position (0%), then offset an additional amount by (colorset eq width)*pct
  return width*pct;
}
function setColorsetProportions(colorsetNum,type) {
  let coordinateArray = null;
  if(type==='leftHalf') {
    coordinateArray = [[0,100],[100*1/5,95],[100*2/5,90],[100*3/5,10],[100*4/5,0],[100,0]];
  }
  else {
    coordinateArray = [[0,0],[100*1/5,0],[100*2/5,10],[100*3/5,90],[100*4/5,95],[100,100]];
  }
  let circles = colorsetObjects[colorsetNum].circle;
  circles.forEach(function(circle,idx) {
    circle.setPosition(getXPosFromPercent(coordinateArray[idx][0]),getYPosFromPercent(coordinateArray[idx][1]));
  });
  // obj.setPosition(obj.getX()*(newWidth/oldWidth),newHeight-(oldHeight-obj.getY()));
}
function setupStartView() {
  //Sun & Ice - https://www.youtube.com/watch?v=tlEinFS01lk
  setColors('colorset-1','fall',false);
  setColors('colorset-2','winter',false);
  setColors('colorset-3','summer',false);
  setColors('colorset-4','spring',false);
  setColorsetProportions(1,'leftHalf');
  setColorsetProportions(2,'rightHalf');
}
// function showPreset(id) {
//     'rgb(,,)'
// }
// main p5
function setup() {
    noSmooth();
    fullCanvas = createCanvas(500, 500);
    fullCanvas.parent('sketch-holder');
    windowResized();
    $('.colorset-1').css('color',colorset_color_1);
    $('.colorset-2').css('color',colorset_color_2);
    $('.colorset-3').css('color',colorset_color_3);
    $('.colorset-4').css('color',colorset_color_4);
    $('.colorset-5').css('color',colorset_color_5);
    // hide all ones we don't want
    for(let i=1; i<=MAX_COLORSETS; i++) {
        //adding colorpickers
        if(i>INIT_COLORSETS) {
            let colorsetDiv = '#colorset-' + i;
            $(colorsetDiv).toggle();
        }
        for (let j=1; j<=MAX_COLORS; j++) {
            let colorpickerDiv = '#colorset-' + i + '-color-' + j;
            if (j>INIT_COLORS) {
                $(colorpickerDiv).colorpicker({
                  format: 'rgb',
                  color: 'rgb(255,255,254)'
                });
                $(colorpickerDiv).toggle();
            }
            else {
                $(colorpickerDiv).colorpicker({
                        format: 'rgb',
                        color: 'rgb(255,255,254)'
                });
            }
        }

        // adding bezier curves/EQ circles to canvas
        // draw all beziers, add to array
        // add start, iterate through length of beziers-1, add end
        let bezierArray = [];
        let circleArray = [];
        for(let j=0; j<NUM_EQ_NODES-1; j++) {
            let bezierObj = MovingBezierHorizontal(0,0,width,0,i);
            shapesToDraw.push(bezierObj);
            bezierArray.push(bezierObj);
            if (i>INIT_COLORSETS) { bezierObj.hide(); }
        }
        let circleObj =  MovingCircleStartpoint(0,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,i,bezierArray[0],i);
        shapesToDraw.push(circleObj);
        clickableObjects.push(circleObj);
        movingCircleArray.push(circleObj);
        circleArray.push(circleObj);
        if (i>INIT_COLORSETS) { circleObj.hide(); }
        for(let j=0; j<bezierArray.length-1; j++) {
            circleObj =  MovingCircleMidpoint(width*((j+1)/5),height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,i,bezierArray[j],bezierArray[j+1],i);
            shapesToDraw.push(circleObj);
            clickableObjects.push(circleObj);
            movingCircleArray.push(circleObj);
            circleArray.push(circleObj);
            if (i>INIT_COLORSETS) { circleObj.hide(); }
        }
        circleObj =  MovingCircleEndpoint(width,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,i,bezierArray[bezierArray.length-1],i);
        shapesToDraw.push(circleObj);
        clickableObjects.push(circleObj);
        movingCircleArray.push(circleObj);
        circleArray.push(circleObj);
        if (i>INIT_COLORSETS) { circleObj.hide(); }
        colorsetObjects[i] = {'bezier': bezierArray, 'circle': circleArray};
    }
  background(255);
  stroke(0, 0, 0);
  noFill();
  shapeFieldReady = true;
  setupStartView();
}
function drawShapeField() {
  if(shapeFieldReady) {
    background(255);
    drawMain();
    stroke(0, 0, 0);
    noFill();
  }
}
function draw() {
  nowTime = new Date() / 1000;
  if(nowTime>nextTime && !isFrozen) {
    drawShapeField();
    nextTime = nowTime + refreshRate;
  }
  // noFill();
  // stroke(0, 0, 0);
  // rect(0,width*9/16,width,height);
  drawProportionBox();
  shapesToDraw.forEach( function (shape) {
    if(shape.isShown()) {
      shape.draw();
    }
  });
}
// drawing functions (misc)
function findColorRNG(proportions, alphas){
  let val = Math.random();
  for(let idx=1; idx<=proportions.length; idx++) {
    let p = proportions[idx];
    if(p>val){
      let colorsetNumber = idx;
      let colorChoices = colorArray[colorsetNumber];
      let colorRGB = colorChoices[Math.floor(Math.random()*colorChoices.length)];
      let alphaChoices = alphaArray[colorsetNumber];
      // todo bw also change this
      // alphaChoices = alphas
      if(historyFraction>0) {
        return [colorRGB.r, colorRGB.g, colorRGB.b, 255];
      }
      else {
        let alpha = Number(alphaChoices[Math.floor(Math.random() * alphaChoices.length)]);
        // console.log(alpha);
        // todo bw change this
        return [colorRGB.r, colorRGB.g, colorRGB.b, alpha];
      }
    }
  }
}
function calculateColorsetProportionsShared(steps) {
  let stepIncrement = width/steps;
  let probsByColorset = [];
  let sumArrays = [];
  // how to evaluate:
  for(let c=1; c<=colorsetCount; c++) {
    let colorsetProbs = [];
    // all curves are already sorted from left to right, start with leftmost
    let curves = colorsetObjects[c].bezier;
    let activeBezier = 0;
    for(let i=0; i<steps; i++) {
      // get pixel values you need to evaluate on
      // determine which bezier curve applies, then evaluate
      while(curves[activeBezier].getXEnd()<(i*stepIncrement)) {
        activeBezier++;
      }
      let y = curves[activeBezier].getYFromX(i*stepIncrement)
      let prob = Math.round(height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM-y);
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
        sumArray[j] = j*(1/(sumArray.length-1));
      }
    }
    sumArrays.push(sumArray);
  }
  return sumArrays;
}
function updateColorArray() {
  for(let i=1; i<= colorsetCount; i++) {
    let colorsetName = 'colorset-' + i;
    let colorCount = colorsetColorCount[colorsetName];
    let colorsetArray = [];
    let rKey = 0;
    let gKey = 0;
    let bKey = 0;
    for(let j=1; j<=colorCount; j++){
      let colorpickerName = '#' + colorsetName + '-color-' + j;
      let newColor = $(colorpickerName).colorpicker().data('colorpicker').color.toRGB();
      colorsetArray.push(newColor);
      rKey = rKey + newColor.r;
      gKey = gKey + newColor.g;
      bKey = bKey + newColor.b;
    }

    colorArray[i] = colorsetArray;
    let alphaName = colorsetName+'-opacity';
    let singleAlphaArray = [];
    // todo bw not just colorset-1;
    $('[name='+alphaName+']:checked').each(function(i){
      singleAlphaArray.push($(this).val());
    });
    if(singleAlphaArray.length===0) {
      singleAlphaArray = [255];
    }
    alphaArray[i] = singleAlphaArray;
    if((rKey+gKey+bKey)/colorCount/3 > 140) {
      rKey = rKey*0.5;
      gKey = gKey*0.5;
      bKey = bKey*0.5
    }

    let rKeyDark = Math.round(rKey*0.9/colorCount).toString(16).padStart(2, '0');
    let gKeyDark = Math.round(gKey*0.9/colorCount).toString(16).padStart(2, '0');
    let bKeyDark = Math.round(bKey*0.9/colorCount).toString(16).padStart(2, '0');
    let newDarkColorsetColor = '#' + rKeyDark + gKeyDark + bKeyDark;

    rKey = Math.round(rKey/colorCount).toString(16).padStart(2, '0');
    gKey = Math.round(gKey/colorCount).toString(16).padStart(2, '0');
    bKey = Math.round(bKey/colorCount).toString(16).padStart(2, '0');
    let newColorsetColor = '#' + rKey + gKey + bKey;
    colorsetColorKey[i] = newColorsetColor;
    $('.' + colorsetName).css('color',newColorsetColor);

    // todo bw make these behave more like outline boxes?? or an expanding div that contains the text itself
    $('.background-' + colorsetName).css('background-color',newColorsetColor);

    // todo bw add a colorset clicked class instead
    $(' .expanded.background-' + colorsetName).css('background-color',newDarkColorsetColor);
  }
}
function drawMain() {
  let shapeType = $('#shape-toggle input:radio:checked').val();
  if(shapeType!=shape) {
    colorTiles = {};
    shape = shapeType;
  }
  // should update all colorsets etc in memory
  let val = $('#num-columns').val();
  if (val==0) {
    val=1;
  }
  if(val!=columnVal) {
    // colorTiles = {};
    columnVal = val;
  }
  // numberColumns = 1;
  let alphaValues = [100,150,220];
  updateColorArray();
  if (shape==='triangle') {
    drawTriangleField(columnVal, alphaValues);
  }
  else if (shape==='square') {
    drawSquareField(columnVal, alphaValues);
  }
  else {
    drawDiamondField(columnVal, alphaValues);
  }
}
// drawing functions (shape-specific)
function drawTriangleField(numberColumns,alphaValues) {
  let fieldHeight = Math.ceil(width*(9/16));
  let columnWidth = width/numberColumns;
  if(columnWidth%1!=0) {
    columnWidth = Math.floor(columnWidth);
    numberColumns = Math.ceil(width/columnWidth);
    numberColumns++;
  }
  else {
  }
  let colorsetProportions = calculateColorsetProportionsShared(numberColumns);
  let columnHeight = width*(9/16);
  let yPosTop = 0;
  for(let i=0; i<numberColumns; i++) {
    let xPosL = i*columnWidth;
    let yPosTop = 0;
    drawTriangleColumn(columnWidth,columnHeight,xPosL,yPosTop,colorsetProportions[i],alphaValues,i)
  }
  // + sidelength*i, orientation=i;
}
function drawTriangleColumn(columnWidth,columnHeight,xPosL,yPosTop,colorsetProportions,alphaValues,columnKey) {
  let sideLength = 2*columnWidth/Math.sqrt(3);
  let i = 0;
  // draw triangle pointing right, and triangle above it, facing left
  while(yPosTop<=columnHeight) {
    i++;
    let drawColor = findColorRNG(colorsetProportions,alphaValues);
    drawTriangle(sideLength, xPosL, yPosTop, 1, drawColor, [columnVal,columnKey,i]);
    drawColor = findColorRNG(colorsetProportions,alphaValues);
    i++
    drawTriangle(sideLength, xPosL+columnWidth, yPosTop-sideLength/2, -1, drawColor, [columnVal,columnKey,i]);
    yPosTop += sideLength;
  }
  i++;
  // one more for good measure
  let drawColor = findColorRNG(colorsetProportions,alphaValues);
  drawTriangle(sideLength, xPosL+columnWidth, yPosTop-sideLength/2, -1, drawColor,[columnVal,columnKey,i]);
}
function drawTriangle(sideLength, topPosX, topPosY, xDirection, rngColor, tileKey) {
  let drawColor = getNewColor(rngColor,historyFraction,tileKey);
  fill(drawColor);
  noStroke();
  // Math.sqrt(3)/2
  let xMid = topPosX+((sideLength*xDirection)*Math.sqrt(3)/2);
  let yMid = topPosY+sideLength/2;
  let xLast = topPosX;
  let yLast = topPosY+sideLength;
  triangle(topPosX,topPosY,xMid,yMid,xLast,yLast);
  return;
}
function drawSquareField(numberColumns,alphaValues) {
  let fieldHeight = Math.ceil(width*(9/16));
  let columnWidth = width/numberColumns;
  if(columnWidth%1!=0) {
    columnWidth = Math.floor(columnWidth);
    numberColumns = Math.ceil(width/columnWidth);
    numberColumns++;
  }
  else {
  }
  let colorsetProportions = calculateColorsetProportionsShared(numberColumns);
  let columnHeight = width*(9/16);
  let yPosTop = 0;
  for(let i=0; i<numberColumns; i++) {
    let xPosL = i*columnWidth;
    let yPosTop = 0;
    drawSquareColumn(columnWidth,columnHeight,xPosL,yPosTop,colorsetProportions[i],alphaValues,i);
  }
  // + sidelength*i, orientation=i;
}
function drawSquareColumn(columnWidth,columnHeight,xPosL,yPosTop,colorsetProportions,alphaValues,columnKey) {
  let sideLength = columnWidth; // todo bw: square change here?
  let i = 0;
  // draw squares down to bottom
  while(yPosTop<=columnHeight) {
    i++;
    let drawColor = findColorRNG(colorsetProportions,alphaValues);
    drawSquare(sideLength, xPosL, yPosTop, drawColor,[columnVal,columnKey,i]);
    yPosTop += sideLength;
  }
}
function drawSquare(sideLength, leftPosX, topPosY, rngColor, tileKey) {
  let drawColor = getNewColor(rngColor,historyFraction,tileKey);
  fill(drawColor);
  noStroke();
  rect(leftPosX,topPosY,sideLength,sideLength);
  return;
}
function drawDiamondField(numberColumns,alphaValues) {
  let fieldHeight = Math.ceil(width*(9/16));
  let columnWidth = width/numberColumns;
  if(columnWidth%1!=0) {
    columnWidth = Math.floor(columnWidth);
    numberColumns = Math.ceil(width/columnWidth);
    numberColumns++;
  }
  numberColumns = numberColumns*2;
  let colorsetProportions = calculateColorsetProportionsShared(numberColumns+1); // extra one for edge
  let columnHeight = width*(9/16);
  let yPosTop = 0;
  // todo: make column key: unique identifier will be numberColumns, columnId, rowId)
  for(let i=0; i<=numberColumns; i=i+2) {
    let xPosMid = i*columnWidth/2;
    let yPosTop = 0;
    drawDiamondColumn(columnWidth,columnHeight,xPosMid,yPosTop,colorsetProportions[i],alphaValues,i);
    xPosMid += columnWidth/2;
    yPosTop = yPosTop-(columnWidth/2);
    drawDiamondColumn(columnWidth,columnHeight,xPosMid,yPosTop,colorsetProportions[i],alphaValues,i+1);
  }
  // + sidelength*i, orientation=i;
}
function drawDiamondColumn(columnWidth,columnHeight,xPosMid,yPosTop,colorsetProportions,alphaValues,columnKey) {
  let diagonalHalf = columnWidth/2;
  let yPosMid = yPosTop;
  let i = 0;
  // draw triangle pointing right, and triangle above it, facing left
  while((yPosMid-diagonalHalf)<=columnHeight) {
    i++;
    let drawColor = findColorRNG(colorsetProportions,alphaValues);
    drawDiamond(diagonalHalf, xPosMid, yPosMid, drawColor,[columnVal,columnKey,i]);
    yPosMid += diagonalHalf*2;
  }
}
function drawDiamond(diagonalHalf, xPosMid, yPosMid, rngColor, tileKey) {
  let drawColor = getNewColor(rngColor,historyFraction,tileKey);
  fill(drawColor);
  noStroke();
  quad(xPosMid-diagonalHalf,yPosMid,
    xPosMid,yPosMid-diagonalHalf,
    xPosMid+diagonalHalf,yPosMid,
    xPosMid,yPosMid+diagonalHalf);
  return;
}
function getNewColor(rngColor, historyFraction, tileKey) {
  if(historyFraction>0) {
    if(!colorTiles[tileKey[0]]){
      colorTiles[tileKey[0]] = {};
    }
    if(!colorTiles[tileKey[0]][tileKey[1]]){
      colorTiles[tileKey[0]][tileKey[1]] = {};
    }
    if(!colorTiles[tileKey[0]][tileKey[1]][tileKey[2]]){
      colorTiles[tileKey[0]][tileKey[1]][tileKey[2]] = rngColor;
      return color(rngColor);
    }
    else {
      let newFraction = 1-historyFraction;
      oldColor = colorTiles[tileKey[0]][tileKey[1]][tileKey[2]];
      newColor = [(historyFraction*oldColor[0]+newFraction*rngColor[0]),
        (historyFraction*oldColor[1]+newFraction*rngColor[1]),
        (historyFraction*oldColor[2]+newFraction*rngColor[2]),
        255];
      colorTiles[tileKey[0]][tileKey[1]][tileKey[2]] = newColor;
      return color(newColor);
    }
  }
  else {
    return color(rngColor);
  }
}
// p5js event listeners
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
  if (mouseY>height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM) {
    mouseY = height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM;
  }
  else if (mouseY<height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_TOP) {
    mouseY = height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_TOP;
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
function forceResize(proposedWidth) {
  let oldHeight = height;
  let oldWidth = width;
  let proposedHeight = Math.ceil(150+proposedWidth*(9/16)+WINDOW_BOTTOM_PADDING)
  movingCircleArray.sort(function(a, b) {
    return b.getX() - a.getX();
  });
  repositionMovingCircles(oldWidth,oldHeight,proposedWidth,proposedHeight);
  resizeCanvas(proposedWidth,proposedHeight);
  drawShapeField();
}
function windowResized() {
  let oldHeight = height;
  let oldWidth = width;
  if(windowWidth<1350) {
    proposedWidth = 700;
  }
  else if(windowWidth>=1350 && windowWidth<1640) {
    proposedWidth = 1000;
  }
  else {
    proposedWidth = 1200;
  }
  proposedHeight = Math.ceil(150+proposedWidth*(9/16)+WINDOW_BOTTOM_PADDING);
  if(proposedWidth>oldWidth) {
    movingCircleArray.sort(function(a, b) {
      return b.getX() - a.getX();
    });
  }
  else if(proposedWidth<oldWidth) {
    movingCircleArray.sort(function(a, b) {
      return a.getX() - b.getX();
    });
  }
  repositionMovingCircles(oldWidth,oldHeight,proposedWidth,proposedHeight);
  resizeCanvas(proposedWidth,proposedHeight);
  drawShapeField();
}
function executeSave() {
  forceResize(3000);
  saveFieldToDisk(3000,'mosaic.png');
  windowResized();
}
function saveFieldToDisk(proposedWidth, fname) {
  // ughhhh okay
  let saveWidth = proposedWidth;
  let saveHeight = saveWidth*(9/16);
  var img = createImage(saveWidth, saveHeight);
  // ughhhh okay
  let numChunks = 1;
  let sourceWidthChunk = width/numChunks;
  let sourceHeightChunk = (width*9/16)/numChunks;
  for(let i=0; i<numChunks; i++) {
    for(let j=0; j<numChunks; j++) {
      let sourceX = i*sourceWidthChunk;
      let sourceY = j*sourceHeightChunk;
      let destX = i*saveWidth/numChunks;
      let destY = j*saveHeight/numChunks;
      img.copy(fullCanvas, sourceX, sourceY, sourceWidthChunk, sourceHeightChunk, destX, destY, saveWidth/numChunks, saveHeight/numChunks);
    }
  }
  save(img, fname);
}
// Toolbar functions
function toggleFreeze() {
  let $toggleFreeze = $('#toggle-freeze');
  if($toggleFreeze.hasClass('active')) {
    $toggleFreeze.removeClass('active');
    $toggleFreeze.text('Freeze');
    isFrozen = false;
  }
  else {
    $toggleFreeze.addClass('active');
    $toggleFreeze.text('Unfreeze');
    isFrozen = true;
  }
}
function refreshDrawing() {
  nowTime = new Date() / 1000;
  drawShapeField();
  nextTime = nowTime + refreshRate;
  drawProportionBox();
}
// function timeRandom() {
//   let p5Array = [];
//   for (let j = 0; j < 5; j++) {
//     nowTime = new Date() / 1000;
//     console.log(j);
//     for (let i = 1; i < 200000000; i++) {
//       let randNum = random();
//     }
//     let finishTime = new Date() / 1000;
//     p5Array.push(finishTime-nowTime);
//   }
//   let jsArray = [];
//   for (let j = 0; j < 5; j++) {
//     nowTime = new Date() / 1000;
//     console.log(j);
//     for (let i = 1; i < 200000000; i++) {
//       let randNum = random();
//     }
//     let finishTime = new Date() / 1000;
//     jsArray.push(finishTime-nowTime);
//   }
//   console.log(p5Array);
//   console.log(jsArray);
// }
function updateSmoothing() {
  let val = $('#smoothing').val();
  $('#smoothing-display').text(val);
  val++;
  if(val===1) {
    if(historyFraction>0) {
      $('.nav-tabs').show(400);
      $( "#opacity-enabled" ).fadeIn( "slow", function() {
      });
    }
    historyFraction = 0;
    $('[name="opacity-lock"]').hide();
  }
  else {
    historyFraction = 1-1/val;
    $( "#opacity-enabled" ).fadeOut( "fast", function() {
      // Animation complete
    });
    $('[name="nav-link-colors"]').click();
    $('.nav-tabs').hide(400);
  }
}
function updateRefreshRate(inputDiv) {
  $('#refresh-warning').hide();
  let $refreshSeconds = $('#refresh-seconds');
  let $refreshPerMinute = $('#refresh-per-minute');
  let refreshRateTemp;
  if(inputDiv=='#refresh-per-minute') {
    //todo bw: handle edge case, refresh per minute as zero, or add freeze button and manual refresh?
    refreshRate = 60/$refreshPerMinute.val();
  } else {
    refreshRate = $refreshSeconds.val();
  }

  if(refreshRate<0.01) {
    refreshRate = 0.01;
    $('#refresh-warning').show();
  }

  $('#refresh-seconds-text').text('(every '+refreshRate+' seconds)');

  $refreshPerMinute.val(Math.round(60/refreshRate));
  $refreshSeconds.val(refreshRate);

  nowTime = new Date() / 1000;
  nextTime = nowTime + refreshRate;

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
  if(newColorNum <= MAX_COLORS) {
    colorsetColorCount[colorsetDiv]++;
    let newDiv = '#' + colorsetDiv + '-color-' + newColorNum;
    $(newDiv).toggle();
    // todo bw: change back?
    // $(newDiv).colorpicker({
    //   format: 'rgb',
    //   color: '#FFFFFE'
    // });
  }
  if(colorsetColorCount[colorsetDiv] == MAX_COLORS) {
    $('#add-'+colorsetDiv).prop('disabled', true);
  }
}
function removeColorset() {
  $('#add-colorset').prop('disabled', false);

  if(colorsetCount>1) {
    console.log('2')
    let shownObjects = colorsetObjects[colorsetCount];
    shownObjects.bezier.forEach(function(obj) { obj.hide();})
    shownObjects.circle.forEach(function(obj) { obj.hide();})

    let removeDiv = '#colorset-' + colorsetCount;
    $(removeDiv).toggle();
    colorsetCount--;
  }
  if(colorsetCount == 1) {
    $('#remove-colorset').prop('disabled', true);
  }
  let proportions = calculateColorsetProportionsShared(20);
}
function addColorset() {
  $('#remove-colorset').prop('disabled', false);
  if(colorsetCount < MAX_COLORSETS) {
    colorsetCount++;
    let newDiv = '#colorset-' + colorsetCount;
    $(newDiv).toggle();
    let hiddenObjects = colorsetObjects[colorsetCount];
    hiddenObjects.bezier.forEach(function(obj) { obj.show();})
    hiddenObjects.circle.forEach(function(obj) { obj.show();})
  }
  if(colorsetCount == MAX_COLORSETS) {
    $('#add-colorset').prop('disabled', true);
  }
}
// Proportion box drawing/UI
function repositionMovingCircles(oldWidth, oldHeight, newWidth, newHeight) {
  // windowWidth
  // windowHeigh
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
function toggleColorset(colorsetName) {
  $('#' + colorsetName + '-collapse').toggle(600);
  let colorsetToggleSelector = '#' + colorsetName + '-toggle';
  if($(colorsetToggleSelector).hasClass('expanded')){
    console.log('hide!');
    $(colorsetToggleSelector + ' .fa').removeClass('fa-angle-down');
    $(colorsetToggleSelector + ' .fa').addClass('fa-angle-right');
    $(colorsetToggleSelector).removeClass('expanded');
  }
  else {
    console.log('show');
    $(colorsetToggleSelector + ' .fa').removeClass('fa-angle-right');
    $(colorsetToggleSelector + ' .fa').addClass('fa-angle-down');
    $(colorsetToggleSelector).addClass('expanded');
  }
  console.log('hello');
}
function drawProportionBox() {
  strokeWeight(0);
  fill(255);
  rect(0,width*9/16,width,height);
  let dashedLineLength = 10;
  let gapX = 20;
  let fontSize=14;
  let nudge = 4;
  let strokeWeightVar = 1;
  stroke(30);
  strokeWeight(strokeWeightVar);
  noFill();
  // top line segment, 0 space, second line segment
  line(0,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_TOP,gapX-dashedLineLength,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_TOP);
  line(gapX+dashedLineLength*2,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_TOP,width-strokeWeightVar,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_TOP);
  // bottom line segment, 100 space, second line segment
  line(0,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM,gapX-dashedLineLength,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM);
  line(gapX+dashedLineLength*2,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM,width-strokeWeightVar,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM);
  // left and right line segments
  line(0,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_TOP,0,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM)
  line(width-strokeWeightVar,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_TOP,width-strokeWeightVar,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM)
  //25,50,75 - 10 pixels on, 10 pixels off
  let end = 0;

  let pct25Y = (height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM)-(COLORSET_EQ_TOP-COLORSET_EQ_BOTTOM)*.25;
  let pct50Y = (height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM)-(COLORSET_EQ_TOP-COLORSET_EQ_BOTTOM)*.50;
  let pct75Y = (height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM)-(COLORSET_EQ_TOP-COLORSET_EQ_BOTTOM)*.75;
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
  text("0", gapX-nudge, height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM+fontSize/3);
  text("25", gapX-nudge, pct25Y+fontSize/3);
  text("50", gapX-nudge, pct50Y+fontSize/3);
  text("75", gapX-nudge, pct75Y+fontSize/3);
  text("100", gapX-nudge, height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_TOP+fontSize/3);

  strokeWeight(1);
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
    else if(!obj.lock) {
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
    if(!obj.lock) {
      obj.xPos = x;
    }
    obj.leftObj.setEnd(obj.xPos,obj.yPos);
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
    let drawColor = colorsetColorKey[obj.color];
    fill(color(drawColor));
    stroke(color(0,0,0));
    ellipse(obj.xPos, obj.yPos, obj.radius*2, obj.radius*2);
    fill(color(255,255,255,255));
    textSize(obj.radius*1.5);
    text(obj.text, obj.xPos-obj.radius/2, obj.yPos+obj.radius/2);
  }
});
const drawableBezierHorizontal = (obj) => ({
  draw: () => {
    noFill();
    xLength = obj.xPosEnd-obj.xPosStart;
    stroke(color(colorsetColorKey[obj.color]));
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
const MovingCircle = (xPos,yPos,radius,color,text)  => {
  var state = {
    xPos,yPos,radius,color,text,
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
const MovingCircleStartpoint = (xPos,yPos,radius,color,rightObj,text)  => {
  var state = {
    xPos,yPos,radius,color,rightObj,text,
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
const MovingCircleEndpoint = (xPos,yPos,radius,color,leftObj,text)  => {
  var state = {
    xPos,yPos,radius,color,leftObj,text,
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
const MovingCircleMidpoint = (xPos,yPos,radius,color,leftObj,rightObj,text)  => {
  var state = {
    xPos,yPos,radius,color,leftObj,rightObj,text,
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