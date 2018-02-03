const guider_canvas = document.getElementById("guider_canvas");

function main(){
    const gl = guider_canvas.getContext("webgl");
  
    // Only continue if WebGL is available and working
    if (!gl) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }
  
    // Set clear color to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT);

    
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //gl.enable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.globleInfo = {
        cameraMatrix: mat4.create(),
        antiCameraMatrix: mat4.create(),
        projectionMatrix: mat4.create(),
    }
    mat4.perspective(gl.globleInfo.projectionMatrix, 60 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.01, 2000);
    mat4.inverse(gl.globleInfo.antiCameraMatrix, gl.globleInfo.cameraMatrix);
    //相机FOV 60

    gl.clear(gl.COLOR_BUFFER_BIT);
    obj1 = new GLObject(gl);
    mat4.translate(obj1.viewMatrix, obj1.viewMatrix, [0,0,-15]);
    mat4.rotate(obj1.viewMatrix, obj1.viewMatrix, 0.7, [0,0,1]);
    obj1.setSquare();
    obj1.texture = createTexture(gl);

    obj1.drawOn();
}
class GLObject{
    constructor(gl){
        this.gl = gl;
        this.positionBuffer = this.gl.createBuffer();
        this.textureCoordBuffer = this.gl.createBuffer();
        this.normalBuffer = this.gl.createBuffer();
        this.indexBuffer = this.gl.createBuffer();
        this.texture = undefined;
        this.vertexCount = 0;
        this.viewMatrix = mat4.create();

        this.shaderProgram = createShaderProgram(this.gl, GLObject.defaultvsSource, GLObject.defaultfsSource);
        this.programInfo = {
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
                vertexNormal: this.gl.getAttribLocation(this.shaderProgram, 'aVertexNormal'),
                textureCoord: this.gl.getAttribLocation(this.shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
                normalMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uNormalMatrix'),
                uSampler: this.gl.getUniformLocation(this.shaderProgram, 'uSampler'),
            },
        };
        return this;
    }
    drawOn(params){
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.disable(this.gl.BLEND);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.disable(this.gl.CULL_FACE);
        {//position array
            const numComponents = 3;  // pull out 3 values per iteration
            const type = this.gl.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
                                      // 0 = use type and numComponents above
            const offset = 0;         // how many bytes inside the buffer to start from
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
                this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
        }   
        {//normal array
            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexNormal,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexNormal);
        }
        {
            const num = 2; // every coordinate composed of 2 values
            const type = this.gl.FLOAT; // the data in the buffer is 32 bit float
            const normalize = false; // don't normalize
            const stride = 0; // how many bytes to get from one set to the next
            const offset = 0; // how many butes inside the buffer to start from
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
            this.gl.vertexAttribPointer(this.programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
            this.gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
        }
        this.gl.useProgram(this.shaderProgram);
        //send uniforms
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, this.gl.globleInfo.projectionMatrix);
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, this.viewMatrix);
        var normalMatrix = mat4.create();
        mat4.inverse(normalMatrix, normalMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.normalMatrix, false, normalMatrix);

        //bind buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

        // Tell the shader we bound the texture to texture unit 0
        this.gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);
        {
            var type = this.gl.UNSIGNED_SHORT;
            //this.gl.drawElements(this.gl.TRIANGLES, this.vertexCount, type, 0);
            this.gl.drawElements(this.gl.TRIANGLES, 3, type, 0);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 24);
            //this.gl.drawArrays(this.gl.TRIANGLES, 3, 3);
        }
    }
    setSquare(){
        {
            this.gl.deleteBuffer(this.positionBuffer);
            this.positionBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
            const positions = [
                // Front face
                -1.0, -1.0,  1.0,
                 1.0, -1.0,  1.0,
                 1.0,  1.0,  1.0,
                -1.0,  1.0,  1.0,
                
                // Back face
                -1.0, -1.0, -1.0,
                -1.0,  1.0, -1.0,
                 1.0,  1.0, -1.0,
                 1.0, -1.0, -1.0,
                
                // Top face
                -1.0,  1.0, -1.0,
                -1.0,  1.0,  1.0,
                 1.0,  1.0,  1.0,
                 1.0,  1.0, -1.0,
                
                // Bottom face
                -1.0, -1.0, -1.0,
                 1.0, -1.0, -1.0,
                 1.0, -1.0,  1.0,
                -1.0, -1.0,  1.0,
                
                // Right face
                 1.0, -1.0, -1.0,
                 1.0,  1.0, -1.0,
                 1.0,  1.0,  1.0,
                 1.0, -1.0,  1.0,
                
                // Left face
                -1.0, -1.0, -1.0,
                -1.0, -1.0,  1.0,
                -1.0,  1.0,  1.0,
                -1.0,  1.0, -1.0,
            ];
            this.gl.bufferData(this.gl.ARRAY_BUFFER,
                new Float32Array(positions),
                this.gl.STATIC_DRAW);
        }
        {
            this.gl.deleteBuffer(this.textureCoordBuffer);
            this.textureCoordBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
            const textureCoordinates = [
                // Front
                0.0,  0.0,
                1.0,  0.0,
                1.0,  1.0,
                0.0,  1.0,
                // Back
                0.0,  0.0,
                1.0,  0.0,
                1.0,  1.0,
                0.0,  1.0,
                // Top
                0.0,  0.0,
                1.0,  0.0,
                1.0,  1.0,
                0.0,  1.0,
                // Bottom
                0.0,  0.0,
                1.0,  0.0,
                1.0,  1.0,
                0.0,  1.0,
                // Right
                0.0,  0.0,
                1.0,  0.0,
                1.0,  1.0,
                0.0,  1.0,
                // Left
                0.0,  0.0,
                1.0,  0.0,
                1.0,  1.0,
                0.0,  1.0,
            ];
            this.gl.bufferData(this.gl.ARRAY_BUFFER,
                new Float32Array(textureCoordinates),
                this.gl.STATIC_DRAW);
        }
        {
            this.gl.deleteBuffer(this.normalBuffer);
            this.normalBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            const vertexNormals = [
                // Front
                0.0,  0.0,  1.0,
                0.0,  0.0,  1.0,
                0.0,  0.0,  1.0,
                0.0,  0.0,  1.0,
            
                // Back
                0.0,  0.0, -1.0,
                0.0,  0.0, -1.0,
                0.0,  0.0, -1.0,
                0.0,  0.0, -1.0,
            
                // Top
                0.0,  1.0,  0.0,
                0.0,  1.0,  0.0,
                0.0,  1.0,  0.0,
                0.0,  1.0,  0.0,
            
                // Bottom
                0.0, -1.0,  0.0,
                0.0, -1.0,  0.0,
                0.0, -1.0,  0.0,
                0.0, -1.0,  0.0,
            
                // Right
                1.0,  0.0,  0.0,
                1.0,  0.0,  0.0,
                1.0,  0.0,  0.0,
                1.0,  0.0,  0.0,
            
                // Left
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0
            ];
            this.gl.bufferData(this.gl.ARRAY_BUFFER,
                new Float32Array(vertexNormals),
                this.gl.STATIC_DRAW);
        }
        {
            this.gl.deleteBuffer(this.indexBuffer);
            this.indexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            const indices = [
                0,  1,  2,      0,  2,  3,    // front
                4,  5,  6,      4,  6,  7,    // back
                8,  9,  10,     8,  10, 11,   // top
                12, 13, 14,     12, 14, 15,   // bottom
                16, 17, 18,     16, 18, 19,   // right
                20, 21, 22,     20, 22, 23,   // left
            ];
            this.gl.bufferData(this.gl.ARRAY_BUFFER,
                new Uint16Array(indices),
                this.gl.STATIC_DRAW);
        }
        this.vertexCount = 36;
    }
}
GLObject.defaultvsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
`;
GLObject.defaultfsSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

        gl_FragColor = vec4(texelColor.rgb, texelColor.a);
        //gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    }
`;
function createShaderProgram(gl, vsSource, fsSource) {
    //vertexshader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(vertexShader));
        return null;
    }
    //fragmentshader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(fragmentShader));
        return null;
    }
    // Create the shader program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        gl.deleteProgram(shaderProgram);
        return null;
    }
    return shaderProgram;
}
function deleteShaderProgram(gl, shaderProgram){
    gl.deleteProgram(shaderProgram);
}
function createTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //得到一个单像素texture
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);
  
    // Turn off mips and set  wrapping to clamp to edge so it
    // will work regardless of the dimensions of the video.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  
    return texture;
}
function deleteTexture(gl, texture){
    gl.deleteTexture(texture);
}
main();