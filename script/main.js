var gl;
var view;
var canvas;
var evt;
var player;
var m = new matIV();
var stats = new Stats();


//******************************************************************************
//* 初期化
//******************************************************************************


onload = function(){
	stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( stats.dom );
	
	startTime = performance.now();
	evt = new Event();
	element = new Element();
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
	stats.begin();
	if(player.moving() == true) {
		player.move();
	}
	stats.end();
	window.requestAnimationFrame(animloop);
}





function round(msg, n) {
	return  Math.floor(msg * Math.pow(10,n)) / Math.pow(10, n);
}
var PI_180 = Math.PI / 180;
function rad(deg) {
	return deg * PI_180;
}

//log共通関数
function comlog(table_id, target, msg) {

	let log_table_elem = document.getElementById(table_id);
	if(log_table_elem.childElementCount == 0) {
		let td_key = document.createElement('th');
		td_key.align = 'center';
		td_key.textContent = 'key';

		let td_val = document.createElement('th');
		td_val.align = 'center';
		td_val.textContent = '　　val　　';

		let tr = document.createElement('tr');
		tr.appendChild(td_key);
		tr.appendChild(td_val);
		log_table_elem.appendChild(tr);
	}

	let elem = document.getElementById(target);
	if (elem == null) {
		let td_key = document.createElement('td');
		td_key.align = 'left';
		td_key.textContent = target;

		let td_val = document.createElement('td');
		td_val.align = 'right';
		td_val.id  = target;
		elem = td_val;

		let tr = document.createElement('tr');
		tr.appendChild(td_key);
		tr.appendChild(td_val);
		log_table_elem.appendChild(tr);
	}
	if(isNaN(msg)) {
		elem.innerText = msg;
	} else {
		elem.innerText = round(msg, 2);
	}
}
//全体log
function log(target, msg) {
	return;//log off 
	comlog('log_table', target, msg);
}
