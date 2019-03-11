'use strict';

class ShaderTextureBlock {
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
		let vertex_position = [
			// Front face
			-0.5, -0.5,  0.5,
			0.5, -0.5,  0.5,
			0.5,  0.5,  0.5,
			-0.5,  0.5,  0.5,

			// Back face
			-0.5, -0.5, -0.5,
			-0.5,  0.5, -0.5,
			0.5,  0.5, -0.5,
			0.5, -0.5, -0.5,

			// Top face
			-0.5,  0.5, -0.5,
			-0.5,  0.5,  0.5,
			0.5,  0.5,  0.5,
			0.5,  0.5, -0.5,

			// Bottom face
			-0.5, -0.5, -0.5,
			0.5, -0.5, -0.5,
			0.5, -0.5,  0.5,
			-0.5, -0.5,  0.5,

			// Right face
			0.5, -0.5, -0.5,
			0.5,  0.5, -0.5,
			0.5,  0.5,  0.5,
			0.5, -0.5,  0.5,

			// Left face
			-0.5, -0.5, -0.5,
			-0.5, -0.5,  0.5,
			-0.5,  0.5,  0.5,
			-0.5,  0.5, -0.5,
		];
		this._textures = [];
		this._index = [
			0, 1, 2,      0, 2, 3,    // Front face
			4, 5, 6,      4, 6, 7,    // Back face
			8, 9, 10,     8, 10, 11,  // Top face
			12, 13, 14,   12, 14, 15, // Bottom face
			16, 17, 18,   16, 18, 19, // Right face
			20, 21, 22,   20, 22, 23  // Left face
		];

		// テクスチャ座標
		let textureCoord = [
			// Front face
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,

			// Back face
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,

			// Top face
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,

			// Bottom face
			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0,

			// Right face
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
			0.0, 0.0,

			// Left face
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
		];

		this._datas = data;

		//テクスチャー シェーダー
		this._prg             = GlCommon.make_program_var(vs, fs);
		this.loc_position		= gl.getAttribLocation(this._prg, 'position');
		this.loc_textureCoord	= gl.getAttribLocation(this._prg, 'textureCoord');
		this.loc_mvpMatrix		= gl.getUniformLocation(this._prg, 'mvpMatrix');
		this.loc_texture		= gl.getUniformLocation(this._prg, 'texture');

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


		this._vbo_pos = GlCommon.create_vbo(vertex_position);
		this._vbo_textureCoord = GlCommon.create_vbo(textureCoord);

		let ibo = GlCommon.create_ibo(this._index);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	
	}

	draw(baseMatrix, mvpMatrix, pos) {

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo_pos);
		gl.enableVertexAttribArray(this.loc_position);
		gl.vertexAttribPointer(this.loc_position, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo_textureCoord);
		gl.enableVertexAttribArray(this.loc_textureCoord);
		gl.vertexAttribPointer(this.loc_textureCoord, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		for(let data of this._datas ) {

			//テクスチャが読み込まれるまで何もしない
			if(this._textures[data[3]] == undefined)return;

			//テクスチャの粗さ
			gl.bindTexture(gl.TEXTURE_2D, this._textures[data[3]]);
//			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

			let a = [data[0] + pos[0], data[1] + pos[1], data[2] + pos[2]];

			//移動
			gl.useProgram(this._prg);
			m.translate(baseMatrix, a, mvpMatrix);
			gl.uniformMatrix4fv(this.loc_mvpMatrix, false, mvpMatrix);
			gl.drawElements(gl.TRIANGLES, this._index.length, gl.UNSIGNED_SHORT, 0);
		}
	}


}
