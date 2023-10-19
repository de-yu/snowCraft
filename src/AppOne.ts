import * as BABYLON from '@babylonjs/core';
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import * as GUI from '@babylonjs/gui/';
import { AdvancedDynamicTexture, Button } from '@babylonjs/gui/2D';
import Person from './gameObject/Person';
import Ground from './gameObject/Ground';

export class AppOne {
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;

  constructor(readonly canvas: HTMLCanvasElement) {
    this.engine = new BABYLON.Engine(canvas)
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
    this.scene = await createScene(this.engine, this.canvas)
    this.debug(true);
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

}

let createScene = async function (engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
  // this is the default code from the playground:
  // This creates a basic Babylon Scene object (non-mesh)

  let size = 5
  let scene = new BABYLON.Scene(engine);
 
  new BABYLON.AxesViewer(scene, 5);

  let havokInstance = await HavokPhysics()
  const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
  scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), havokPlugin);
  scene.collisionsEnabled = true;
  // This creates and positions a free camera (non-mesh)
  let camera = new BABYLON.ArcRotateCamera("camera1",0, 0, 80, BABYLON.Vector3.Zero(), scene);
  const ratio = scene.getEngine().getAspectRatio(camera)
  camera.mode = BABYLON.ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
  camera.orthoTop = size+2;
  camera.orthoBottom = -size-2;
  camera.orthoLeft = (-size-2) * ratio;
  camera.orthoRight = (size+2) * ratio;

  // This targets the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());

  //camera.attachControl(canvas, true);
  // This attaches the camera to the canvas

  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  let light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, -1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.8;

  var redMat = new BABYLON.StandardMaterial("redMat", scene,);
	redMat.emissiveColor = new BABYLON.Color3(1, 0, 0);
	
	var blueMat = new BABYLON.StandardMaterial("blueMat", scene);
	blueMat.emissiveColor = new BABYLON.Color3(0, 0, 1);
	
  console.log(sizetoMax(size, ratio))

  const newPerson = new Person(scene, blueMat,  new BABYLON.Vector3(5,1,5), sizetoMax(size, ratio));
  new Ground(scene)

  const foe = new Person(scene, redMat, new BABYLON.Vector3(2,1,2), sizetoMax(size, ratio));


  let click = false;
  scene.onPointerDown = ((evt, info) => {

    if (info.hit) {
      newPerson.createBall()
      click = true;
    }
  })

  scene.onPointerUp = ((evt, info) => {
    click = false;
    newPerson.throwBall();
  })

  scene.onKeyboardObservable.add((kbInfo: BABYLON.KeyboardInfo) => {
    if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
      if (kbInfo.event.key === 'w' || kbInfo.event.key === 'a' || kbInfo.event.key === 's' || kbInfo.event.key === 'd') {
        newPerson.addMoveDirection(kbInfo.event.key)
      }
    }
    if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
      if (kbInfo.event.key === 'w' || kbInfo.event.key === 'a' || kbInfo.event.key === 's' || kbInfo.event.key === 'd') {
        newPerson.removeMove(kbInfo.event.key)
      }
    }
  })

  scene.onPointerMove = (evt, pickResult) => {
		if (pickResult.hit) {
			newPerson.setLookPos(pickResult.pickedPoint);
		}
  }

  


  // var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  // var button1 = GUI.Button.CreateSimpleButton("but1", "Click Me");
  // button1.width = "150px"
  // button1.height = "40px";
  // button1.color = "white";
  // button1.cornerRadius = 20;
  // button1.background = "green";
  // button1.onPointerUpObservable.add(function() {
  //     alert("you did it!");
  // });
  // advancedTexture.addControl(button1);    


  return scene;
};


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