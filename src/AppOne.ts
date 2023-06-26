import * as BABYLON from 'babylonjs'
import HavokPhysics from "@babylonjs/havok";

export class AppOne {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;

    constructor(readonly canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(canvas)
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        this.scene = createScene(this.engine, this.canvas)

    }

    debug(debugOn: boolean = true) {
        if (debugOn) {
            this.scene.debugLayer.show({ overlay: true });
        } else {
            this.scene.debugLayer.hide();
        }
    }

    run() {
        this.debug(true);
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

}


let createScene = function (engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    // this is the default code from the playground:

    // This creates a basic Babylon Scene object (non-mesh)
    let scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 10, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Our built-in 'sphere' shape.
    
    let man = BABYLON.MeshBuilder.CreateBox('man', {
        height: 2,
        width: 1,
        depth: 1,
        bottomBaseAt: 2
    }, scene);
    man.position = new BABYLON.Vector3(3, 1, 0)


    let man2 = BABYLON.MeshBuilder.CreateBox('man2', {
        height: 2,
        width: 1,
        depth: 1,
        bottomBaseAt: 2
    }, scene);
    man2.position = new BABYLON.Vector3(0, 1, 3)


    let ball = BABYLON.CreateSphereVertexData({
        diameter: 0.5
    })
    let ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    let click = false;
    let id: AbstractMesh = null
    let tempball: AbstractMesh = null
    scene.onPointerDown = ((evt , info) => {

        if(info.hit) {


            if(info.pickedMesh.id !== 'ground') {
                let snowball = new BABYLON.Mesh("snowball");
                const pos = info.pickedMesh.position.clone();
                pos.y = pos.y + 1;
                pos.x = pos.x + 1;
                snowball.position = pos;
                ball.applyToMesh(snowball)
                id = info.pickedMesh
                tempball = snowball
                click = true;
            }
        }
    })

    scene.onPointerMove = ((evt, info) => {
        if(click) {
            // console.log(scene.pointerX, scene.pointerY)
            // let pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) => mesh === ground);
            // console.log(pickInfo)
            // if ( pickInfo.pickedPoint) {
            //     const pos = pickInfo.pickedPoint
            //     id.position = pos
            // }


        }
    })

    scene.onPointerUp = ((evt, info) => {
        click = false;
        new BABYLON.PhysicsAggregate(tempball, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution:0.75}, scene)
        let temp = new BABYLON.PhysicsBody(tempball, BABYLON.PhysicsMotionType.DYNAMIC, false, scene)
        let shape = new BABYLON.PhysicsShapeSphere( 
            tempball.position,
         1,
        scene)
        temp.shape = shape
        temp.setMassProperties({
            mass: 10,
          });
          tempball.physicsBody.applyForce(new BABYLON.Vector3(0, 1, 0), new BABYLON.Vector3(0, 0, 0));

    })
    let havokInstance;

    HavokPhysics().then((havok) => {
        // Havok is now available
        havokInstance = havok;
        const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
        // enable physics in the scene with a gravity
        scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), havokPlugin);
        var groundAggregate = new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);
      });


    return scene;
};