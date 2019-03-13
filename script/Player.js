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
		this.jump_step	 = 0.2;
		this.flying_flg = false;
	}

	//移動後の8角
	get_corner(pos) {
		let corner_pos = [];
		let rad = 0.499;
		corner_pos[0] = [pos[0] + rad, pos[1] + rad * 2, pos[2] + rad];
		corner_pos[1] = [pos[0] - rad, pos[1] + rad * 2, pos[2] + rad];
		corner_pos[2] = [pos[0] - rad, pos[1] + rad * 2, pos[2] - rad];
		corner_pos[3] = [pos[0] + rad, pos[1] + rad * 2, pos[2] - rad];
		corner_pos[4] = [pos[0] + rad, pos[1] - rad, pos[2] + rad];
		corner_pos[5] = [pos[0] - rad, pos[1] - rad, pos[2] + rad];
		corner_pos[6] = [pos[0] - rad, pos[1] - rad, pos[2] - rad];
		corner_pos[7] = [pos[0] + rad, pos[1] - rad, pos[2] - rad];
		return corner_pos;
	}

	move() {

		//落下速度
		this.v_y += this.a_y;
		this.a_y -= 0.07;
		if(this.v_y >= 1)this.v_y = 0.5;
		if(this.v_y <= -1)this.v_y = -0.5;
		
		console.log('before a:',round(this.a_x,2), round(this.a_y,2), round(this.a_z,2),'v:',round(this.v_x,2), round(this.v_y,2), round(this.v_z,2),'pos:',round(this.pos_x,2), round(this.pos_y,2), round(this.pos_z,2));

		//各軸移動後の8角計算
		let corner_pos_x = this.get_corner([this.pos_x + this.v_x, this.pos_y, this.pos_z]);
		let corner_pos_y = this.get_corner([this.pos_x, this.pos_y + this.v_y, this.pos_z]);
		let corner_pos_z = this.get_corner([this.pos_x, this.pos_y, this.pos_z + this.v_z]);

		//正面
		if(this.v_x > 0) {
			if(view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_x[0])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_x[4])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_x[3])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_x[7])) == true) {
				this.v_x = 0;
				this.pos_x = this.get_block(corner_pos_x[0])[0] - 1;
				console.log('前');
			}
		}
		//後ろ
		if(this.v_x < 0) {
			let corner_pos = this.get_corner([this.pos_x  + this.v_x, this.pos_y, this.pos_z]);
			if(view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_x[1])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_x[5])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_x[2])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_x[6])) == true) {
				this.v_x = 0;
				this.pos_x = this.get_block(corner_pos_x[1])[0] + 1;
				console.log('後');
			}
		}
		//右
		if(this.v_z > 0) {
			if(view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_z[0])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_z[1])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_z[5])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_z[4])) == true) {
				this.v_z = 0;
				this.pos_z = this.get_block(corner_pos_z[0])[2] - 1;
				console.log('右');
			}
		}
		//左
		if(this.v_z < 0) {
			if(view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_z[3])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_z[2])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_z[6])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_z[7])) == true) {
				this.v_z = 0;
				this.pos_z = this.get_block(corner_pos_z[3])[2] + 1;
				console.log('左');
			}
		}

		//上
		if(this.v_y > 0) {
			if(view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_y[0])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_y[1])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_y[2])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_y[3])) == true) {
				this.a_y = 0;
				this.v_y = 0;
//				this.pos_y = this.get_block(corner_pos_y[0])[1] - 1;
				console.log('上');
				this.flying_flg = true;
			}
		}
		//下
		if(this.v_y < 0) {
			if(view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_y[4])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_y[5])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_y[6])) == true
			|| view.shaderTextureMulti.block_exists_array(this.get_block(corner_pos_y[7])) == true) {
				this.a_y = 0;
				this.v_y = 0;
				console.log('下');
				this.pos_y = this.get_block(corner_pos_y[4])[1] + 1;
				this.flying_flg = false;
			} else {
				this.flying_flg = true;
			}
		}


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

		log('flying_flg', this.flying_flg);
		log('key', JSON.stringify(canvas.key_state));
		console.log('after a:',round(this.a_x,2), round(this.a_y,2), round(this.a_z,2),'v:',round(this.v_x,2), round(this.v_y,2), round(this.v_z,2),'pos:',round(this.pos_x,2), round(this.pos_y,2), round(this.pos_z,2));
		view.draw_display();
	}

	moving() {
		if(this.v_x != 0 || this.v_y != 0 || this.v_z != 0 || this.a_y != 0 || this.flying_flg == true) return true;
		return false;
	}
	get_block(pos) {
		let ret = [0];
		ret[0] = Math.round(pos[0]);
		ret[1] = Math.round(pos[1]);
		ret[2] = Math.round(pos[2]);
		return ret;
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
			if(this.flying_flg == false) {
				this.flying_flg = true;
				this.a_y += this.jump_step;
			}
		}
		//https://teratail.com/questions/38689 同時押し
	}
}
console.log(Math.floor(0.99));
console.log(Math.floor(-0.99));
