var gl;
var view;
var canvas;
var evt;
var player;
var m = new matIV();

//******************************************************************************
//* 初期化
//******************************************************************************


onload = function(){
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
	if(player.moving() == true) {
		player.move();
	}
	window.requestAnimationFrame(animloop);
}





function round(msg, n) {
	return  Math.floor(msg * Math.pow(10,n)) / Math.pow(10, n);
}
function rad(deg) {
	return deg / 180 * Math.PI;
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
	comlog('log_table', target, msg);
}
