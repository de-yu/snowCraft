import * as BABYLON from '@babylonjs/core';


class Ground {

  ground: BABYLON.Mesh;
  groundPhysics: BABYLON.PhysicsAggregate;

  constructor (scene: BABYLON.Scene) {

    this.ground= BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    this.ground.checkCollisions = true;
    this.ground.enablePointerMoveEvents = true;
    this.groundPhysics = new BABYLON.PhysicsAggregate(this.ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);
    this.groundPhysics.body.setCollisionCallbackEnabled(true);
    const observable = this.groundPhysics.body.getCollisionObservable();
    observable.add((collisionEvent) => {

      if(collisionEvent.collidedAgainst.transformNode.name === 'snowball') {
        collisionEvent.collidedAgainst.transformNode.dispose()
      }
    });
  }

}

export default Ground;