import * as BABYLON from '@babylonjs/core';

interface GroundLimit {
  maxX: number;
  minX: number;
  maxZ: number;
  minZ: number;
}

class Ground {

  ground: BABYLON.Mesh;
  groundPhysics: BABYLON.PhysicsAggregate;
  scene: BABYLON.Scene;
  center: {x: number, y: number};
  textureResolution: number

  constructor (scene: BABYLON.Scene, textureResolution: number = 1000) {
    this.scene = scene;
    this.ground= BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, this.scene);
    this.ground.checkCollisions = true;
    this.ground.enablePointerMoveEvents = true;
    this.groundPhysics = new BABYLON.PhysicsAggregate(this.ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, this.scene);
    this.groundPhysics.body.setCollisionCallbackEnabled(true);
    const observable = this.groundPhysics.body.getCollisionObservable();
    observable.add((collisionEvent) => {

      if(collisionEvent.collidedAgainst.transformNode.name === 'snowball') {
        collisionEvent.collidedAgainst.transformNode.dispose()
      }
    });

    this.textureResolution = textureResolution;
    this.center = { x: textureResolution / 2, y: textureResolution /2};
  }

  setEdge(groundLimit: GroundLimit) {

    var textureGround = new BABYLON.DynamicTexture("dynamic texture", this.textureResolution, this.scene);   
    var textureContext = textureGround.getContext();
    
    var materialGround = new BABYLON.StandardMaterial("Mat", this.scene);    				
    materialGround.diffuseTexture = textureGround;
    this.ground.material = materialGround;
      
      //Draw on canvas
      textureContext.beginPath();
      textureContext.rect(this.center.x- groundLimit.maxX * 10, 
        this.center.y - groundLimit.maxZ * 10, 
        10 * groundLimit.maxX * 2,
        10 * groundLimit.maxZ * 2)
      textureContext.fillStyle = "white";
      textureContext.fill();
      textureGround.update();
  
  }
}

export default Ground;