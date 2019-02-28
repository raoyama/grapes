//******************************************************************************
//* テクスチャ頂点シェーダー
//******************************************************************************
var shader_texture_vs = `
	attribute	vec3 position;
	attribute	vec2 textureCoord;
	uniform		mat4 mvpMatrix;
	varying		vec2 vTextureCoord;

	void main(void){
		vTextureCoord = textureCoord;
		gl_Position = mvpMatrix * vec4(position, 1.0);
	}
`;

//******************************************************************************
//* テクスチャフラグメントシェーダー
//******************************************************************************
var shader_texture_fs = `
	precision mediump float;
	uniform sampler2D texture;
	varying vec2      vTextureCoord;

	void main(void){
		vec4 smpColor = texture2D(texture, vTextureCoord);
		gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * smpColor;
	}
`;
