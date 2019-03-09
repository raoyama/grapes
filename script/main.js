var gl;
var view;
var canvas;
var m = new matIV();
var anime_flg = true;

//******************************************************************************
//* 初期化
//******************************************************************************
function anim() {
	view.draw_display();
	if(view.shaderTextureMulti.block_exists(Math.ceil(view.camera_x / 2), Math.ceil(view.camera_y / 2) - 3, Math.ceil(view.camera_z / 2))) {
		anime_flg = false;
	} else {
		view.camera_y -= 1;
	}
};

onload = function(){
	startTime = performance.now();
	canvas = new Canvas();
	view = new View();
	endTime = performance.now();
	console.log(endTime - startTime); 

	view.draw_display();
//	window.setInterval(anim, 100);
	animloop();
};
function animloop(){
	anim();
	window.requestAnimationFrame(animloop);
}
