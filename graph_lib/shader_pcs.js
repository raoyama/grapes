//******************************************************************************
//* データ頂点シェーダー
//******************************************************************************
var shader_pcs_vs = `
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

//******************************************************************************
//* データフラグメントシェーダー
//******************************************************************************
var shader_pcs_fs = `
	precision mediump float;
	varying vec4 vColor;
	void main(void){
		gl_FragColor = vColor;
	}
`;
