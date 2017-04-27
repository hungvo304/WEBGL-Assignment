var sphereVertexPositionBuffer;
var sphereVertexTextureCoordBuffer;
var sphereVertexIndexBuffer;
var sphereVertexNormalBuffer;
var radius = 0.2;
function initSphereBuffer(){
  var latitudeBands = 30;
  var longitudeBands = 30;


  var vertexPositionData = [];
  var normalData = [];
  var textureCoordData = [];

  for(var latNumber = 0; latNumber <= latitudeBands; latNumber++){
    var theta = latNumber * Math.PI / latitudeBands;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for(var longNumber = 0; longNumber <= longitudeBands; longNumber++){
      var phi = longNumber * 2 * Math.PI / longitudeBands;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);

      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
      var u = 1 - (longNumber / longitudeBands);
      var v = 1 - (latNumber / latitudeBands);

      normalData.push(x);
      normalData.push(y);
      normalData.push(z);
      textureCoordData.push(u);
      textureCoordData.push(v);
      vertexPositionData.push(x * radius);
      vertexPositionData.push(y * radius);
      vertexPositionData.push(z * radius);
    }
  }

  var indexData = [];
  for(var latNumber = 0; latNumber < latitudeBands; latNumber++){
    for(var longNumber = 0; longNumber < longitudeBands; longNumber++){
      var first = (latNumber * (longitudeBands + 1)) + longNumber;
      var second = first + longitudeBands + 1;

      indexData.push(first);
      indexData.push(second);
      indexData.push(first + 1);

      indexData.push(second);
      indexData.push(second + 1);
      indexData.push(first + 1);
    }
  }

  sphereVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
  sphereVertexTextureCoordBuffer.itemSize = 2;
  sphereVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

  sphereVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
  sphereVertexPositionBuffer.itemSize = 3;
  sphereVertexPositionBuffer.numItems = vertexPositionData.length / 3;

  sphereVertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
  sphereVertexNormalBuffer.itemSize = 3;
  sphereVertexNormalBuffer.numItems = normalData.length / 3;

  sphereVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
  sphereVertexIndexBuffer.itemSize = 1;
  sphereVertexIndexBuffer.numItems = indexData.length;
}

var sphereTexture;
function initSphereTexture(){
    sphereTexture = gl.createTexture();
    sphereTexture.image = new Image();
    sphereTexture.image.onload = function(){
      handleLoadedTexture(sphereTexture);
    }
    sphereTexture.image.src = "./img/sphereTexture.jpg";
}

function Sphere(x, y, z){
  this.posX = x;
  this.posY = y;
  this.posZ = z;
  this.rot = 0;
  this.speed = 0;
  this.direction = [1, 0, 0];
}

Sphere.prototype.draw = function(){
    mvPushMatrix();
    mat4.translate(mvMatrix, [0, 0, this.posZ]);
    mat4.rotate(mvMatrix, degToRad(this.rot), this.direction);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sphereTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, sphereVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, sphereVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
    setUniformMatrix();
    gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix();
}

var speed = 0.01;

function Add(a, b){
  return a + b;
}
function Sub(a, b){
  return a - b;
}

var caculate = null;

Sphere.prototype.animate = function(elapsed){
  /*if (this.rot < 0 ){
    this.rot -= (360 * elapsed) / 1000.0;
  }
  else {
    this.rot += (360 * elapsed) / 1000.0;
  }*/
  this.rot = caculate(this.rot, (360 * elapsed) / 1000.0);
}

Sphere.prototype.moveLeft = function(){
    if (this.posX - radius > walls[2].posX + wallWidth){
    this.posX -= speed;
    caculate = Sub;
    //if (this.rot > 0) this.rot = -this.rot;
    this.direction = [0, 1, 0];
  }
}

Sphere.prototype.moveRight = function(){
  if (this.posX + radius < walls[3].posX - wallWidth){
    this.posX += speed;
    caculate = Add;
    //if (this.rot < 0) this.rot = -this.rot;
    this.direction = [0, 1, 0];
  }
}

Sphere.prototype.moveUp = function(){
  if (this.posY + radius < walls[0].posY - wallHeight){
    this.posY += speed;
    caculate = Sub;
    //if (this.rot > 0) this.rot = -this.rot;
    this.direction = [1, 0 , 0];
  }
}

Sphere.prototype.moveDown = function(){
  if (this.posY - radius > walls[1].posY + wallHeight){
    this.posY -= speed;
    caculate = Add;
    //if (this.rot < 0) this.rot = -this.rot;
    this.direction = [1, 0, 0];
  }
}
