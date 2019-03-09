'use strict';

class ShaderTexture2 {
	constructor(data_list) {

		// 頂点シェーダー:座標
		let vs = `
			attribute	vec3 position;
			attribute	vec2 textureCoord;
			uniform		mat4 mvpMatrix;
			varying		vec2 vTextureCoord;

			void main(void){
				vTextureCoord = textureCoord;
				gl_Position = mvpMatrix * vec4(position, 1.0);
			}
		`;

		// フラグメントシェーダー
		let fs = `
			precision mediump float;
			uniform sampler2D texture;
			varying vec2      vTextureCoord;

			void main(void){
				vec4 smpColor = texture2D(texture, vTextureCoord);
				gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * smpColor;
			}
		`;

		//テクスチャー シェーダー
		this._prg             = GlCommon.make_program_var(vs, fs);
		this.loc_position		= gl.getAttribLocation(this._prg, 'position');
		this.loc_textureCoord	= gl.getAttribLocation(this._prg, 'textureCoord');
		this.loc_mvpMatrix		= gl.getUniformLocation(this._prg, 'mvpMatrix');
		this.loc_texture		= gl.getUniformLocation(this._prg, 'texture');

		this._all_texture = [];
		GlCommon.create_texture(this._all_texture, 'texture/block_all.png', 0);

		this._ver_pos = [
			[-1.0, -1.0,   1.0],
			[1.0 , -1.0,   1.0],
			[1.0 ,  1.0,   1.0],
			[-1.0,  1.0,   1.0],
			[-1.0, -1.0,  -1.0],
			[1.0 , -1.0,  -1.0],
			[1.0 ,  1.0,  -1.0],
			[-1.0,  1.0,  -1.0],
		];
		this._base_index = [0,   1,  2,   0,  2,  3];
		this._blocksize = 2;

		// テクスチャ座標
		this._texture_pos_list = this.make_texture_pos(4);	//4分割

		/** 隠される面を除いたポリゴン作成 */
		//ブロック位置を3次元連想配列に格納
		console.log('1:' + performance.now()); 
		let block_pos = {};
		for(let data of data_list ) {
			this.array_put(block_pos, data[0], data[1], data[2], data[3]);
		}

		//ブロックの隣にブロックがなければ面を作成
		//vboの量に制限があるため、グループに分けて格納していく
		console.log('2:' + performance.now()); 
		this.index_num = 0;
		this.point_list = [];
		this.group_num = 0;

		for(let x in block_pos) {
			for(let y in block_pos[x]) {
				for(let z in block_pos[x][y]) {
					x = Number(x);
					y = Number(y);
					z = Number(z);
					if(this.array_exists(block_pos, x, y, z + 1) == false)this.make_surface(x, y, z, 0, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x, y, z - 1) == false)this.make_surface(x, y, z, 1, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x, y + 1, z) == false)this.make_surface(x, y, z, 2, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x, y - 1, z) == false)this.make_surface(x, y, z, 3, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x + 1, y, z) == false)this.make_surface(x, y, z, 4, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x - 1, y, z) == false)this.make_surface(x, y, z, 5, block_pos[x][y][z]);
				}                                                                                
			}
		}

		//vbo,iboをグループごとに作成
		console.log('3:' + performance.now()); 
		this._vbo_list = [];
		for(let i =0; i <  this.point_list.length; i ++) {
			this._vbo_list[i] = {};
			this._vbo_list[i]['pos']			= GlCommon.create_vbo(this.point_list[i]['pos']);
			this._vbo_list[i]['texture']		= GlCommon.create_vbo(this.point_list[i]['texture']);
			this._vbo_list[i]['index']			= GlCommon.create_ibo(this.point_list[i]['index']);
			this._vbo_list[i]['index_length']	= this.point_list[i]['index'].length;
		}
		 this.point_list = null;
	}

	make_surface(x, y, z, surface_id, texture_id) {
		x = x * this._blocksize;
		y = y * this._blocksize;
		z = z * this._blocksize;

		if(this.point_list[this.group_num] == undefined) {
			this.point_list[this.group_num] = {};
			this.point_list[this.group_num]['pos']		= [];
			this.point_list[this.group_num]['texture']	= [];
			this.point_list[this.group_num]['index']	= [];
		}
		switch (surface_id) {
			case 0:
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[0], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[1], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[2], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[3], x, y, z));
			break;
			case 1:
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[7], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[6], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[5], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[4], x, y, z));
			break;
			case 2:
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[6], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[7], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[3], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[2], x, y, z));
			break;
			case 3:
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[4], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[5], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[1], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[0], x, y, z));
			break;
			case 4:
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[5], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[6], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[2], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[1], x, y, z));
			break;
			case 5:
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[7], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[4], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[0], x, y, z));
				this.point_list[this.group_num]['pos'].push(...this.vec3_add(this._ver_pos[3], x, y, z));
			break;
		}
		this.point_list[this.group_num]['index'].push(...this.vec6_add(this._base_index, this.index_num * 4));
		this.point_list[this.group_num]['texture'].push(...this._texture_pos_list[texture_id][0]);
		this.point_list[this.group_num]['texture'].push(...this._texture_pos_list[texture_id][1]);
		this.point_list[this.group_num]['texture'].push(...this._texture_pos_list[texture_id][2]);
		this.point_list[this.group_num]['texture'].push(...this._texture_pos_list[texture_id][3]);
		this.index_num = this.index_num + 1;

		if(this.index_num % 10000 == 0){
			this.group_num ++;
			this.index_num = 0;
		}
	}

	make_texture_pos(split) {
		let num = Math.sqrt(split);	//1辺の数
		let base = 1 / num;
		let ret_list = [];
		for(let i = 0; i < num; i ++) {
			for(let j = 0; j < num; j ++) {
				let tmp = [];
				let tmp_base_i = base * i;
				let tmp_base_j = base * j;
				//console.log(tmp_base_i, tmp_base_j);
				tmp.push([tmp_base_i, tmp_base_j + base]);
				tmp.push([tmp_base_i + base, tmp_base_j + base]);
				tmp.push([tmp_base_i + base, tmp_base_j]);
				tmp.push([tmp_base_i, tmp_base_j]);
				ret_list.push(tmp);
			}
		}

		return ret_list;
	}

	vec6_add(array, n) {
		let ret = [];
		for(let i = 0; i < 6; i++) {
			ret[i] = array[i] + n;
		}
		return ret;
	}
	vec3_add(array, x, y, z) {
		let ret = [];
		ret[0] = array[0] + x;
		ret[1] = array[1] + y;
		ret[2] = array[2] + z;
		return ret;
	}
	array_exists(array, x, y, z) {
		x = String(x);
		y = String(y);
		z = String(z);
//		console.log(x + ':' + y + ':' + z);
		if(array[x]			== undefined)return false;
		if(array[x][y]		== undefined)return false;
		if(array[x][y][z]	== undefined)return false;
		return true;
	}

	array_put(array, x, y, z, val) {
		x = String(x);
		y = String(y);
		z = String(z);
		if(array[x]			== undefined)array[x]		= [];
		if(array[x][y]		== undefined)array[x][y]	= [];
		if(array[x][y][z]	== undefined)array[x][y][z]	= [];
		array[x][y][z] = val;
	}


	draw(mvpMatrix) {
		for(let vbo of this._vbo_list) {
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo['pos']);
			gl.enableVertexAttribArray(this.loc_position);
			gl.vertexAttribPointer(this.loc_position, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);

			gl.bindBuffer(gl.ARRAY_BUFFER, vbo['texture']);
			gl.enableVertexAttribArray(this.loc_textureCoord);
			gl.vertexAttribPointer(this.loc_textureCoord, 2, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo['index']);
			let trans_size = 2.0;

			//テクスチャが読み込まれるまで何もしない
			if(this._all_texture[0] == undefined)return;

			gl.bindTexture(gl.TEXTURE_2D, this._all_texture[0]);
			//テクスチャの粗さ
//			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

			//移動
			gl.useProgram(this._prg);
			gl.uniformMatrix4fv(this.loc_mvpMatrix, false, mvpMatrix);
			gl.drawElements(gl.TRIANGLES, vbo['index_length'], gl.UNSIGNED_SHORT, 0);
		}


	}
}
