precision highp float;

uniform float texSize;
uniform sampler2D positions;

const float EPSILON = 0.01;

// encodes float values in range (0, 1) to rgba bytes
const float valueScale = 0.9999;
const vec4 bitEncode = vec4(1.0, 255.0, 65025.0, 16581375.0);
vec4 encodeFloat(float value) {
    value = value * valueScale; // scale down to prevent errors on encoding 1.0
    vec4 encoded = bitEncode * value;
    encoded = fract(encoded);
    encoded -= encoded.yzww * vec2(1.0 / 255.0, 0.0).xxxy;
    return encoded;
}

// decode rgba values to floats in range (0, 1)
const vec4 bitDecode = 1.0 / bitEncode;
const float invValueScale = 1.0 / valueScale;
float decodeFloat (vec4 rgba) {
    float decoded = dot(rgba, bitDecode) * invValueScale;
    return decoded;
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

void main() {
    vec2 coord = gl_FragCoord.xy - 0.5;
    float ind = coord.x + coord.y * texSize;

    float modInd = mod(ind, 3.0);
    float normInd = 3.0 * ind / (texSize * texSize);

    vec2 lastPosCoord = indToCoord(ind);
    vec4 lastPosEncoded = texture2D(positions, lastPosCoord);
    float lastPos = decodeFloat(lastPosEncoded);

    if (modInd < EPSILON) {
        gl_FragColor = encodeFloat(lastPos);
    } else if (modInd < 1.0 + EPSILON) {
        gl_FragColor = encodeFloat(lastPos);
    } else {
        gl_FragColor = encodeFloat(lastPos);
    }
}
