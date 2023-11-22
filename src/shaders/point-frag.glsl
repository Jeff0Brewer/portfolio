precision highp float;

varying vec3 color;
varying vec3 position;

void main() {
    vec2 cxy = 2.0 * gl_PointCoord.xy - 1.0;
    float radius = dot(cxy, cxy);
    // temp branch
    if (radius > 1.0) {
        discard;
    }
    float shade = (dot(normalize(position.xz), cxy) * 0.5 + 0.5);
    gl_FragColor = vec4(color * shade, 1.0);
}
