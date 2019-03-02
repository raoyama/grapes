'use strict';

class ShaderPcs {
	constructor(data_pos, data_cls, data_size) {

		// 頂点シェーダー:座標、色、サイズ
		let vs = `
			attribute vec3 position;
			uniform mat4 mvpMatrix;
			attribute float pointSize;
			attribute vec4 color;
			varying vec4 vColor;

			void main(void){
				gl_Position = mvpMatrix * vec4(position, 1.0);
				gl_PointSize = pointSize;
				vColor = color;
			}
		`;

		// フラグメントシェーダー:色指定
		let fs = `
			precision mediump float;
			varying vec4 vColor;
			void main(void){
				gl_FragColor = vColor;
			}
		`;

		this._prg = GlCommon.make_program_var(vs, fs);
		this._loc_position  = gl.getAttribLocation(this._prg, 'position');
		this._loc_color		= gl.getAttribLocation(this._prg, 'color');
		this._loc_mvpMatrix	= gl.getUniformLocation(this._prg, 'mvpMatrix');
		this._loc_pointSize	= gl.getAttribLocation(this._prg, 'pointSize');

    	this._vbo_pos       = GlCommon.create_vbo(data_pos);
		this._vbo_cls       = GlCommon.create_vbo(data_cls);
		this._vbo_size      = GlCommon.create_vbo(data_size);
    	this._data_length   = data_pos.length;
    }

	draw(mvpMatrix) {
		gl.useProgram(this._prg);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo_pos);
		gl.enableVertexAttribArray(this._loc_position);
		gl.vertexAttribPointer(this._loc_position, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo_cls);
		gl.enableVertexAttribArray(this._loc_color);
		gl.vertexAttribPointer(this._loc_color, 4, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo_size);
		gl.enableVertexAttribArray(this._loc_pointSize);
		gl.vertexAttribPointer(this._loc_pointSize, 1, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.uniformMatrix4fv(this._loc_mvpMatrix, false, mvpMatrix);
		gl.drawArrays(gl.POINTS, 0, this._data_length / 3);
	}

	
}
