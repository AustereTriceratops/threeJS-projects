class Simulator
{
    // setup rendering parameters for the shader
    static aspect = window.innerWidth / window.innerHeight;
    static zoom = 1.0;
    static offset = new THREE.Vector2(-0.50*aspect, -0.5);
    static cameraX = new THREE.Vector3(1.0, 0.0, 0.0);
    static cameraY = new THREE.Vector3(0.0, 0.0, -1.0);
    static cameraZ = new THREE.Vector3(0.0, 1.0, 0.0);
    static cameraPos = new THREE.Vector3(0.0, 0.0, 1.0);
}