// todo bw: have a few different presets, randomly pick between the 7-8?

// sketch.js
var shape = "diamond";
var shapeFieldReady = false;
// colorset variables
var INIT_COLORS = 3;
var INIT_COLORSETS = 2;
var MAX_COLORS = 8;
var MAX_COLORSETS = 5;
var WINDOW_BOTTOM_PADDING = 45;
var colorsetCount = 2;
var colorsetColorCount = {"colorset-1": 3, "colorset-2": 3, "colorset-3": 3, "colorset-4": 3, "colorset-5": 3};
var colorArray = {};
var alphaArray = {};
var COLORSET_COLOR_1 = "#812050";
var COLORSET_COLOR_2 = "#048ad1" ;
var COLORSET_COLOR_3 = "#8ddc1c";
var COLORSET_COLOR_4 = "#9159de";
var COLORSET_COLOR_5 = "#fd8f2f";
var COLORSET_ARRAY = [COLORSET_COLOR_1, COLORSET_COLOR_2, COLORSET_COLOR_3, COLORSET_COLOR_4, COLORSET_COLOR_5];
var colorsetObjects = {};
// some default colors
var fallColorset = ["rgb(227,64,27)", "rgb(235,182,38)", "rgb(246,238,0)", "rgb(76,39,10)",
  "rgb(227,174,140)", "rgb(151,92,48)", "rgb(156,26,84)", "rgb(228,105,129)"];
var winterColorset = ["rgb(50,49,238)", "rgb(77,17,148)", "rgb(71,111,216)", "rgb(119,209,253)",
  "rgb(13,53,63)", "rgb(89,250,234)", "rgb(22,146,148)", "rgb(92,108,131)"];
var springColorset = ["rgb(221,61,202)", "rgb(169,104,210)", "rgb(252,194,251)", "rgb(88,37,105)",
  "rgb(191,214,250)", "rgb(246,86,139)", "rgb(242,145,128)", "rgb(97,8,232)"];
var summerColorset = ["rgb(11,83,19)", "rgb(42,150,86)", "rgb(87,226,76)", "rgb(195,239,178)",
  "rgb(11,19,6)", "rgb(200,242,81)", "rgb(53,224,169)", "rgb(134,151,100)"];
// shape drawing (proportion box)
var shapesToDraw = [];
// proportion box variables
var COLORSET_EQ_BOTTOM = 8;
var COLORSET_EQ_TOP = 140;
var CIRCLE_RADIUS = 6;
var NUM_EQ_NODES = 6;
var movingCircleArray = [];
var clickableObjects = [];
var activeObject;
// refresh variables
var START_TIME = new Date() / 1000;
var refreshRate = null;
var nextTime = START_TIME+refreshRate;
var nowTime = START_TIME;
var isFrozen = false;
$(document).ready(function(){
    let elements = null;
    elements = document.getElementsByClassName('colorset-1');
    console.log(elements);
    for(let i=0;i<elements.length;i++){
      elements[i].style.color = COLORSET_COLOR_1;
    };
    document.getElementById('colorset-2').style.color = COLORSET_COLOR_2;
    document.getElementById('colorset-3').style.color = COLORSET_COLOR_3;
    document.getElementById('colorset-4').style.color = COLORSET_COLOR_4;
    document.getElementById('colorset-5').style.color = COLORSET_COLOR_5;
    $('#num-columns').on('input change', function(e) {
        console.log(e.target.value);
        $('#num-columns-display').text(e.target.value);
    });
    $('#refresh-seconds').on('change', function(e) {
      updateRefreshRate('#refresh-seconds');
    });
    $('#refresh-per-minute').on('change', function(e) {
        updateRefreshRate('#refresh-per-minute');
    });
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
    var canvas = createCanvas(500, 500);
    canvas.parent('sketch-holder');
    windowResized();
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
        let c = color(COLORSET_ARRAY[i-1]);
        for(let j=0; j<NUM_EQ_NODES-1; j++) {
            let bezierObj = MovingBezierHorizontal(0,0,width,0,c);
            shapesToDraw.push(bezierObj);
            bezierArray.push(bezierObj);
            if (i>INIT_COLORSETS) { bezierObj.hide(); }
        }
        let circleObj =  MovingCircleStartpoint(0,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,c,bezierArray[0]);
        shapesToDraw.push(circleObj);
        clickableObjects.push(circleObj);
        movingCircleArray.push(circleObj);
        circleArray.push(circleObj);
        if (i>INIT_COLORSETS) { circleObj.hide(); }
        for(let j=0; j<bezierArray.length-1; j++) {
            circleObj =  MovingCircleMidpoint(width*((j+1)/5),height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,c,bezierArray[j],bezierArray[j+1]);
            shapesToDraw.push(circleObj);
            clickableObjects.push(circleObj);
            movingCircleArray.push(circleObj);
            circleArray.push(circleObj);
            if (i>INIT_COLORSETS) { circleObj.hide(); }
        }
        circleObj =  MovingCircleEndpoint(width,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,c,bezierArray[bezierArray.length-1]);
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
  rect(0,0,width-1,width*9/16-1);
  shapeFieldReady = true;
  setupStartView();
}
function drawShapeField() {
  if(shapeFieldReady) {
    background(255);
    drawMain();
    stroke(0, 0, 0);
    noFill();
    rect(0,0,width-1,width*9/16-1);
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
  })
  shape = $('#shape-toggle input:radio:checked').val();
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
      let alpha = Number(alphaChoices[Math.floor(Math.random()*alphaChoices.length)]);
      // console.log(alpha);
      // todo bw change this
      return color(colorRGB.r,colorRGB.g,colorRGB.b,alpha);
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
    for(let j=1; j<=colorCount; j++){
      let colorpickerName = '#' + colorsetName + '-color-' + j;
      colorsetArray.push($(colorpickerName).colorpicker().data('colorpicker').color.toRGB());
    }
    colorArray[i] = colorsetArray;
    let alphaName = colorsetName+'-opacity';
    let singleAlphaArray = [];
    // todo bw not just colorset-1;
    $('[name=colorset-1-opacity]:checked').each(function(i){
      singleAlphaArray.push($(this).val());
      console.log($(this).val());
    });
    alphaArray[i] = singleAlphaArray;
  }
}
function drawMain() {
  let shapeType = $("input[name='shape-options']:checked").val();
  // should update all colorsets etc in memory
  let numberColumns = $('#num-columns').val();
  if (numberColumns==0) {
    numberColumns=1;
  }
  // numberColumns = 1;
  let alphaValues = [100,150,220];
  updateColorArray();
  console.log(shapeType)
  if (shapeType==='triangle') {
    drawTriangleField(numberColumns, alphaValues);
  }
  else if (shapeType==='square') {
    drawSquareField(numberColumns, alphaValues);
  }
  else {
    drawDiamondField(numberColumns, alphaValues);
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
    drawTriangleColumn(columnWidth,columnHeight,xPosL,yPosTop,colorsetProportions[i],alphaValues)
  }
  // + sidelength*i, orientation=i;
}
function drawTriangleColumn(columnWidth,columnHeight,xPosL,yPosTop,colorsetProportions,alphaValues) {
  let sideLength = 2*columnWidth/Math.sqrt(3);
  // draw triangle pointing right, and triangle above it, facing left
  while(yPosTop<=columnHeight) {
    let drawColor = findColorRNG(colorsetProportions,alphaValues);
    drawTriangle(sideLength, xPosL, yPosTop, 1, drawColor);
    drawColor = findColorRNG(colorsetProportions,alphaValues);
    drawTriangle(sideLength, xPosL+columnWidth, yPosTop-sideLength/2, -1, drawColor);
    yPosTop += sideLength;
  }
  // one more for good measure
  let drawColor = findColorRNG(colorsetProportions,alphaValues);
  drawTriangle(sideLength, xPosL+columnWidth, yPosTop-sideLength/2, -1, drawColor);
}
function drawTriangle(sideLength, topPosX, topPosY, xDirection, color) {
  fill(color);
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
    drawSquareColumn(columnWidth,columnHeight,xPosL,yPosTop,colorsetProportions[i],alphaValues)
  }
  // + sidelength*i, orientation=i;
}
function drawSquareColumn(columnWidth,columnHeight,xPosL,yPosTop,colorsetProportions,alphaValues) {
  let sideLength = columnWidth; // todo bw: square change here?
  // draw squares down to bottom
  while(yPosTop<=columnHeight) {
    let drawColor = findColorRNG(colorsetProportions,alphaValues);
    drawSquare(sideLength, xPosL, yPosTop, drawColor);
    yPosTop += sideLength;
  }
}
function drawSquare(sideLength, leftPosX, topPosY, color) {
  fill(color);
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
  else {
  }
  numberColumns = numberColumns*2;
  let colorsetProportions = calculateColorsetProportionsShared(numberColumns+1); // extra one for edge
  let columnHeight = width*(9/16);
  let yPosTop = 0;
  for(let i=0; i<=numberColumns; i=i+2) {
    let xPosMid = i*columnWidth/2;
    let yPosTop = 0;
    drawDiamondColumn(columnWidth,columnHeight,xPosMid,yPosTop,colorsetProportions[i],alphaValues);
    xPosMid += columnWidth/2;
    yPosTop = yPosTop-(columnWidth/2);
    drawDiamondColumn(columnWidth,columnHeight,xPosMid,yPosTop,colorsetProportions[i],alphaValues);
  }
  // + sidelength*i, orientation=i;
}
function drawDiamondColumn(columnWidth,columnHeight,xPosMid,yPosTop,colorsetProportions,alphaValues) {
  let diagonalHalf = columnWidth/2;
  let yPosMid = yPosTop;
  // draw triangle pointing right, and triangle above it, facing left
  while((yPosMid-diagonalHalf)<=columnHeight) {
    let drawColor = findColorRNG(colorsetProportions,alphaValues);
    drawDiamond(diagonalHalf, xPosMid, yPosMid, drawColor);
    yPosMid += diagonalHalf*2;
  }
}
function drawDiamond(diagonalHalf, xPosMid, yPosMid, color) {
  fill(color);
  noStroke();
  quad(xPosMid-diagonalHalf,yPosMid,
    xPosMid,yPosMid-diagonalHalf,
    xPosMid+diagonalHalf,yPosMid,
    xPosMid,yPosMid+diagonalHalf);
  return;
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
  if(proposedWidth>oldWidth) {
    resizeCanvas(proposedWidth,Math.ceil(150+proposedWidth*(9/16)+WINDOW_BOTTOM_PADDING));
    movingCircleArray.sort(function(a, b) {
      return b.getX() - a.getX();
    });
    repositionMovingCircles(oldWidth,oldHeight);
    drawShapeField();
  }
  else if(proposedWidth<oldWidth) {
    resizeCanvas(proposedWidth,Math.ceil(150+proposedWidth*(9/16)+WINDOW_BOTTOM_PADDING));
    movingCircleArray.sort(function(a, b) {
      return a.getX() - b.getX();
    });
    repositionMovingCircles(oldWidth,oldHeight);
    drawShapeField();
  }
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
  timeRandom();
}
function refreshDrawing() {
  // todo bw: fix the stuff so that colors don't stack
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
    $(newDiv).colorpicker({
      format: 'rgb',
      color: '#FFFFFE'
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
  updateColorArray();
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