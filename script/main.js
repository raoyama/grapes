var gl;
var view;
var canvas;
var m = new matIV();

//******************************************************************************
//* 初期化
//******************************************************************************
onload = function(){
	startTime = performance.now();
	canvas = new Canvas();
	view = new View();
	endTime = performance.now();
	console.log(endTime - startTime); 

	view.draw_display();

};

