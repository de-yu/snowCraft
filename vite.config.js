import { defineConfig } from 'vite';
import wasm from "vite-plugin-wasm";

export default defineConfig(({ command, mode }) => {
    return {
        base: './',
        plugins: [
            wasm(),
        ],
        resolve: {
            alias: {
                'babylonjs': mode === 'development' ? 'babylonjs/babylon.max' : 'babylonjs'
            }
        },
        optimizeDeps: {
            exclude: ['@babylonjs/havok', '@babylonjs/gui','@babylonjs/core'],
        }
    };
});
