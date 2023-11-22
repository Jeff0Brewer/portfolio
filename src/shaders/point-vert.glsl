attribute float vertexInd;

uniform mat4 view;
uniform mat4 proj;
uniform float texSize;
uniform float dpr;
uniform sampler2D positions;
uniform sampler2D frequencies;

varying vec3 color;
varying vec3 position;

const float PX_PER_POS = 3.0;

const vec4 bitDecode = 1.0 / vec4(1.,255.,65025.,16581375.);
float decodeFloat (vec4 rgba) {
    float decoded = dot(rgba, bitDecode);
    return decoded * 2.0 - 1.0; // map to range (-1, 1)
}

vec2 indToCoord (float ind) {
    float row = floor(ind / texSize);
    float col = mod(ind, texSize);
    // add 0.5 to center coord on pixel
    return vec2(
        (col + 0.5) / texSize,
        (row + 0.5) / texSize
    );
}

vec3 colorMap(float x) {
    return normalize(vec3(mod(x, 0.1) * 10.0, mod(x, 0.01) * 100.0, mod(x, 0.001) * 1000.0));
}

float shadeMap(float x) {
    return pow(x, 0.3) * 0.7 + 0.4;
}

void main() {
    float ind = floor(vertexInd / PX_PER_POS);
    vec4 xPixel = texture2D(positions, indToCoord(ind * PX_PER_POS));
    vec4 yPixel = texture2D(positions, indToCoord(ind * PX_PER_POS + 1.0));
    vec4 zPixel = texture2D(positions, indToCoord(ind * PX_PER_POS + 2.0));
    position = vec3(
        decodeFloat(xPixel),
        decodeFloat(yPixel) * 6.0 - 5.0,
        decodeFloat(zPixel)
    );
    gl_Position = proj * view * vec4(position, 1.0);

    float normInd = vertexInd / (texSize * texSize / 3.0);
    float mirroredInd = pow(abs(normInd - 0.5) * 2.0, 1.2);
    float freq = texture2D(frequencies, vec2(mirroredInd, 0.5)).x;
    color = colorMap(normInd) * shadeMap(freq);

    gl_PointSize = (30.0 * pow(freq, 5.0) + 5.0)* dpr / gl_Position.w;
}
