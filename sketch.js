// sketch.js
var rgbGVal = 0;
var tuple = [255, 0, 200];
var shape = "triangle";
var colorsetCount = {"colorset-1": 1}
var MAX_COLORS = 5;


$(document).ready(function(){



    $(function() {
        $('#colorset-1-color-1').colorpicker({
            format: 'rgb'
        });
    });

    $(function() {
        $('#colorset-1-color-1').colorpicker().on('hidePicker', function(e) {
        		console.log(e);
            rgba = e.color.toRGB();
            tuple = [rgba.r, rgba.g, rgba.b];
            console.log(tuple);
        });
    });

    // $(function() {
    //     $('#shape-toggle').change(function () {
    //     });
    // });




});

function addColor(colorsetDiv) {
	console.log('ello');
	console.log(colorsetDiv);
	newColorNum = colorsetCount[colorsetDiv] + 1;
	console.log(newColorNum)
	if(newColorNum <= MAX_COLORS) {
		colorsetCount[colorsetDiv] = colorsetCount[colorsetDiv] + 1;
		var newDiv = colorsetDiv + '-color-' + newColorNum;
		var new_html = '<div id="' + newDiv + 
			'" class="input-group colorpicker-component"><input type="text" ' +
			'class="form-control" /><span class="input-group-addon">' +
			'<i></i></span></div>';
		$('#'+colorsetDiv).append(new_html);
		$(function() {
        $('#'+newDiv).colorpicker({
            format: 'rgb',
            color: '#FFFFFF'
        });
    });
	}
}

// setup p5
function setup() {
  var canvas = createCanvas(500, 500);
   canvas.parent('sketch-holder');
  background(tuple);

}

// main p5 loop
function draw() {
	shape = $('#shape-toggle input:radio:checked').val();
	tuple[1] = tuple[1]+1;
	background(tuple);
}