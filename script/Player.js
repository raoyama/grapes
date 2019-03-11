'use strict';

class Player {
	constructor() {
		this.pos_x	= 0.0;
		this.pos_y	= 30.0;
		this.pos_z	= 0.0;
		this.a_x	= 0.0;
		this.a_y	= 0.0;
		this.a_z	= 0.0;
		this.v_x	= 0.0;
		this.v_y	= 0.0;
		this.v_z	= 0.0;
		this.view_x	= 0.0;
		this.view_y	= 0.0;

		this.step		 = 0.1;
		this.jump_step	 = 1;
		this.jumping_flg = false;
	}

	move() {
		view.draw_display();

		this.a_y -= 0.1;
		this.v_y += this.a_y;
		if(this.v_y >= 1)this.v_y = 1;
		if(this.v_y <= -1)this.v_y = -1;

		if(view.shaderTextureMulti.block_exists(Math.ceil((this.pos_x  + this.v_x)), Math.ceil(this.pos_y) - 2, Math.ceil(this.pos_z))) {
			this.v_x = 0;
		}
		if(view.shaderTextureMulti.block_exists(Math.ceil(this.pos_x), Math.ceil((this.pos_y  + this.v_y)) - 2, Math.ceil(this.pos_z))) {
			this.a_y = 0;
			this.v_y = 0;
			this.jumping_flg = false;
		} else {
			this.jumping_flg = true;
		}
		if(view.shaderTextureMulti.block_exists(Math.ceil(this.pos_x), Math.ceil(this.pos_y) - 2, Math.ceil((this.pos_z  + this.v_z)))) {
			this.v_z = 0;
		}

		this.pos_x += this.v_x;
		this.pos_y += this.v_y;
		this.pos_z += this.v_z;

		this.v_x = 0;
		this.v_z = 0;
		console.log('pos:',[this.a_x, this.a_y, this.a_z],'pos:',[this.v_x, this.v_y, this.v_z],'pos:',[this.pos_x, this.pos_y, this.pos_z]);
	}

	moving() {
		if(this.v_x != 0 || this.v_y != 0 || this.v_z != 0 || this.a_y != 0) return true;
		return false;
	}

	keyevent(keycode) {
		console.log(keycode);
		switch(keycode) {
			case 'KeyW':
				this.v_x += Math.cos(this.view_x / 180 * Math.PI) * this.step;
				this.v_z += Math.sin(this.view_x / 180 * Math.PI) * this.step;
				break;
			case 'KeyD':
				this.v_x -= Math.sin(this.view_x / 180 * Math.PI) * this.step;
				this.v_z += Math.cos(this.view_x / 180 * Math.PI) * this.step;
				break;
			case 'KeyS':
				this.v_x -= Math.cos(this.view_x / 180 * Math.PI) * this.step;
				this.v_z -= Math.sin(this.view_x / 180 * Math.PI) * this.step;
				break;
			case 'KeyA':
				this.v_x += Math.sin(this.view_x / 180 * Math.PI) * this.step;
				this.v_z -= Math.cos(this.view_x / 180 * Math.PI) * this.step;
				break;
			case 'Space':
				if(this.jumping_flg == false) {
					this.a_y += this.jump_step;
				}
				break;
		}
		//https://teratail.com/questions/38689 同時押し
	}
}
