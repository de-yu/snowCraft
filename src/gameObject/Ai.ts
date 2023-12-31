import * as BABYLON from '@babylonjs/core';
import Person from "./Person";
import { random } from 'lodash';
type Direction =  'w' | 's' | 'a' | 'd';
const rotationPoint = [0, 45, 90, 135, 180, 225, 270, 315];
const operation: Direction[][] = [
  ['d'], ['w', 'd'], ['w'], ['w', 'a'], ['a'], ['a', 's'], ['s'], ['s', 'd']
]

class Ai {

  person: Person;
  enemy: Person[];
  nearestIndex: number;
  scene: BABYLON.Scene;

  constructor(person: Person, enemy: Person[], scene: BABYLON.Scene) {
    this.person = person;
    this.enemy = enemy;
    this.scene = scene
    this.nearestIndex = 0

    this.scene.registerBeforeRender(() => {
      this.nearestEnemy();
      this.lookTarget()
      if(!this.isInRange()) {
        this.setMoveDirection()
        this.person.move();
      } else {
        this.stop();
      }
    });

    setInterval(() => {
      // if(this.isInRange()){
      //   this.shoot();
      // }
      setTimeout(() => {
        if(this.isInRange()){
          this.shoot();
        }
      }, random(500,1500))
    }, 1000)
  }

  nearestEnemy() {
    let distance = 100;
    let index = 0;
    for(let i=0;i<this.enemy.length;i++) {
      const newDistance = BABYLON.Vector3.Distance(this.person.position, this.enemy[i].position);
      if(newDistance < distance) {
        distance = newDistance;
        index = i
      }
    }
    this.nearestIndex = index;
  }

  lookTarget() {
    this.person.setLookPos(this.enemy[this.nearestIndex].position)
  }

  stop() {
    this.person.setDirection([]);
  }

  setMoveDirection() {
    let rotation = 0;
    if(this.person.rotationY < 0) {
      rotation = Math.abs(this.person.rotationY);
    } else {
      rotation = 360 - this.person.rotationY
    }

    let rotationMin = 360;
    let direction: Direction[]  = [];
    for(let i=0;i< rotationPoint.length;i++) {
      const diff = Math.abs(rotation - rotationPoint[i]);
      if(diff < rotationMin) {
        rotationMin = diff;
        direction = operation[i];
      }
    }
    
    this.person.setDirection(direction);

  } 
  
  isInRange() {
    return BABYLON.Vector3.Distance(this.person.position, this.enemy[this.nearestIndex].position) < 6
  }

  shoot() {
    this.person.createBall();
    this.person.throwBall();
  }
}

export default Ai;