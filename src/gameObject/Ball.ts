import * as BABYLON from '@babylonjs/core';


type Ballstatus = 'start' | 'throw';

class Ball {

  power: number;
  snowBall: BABYLON.Mesh;
  snowBallPhysics: BABYLON.PhysicsAggregate;
  status: Ballstatus

  constructor(scene: BABYLON.Scene, disposeCallback: () => void) {
    this.power = 10;
    this.snowBall = BABYLON.MeshBuilder.CreateSphere('snowball', {
      segments: 10,
      diameter: 0.5
    }, scene);
    this.status = 'start'
    console.log('ball con')
    this.snowBallPhysics = new BABYLON.PhysicsAggregate(this.snowBall, BABYLON.PhysicsShapeType.SPHERE, { mass: 2, friction:5  }, scene)
    this.snowBallPhysics.body.disablePreStep = false;
    this.snowBallPhysics.body.setCollisionCallbackEnabled(true)
    this.snowBallPhysics.body.setMotionType(BABYLON.PhysicsMotionType.STATIC);
    this.snowBall.onDispose = () => {
      disposeCallback();
    }
  }
  setPosition(pos: BABYLON.Vector3) {
    if(this.status === 'start') {
      this.snowBall.position = pos;
    }
  }

  show(enabled: boolean) {
    this.snowBall.setEnabled(enabled);
  }

  addPower() {

  }

  addImpuse(power: BABYLON.Vector3, personPos: BABYLON.Vector3) {
    this.snowBallPhysics.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
    this.snowBallPhysics.body.applyImpulse(power.multiply(new BABYLON.Vector3(this.power, 0 , this.power)), personPos);
    this.status = 'throw';
  }
}


export default Ball;