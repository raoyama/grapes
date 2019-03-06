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

		let ver_pos = [
			[-1.0, -1.0,   1.0],
			[1.0 , -1.0,   1.0],
			[1.0 ,  1.0,   1.0],
			[-1.0,  1.0,   1.0],
			[-1.0, -1.0,  -1.0],
			[1.0 , -1.0,  -1.0],
			[1.0 ,  1.0,  -1.0],
			[-1.0,  1.0,  -1.0],
		];

		let ver_vbo_pos = [];
		ver_vbo_pos.push(...ver_pos[0]);
		ver_vbo_pos.push(...ver_pos[1]);
		ver_vbo_pos.push(...ver_pos[2]);
		ver_vbo_pos.push(...ver_pos[3]);

		ver_vbo_pos.push(...ver_pos[7]);
		ver_vbo_pos.push(...ver_pos[6]);
		ver_vbo_pos.push(...ver_pos[5]);
		ver_vbo_pos.push(...ver_pos[4]);

		ver_vbo_pos.push(...ver_pos[4]);
		ver_vbo_pos.push(...ver_pos[5]);
		ver_vbo_pos.push(...ver_pos[1]);
		ver_vbo_pos.push(...ver_pos[0]);

		ver_vbo_pos.push(...ver_pos[7]);
		ver_vbo_pos.push(...ver_pos[4]);
		ver_vbo_pos.push(...ver_pos[0]);
		ver_vbo_pos.push(...ver_pos[3]);

		ver_vbo_pos.push(...ver_pos[6]);
		ver_vbo_pos.push(...ver_pos[7]);
		ver_vbo_pos.push(...ver_pos[3]);
		ver_vbo_pos.push(...ver_pos[2]);

		ver_vbo_pos.push(...ver_pos[5]);
		ver_vbo_pos.push(...ver_pos[6]);
		ver_vbo_pos.push(...ver_pos[2]);
		ver_vbo_pos.push(...ver_pos[1]);


		this._index = [
			0,   1,  2,   0,  2,  3,
			4,   5,  6,   4,  6,  7,
			8,   9, 10,   8, 10, 11,
			12, 13, 14,  12, 14, 15,
			16, 17, 18,  16, 18, 19,
			20, 21, 22,  20, 22, 23,
		];

		// テクスチャ座標
		let texture_pos = [
			[0.0, 0.0],
			[0.0, 1.0],
			[1.0, 1.0],
			[1.0, 0.0],
		];

		let textureCoord = [];
		textureCoord.push(...texture_pos[1]);
		textureCoord.push(...texture_pos[2]);
		textureCoord.push(...texture_pos[3]);
		textureCoord.push(...texture_pos[0]);
		
		textureCoord.push(...texture_pos[1]);
		textureCoord.push(...texture_pos[2]);
		textureCoord.push(...texture_pos[3]);
		textureCoord.push(...texture_pos[0]);

		textureCoord.push(...texture_pos[1]);
		textureCoord.push(...texture_pos[2]);
		textureCoord.push(...texture_pos[3]);
		textureCoord.push(...texture_pos[0]);

		textureCoord.push(...texture_pos[1]);
		textureCoord.push(...texture_pos[2]);
		textureCoord.push(...texture_pos[3]);
		textureCoord.push(...texture_pos[0]);

		textureCoord.push(...texture_pos[1]);
		textureCoord.push(...texture_pos[2]);
		textureCoord.push(...texture_pos[3]);
		textureCoord.push(...texture_pos[0]);

		textureCoord.push(...texture_pos[1]);
		textureCoord.push(...texture_pos[2]);
		textureCoord.push(...texture_pos[3]);
		textureCoord.push(...texture_pos[0]);

		this._datas = data;

		//テクスチャー シェーダー
		this._prg             = GlCommon.make_program_var(vs, fs);
		this.loc_position		= gl.getAttribLocation(this._prg, 'position');
		this.loc_textureCoord	= gl.getAttribLocation(this._prg, 'textureCoord');
		this.loc_mvpMatrix		= gl.getUniformLocation(this._prg, 'mvpMatrix');
		this.loc_texture		= gl.getUniformLocation(this._prg, 'texture');

		this._textures = [];
		GlCommon.create_texture(this._textures, 'texture/block1.png', 1);
		GlCommon.create_texture(this._textures, 'texture/block2.png', 2);
		GlCommon.create_texture(this._textures, 'texture/block3.png', 3);
		GlCommon.create_texture(this._textures, 'texture/block4.png', 4);
		GlCommon.create_texture(this._textures, 'texture/block5.png', 5);
		GlCommon.create_texture(this._textures, 'texture/block6.png', 6);
		GlCommon.create_texture(this._textures, 'texture/block7.png', 7);
		GlCommon.create_texture(this._textures, 'texture/block8.png', 8);
		GlCommon.create_texture(this._textures, 'texture/block9.png', 9);
		GlCommon.create_texture(this._textures, 'texture/block_test.png', 10);


		this._vbo_pos = GlCommon.create_vbo(ver_vbo_pos);
		this._vbo_textureCoord = GlCommon.create_vbo(textureCoord);

		let ibo = GlCommon.create_ibo(this._index);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

		//隠される面を除いたポリゴン作成
		let block_pos = [];
		for(let data of this._datas ) {
			this.array_put(block_pos, data[0], data[1], data[2], data[3]);
		}
		let surface_pos = [];
		for(let x in block_pos) {
			for(let y in block_pos[x]) {
				for(let z in block_pos[x][y]) {
					if(this.array_exists(block_pos, x, y, z + 1) == false)this.array_put2(surface_pos, x, y, z, 0, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x, y, z - 1) == false)this.array_put2(surface_pos, x, y, z, 1, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x, y + 1, z) == false)this.array_put2(surface_pos, x, y, z, 2, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x, y - 1, z) == false)this.array_put2(surface_pos, x, y, z, 3, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x + 1, y, z) == false)this.array_put2(surface_pos, x, y, z, 4, block_pos[x][y][z]);
					if(this.array_exists(block_pos, x - 1, y, z) == false)this.array_put2(surface_pos, x, y, z, 5, block_pos[x][y][z]);
				}
			}
		}
		console.log(block_pos);
		console.log(surface_pos);
	}
	array_exists(array, x, y, z) {
		x = Number(x);
		y = Number(y);
		z = Number(z);
		console.log(x + ':' + y + ':' + z);
		if(array[x]			== undefined)return false;
		if(array[x][y]		== undefined)return false;
		if(array[x][y][z]	== undefined)return false;
		return true;
	}
	array_put(array, x, y, z, val) {
		x = Number(x);
		y = Number(y);
		z = Number(z);
		if(array[x]			== undefined)array[x]		= [];
		if(array[x][y]		== undefined)array[x][y]	= [];
		if(array[x][y][z]	== undefined)array[x][y][z]	= [];
		array[x][y][z] = val;
	}
	array_put2(array, x, y, z, s, val) {
		x = Number(x);
		y = Number(y);
		z = Number(z);
		s = Number(s);
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
		for(let data of this._datas ) {

			//テクスチャが読み込まれるまで何もしない
			if(this._textures[data[3]] == undefined)return;

			//テクスチャの粗さ
			gl.bindTexture(gl.TEXTURE_2D, this._textures[data[3]]);
//			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

			let a = [data[0], data[1], data[2]];
			let trans = vec_mul([trans_size, trans_size, trans_size], a);

			//移動
			gl.useProgram(this._prg);
			m.translate(baseMatrix, trans, mvpMatrix);
			gl.uniformMatrix4fv(this.loc_mvpMatrix, false, mvpMatrix);
			gl.drawElements(gl.TRIANGLES, this._index.length, gl.UNSIGNED_SHORT, 0);
		}
	}
}
