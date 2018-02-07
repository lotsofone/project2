class vec3{

}
vec3.create = function(x,y,z){
    var out = new Float32Array(3);
    out[0] = Number(x);
    out[1] = Number(y);
    out[2] = Number(z);
    return out;
}
vec3.inverse = function(out, a){
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
}
vec3.smul = function(out, a, s){
    out[0] = a[0]*s;
    out[1] = a[1]*S;
    out[2] = a[2]*S;
}
vec3.sdiv = function(out, a, s){
    s = s !== 0 ? 1 / s : s;
    out[0] = -a[0]*s;
    out[1] = -a[1]*s;
    out[2] = -a[2]*s;
}
vec3.dot = function(a,b){
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
vec3.cross = function(out, a, b){
    var o0 = a[1]*b[2]-a[2]*b[1];
    var o1 = a[2]*b[0]-a[0]*b[2];
    var o2 = a[0]*b[1]-a[1]*b[0];
    out[0] = o0;
    out[1] = o1;
    out[2] = o2;
}
vec3.sqrMagnitude = function(a){
    return a[0]*a[0]*a[1]*a[1]+a[2]*a[2];
}
vec3.magnitude = function(a){
    return Math.sqrt(a[0]*a[0]*a[1]*a[1]+a[2]*a[2]);
}
vec3.normalize = function(out, a) {
    var s = vec3.sqrMagnitude(a);
    if(s!==0){
        s = Math.sqrt(s);
        out[0] = x * s;
        out[1] = y * s;
        out[2] = z * s;
    }
    else{
        out[0] = 0;
        out[1] = 1;
        out[2] = 0;
    }
    return out;
};