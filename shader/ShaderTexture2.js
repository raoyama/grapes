'use strict';

class ShaderTexture2 {
	constructor(data) {

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

		this._datas = data;
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

		//隠される面を除いたポリゴン作成
		let block_pos = [];
		for(let data of this._datas ) {
			this.array_put(block_pos, data[0], data[1], data[2], data[3]);
		}
		let surface_pos = [];
		for(let x in block_pos) {
			for(let y in block_pos[x]) {
				for(let z in block_pos[x][y]) {
					x = String(x);
					y = String(y);
					z = String(z);
					if(this.array_exists(block_pos, x, y, Number(z) + 1) == false)this.array_put2(surface_pos, x, y, z, 0, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x, y, Number(z) - 1) == false)this.array_put2(surface_pos, x, y, z, 1, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x, Number(y) + 1, z) == false)this.array_put2(surface_pos, x, y, z, 2, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x, Number(y) - 1, z) == false)this.array_put2(surface_pos, x, y, z, 3, block_pos[x][y][z]);
					if(this.array_exists(block_pos, Number(x) + 1, y, z) == false)this.array_put2(surface_pos, x, y, z, 4, block_pos[x][y][z]);
					if(this.array_exists(block_pos, Number(x) - 1, y, z) == false)this.array_put2(surface_pos, x, y, z, 5, block_pos[x][y][z]);
				}
			}
		}
		//console.log(block_pos);
		//console.log(surface_pos);
		let index_num = 0;

		let ver_vbo_pos2 = [];
		let textureCoord2 = [];
		this._index2 = []

		for(let x in surface_pos) {
			for(let y in surface_pos[x]) {
				for(let z in surface_pos[x][y]) {
					for(let s in surface_pos[x][y][z]) {
//						if(!surface_pos[x][y][z][s]) continue;
//						console.log(x,y,z,s);
						x = String(x);
						y = String(y);
						z = String(z);
						s = String(s);

						let ret = this.make_surface(x, y, z, index_num, s, surface_pos[x][y][z][s]);
						index_num = index_num + 1;
						ver_vbo_pos2.push(...ret['vbo_pos']);
						textureCoord2.push(...ret['texture']);
						this._index2.push(...ret['index']);
					}
				}
			}
		}
		console.log(ver_vbo_pos2.length);
		console.log(index_num);

		this._vbo_pos = GlCommon.create_vbo(ver_vbo_pos2);
		this._vbo_textureCoord = GlCommon.create_vbo(textureCoord2);
		let ibo = GlCommon.create_ibo(this._index2);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	}

	make_surface(x, y, z, index_id, surface_id, texture_id) {
		let ret = {};
		surface_id = Number(surface_id);
		ret['vbo_pos']	= [];
		ret['index']	= [];
		ret['texture']	= [];
		x = Number(x) * this._blocksize;
		y = Number(y) * this._blocksize;
		z = Number(z) * this._blocksize;

		switch (surface_id) {
			case 0:
				ret['vbo_pos'].push(...vec_add(this._ver_pos[0], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[1], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[2], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[3], [x, y, z]));
			break;
			case 1:
				ret['vbo_pos'].push(...vec_add(this._ver_pos[7], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[6], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[5], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[4], [x, y, z]));
			break;
			case 2:
				ret['vbo_pos'].push(...vec_add(this._ver_pos[6], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[7], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[3], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[2], [x, y, z]));
			break;
			case 3:
				ret['vbo_pos'].push(...vec_add(this._ver_pos[4], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[5], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[1], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[0], [x, y, z]));
			break;
			case 4:
				ret['vbo_pos'].push(...vec_add(this._ver_pos[5], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[6], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[2], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[1], [x, y, z]));
			break;
			case 5:
				ret['vbo_pos'].push(...vec_add(this._ver_pos[7], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[4], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[0], [x, y, z]));
				ret['vbo_pos'].push(...vec_add(this._ver_pos[3], [x, y, z]));
			break;
		}
		ret['index'].push(...vec_add(this._base_index, [index_id * 4]));
		ret['texture'].push(...this._texture_pos_list[texture_id][0]);
		ret['texture'].push(...this._texture_pos_list[texture_id][1]);
		ret['texture'].push(...this._texture_pos_list[texture_id][2]);
		ret['texture'].push(...this._texture_pos_list[texture_id][3]);

		return ret;
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
	array_put2(array, x, y, z, s, val) {
		x = String(x);
		y = String(y);
		z = String(z);
		s = String(s);
		if(array[x]				== undefined)array[x]			= [];
		if(array[x][y]			== undefined)array[x][y]		= [];
		if(array[x][y][z]		== undefined)array[x][y][z]		= [];
		if(array[x][y][z][s]	== undefined)array[x][y][z][s]	= [];
		array[x][y][z][s] = val;
	}



	draw(baseMatrix, mvpMatrix) {

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo_pos);
		gl.enableVertexAttribArray(this.loc_position);
		gl.vertexAttribPointer(this.loc_position, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo_textureCoord);
		gl.enableVertexAttribArray(this.loc_textureCoord);
		gl.vertexAttribPointer(this.loc_textureCoord, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		let trans_size = 2.0;

		//テクスチャが読み込まれるまで何もしない
		if(this._all_texture[0] == undefined)return;

		//テクスチャの粗さ
		gl.bindTexture(gl.TEXTURE_2D, this._all_texture[0]);
//			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

//		let a = [0,0,0];
//		let trans = vec_mul([trans_size, trans_size, trans_size], a);

		//移動
		gl.useProgram(this._prg);
//		m.translate(baseMatrix, trans, mvpMatrix);
		gl.uniformMatrix4fv(this.loc_mvpMatrix, false, mvpMatrix);
		gl.drawElements(gl.TRIANGLES, this._index2.length, gl.UNSIGNED_SHORT, 0);

	}
}
