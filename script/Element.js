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
			//btn.onclick = this.touchstart2();
			break;
		case 1:
			//→
			btn.style.top	= '970px';
			btn.style.left	= '270px';
			btn.onclick = new Function("alert('ok');");
			break;
		case 2:
			//←
			btn.style.top	= '970px';
			btn.style.left	= '30px';
			btn.onclick = new Function("alert('ok');");
			break;
		case 3:
			//↓
			btn.style.top	= '1090px';
			btn.style.left	= '150px';
			btn.onclick = new Function("alert('ok');");
			break;
		}
	}
	/*
	touchstart2(ev) {
		ev.preventDefault();
		ev = ev.targetTouches[0];
		this.mousedown(ev);
	}
	*/
}

