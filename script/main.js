var gl;
var view;
var canvas;
var player;
var m = new matIV();

//******************************************************************************
//* 初期化
//******************************************************************************


onload = function(){
	startTime = performance.now();
	player = new Player();
	canvas = new Canvas();
	view = new View();
	endTime = performance.now();
	console.log(endTime - startTime); 

	view.draw_display();
//	window.setInterval(anim, 100);
	player.move();
	animloop();
};

function animloop(){
	if(player.moving() == true) {
		player.move();
	}
	window.requestAnimationFrame(animloop);
}
