import * as BABYLON from '@babylonjs/core';
import Ball from './Ball';


interface GroundLimit {
  maxX: number;
  minX: number;
  maxZ: number;
  minZ: number;
}

const moveValue = {
  'w': new BABYLON.Vector3(-1,0,0),
  'a': new BABYLON.Vector3(0,0,-1),
  's': new BABYLON.Vector3(1,0,0),
  'd': new BABYLON.Vector3(0,0,1),
}

const moveDirection = ['w', 'a', 's', 'd'];

class Person {

  scene: BABYLON.Scene;
  person!: BABYLON.Mesh;
  personNewPos!: BABYLON.Vector3;
  personPhysics!: BABYLON.PhysicsAggregate;
  arrow!: BABYLON.Mesh;
  arrowMat!: BABYLON.StandardMaterial;

  power: number;
  live: number;
  ball: Ball[];
  lastBallDispose: boolean;
  limit: GroundLimit
  moveArr: string[];
  lookAtPos: BABYLON.Vector3;
  strength: boolean;
  newStrength: number

  constructor (scene: BABYLON.Scene, material: BABYLON.StandardMaterial, startPos: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0), limit:  GroundLimit) {

    this.scene = scene;
    this.createPerson(material, startPos);
    this.createArrow(startPos);

    this.live = 100;
    this.power = 2;
    this.limit = limit;
    this.moveArr = [];

    this.scene.onBeforeRenderObservable.add(() => {
      this.person.position = BABYLON.Vector3.Lerp(this.person.position.clone(), this.personNewPos, 0.02);
      if(!this.lastBallDispose) {
        this.ball[this.ball.length -1].setPosition(this.person.position.add(this.person.forward))
      }
      this.arrow.scaling.z = this.newStrength
    });
    this.scene.registerBeforeRender(() => {
      this.move()
      this.addPower()
    });

    this.setObservable()
    this.lookAtPos = new BABYLON.Vector3(0, 0 , 0);
    this.ball = [];
    this.lastBallDispose = true;
    this.strength = false
    this.newStrength = 1
  }

  createPerson( material: BABYLON.StandardMaterial, startPos: BABYLON.Vector3) {

    this.person = BABYLON.MeshBuilder.CreateCapsule('person', {
      height: 2,
    }, this.scene);
    this.person.material = material;
    this.person.rotation = new BABYLON.Vector3(0, 0 , 0);
    this.person.position = startPos;
    this.personNewPos = startPos;
    this.person.checkCollisions = true;
    this.personPhysics = new BABYLON.PhysicsAggregate(this.person, BABYLON.PhysicsShapeType.BOX, { mass: 20, friction:5, mesh:this.person  }, this.scene);
    this.personPhysics.body.disablePreStep = false;
    this.personPhysics.body.setCollisionCallbackEnabled(true)
    this.personPhysics.body.setMotionType(BABYLON.PhysicsMotionType.STATIC);
  }

  createArrow(startPos: BABYLON.Vector3) {
    this.arrow = BABYLON.MeshBuilder.CreateGround("arrow", {width:1, height:1}, this.scene)
    this.arrow.position = startPos.add( this.person.forward);
    this.arrow.position.y = 0.1;
    this.arrowMat = new BABYLON.StandardMaterial("mat", this.scene);
    this.arrowMat.diffuseTexture = new BABYLON.Texture("public/arrow.png", this.scene);;
    this.arrow.material = this.arrowMat
  }


  setObservable() {
    const observable = this.personPhysics.body.getCollisionObservable();
    observable.add((collisionEvent) => {
      if(collisionEvent.collidedAgainst.transformNode.name === 'snowball') {
        collisionEvent.collidedAgainst.transformNode.dispose()
        this.live = this.live - 50
      }
      // if(this.live <= 0) {
      //   this.person.dispose();
      // }
    });
  }

  setLookPos(targetPoint: BABYLON.Vector3) {
    this.lookAtPos = targetPoint;
    this.lookAt();
  } 

  lookAt() {
    const temp = this.lookAtPos.add(this.person.position.negate())
    temp.y = 0;
    this.personPhysics.transformNode.setDirection(temp);
    this.arrow.setDirection(temp);
    this.arrow.position = this.person.position.add(this.person.forward);
    this.arrow.position.y = 0.1
  } 

  removeMove (direction: 'w' | 's' | 'a' | 'd') {
    const index = this.moveArr.indexOf(direction);
    if (index > -1) { // only splice array when item is found
      this.moveArr.splice(index, 1); // 2nd parameter means remove one item only
    }
  }

  addMoveDirection(direction: 'w' | 's' | 'a' | 'd') {
    for(const temp of moveDirection) {
      if(temp === direction) {
        if(!this.moveArr.includes(direction)) {
          this.moveArr.push(direction)
        }
      }
    }
  }
  move () {

    let move = this.person.position

    let sum = new BABYLON.Vector3(0,0,0);
    for(const temp of this.moveArr) {
      sum = sum.add(moveValue[temp])
    }

    move = this.person.position.add(sum.scaleInPlace(1));

    move.x = Math.min(this.limit.maxX, move.x)
    move.x = Math.max(this.limit.minX, move.x)

    move.z = Math.min(this.limit.maxZ, move.z)
    move.z = Math.max(this.limit.minZ, move.z)

    this.personNewPos = move
    this.lookAt();
  }

  createBall () {
    if(this.lastBallDispose) {
      this.ball.push(new Ball(this.scene, () => {
        this.lastBallDispose = true;
        this.strength = false
      }))
      this.ball[this.ball.length - 1].setPosition(this.person.position.clone().add(this.person.forward).clone());
      this.lastBallDispose = false;
      this.strength = true
    }
  }

  addPower() {
    if(this.strength) {
      this.newStrength += 0.05
      this.newStrength = Math.min(this.newStrength, 3)
    } else {
      this.newStrength -= 0.05
      this.newStrength = Math.max(this.newStrength, 1)
    }

  }

  throwBall () {
    this.ball[this.ball.length - 1].addImpuse(this.person.forward.multiply(
      new BABYLON.Vector3(3, 0 ,3)), this.person.position);
  }
}

export default Person;