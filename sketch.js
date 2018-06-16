// june 11: 
// rewrite colorsets to image layers
// drawing a square based off position means creating a dictionary
// 


// sketch.js
var semanticDictionaries = null;
var imageDictionary = {};
var shapeFieldReady = false;
var idxToLayer = [null,'input','mixed5a','mixed4d','mixed4a','mixed3a']
var layerTileCounts = {'input':0,
  'mixed5a':1,
  'mixed4d':2,
  'mixed4a':2,
  'mixed3a':4};
var layerActivationCounts = {
  'input':null,
  'mixed5a':2,
  'mixed4d':2,
  'mixed4a':2,
  'mixed3a':2
};
var MAX_ACTIVATIONS = 5;

var aspectRatio = 12/20;
var fullCanvas = null;
var shape = "diamond";
var columnVal = 60;
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
// some default colors/preset
var fullPresets = ['vivaldi','1966','sun-and-ice','color-party'];
var fallColorset = ["rgb(232,19,19)", "rgb(235,182,38)", "rgb(246,238,0)", "rgb(28,9,9)",
  "rgb(227,174,140)", "rgb(151,92,48)", "rgb(156,26,84)", "rgb(228,105,129)"];
var winterColorset = ["rgb(50,49,238)", "rgb(77,17,148)", "rgb(119,209,253)", "rgb(141,87,255)",
  "rgb(89,250,234)", "rgb(71,111,216)", "rgb(22,146,148)", "rgb(92,108,131)"];
var springColorset = ["rgb(221,61,202)", "rgb(169,104,210)", "rgb(252,194,251)", "rgb(88,37,105)",
  "rgb(191,214,250)", "rgb(246,86,139)", "rgb(242,145,128)", "rgb(97,8,232)"];
var summerColorset = ["rgb(11,83,19)", "rgb(42,150,86)", "rgb(87,226,76)", "rgb(195,239,178)",
  "rgb(11,19,6)", "rgb(200,242,81)", "rgb(53,224,169)", "rgb(134,151,100)"];
var brightColorset = ["rgb(231,0,100)","rgb(0,163,255)","rgb(255,197,0)"];
var grayscaleColorset = ["rgb(0,0,1)","rgb(67,67,68)","rgb(133,133,134)"];
var colorsetPresets = {'fall':fallColorset,'winter':winterColorset,'spring':springColorset,'summer':summerColorset,
        'bright': brightColorset, 'grayscale': grayscaleColorset};
var proportionOptions = ['leftHalf','rightHalf','rightEdgeDescent','rightEdgeAscent',
  'middleThird','firstQuarter','secondQuarter','thirdQuarter','fourthQuarter',
  'base90','cos','negCos'];
var colorsetKeys = Object.keys(colorsetPresets);
var allColors = [];
colorsetKeys.forEach(function(key) {
  allColors = allColors.concat(colorsetPresets[key]);
});
// thirds, fourths, increaseEdge, decreaseEdge, sinWave, -sinWave, cosWave, -cosWave
var chosenColors = [];
// shape drawing (proportion box)
var shapesToDraw = [];
// proportion box variables
var COLORSET_EQ_BOTTOM = 8;
var COLORSET_EQ_TOP = 140;
var CIRCLE_RADIUS = 8;
var NUM_EQ_NODES = 3;
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
var isAutoMosaic = false;
var AUTO_MOSAIC_RATE = 10;
var nextAutoMosaic = START_TIME+AUTO_MOSAIC_RATE;
var checkboxHtml = '<i class="fa fa-check" aria-hidden="true"></i>';
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
    $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
      var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
      if(!state) {
        $('#sidebar').fadeIn('fast');
        $('#sketch-holder-holder').removeClass('fixed-top');
        $('#sketch-holder-holder').addClass('sticky-top');
      }
    });
});
function setColors(colorset,colors) {
  let colorCount = colorsetColorCount[colorset];
  let colorCountDiff = colors.length-colorCount;
  for(let i=0; i>colorCountDiff; i--) {
    removeColor(colorset);
  }
  for(let i=0; i<colorCountDiff; i++) {
    addColor(colorset);
  }
  colors.forEach(function(colorName,idx) {
    let i = idx+1;
    let colorpickerDiv = '#'+colorset+'-color-'+i;
    $(colorpickerDiv).colorpicker().data('colorpicker').setValue(colorName);
  });
  collapseColorset(colorset);
  drawMain();
}
function setColorsSetup(colorset,name,isRandom) {
  let colorsToUse = colorsetPresets[name];

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
  // thirds, fourths, increaseEdge, decreaseEdge, sinWave, -sinWave, cosWave, -cosWave
  if(type==='leftHalf') {
    coordinateArray = [[0,100],[100*1/5,95],[100*2/5,90],[100*3/5,10],[100*4/5,0],[100,0]];
  }
  else if(type=='rightHalf') {
    coordinateArray = [[0,0],[100*1/5,0],[100*2/5,10],[100*3/5,90],[100*4/5,95],[100,100]];
  }
  else if(type==='rightEdgeDescent') {
    coordinateArray = [[0,100],[100*1/5,100],[100*3/10,99],[100*7/10,90],[100*9/10,25],[100,1]];
  }
  else if(type==='rightEdgeAscent') {
    coordinateArray = [[0,0],[100*1/5,0],[100*3/10,1],[100*7/10,10],[100*9/10,75],[100,99]];
  }
  else if(type==='middleThird') {
    coordinateArray = [[0,0],[100*1/4,0],[100*4/10,100],[100*6/10,100],[100*3/4,0],[100,0]];
  }
  else if(type==='firstQuarter') {
    coordinateArray = [[0,100],[12,100],[32,0],[100*3/5,0],[100*4/5,0],[100,0]];
  }
  else if(type==='secondQuarter') {
    coordinateArray = [[0,0],[12,0],[32,100],[100*4/10,100],[100*6/10,0],[100,0]];
  }
  else if(type==='thirdQuarter') {
    coordinateArray = [[0,0],[100*4/10,0],[100*6/10,100],[68,100],[88,0],[100,0]];
  }
  else if(type==='fourthQuarter') {
    coordinateArray = [[0,0],[100*1/5,0],[100*2/5,0],[68,0],[88,100],[100,100]];
  }
  else if(type==='base10') {
    coordinateArray = [[0,10],[100*1/5,10],[100*2/5,10],[100*3/5,10],[100*4/5,10],[100,10]];
  }
  else if(type==='base90') {
    coordinateArray = [[0,90],[100*1/5,90],[100*2/5,90],[100*3/5,90],[100*4/5,90],[100,90]];
  }
  else if(type==='cos') {
    coordinateArray = [[0,100],[100*1/5,95],[100*2/5,90],[100*3/5,10],[100*4/5,0],[100,0]];
  }
  else if(type==='negCos') {
    coordinateArray = [[0,100],[100*1/5,95],[100*2/5,90],[100*3/5,10],[100*4/5,0],[100,0]];
  }
  else {
    return;
  }
  let circles = colorsetObjects[colorsetNum].circle;
  circles = circles.reverse();
  circles.forEach(function(circle) {
    circle.setPosition(getXPosFromPercent(100),getYPosFromPercent(0));
  });
  circles = circles.reverse();
  circles.forEach(function(circle,idx) {
    circle.setPosition(getXPosFromPercent(coordinateArray[idx][0]),getYPosFromPercent(coordinateArray[idx][1]));
  });
  // obj.setPosition(obj.getX()*(newWidth/oldWidth),newHeight-(oldHeight-obj.getY()));
}
function setupStartView() {
  //Sun & Ice - https://www.youtube.com/watch?v=tlEinFS01lk
  let seasonArray = shuffle(['fall','winter','summer','spring']);
  setColorsSetup('colorset-1',seasonArray[0],false);
  setColorsSetup('colorset-2',seasonArray[1],false);
  setColorsSetup('colorset-3',seasonArray[2],false);
  setColorsSetup('colorset-4',seasonArray[3],false);
  setColorsSetup('colorset-5','grayscale',false);
  setColorsetProportions(1,'leftHalf');
  setColorsetProportions(2,'rightHalf');
  setColorsetProportions(3,'middleThird');
  setColorsetProportions(4,'base90');
  setColorsetProportions(5,'rightEdgeAscent');
}
function setNumColorsets(num) {
  while(colorsetCount>num) {
    removeColorset();
  }
  while(colorsetCount<num) {
    addColorset();
  }
}
function setNumColorsetColors(colorset,num) {
  while(colorsetColorCount[colorset]>num) {
    removeColor(colorset);
  }
  while(colorsetColorCount[colorset]>num) {
    addColor(colorset);
  }
}
function setNumColumns(num) {
  $('#num-columns').val(num);
  $('#num-columns-display').text(num);
  columnVal = num;
}
function setShape(shapeName) {
  let shapeType = $('#shape-toggle input:radio:checked').val();
  if(shapeType!=shapeName) {
    colorTiles = {};
    // $('input[value="' + shapeName + '"]').prop('checked', true);
    $('input[value="' + shapeName + '"]').click();
    $('input[value="' + shapeName + '"]').blur();
    shape = shapeName;
  }
}
function setSmoothing(num) {
  $('#smoothing').val(num);
  updateSmoothing();
}
function setRefreshRate(num) {
  $('#refresh-per-minute').val(num);
  updateRefreshRate();
}
function setupPresetViewButton(name) {
  setupPresetView(name);
  hideFullPresets();
}
function setupPresetView(name) {
  if(name==='sun-and-ice') {
    setShape('diamond');
    setRefreshRate(512);
    setNumColumns(90);
    setSmoothing(6);
    setNumColorsets(2);
    setColors('colorset-1',fallColorset);
    setNumColorsetColors('colorset-1',3);
    setColorsetProportions(1,'leftHalf');
    setColors('colorset-2',winterColorset);
    setNumColorsetColors('colorset-2',3);
    setColorsetProportions(2,'rightHalf');
  }
  else if(name==='1966') {
    setShape('diamond');
    setRefreshRate(500);
    setNumColumns(60);
    setSmoothing(1);
    setNumColorsets(2);
    setColors('colorset-1',grayscaleColorset);
    setNumColorsetColors('colorset-1',3);
    setColorsetProportions(1,'rightEdgeDescent');
    setColors('colorset-2',brightColorset);
    setNumColorsetColors('colorset-2',3);
    setColorsetProportions(2,'rightEdgeAscent');
  }
  else if(name==='vivaldi') {
    setShape('triangle');
    setRefreshRate(500);
    setNumColumns(60);
    setSmoothing(3);
    setNumColorsets(4);
    setColors('colorset-1',winterColorset);
    setNumColorsetColors('colorset-1',8);
    setColorsetProportions(1,'firstQuarter');
    setColors('colorset-2',springColorset);
    setColorsetProportions(2,'secondQuarter');
    setColors('colorset-3',summerColorset);
    setColorsetProportions(3,'thirdQuarter');
    setColors('colorset-4',fallColorset);
    setColorsetProportions(4,'fourthQuarter');
  }
  else if (name==='color-party') {
    setShape('square');
    setRefreshRate(90);
    setNumColumns(80);
    setSmoothing(0);
    setNumColorsets(5);
    setColors('colorset-1',brightColorset);
    setNumColorsetColors('colorset-1',8);
    setColorsetProportions(1,'base10');
    setColors('colorset-2',springColorset);
    setColorsetProportions(2,'base10');
    setColors('colorset-3',winterColorset);
    setColorsetProportions(3,'base10');
    setColors('colorset-4',summerColorset);
    setColorsetProportions(4,'base10');
    setColors('colorset-5',fallColorset);
    setColorsetProportions(5,'base10');
    $('input:checkbox').prop('checked', 0);
    $('[data-percent="100"]:checkbox').prop('checked', 'true');
    $('[data-percent="90"]:checkbox').prop('checked', 'true');
    $('[data-percent="70"]:checkbox').prop('checked', 'true');
    $('[data-percent="60"]:checkbox').prop('checked', 'true');
  }
}
function drawSquareSubIcon(sideLength,columnKey,rowKey,imageName,layerName,activationCount) {
  let activations = semanticDictionaries[imageName][layerName][rowKey][columnKey];
  let topPosY = sideLength*rowKey;
  let leftPosX = sideLength*columnKey;
  let idx = activations[Math.floor(Math.random()*activationCount)];
  let img = imageDictionary[layerName][idx];
  image(img, leftPosX, topPosY, sideLength, sideLength); 
}
function drawSquareIcon(sideLength, imageName,layerProportions,columnKey,rowKey) {
  let val = Math.random();
  let layerName = null;
  for(let idx=0; idx<layerProportions.length; idx++) {
    let p = layerProportions[idx];
    if(p>val){
      layerName = idxToLayer[idx];
      break;
    }
  }
  let tileCount = layerTileCounts[layerName];
  if(tileCount) {
    let activationCount = layerActivationCounts[layerName];
    let newSideLength = sideLength/tileCount;
    let newColumnKey = columnKey*tileCount;
    let newRowKey = rowKey*tileCount;
    // i as columns, j as rows
    for(let i=0; i<tileCount; i++) {
      for(let j=0; j<tileCount; j++) {
        drawSquareSubIcon(newSideLength, 
          newColumnKey+j, newRowKey+i,
          imageName,layerName,activationCount);
      }
    }
    return;
  }
}


function uploadFilepath(fpath, idx) {
  // Create an image DOM element but don't show it
    // var img = p.createImg(file.data).hide();
      // Draw the image onto the canvas
    // loadImage('assets/laDefense.jpg', function(img) {
    loadImage(fpath, function(img) {
      uploadedImages[idx] = img;  
    });
  }

function loadSemanticDictionaries() {
  let promises = [];
  let d = $.getJSON( "lib/img_dict_new.json")
    .done(function(data) {
      semanticDictionaries = data;
    })
    .fail(function(e) {
      console.log( "error, could not load img_dict.json" );
      console.log("response: ", e);
    })
  promises.push(d);

  d = $.Deferred();
  promises.push(d);
  $.getJSON( "lib/unique_sprites.json")
    .done(function(data) {
      loadedLayers = {};
      Object.keys(data).forEach(function(layer) {
        imageDictionary[layer] = {};
        data[layer].forEach(function(num) {
          fpath = "img/sprites/" + layer + "/" + num + ".jpeg";
          loadImage(fpath, function(img) {
            imageDictionary[layer][num] = img;
            if(Object.keys(imageDictionary[layer]).length===data[layer].length) {
              console.log(layer)
              loadedLayers[layer] = true;
            }
            if(Object.keys(loadedLayers).length===Object.keys(data).length) {
              d.resolve(); 
            }
          });
        });
      });
    })
    .fail(function(e) {
      console.log( "error, could not load unique_sprites.json" );
      console.log("response: ", e);
    });
  $.when.apply($, promises)
    .fail(function () {
      d.reject();
    }).done(function() {
      shapeFieldReady = true;
      console.log('promises resolved. dictionaries:');
      console.log(imageDictionary);
      console.log(semanticDictionaries);
    });
}
// function showPreset(id) {
//     'rgb(,,)'
// }
// main p5
function setup() {
    loadSemanticDictionaries();

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
            $(colorpickerDiv).colorpicker({
              format: 'rgb',
              color: 'rgb(255,255,254)'
            })
            .on('hidePicker', function(e, colorpickerDiv) {
              let rgb = e.color.toRGB();
              if (rgb.r==rgb.g && rgb.g==rgb.b) {
                rgb.b++;
                let newColor = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
                $('#'+e.target.id).colorpicker().data('colorpicker').setValue(newColor);
              }
            });
            if (j>INIT_COLORS) {
              $(colorpickerDiv).toggle();
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
        let startObj = circleObj;
        shapesToDraw.push(circleObj);
        clickableObjects.push(circleObj);
        movingCircleArray.push(circleObj);
        circleArray.push(circleObj);
        if (i>INIT_COLORSETS) { circleObj.hide(); }
        // for(let j=0; j<bezierArray.length-1; j++) {
        //     circleObj =  MovingCircleMidpoint(width*((j+1)/(NUM_EQ_NODES-1)),height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,i,bezierArray[j],bezierArray[j+1],i);
        //     shapesToDraw.push(circleObj);
        //     clickableObjects.push(circleObj);
        //     movingCircleArray.push(circleObj);
        //     circleArray.push(circleObj);
        //     if (i>INIT_COLORSETS) { circleObj.hide(); }
        // }
        circleObj =  MovingCircleEndpoint(width,height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,i,bezierArray[bezierArray.length-1],i);
        let endObj = circleObj;
        shapesToDraw.push(circleObj);
        clickableObjects.push(circleObj);
        movingCircleArray.push(circleObj);
        circleArray.push(circleObj);
        if (i>INIT_COLORSETS) { circleObj.hide(); }
        for(let j=0; j<bezierArray.length-1; j++) {
            circleObj =  MovingCircleMidpointLeader(width*((j+1)/(NUM_EQ_NODES-1)),height-WINDOW_BOTTOM_PADDING-COLORSET_EQ_BOTTOM,CIRCLE_RADIUS,i,bezierArray[j],bezierArray[j+1],i,startObj,endObj);
            shapesToDraw.push(circleObj);
            clickableObjects.push(circleObj);
            movingCircleArray.push(circleObj);
            circleArray.push(circleObj);
            if (i>INIT_COLORSETS) { circleObj.hide(); }
        }
        colorsetObjects[i] = {'bezier': bezierArray, 'circle': circleArray};
    }
  background(255);
  stroke(0, 0, 0);
  noFill();
  // setupStartView();
  setupPresets();
  if(isMobile()) {
    showFullPresets();
    $('#mobile-header').fadeIn('3000',function() {
      mobileResize();
    });
    $('#sidebar-title').fadeOut();
    $('.btn-sm').addClass('btn-lg');
    $('.btn-sm').removeClass('btn-sm');
    $('.font-size-1-25.strong-font').addClass('font-size-2-5');
    $('.font-size-1-25.strong-font').removeClass('font-size-1-25');
    $('#cancel-full-presets').hide();
    $('.btn-outline-success').css('width','30%');
    $('.btn-outline-success').addClass('btn-success');
    $('.btn-outline-success').removeClass('btn-outline-success');
    $('#sketch-holder-holder').removeClass('sticky-top');
    $('#sketch-holder-holder').addClass('relative-top-mobile');
    // $('.margin-top-15 h5').replaceWith(function () {
    // return "<h3 class='margin-top-15'>" + $(this).text() + "</h3>";
    // });
  }
}
function drawShapeField() {
  if(shapeFieldReady) {
    background(255);
    image(imageDictionary['inputs']['birds'],0,0,width,width*(12/20))
    drawMain();
    stroke(0, 0, 0);
    noFill();
  }
}
function isMobile() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
function draw() {
  nowTime = new Date() / 1000;
  if(nowTime>nextTime && !isFrozen) {
    drawShapeField();
    nextTime = nowTime + refreshRate;
  }
  if(isAutoMosaic && nowTime>nextAutoMosaic && !isFrozen) {
    nextAutoMosaic = nowTime+AUTO_MOSAIC_RATE;
    generateAutoMosaic();
  }
  // noFill();
  // stroke(0, 0, 0);
  // rect(0,width*aspectRatio,width,height);
  if(!fullscreen() && !isMobile()) {
    drawProportionBox();
    shapesToDraw.forEach( function (shape) {
      if(shape.isShown()) {
        shape.draw();
      }
    });
  }
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
    let newColorsetColor = colorsetColorKey[i];
    $('.' + colorsetName).css('color',newColorsetColor);

    $('.background-' + colorsetName).css('background-color',newColorsetColor);
    $(' .expanded.background-' + colorsetName).css('background-color',newColorsetColor);
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
  columnVal = val;
  var numColumnVal = columnVal;
  if(isMobile()) {
    if(shapeType==='square') {
      numColumnVal = Math.ceil(numColumnVal/2.5);
    }
    else if((shapeType==='diamond' || shapeType==='triangle')) {
      numColumnVal = Math.ceil(numColumnVal/3);
    }

    if(historyFraction===0) {
      setRefreshRate(256);
    }
    else if(historyFraction===1){
      setRefreshRate(512);
    }
    else if(refreshRate!=1/1000) {
      setRefreshRate(1000);
    }
  }
  // numberColumns = 1;
  let alphaValues = [100,150,220];
  updateColorArray();
  if (shape==='triangle') {
    drawTriangleField(numColumnVal, alphaValues);
  }
  else if (shape==='square') {
    console.log('frame');
    drawSquareField(numColumnVal, alphaValues);
  }
  else {
    drawDiamondField(numColumnVal, alphaValues);
  }
}
// drawing functions (shape-specific)
function drawTriangleField(numberColumns,alphaValues) {
  let fieldHeight = Math.ceil(width*aspectRatio);
  let columnWidth = width/numberColumns;
  if(columnWidth%1!=0) {
    columnWidth = Math.floor(columnWidth);
    numberColumns = Math.ceil(width/columnWidth);
    numberColumns++;
  }
  else {
  }
  let colorsetProportions = calculateColorsetProportionsShared(numberColumns);
  let columnHeight = width*aspectRatio;
  if(fullscreen() || isMobile()) {
    columnHeight = height;
  }
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
  let columnWidth = width/numberColumns;
  if(columnWidth%1!=0) {
    columnWidth = Math.floor(columnWidth);
    numberColumns = Math.ceil(width/columnWidth);
    numberColumns++;
  }
  else {
  }
  let colorsetProportions = calculateColorsetProportionsShared(numberColumns);
  let columnHeight = width*aspectRatio;
  if(fullscreen() || isMobile()) {
    columnHeight = height;
  }
  let yPosTop = 0;
  for(let i=0; i<numberColumns; i++) {
    let xPosL = i*columnWidth;
    let yPosTop = 0;
    drawSquareColumn(columnWidth,columnHeight,xPosL,yPosTop,colorsetProportions[i],alphaValues,i);
  }
  // + sidelength*i, orientation=i;
}
function drawSquareColumn(columnWidth,columnHeight,xPosL,yPosTop,layerProportions,alphaValues,columnKey) {
  let sideLength = columnWidth; // todo bw: square change here?
  let i = 0;
  // draw squares down to bottom
   // squareField()
  // squareColumn()
  // generateRngImage(imageName,proportions,columnKey,rowKey)
  //    pluck layer based off proportions in position, get activation count, pick random from that list
  imageName='birds';
  sideLength = columnWidth;
  while(yPosTop<columnHeight) {
    drawSquareIcon(sideLength, imageName,layerProportions,columnKey,i);
    yPosTop += sideLength;
    i++;
  }
}
function drawDiamondField(numberColumns,alphaValues) {
  let fieldHeight = Math.ceil(width*aspectRatio);
  let columnWidth = width/numberColumns;
  if(columnWidth%1!=0) {
    columnWidth = Math.floor(columnWidth);
    numberColumns = Math.ceil(width/columnWidth);
    numberColumns++;
  }
  numberColumns = numberColumns*2;
  let colorsetProportions = calculateColorsetProportionsShared(numberColumns+1); // extra one for edge
  let columnHeight = width*aspectRatio;
  if(fullscreen() || isMobile()) {
    columnHeight = height;
  }
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
function generateRngImage(imageName,proportions,columnKey,rowKey) {
  imgName = semanticDictionaries['birds']['mixed5a'][rowKey][columnKey][0]
  return imageDictionary['mixed5a'][imgName];
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
  var noObjectFound=true;
  clickableObjects.forEach( function(obj) {
    if(obj.isMouseInside() && obj.isShown()) {
      noObjectFound=false;
      activeObject = obj;
      return;
    }
  })
  if(noObjectFound) {
    activeObject = null;
  }
  return;
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
  let proposedHeight = Math.ceil(150+proposedWidth*aspectRatio+WINDOW_BOTTOM_PADDING);
  movingCircleArray.sort(function(a, b) {
    return b.getX() - a.getX();
  });
  repositionMovingCircles(oldWidth,oldHeight,proposedWidth,proposedHeight);
  resizeCanvas(proposedWidth,proposedHeight);
  drawShapeField();
}
function mobileResize() {
  let oldHeight = height;
  let oldWidth = width;
  let proposedWidth= windowWidth;
  let proposedHeight = windowWidth;

  if(proposedWidth>oldWidth) {
    movingCircleArray.sort(function(a, b) {
      return b.getX() - a.getX();
    });
  }
  if(proposedWidth<oldWidth) {
    movingCircleArray.sort(function(a, b) {
      return a.getX() - b.getX();
    });
  }
  repositionMovingCircles(oldWidth,oldHeight,proposedWidth,proposedHeight);
  resizeCanvas(proposedWidth,proposedHeight);
  drawShapeField();
}
function windowResized() {
  let oldHeight = height;
  let oldWidth = width;
  let proposedWidth = null;
  // min 1000
  if(windowWidth<1200) {
    proposedWidth = 700;
  }
  else if(windowWidth<1375) {
    proposedWidth = 880;
  }
  else if(windowWidth>=1375 && windowWidth<1640) {
    proposedWidth = 960;
  }
  else if(windowWidth>=1640 && windowWidth<1900) {
    proposedWidth = 1200;
  }
  else if(windowWidth>=1900 && windowWidth<2200) {
    proposedWidth = 1400;
  }
  else {
    proposedWidth = 1600;
  }
  let proposedHeight = Math.ceil(150+proposedWidth*aspectRatio+WINDOW_BOTTOM_PADDING);
  if(fullscreen()) {
    proposedWidth= windowWidth;
    proposedHeight = windowHeight;
  }

  if(isMobile()) {
    return;
    proposedWidth= windowWidth;
    proposedHeight = windowWidth;
  }


  if(proposedWidth==oldWidth && !fullscreen()) {
    return;
  }
  else if(proposedWidth>oldWidth) {
    movingCircleArray.sort(function(a, b) {
      return b.getX() - a.getX();
    });
  }
  if(proposedWidth<oldWidth) {
    movingCircleArray.sort(function(a, b) {
      return a.getX() - b.getX();
    });
  }
  repositionMovingCircles(oldWidth,oldHeight,proposedWidth,proposedHeight);
  resizeCanvas(proposedWidth,proposedHeight);
  drawShapeField();
}
function executeSave() {
  $('#save-image').blur();
  forceResize(3000);
  saveFieldToDisk(3000,'mosaic.png');
  windowResized();
}
function saveFieldToDisk(proposedWidth, fname) {
  // ughhhh okay
  let saveWidth = proposedWidth;
  let saveHeight = saveWidth*aspectRatio;
  var img = createImage(saveWidth, saveHeight);
  // ughhhh okay
  let numChunks = 1;
  let sourceWidthChunk = width/numChunks;
  let sourceHeightChunk = (width*aspectRatio)/numChunks;
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
  $toggleFreeze.blur();
}
function toggleAutoMosaicMobile() {
  let $toggleAutoMosaic = $('#m-toggle-auto-mosaic');
  if($toggleAutoMosaic.hasClass('active')) {
    $toggleAutoMosaic.removeClass('active');
    isAutoMosaic = false;
    $( "#m-auto-mosaic-enabled" ).fadeOut( "fast", function() {
    });
  }
  else {
    $toggleAutoMosaic.addClass('active');
    isAutoMosaic = true;
    $( "#m-auto-mosaic-enabled" ).fadeIn( "slow", function() {
    });
    
    nextAutoMosaic = nowTime+AUTO_MOSAIC_RATE/2;
  }
  $toggleAutoMosaic.blur();
}
function toggleAutoMosaic() {
  let $toggleAutoMosaic = $('#toggle-auto-mosaic');
  if($toggleAutoMosaic.hasClass('active')) {
    $toggleAutoMosaic.removeClass('active');
    isAutoMosaic = false;
    $( "#auto-mosaic-enabled" ).fadeOut( "fast", function() {
    });

  }
  else {
    $toggleAutoMosaic.addClass('active');
    isAutoMosaic = true;
    $( "#auto-mosaic-enabled" ).fadeIn( "slow", function() {
    });
    nextAutoMosaic = nowTime+AUTO_MOSAIC_RATE/2;
    let $toggleFreeze = $('#toggle-freeze');
    if($toggleFreeze.hasClass('active')) {
      $toggleFreeze.removeClass('active');
      $toggleFreeze.text('Freeze');
      isFrozen = false;
    }
  }
  $toggleAutoMosaic.blur();
}
function arrayToRGB(array) {
  let newArray = [];
  array.forEach(function(obj) {
    let newStr = 'rgb(' + obj.r + ',' + obj.g + ',' + obj.b + ')';
    newArray.push(newStr);
  })
  return newArray;
}
function generateNewColors(numNewColors) {
  if(Math.random()>0.5) {
    // add colors from some colorset
    let presetChoice = chooseRandom(colorsetKeys);
    let presetColorset = colorsetPresets[presetChoice];
    presetColorset = shuffle(presetColorset);
    while(presetColorset.length<numNewColors) {
      presetColorset.push(chooseRandom(allColors));
    }
    presetColorset = presetColorset.slice(0,numNewColors);
    return presetColorset;
  }
  else {
    // add random colors
    let newColors = [];
    for(let j=0; j<numNewColors; j++) {
      newColors.push(chooseRandom(allColors));
    }
    return newColors;
  }
}
function generateAutoMosaic() {
  let autoOptions = ['add-colorset','remove-colorset','add-colors',
    'remove-colors','change-colors','change-proportions',
    'change-refresh-smoothing','change-columns','change-shape'];
  autoOptions = autoOptions.concat(autoOptions,['choose-preset']);

  if(colorsetCount===1) {
    autoOptions = ['add-colorset','change-colors','add-colors'];
  }
  else if(colorsetCount===2) {
    autoOptions.concat(['add-colorset','add-colorset']);
  }

  let chosenOption = chooseRandom(autoOptions);
  executeAutoMosaic(chosenOption)
}
function randomizeView() {
  let autoOptions = ['remove-colors','add-colors','change-colors','change-proportions',
    'change-refresh-smoothing','change-columns','change-shape'];
  newColorsetCount = Math.ceil(Math.random()*5);
  while(colorsetCount<newColorsetCount) {
    autoOptions.push('add-colorset');
    newColorsetCount--;
  }
  while(colorsetCount>newColorsetCount) {
    autoOptions.push('remove-colorset');
    newColorsetCount++;
  }
  autoOptions.forEach(function(name) {
    executeAutoMosaic(name);
  });  
}
function executeAutoMosaic(chosenOption) {
  // fixing uninteresting cases
  if(chosenOption==='add-colorset' && colorsetCount==MAX_COLORSETS) {
    chosenOption='remove-colorset';
  }
  else if(chosenOption==='remove-colorset' && colorsetCount==1) {
    chosenOption='add-colorset';
  }
  else if(chosenOption==='change-proporions' && colorsetCount==1) {
    chosenOption='add-colorset';
  }

  if(columnVal===1) {
    let chosenColumns = columnVal;
    while(chosenColumns===columnVal) {
      chosenColumns = Math.round(Math.random() * 10) * 10;
    }
    setNumColumns(chosenColumns);
  };

  if(chosenOption==='add-colorset') {
    addColorset();
    let colorsetName = 'colorset-' + colorsetCount;
    let newColors = generateNewColors(Math.round(Math.random()*MAX_COLORS));
    setColors(colorsetName,newColors);
    setColorsetProportions(colorsetCount,chooseRandom(proportionOptions))
  }
  else if(chosenOption==='change-shape') {
    let shapeType = $('#shape-toggle input:radio:checked').val();
    let proposedShape = shapeType;
    let shapeOptions = ['triangle','diamond','square'];
    while(proposedShape===shapeType) {
      proposedShape = chooseRandom(shapeOptions);
    }
    setShape(proposedShape);
  }
  else if(chosenOption==='change-proportions') {
    // randomly change all colorset proportions
    for(let i=1; i<=colorsetCount; i++) {
      setColorsetProportions(i,chooseRandom(proportionOptions))
    }
  }
  else if(chosenOption==='choose-preset') {
    setupPresetView(chooseRandom(fullPresets));
  }
  else if(chosenOption==='change-columns') {
    let chosenColumns = columnVal;
    while(chosenColumns===columnVal) {
      chosenColumns = Math.round(Math.random() * 10) * 10;
    }
    setNumColumns(chosenColumns);
  }
  else if(chosenOption==='change-refresh-smoothing') {
    let refreshOptions = [];
    if(historyFraction>0.25) {
      refreshOptions = [[3,800],[4,1000],[5,1000],[6,1200],[7,1400]];
    }
    else {
      refreshOptions = [[0,60],[1,128],[2,256],[2,512]];
    }
    let newRefreshSmooth = chooseRandom(refreshOptions);
    setSmoothing(newRefreshSmooth[0]);
    setRefreshRate(newRefreshSmooth[1]);
  }
  else if(chosenOption=='remove-colorset') {
    removeColorset();
  }
  else if(chosenOption==='change-colors') {
    let changeColorset = Math.ceil(Math.random()*colorsetCount);
    let key = 'colorset-'+changeColorset;
    let numNewColors = colorsetColorCount[key];
    let newColors = generateNewColors(numNewColors);
    setColors(key,newColors);
    // randomly change one colorset, also half chance to change the others
    for(let i=1; i<=colorsetCount; i++) {
      let key = 'colorset-'+i;
      if(Math.random()>0.5) {
        let newColors = generateNewColors(colorsetColorCount[key]);
        setColors(key,newColors);
      }
    }
  }
  else if(chosenOption==='remove-colors') {
    // halves colors
    for(let i=1; i<=colorsetCount; i++) {
      let key = 'colorset-'+i;
      let countBefore = colorsetColorCount[key];
      let countNew = Math.ceil(Math.random()*countBefore);
      setNumColorsetColors(key,countNew);
    }
  }
  else if(chosenOption==='add-colors') {
    for(let i=1; i<=colorsetCount; i++) {
      let key = 'colorset-'+i;
      let countBefore = colorsetColorCount[key];
      if(countBefore===MAX_COLORS) { countBefore--; }
      let countNew = countBefore+1+Math.round(Math.random()*(MAX_COLORS-1-countBefore));
      let colorChoice = Math.random();
      let newColors = arrayToRGB(shuffle(colorArray[i]));
      if(colorChoice<0.5) {
        // add colors from some colorset
        let presetChoice = chooseRandom(colorsetKeys);
        let presetColorset = colorsetPresets[presetChoice];
        presetColorset = shuffle(presetColorset);
        while(presetColorset.length<(countNew-countBefore)) {
          presetColorset.push(chooseRandom(allColors));
        }
        while(newColors.length<countNew) {
          newColors.push(presetColorset.shift());
        }
        setColors(key,newColors);
      }
      else {
        // add random colors
        while(newColors.length<countNew) {
          newColors.push(chooseRandom(allColors));
        }
        setColors(key,newColors);
      }
    }
  }
  else {
    console.log('pass')
  }
}
function chooseRandom(array) {
  return array[Math.floor(Math.random()*array.length)]
}
function refreshDrawing() {
  nowTime = new Date() / 1000;
  drawShapeField();
  nextTime = nowTime + refreshRate;
  drawProportionBox();
}
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
function updateRefreshRate() {
  let $refreshPerMinute = $('#refresh-per-minute');
  refreshRate = 60/$refreshPerMinute.val();
  if(refreshRate<0.01) {
    refreshRate = 0.01;
  }
  $('#refresh-seconds-text').text('(every '+refreshRate+' seconds)');
  $refreshPerMinute.val(Math.round(60/refreshRate));
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
  $('#max-colorsets').fadeOut('fast');

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
}
function makeFullScreen() {
  $('#sidebar').fadeOut('slow');
  fullscreen(1);
  $('#sketch-holder-holder').addClass('fixed-top');
  $('#sketch-holder-holder').removeClass('sticky-top');
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
    $('#max-colorsets').fadeIn('slow');
  }
  updateColorArray();
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
      obj.setPosition(obj.getX()*(newWidth/oldWidth),newHeight-(oldHeight-obj.getY()),true);
    }
  })
}
function setupPresets() {
  // full presets
  fullPresets.forEach(function(preset, idx) {
    let $tableRow = $('<tr class="table-color-preset">' +
      '<td class="full-preset"><img style="width:50%; overflow: auto;" class="margin-left-5 rounded float-right" src="./img/' + preset + '.png" alt="' + preset +
      '"><span class="font-size-1-25 strong-font margin-top-15">' + preset + '</span><br>' +
      '<button class="btn btn-rounded btn-sm btn-outline-success margin-top-15 full-preset-link" onclick="setupPresetViewButton' +
      "('" + preset + "')" + '">Go</button>' +
      '</td></tr>');
    $tableRow.appendTo('#full-preset-table');
  });
  // color presets
  for(let key in colorsetPresets) {
    let buttonsHtml = '';
    colorsetPresets[key].forEach(function(colorName) {
      buttonsHtml = buttonsHtml + '<button class="btn-icon" data-color="' + colorName +
      '" onclick="togglePreset('+ "'" + colorName + "'" + ')" ></button>';
    })
    let $newHtml = $('<tr>' +
    '<td class="width-40"><span class="font-size-1-25 strong-font padding-top-5">' + key + '</span><br>' +
    '<a href="javascript:" class="select-all-link" onclick="selectAllColors' +
    "('" + key + "')" + '">Select all</a></td><td>' + buttonsHtml + '</td></tr>' +
    '<tr class="table-color-preset"><td></td><td></td></tr>');
    $newHtml.appendTo('#color-preset-table');
    colorsetPresets[key].forEach(function(colorName) {
      // rgb(----)
      let colorSelector = "[data-color='" + colorName + "']";
      let rgbStrings = colorName.slice(4,-1).split(',');
      if( (parseInt(rgbStrings[0])+parseInt(rgbStrings[1])+parseInt(rgbStrings[2])) > 420) {
        $(colorSelector).css('color','black');
      }
      else {
        $(colorSelector).css('color','white');
      }
      $(colorSelector).css('background-color',colorName);
    })
  }
}
function showFullPresets() {
  $('#default-ui-controls').fadeOut(400, function() {
    $('#full-preset-picker').fadeIn(500);
  });
}
function hideFullPresets() {
  $('.full-preset-link').blur();
  if(!isMobile()){
    $('#full-preset-picker').fadeOut(400, function() {
      $('#default-ui-controls').fadeIn(500);
    });
  }
  else {
    jQuery('html,body').animate({scrollTop:0},0);
  }
}
function showPresets(colorset) {
  clearPresetColors();
  $('#confirm-choose-presets').prop("disabled",true);
  let titleText = 'Colorset ' + colorset.split('-')[1] + ' (Max colors=' + MAX_COLORS + ')';
  $('#preset-title').text(titleText);
  $('#default-ui-controls').fadeOut(400, function() {
    $('#color-preset-picker').fadeIn(500);
  });
  $('#confirm-choose-presets').off('click');
  $('#confirm-choose-presets').on('click', function() {
    setColors(colorset,chosenColors);
    hidePresets();
  })
}
function hidePresets() {
  $('#color-preset-picker').fadeOut(400, function() {
    $('#default-ui-controls').fadeIn(500);
  });
}
function clearPresetColors() {
  chosenColors.forEach(function(colorName) {
    removePresetColor(colorName);
  });
  $('#clear-preset-colors').blur();
}
function selectAllColors(key) {
  $('.select-all-link').blur();
  chosenColors.forEach(function(colorName) {
    removePresetColor(colorName);
  });
  colorsetPresets[key].forEach(function(colorName) {
    // rgb(----)
    choosePresetColor(colorName);
  });
}
// todo bw: debug
function choosePresetColor(colorName) {
  if(chosenColors.indexOf(colorName)<0) {
    chosenColors.push(colorName);
    let colorSelector = "[data-color='" + colorName + "']";
    $(colorSelector).html(checkboxHtml);
    $(colorSelector).addClass('checked');
    if (chosenColors.length > MAX_COLORS) {
      removePresetColor(chosenColors.shift());
    }
  }
  if(chosenColors.length>0) {
    $('#confirm-choose-presets').prop("disabled",false);
  }
}
function removePresetColor(colorName) {
  let colorSelector = "[data-color='" + colorName + "']";
  $(colorSelector).html('');
  $(colorSelector).removeClass('checked');
  let idx = chosenColors.indexOf(colorName);
  if(idx!=-1) {
    if(idx==0) {
      chosenColors = chosenColors.slice(1);
    }
    else if(idx==chosenColors.length-1) {
      chosenColors = chosenColors.slice(0,-1);
    }
    else {
      chosenColors = chosenColors.slice(0,idx).concat(chosenColors.slice(idx+1));
    }
  }
  if(chosenColors.length==0) {
    $('#confirm-choose-presets').prop("disabled",true);
  }
}
function togglePreset(colorName) {
  if(chosenColors.indexOf(colorName)<0){
    choosePresetColor(colorName);
  }
  else {
    removePresetColor(colorName);
  }
// <i class="fa fa-check" aria-hidden="true"></i>
}
function collapseColorset(colorsetName) {
  let colorsetToggleSelector = '#' + colorsetName + '-toggle';
  $(colorsetToggleSelector).blur();
  if($(colorsetToggleSelector).hasClass('expanded')){
    $(colorsetToggleSelector + ' .fa').removeClass('fa-angle-up');
    $(colorsetToggleSelector + ' .fa').addClass('fa-angle-down');
    $(colorsetToggleSelector).removeClass('expanded');
    $('#' + colorsetName + '-collapse').toggle(600);
  }
}
function toggleColorset(colorsetName) {
  $('#' + colorsetName + '-collapse').toggle(600);
  let colorsetToggleSelector = '#' + colorsetName + '-toggle';
  $(colorsetToggleSelector).blur();
  if($(colorsetToggleSelector).hasClass('expanded')){
    $(colorsetToggleSelector + ' .fa').removeClass('fa-angle-up');
    $(colorsetToggleSelector + ' .fa').addClass('fa-angle-down');
    $(colorsetToggleSelector).removeClass('expanded');
  }
  else {
    $(colorsetToggleSelector + ' .fa').removeClass('fa-angle-down');
    $(colorsetToggleSelector + ' .fa').addClass('fa-angle-up');
    $(colorsetToggleSelector).addClass('expanded');
  }
}
function drawProportionBox() {
  strokeWeight(0);
  fill(255);
  rect(0,width*aspectRatio,width,height);
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
const moveableXYMidpointHorizontalLeader = (obj) => ({
  setPosition: (x,y,repositioning) => {
    obj.yPos = y;
    if(!obj.leftObj.setEnd(x,y) || !obj.rightObj.setStart(x,y)) {
      obj.leftObj.setEnd(obj.xPos,obj.yPos);
      obj.rightObj.setStart(obj.xPos,obj.yPos);
    }
    else {
      obj.xPos = x;
    }
    // console.log('rescale?')
    if(!repositioning) {
      obj.leftFollower.setPosition(obj.leftFollower.getX(),obj.yPos);
      obj.rightFollower.setPosition(obj.rightFollower.getX(),obj.yPos);
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
const MovingCircleMidpointLeader = (xPos,yPos,radius,color,leftObj,rightObj,text,leftFollower,rightFollower)  => {
  var state = {
    xPos,yPos,radius,color,leftObj,rightObj,text,leftFollower,rightFollower,
    shown: true
  }
  leftObj.setEnd(xPos,yPos);
  rightObj.setStart(xPos,yPos);
  return Object.assign(
    {},
    clickableCircle(state),
    drawableCircle(state),
    moveableXYMidpointHorizontalLeader(state),
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