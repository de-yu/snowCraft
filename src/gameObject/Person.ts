import * as BABYLON from '@babylonjs/core';
import Ball from './Ball';
import * as GUI from '@babylonjs/gui/';
import arrow from '../../public/arrow.png'

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
type Direction =  'w' | 's' | 'a' | 'd';

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
  firstThrow: boolean;
  limit: GroundLimit
  moveArr: Direction[];
  lookAtPos: BABYLON.Vector3;
  isControl: boolean;
  isUserControl: boolean;
  dead: boolean;
  text!: GUI.TextBlock;

  constructor (scene: BABYLON.Scene, material: BABYLON.StandardMaterial, startPos: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0), limit:  GroundLimit,
   isControl: boolean, isUserControl: boolean) {

    this.scene = scene;
    this.createPerson(material, startPos);
    this.createArrow(startPos);

    this.live = 100;
    this.power = 2;
    this.limit = limit;
    this.moveArr = [];
    this.isControl = isControl;
    this.isUserControl = isUserControl;
    this.dead = false;

    this.scene.onBeforeRenderObservable.add(() => {
      if(this.isControl) {
        this.person.position = BABYLON.Vector3.Lerp(this.person.position.clone(), this.personNewPos, 0.02);
        if(!this.lastBallDispose) {
          this.ball[this.ball.length -1].setPosition(this.person.position.add(this.person.forward))
        }
      }
    });
    
    this.scene.registerBeforeRender(() => {
      if(this.isControl) {
        this.move()
      }
    });

    if(this.isUserControl) {
      this.setControl();
      this.showLife();
    }
    this.setObservable();
    this.lookAtPos = new BABYLON.Vector3(0, 0 , 0);
    this.ball = [];
    this.lastBallDispose = true;
    this.firstThrow = true;

  }


  setControl() {
    let click = false;
    this.scene.onPointerDown = ((evt, info) => {
  
      if (info.hit) {
        this.createBall()
        click = true;
      }
    })
  
    this.scene.onPointerUp = ((evt, info) => {
      click = false;
      this.throwBall();
    })

    this.scene.onKeyboardObservable.add((kbInfo: BABYLON.KeyboardInfo) => {
      if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        if (kbInfo.event.key === 'w' || kbInfo.event.key === 'a' || kbInfo.event.key === 's' || kbInfo.event.key === 'd') {
          this.addMoveDirection(kbInfo.event.key)
        }
      }
      if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
        if (kbInfo.event.key === 'w' || kbInfo.event.key === 'a' || kbInfo.event.key === 's' || kbInfo.event.key === 'd') {
          this.removeMove(kbInfo.event.key)
        }
      }
    })

    this.scene.onPointerMove = (evt, pickResult) => {
      if (pickResult.hit && pickResult.pickedPoint) {
        this.setLookPos(pickResult.pickedPoint);
      }
    }
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
    this.personPhysics = new BABYLON.PhysicsAggregate(this.person, BABYLON.PhysicsShapeType.BOX, { mass: 100, friction:5, mesh:this.person  }, this.scene);
    this.personPhysics.body.disablePreStep = false;
    this.personPhysics.body.setCollisionCallbackEnabled(true)
    this.personPhysics.body.setMotionType(BABYLON.PhysicsMotionType.DYNAMIC);
  }

  createArrow(startPos: BABYLON.Vector3) {
    this.arrow = BABYLON.MeshBuilder.CreateGround("arrow", {width:1, height:1}, this.scene)
    this.arrow.position = startPos.add( this.person.forward);
    this.arrow.position.y = 0.1;
    this.arrowMat = new BABYLON.StandardMaterial("mat", this.scene);
    this.arrowMat.diffuseTexture = new BABYLON.Texture(arrow, this.scene);;
    this.arrow.material = this.arrowMat
  }


  setObservable() {
    const observable = this.personPhysics.body.getCollisionObservable();
    observable.add((collisionEvent) => {
      if(collisionEvent.collidedAgainst.transformNode.name === 'snowball') {
        collisionEvent.collidedAgainst.transformNode.dispose()
        this.changeLife(-25)
      }
      
      // if(this.live <= 0) {
      //   this.person.dispose();
      //   this.arrow.dispose();
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

  removeMove (direction: Direction) {
    const index = this.moveArr.indexOf(direction);
    if (index > -1) { // only splice array when item is found
      this.moveArr.splice(index, 1); // 2nd parameter means remove one item only
    }
  }

  addMoveDirection(direction: Direction) {
    for(const temp of moveDirection) {
      if(temp === direction) {
        if(!this.moveArr.includes(direction)) {
          this.moveArr.push(direction)
        }
      }
    }
  }
  
  setDirection(directions: Direction[]) {
    this.moveArr = directions
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
        this.firstThrow = true;
      }))
      this.ball[this.ball.length - 1].setPosition(this.person.position.clone().add(this.person.forward).clone());
      this.lastBallDispose = false;
    }
  }

  throwBall () {
    if(this.firstThrow) {
      this.ball[this.ball.length - 1].addImpuse(this.person.forward.multiply(
        new BABYLON.Vector3(3, 0 ,3)), this.person.position);
      this.firstThrow = false;
    }
    
  }

  showLife() {
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
    
    this.text = new GUI.TextBlock('life', `生命值: ${this.live.toString()}`);
    this.text.topInPixels = 600;
    this.text.leftInPixels = 100;
    this.text.fontSize = '36px';
    this.text.color = '#0f0'
    advancedTexture.addControl(this.text)

  }
  changeLife (value: number) {
    this.live = this.live + value
    if(this.isUserControl) {
      this.text.text = `生命值: ${this.live.toString()}`;
    }
  }

  get position() {
    return this.person.position;
  }
  get rotationY() {
    if(this.personPhysics.transformNode.rotationQuaternion) {
      return this.personPhysics.transformNode.rotationQuaternion?.toEulerAngles().y * 180 / Math.PI;
    }
    return 0
  }

  deletePerson() {
    this.person.dispose();
    this.arrow.dispose();
  }

  get isDead() {
    return this.dead;
  }
}

export default Person;