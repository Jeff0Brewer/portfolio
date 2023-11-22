precision highp float;

uniform float texSize;
uniform sampler2D tex0; // frequencies
uniform sampler2D tex1; // last positions

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
    vec4 lastPosEncoded = texture2D(tex1, lastPosCoord);
    float lastPos = decodeFloat(lastPosEncoded);

    if (modInd < EPSILON) {
        gl_FragColor = encodeFloat(lastPos);
    } else if (modInd < 1.0 + EPSILON) {
        float mirroredInd = pow(abs(normInd - 0.5) * 2.0, 1.2);
        float freq = texture2D(tex0, vec2(mirroredInd, 0.5)).x;
        float lastShifted = mod(lastPos + pow(freq, 2.0) * 0.015, 1.0);
        float yPosition = lastShifted * 0.99 + min(freq, 0.5) * 0.01;
        gl_FragColor = encodeFloat(yPosition);
    } else {
        gl_FragColor = encodeFloat(lastPos);
    }
}
