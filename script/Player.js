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

		this.step		 = 0.5;
		this.jump_step	 = 1;
		this.jumping_flg = false;
	}

	move() {

		//落下速度
		this.v_y += this.a_y;
		this.a_y -= 0.1;
		if(this.v_y >= 1)this.v_y = 0.5;
		if(this.v_y <= -1)this.v_y = -0.5;
		
		if(this.v_x > 0) {
			if(view.shaderTextureMulti.block_exists(Math.floor((this.pos_x  + this.v_x) + 1), Math.round(this.pos_y) , Math.round(this.pos_z + 0.5))) {
				this.v_x = 0;
			}
			if(view.shaderTextureMulti.block_exists(Math.floor((this.pos_x  + this.v_x) + 1), Math.round(this.pos_y) , Math.round(this.pos_z - 0.5))) {
				this.v_x = 0;
			}
		} else {
			if(view.shaderTextureMulti.block_exists(Math.floor((this.pos_x  + this.v_x) - 1), Math.round(this.pos_y) , Math.round(this.pos_z + 0.5))) {
				this.v_x = 0;
			}
			if(view.shaderTextureMulti.block_exists(Math.floor((this.pos_x  + this.v_x) - 1), Math.round(this.pos_y) , Math.round(this.pos_z - 0.5))) {
				this.v_x = 0;
			}
		}
		
		if(this.v_z > 0) {
			if(view.shaderTextureMulti.block_exists(Math.round(this.pos_x + 0.5), Math.round(this.pos_y) , Math.floor((this.pos_z  + this.v_z) + 1))) {
				this.v_z = 0;
			}
			if(view.shaderTextureMulti.block_exists(Math.round(this.pos_x - 0.5), Math.round(this.pos_y) , Math.floor((this.pos_z  + this.v_z) + 1))) {
				this.v_z = 0;
			}
		} else {
			if(view.shaderTextureMulti.block_exists(Math.round(this.pos_x + 0.5), Math.round(this.pos_y) , Math.floor((this.pos_z  + this.v_z) - 1))) {
				this.v_z = 0;
			}
			if(view.shaderTextureMulti.block_exists(Math.round(this.pos_x - 0.5), Math.round(this.pos_y) , Math.floor((this.pos_z  + this.v_z) - 1))) {
				this.v_z = 0;
			}
		}

		console.log('t_v:',round(this.v_x,2), round(this.v_y,2), round(this.v_z,2));
		console.log('t_pos:',round(this.pos_x,2), round(this.pos_y,2), round(this.pos_z,2));
		console.log('teste',Math.round(this.pos_x), Math.floor((this.pos_y  + this.v_y) - 1) , Math.round(this.pos_z));
		if(this.v_y > 0) {
			if(view.shaderTextureMulti.block_exists(Math.round(this.pos_x), Math.floor((this.pos_y  + this.v_y) + 1) , Math.round(this.pos_z))) {
				this.a_y = 0;
				this.v_y = 0;
		//		this.pos_y = Math.ceil(this.pos_y);
				this.jumping_flg = false;
			} else {
				this.jumping_flg = true;
			}
		} else {
			if(view.shaderTextureMulti.block_exists(Math.round(this.pos_x), Math.floor((this.pos_y  + this.v_y) - 1) , Math.round(this.pos_z))) {
				this.a_y = 0;
				this.v_y = 0;
		//		this.pos_y = Math.ceil(this.pos_y);
				this.jumping_flg = false;
			} else {
				this.jumping_flg = true;
			}
		}
		/*
		//あたり判定
		if(view.shaderTextureMulti.block_exists(Math.ceil((this.pos_x  + this.v_x)), Math.ceil(this.pos_y) , Math.ceil(this.pos_z))) {
			this.v_x = 0;
		}
		if(view.shaderTextureMulti.block_exists(Math.ceil(this.pos_x), Math.ceil((this.pos_y  + this.v_y)) , Math.ceil(this.pos_z))) {
			this.a_y = 0;
			this.v_y = 0;
			this.pos_y = Math.ceil(this.pos_y);
			this.jumping_flg = false;
		} else {
			this.jumping_flg = true;
		}
		if(view.shaderTextureMulti.block_exists(Math.ceil(this.pos_x), Math.ceil(this.pos_y) , Math.ceil((this.pos_z  + this.v_z)))) {
			this.v_z = 0;
		}
*/
		
		this.pos_x += this.v_x;
		this.pos_y += this.v_y;
		this.pos_z += this.v_z;

		this.v_x = 0;
		this.v_z = 0;

		log('a_x', this.a_x);
		log('a_y', this.a_y);
		log('a_z', this.a_z);
		log('v_x', this.v_x);
		log('v_y', this.v_y);
		log('v_z', this.v_z);
		log('pos_x', this.pos_x);
		log('pos_y', this.pos_y);
		log('pos_z', this.pos_z);
		log('key', JSON.stringify(canvas.key_state));
		console.log('a:',round(this.a_x,2), round(this.a_y,2), round(this.a_z,2),'v:',round(this.v_x,2), round(this.v_y,2), round(this.v_z,2),'pos:',round(this.pos_x,2), round(this.pos_y,2), round(this.pos_z,2));
		view.draw_display();
	}

	moving() {
		if(this.v_x != 0 || this.v_y != 0 || this.v_z != 0 || this.a_y != 0) return true;
		return false;
	}

	keyevent() {
		if(canvas.key_state['KeyW']) {
			this.v_x += Math.cos(this.view_x / 180 * Math.PI) * this.step;
			this.v_z += Math.sin(this.view_x / 180 * Math.PI) * this.step;
		}

		if(canvas.key_state['KeyD']) {
			this.v_x -= Math.sin(this.view_x / 180 * Math.PI) * this.step;
			this.v_z += Math.cos(this.view_x / 180 * Math.PI) * this.step;
		}
		if(canvas.key_state['KeyS']) {
			this.v_x -= Math.cos(this.view_x / 180 * Math.PI) * this.step;
			this.v_z -= Math.sin(this.view_x / 180 * Math.PI) * this.step;
		}
		if(canvas.key_state['KeyA']) {
			this.v_x += Math.sin(this.view_x / 180 * Math.PI) * this.step;
			this.v_z -= Math.cos(this.view_x / 180 * Math.PI) * this.step;
		}
		if(canvas.key_state['Space']) {
			if(this.jumping_flg == false) {
				this.a_y += this.jump_step;
			}
		}
		//https://teratail.com/questions/38689 同時押し
	}
}
console.log(Math.floor(0.99));
console.log(Math.floor(-0.99));
