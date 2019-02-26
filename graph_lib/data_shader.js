//******************************************************************************
//* データ頂点シェーダー
//******************************************************************************
var shader_data_vs = `
	attribute vec3 position;
	uniform mat4 mvpMatrix;
	uniform float pointSize;
	attribute vec4 color;
	varying vec4 vColor;

	void main(void){
		gl_Position = mvpMatrix * vec4(position, 1.0);
		gl_PointSize = pointSize;
		vColor = color;
	}
`;

//******************************************************************************
//* データフラグメントシェーダー
//******************************************************************************
var shader_data_fs = `
	precision mediump float;
	varying vec4 vColor;
	void main(void){
		gl_FragColor = vColor;
	}
`;
