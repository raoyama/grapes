'use strict';

class ShaderP {
	constructor(data_pos) {

		// 頂点シェーダー:座標
		let vs = `
			attribute vec3 position;
			uniform mat4 mvpMatrix;
			void main(void){
				gl_Position = mvpMatrix * vec4(position, 1.0);
			}
		`;

		// フラグメントシェーダー
		let fs = `
			precision mediump float;
			void main(void){
				gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
			}
		`;

		//位置シェーダー
		this._prg             = GlCommon.make_program_var(vs, fs);
		this._loc_position    = gl.getAttribLocation(this._prg, 'position');
		this._loc_mvpMatrix	  = gl.getUniformLocation(this._prg, 'mvpMatrix');

		this._vbo_pos         = GlCommon.create_vbo(data_pos);
    	this._data_length     = data_pos.length;
    }

	draw(mvpMatrix) {

		gl.useProgram(this._prg);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo_pos);
		gl.enableVertexAttribArray(this._loc_position);
		gl.vertexAttribPointer(this._loc_position, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.uniformMatrix4fv(this._loc_mvpMatrix, false, mvpMatrix);
		gl.drawArrays(gl.LINES, 0, this._data_length / 3);
	}
}
