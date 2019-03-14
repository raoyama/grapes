'use strict';
//無駄にhtmlを自動生成する
class Element {

	constructor() {
		console.log(navigator.userAgent);
		this.add_canvas();
		this.add_logbox();
		if(navigator.userAgent.match(/(iPhone|iPod|Android.*Mobile)/i)){
			this.add_button(0);
			this.add_button(1);
			this.add_button(2);
			this.add_button(3);
			this.add_button(4);
		}else{
		}
	}
	add_canvas() {
		let elem  = document.createElement('canvas');
		elem.id  = 'canvas';
		document.body.appendChild(elem);
	}

	add_logbox() {
		let div  = document.createElement('div');
		div.className  = 'logbox';
		let table  = document.createElement('table');
		table.id = 'log_table';
		div.appendChild(table);
		document.body.appendChild(div);
	}

	add_button(num) {
		let btn  = document.createElement('button');
		btn.className	= 'ctrl_btn';
		document.body.appendChild(btn);
		switch (num) {
		case 0:
			//↑
			btn.style.top	= '850px';
			btn.style.left	= '150px';
			break;
		case 1:
			//→
			btn.style.top	= '970px';
			btn.style.left	= '270px';
			break;
		case 2:
			//↓
			btn.style.top	= '1090px';
			btn.style.left	= '150px';
			break;
		case 3:
			//←
			btn.style.top	= '970px';
			btn.style.left	= '30px';
			break;
		case 4:
			//space
			btn.style.top	= '1200px';
			btn.style.left	= '400px';
			break;
		}
		btn.addEventListener('touchstart',	function(event){return evt.buttonstart(event, num);},		false);
		btn.addEventListener('touchend',	function(event){return evt.buttonend(event, num);},		false);
	}

}

