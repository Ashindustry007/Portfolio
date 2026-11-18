// A minimal WebGL helper for the site's full-canvas shader effects (the hero
// figure and the class cloaks): one quad, a fragment shader, a few textures.

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/** GLSL shared by the effects: luminance, an edge detector, pen hatching, noise. */
export const GLSL_COMMON = `
float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}
float hatch(vec2 p, float angle, float freq, float width) {
  float c = cos(angle), s = sin(angle);
  float v = (p.x * c + p.y * s) * freq;
  return smoothstep(0.5 - width, 0.5, abs(fract(v) - 0.5));
}
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}`;

export type Quad = {
  gl: WebGLRenderingContext;
  uniform: (name: string) => WebGLUniformLocation | null;
  /** Upload an image to a texture unit. */
  upload: (unit: number, image: TexImageSource) => void;
  /** Size the drawing buffer; height defaults to the width (a square). */
  resize: (cssWidth: number, maxDpr?: number, cssHeight?: number) => void;
  draw: () => void;
  dispose: () => void;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (!gl.isContextLost()) console.error(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

/** Returns null when WebGL is unavailable, so callers can show a plain image instead. */
export function createQuad(canvas: HTMLCanvasElement, fragment: string, textureUnits: number): Quad | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  const textures = Array.from({ length: textureUnits }, (_, unit) => {
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    return tex;
  });

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  return {
    gl,
    uniform: (name) => gl.getUniformLocation(program, name),
    upload(unit, image) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, textures[unit]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    },
    resize(cssWidth, maxDpr = 2, cssHeight = cssWidth) {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.max(1, Math.round(cssWidth * dpr));
      const h = Math.max(1, Math.round(cssHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    },
    draw() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    // Frees the GPU objects but keeps the context: the same canvas is reused if the effect re-runs.
    dispose() {
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement | undefined>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(undefined);
    img.src = src;
  });
}
