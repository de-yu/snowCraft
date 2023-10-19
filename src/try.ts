import * as BABYLON from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, TextBlock } from '@babylonjs/gui/2D';

export class AppOne {
  constructor() {
    let canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "renderCanvas";
    document.body.appendChild(canvas);

    let engine = new BABYLON.Engine(canvas, true);

    let scene = this.CreateScene(engine, canvas);

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });
  }

  CreateScene = function (
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement
  ): BABYLON.Scene {
    let scene = new BABYLON.Scene(engine);
		let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0,1,-5), scene);
		
		camera.attachControl(canvas,true);
		
		let ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);
    
    let light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 5, -5), scene);
    light.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);
    
    let box = BABYLON.MeshBuilder.CreateBox("box", {size: 0.75}, scene);
    
    box.position = new BABYLON.Vector3(0,1,1);
    
    let redMat = new BABYLON.StandardMaterial("redMat", scene);


    redMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    box.material=redMat;
  
    let postProcess = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

    let text = "Click me";

    let button = Button.CreateSimpleButton("but",text);
    button.width = "150px"
    button.height = "40px";
    button.left="10px";
    button.color = "white";
    button.cornerRadius = 20;
    button.background = "green";

    let textBlock = new TextBlock();
    textBlock.text = "Hola Mundo";
    textBlock.color = "white";
    textBlock.top="-350px"
    textBlock.fontSize = 24;

    postProcess.addControl(textBlock);
    postProcess.addControl(button);
    
    let clicked = false;
    button.onPointerUpObservable.add(function() {
      clicked = !clicked;
      console.log(clicked);
      if(clicked){
        redMat.diffuseColor = new BABYLON.Color3(0,1,1);
        textBlock.color="black";
        textBlock.text = "Adios Mundo";
      } else {
        redMat.diffuseColor = new BABYLON.Color3(1,1,1);
        textBlock.color = "white";
        textBlock.text = "Hola Mundo";
      }
    });

		return scene;
}
}
