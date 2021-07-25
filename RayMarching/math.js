class Quaternion
{
    constructor(x, y, z, w)
    {
        this.vec = new THREE.Vector4(x, y, z, w);
    }

    get x()
    {
        return this.vec.x;
    }
    get y()
    {
        return this.vec.y;
    }
    get z()
    {
        return this.vec.z;
    }
    get w()
    {
        return this.vec.w;
    }


}