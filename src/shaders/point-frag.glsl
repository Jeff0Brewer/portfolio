precision highp float;

varying vec3 color;

void main() {
    vec2 cxy = 2.0 * gl_PointCoord.xy - 1.0;
    float radius = dot(cxy, cxy);
    // temp branch
    if (radius > 1.0) {
        discard;
    }
    gl_FragColor = vec4(color, 1.0);
}
