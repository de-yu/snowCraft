import * as BABYLON from '@babylonjs/core';
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import * as GUI from '@babylonjs/gui/';
import { AdvancedDynamicTexture, Button } from '@babylonjs/gui/2D';
import Person from './gameObject/Person';
import Ground from './gameObject/Ground';
import Ai from './gameObject/Ai';

export class AppOne {
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;
  ratio: number;
  size: number;
  start: boolean;

  constructor(readonly canvas: HTMLCanvasElement) {
    this.engine = new BABYLON.Engine(canvas);
    this.scene = new BABYLON.Scene(this.engine);
    this.ratio = 0;
    this.size = 10;
    this.start = false;

    window.addEventListener('resize', () => {
      this.engine.resize();
    });


  }

  debug(debugOn: boolean = true) {
    if (debugOn) {
      this.scene.debugLayer.show({ overlay: true, showExplorer: true });
    } else {
      this.scene.debugLayer.hide();
    }
  }

  async run() {
    await this.createScene()

    this.createUI();
    this.debug(true);
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  async createScene() {

    // 三維坐標軸
    //new BABYLON.AxesViewer(this.scene, 5);
  
    let havokInstance = await HavokPhysics()
    const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
    this.scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), havokPlugin);
    this.scene.collisionsEnabled = true;

    let camera = new BABYLON.ArcRotateCamera("camera1",0, 0, 80, BABYLON.Vector3.Zero(), this.scene);
    this.ratio = this.scene.getEngine().getAspectRatio(camera)
    camera.mode = BABYLON.ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = this.size + 5;
    camera.orthoBottom = -this.size - 5;
    camera.orthoLeft = (-this.size - 5) * this.ratio;
    camera.orthoRight = (this.size + 5) * this.ratio;
  
    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());
  
    //camera.attachControl(this.canvas, true);
    // This attaches the camera to the canvas
  
    let light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, -1, 0), this.scene);
    light.intensity = 0.8;

  };

  createGame() {

    let redMat = new BABYLON.StandardMaterial("redMat", this.scene);
    redMat.emissiveColor = new BABYLON.Color3(1, 0, 0);
    
    let blueMat = new BABYLON.StandardMaterial("blueMat", this.scene);
    blueMat.emissiveColor = new BABYLON.Color3(0, 0, 1);

    let greenMat = new BABYLON.StandardMaterial("greenMat", this.scene);
    greenMat.emissiveColor = new BABYLON.Color3(0, 1, 0);

    const ground = new Ground(this.scene)
    ground.setEdge(sizetoMax(this.size, this.ratio));

    const sizeMax = sizetoMax(this.size, this.ratio)

    const newPerson = new Person(this.scene, blueMat,  new BABYLON.Vector3(sizeMax.minX + 1,1,sizeMax.minZ + 1), sizeMax, true, true);

    const teammates = [];
    for(let i=0; i<9;i++) {
      teammates.push(
        new Person(this.scene, greenMat,  new BABYLON.Vector3(sizeMax.minX + i + 2,1,sizeMax.minZ + 1), sizeMax, this.start, false)
      )
    }

    const enemies = []
    for(let i=0; i<10;i++) {
      enemies.push(
        new Person(this.scene, redMat, new BABYLON.Vector3(sizeMax.minX + i + 1 , 1 ,sizeMax.maxZ - 1), sizeMax, this.start, false)
      )
    }

    for(let i=0; i<9;i++) {
      new Ai(teammates[i], enemies, this.scene);
    }

    for(let i=0; i<10;i++) {
      new Ai(enemies[i], teammates.concat(newPerson), this.scene);
    }

    for(let i=0; i<teammates.length;i++) {
      if(teammates[i] !== null) {
        if(teammates[i].isDead){
          delete teammates[i];
        }
      }
    }

    for(let i=0; i<enemies.length;i++) {
      if(enemies[i] !== null) {
        if(enemies[i].isDead){
          delete enemies[i];
        }
      }
    }
  }
  createTestGame() {
    let blueMat = new BABYLON.StandardMaterial("blueMat", this.scene);
    blueMat.emissiveColor = new BABYLON.Color3(0, 0, 1);

    let redMat = new BABYLON.StandardMaterial("redMat", this.scene);
    redMat.emissiveColor = new BABYLON.Color3(1, 0, 0);

    const ground = new Ground(this.scene)
    ground.setEdge(sizetoMax(this.size, this.ratio));

    const sizeMax = sizetoMax(this.size, this.ratio)

    const newPerson = new Person(this.scene, blueMat,  new BABYLON.Vector3(1,1,1), sizeMax, true, true);

    const enemy = new Person(this.scene, redMat, new BABYLON.Vector3(-1 , 1 ,-1), sizeMax, this.start, false);

    new Ai(enemy, [newPerson], this.scene);
  }


  createUI() {
  
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
    
    let text = new GUI.TextBlock('mode', 'Game mode');
    text.top = '-100px';
    text.fontSize = '36px';

    let button1 = GUI.Button.CreateSimpleButton("but1", "10 vs 10");
    button1.width = "150px";
    button1.height = "40px";
    button1.color = "white";
    button1.cornerRadius = 20;
    button1.background = "green";
    button1.onPointerUpObservable.add(() => {
      this.start = true;
      advancedTexture.removeControl(button1);
      advancedTexture.removeControl(button2); 
      advancedTexture.removeControl(text);
      this.createGame();
    });
    let button2 = GUI.Button.CreateSimpleButton("but2", "test game");
    button2.width = "150px";
    button2.height = "40px";
    button2.color = "white";
    button2.cornerRadius = 20;
    button2.background = "green";
    button2.top = '100px';
    button2.onPointerUpObservable.add(() => {
      this.start = true;
      advancedTexture.removeControl(button1);
      advancedTexture.removeControl(button2);
      advancedTexture.removeControl(text);
      this.createTestGame();
    });
    advancedTexture.addControl(button1);
    advancedTexture.addControl(button2); 
  }
  
}

interface GroundLimit {
  maxX: number;
  minX: number;
  maxZ: number;
  minZ: number;
}

function sizetoMax(size: number, ratio: number): GroundLimit {
  return {
    maxX: size,
    minX: -size,
    maxZ: size * ratio,
    minZ: -size * ratio
  }
}