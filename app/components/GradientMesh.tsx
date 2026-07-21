'use client';

import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_blob1Color;
uniform vec3 u_blob2Color;
uniform vec3 u_blob3Color;
uniform float u_blob1Alpha;
uniform float u_blob2Alpha;
uniform float u_blob3Alpha;

void main() {
  vec2 uv = v_uv;
  vec2 b1 = vec2(
    0.5 + 0.3 * sin(u_time * 0.0003 + 0.0) + (u_mouse.x - 0.5) * 0.1,
    0.5 + 0.2 * sin(u_time * 0.0005 + 0.0) + (u_mouse.y - 0.5) * 0.1
  );
  vec2 b2 = vec2(
    0.5 + 0.25 * sin(u_time * 0.0004 + 2.094) + (u_mouse.x - 0.5) * 0.08,
    0.5 + 0.18 * sin(u_time * 0.0006 + 2.094) + (u_mouse.y - 0.5) * 0.08
  );
  vec2 b3 = vec2(
    0.5 + 0.28 * sin(u_time * 0.00035 + 4.188) + (u_mouse.x - 0.5) * 0.06,
    0.5 + 0.22 * sin(u_time * 0.00045 + 4.188) + (u_mouse.y - 0.5) * 0.06
  );
  float d1 = length(uv - b1) / 0.45;
  float d2 = length(uv - b2) / 0.38;
  float d3 = length(uv - b3) / 0.42;
  float f1 = exp(-d1 * d1 * 3.0) * u_blob1Alpha;
  float f2 = exp(-d2 * d2 * 3.0) * u_blob2Alpha;
  float f3 = exp(-d3 * d3 * 3.0) * u_blob3Alpha;
  vec3 color = u_blob1Color * f1 + u_blob2Color * f2 + u_blob3Color * f3;
  float alpha = clamp(f1 + f2 + f3, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

export function GradientMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const lerpedMouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    if (prefersReducedMotion || isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uBlob1Color = gl.getUniformLocation(program, 'u_blob1Color');
    const uBlob2Color = gl.getUniformLocation(program, 'u_blob2Color');
    const uBlob3Color = gl.getUniformLocation(program, 'u_blob3Color');
    const uBlob1Alpha = gl.getUniformLocation(program, 'u_blob1Alpha');
    const uBlob2Alpha = gl.getUniformLocation(program, 'u_blob2Alpha');
    const uBlob3Alpha = gl.getUniformLocation(program, 'u_blob3Alpha');

    gl.uniform3f(uBlob1Color, 212/255, 165/255, 116/255);
    gl.uniform3f(uBlob2Color, 180/255, 120/255, 70/255);
    gl.uniform3f(uBlob3Color, 220/255, 180/255, 130/255);
    gl.uniform1f(uBlob1Alpha, 0.12);
    gl.uniform1f(uBlob2Alpha, 0.08);
    gl.uniform1f(uBlob3Alpha, 0.06);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr * 0.5;
      canvas.height = window.innerHeight * dpr * 0.5;
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.uniform2f(uResolution, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize);

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1 - e.clientY / window.innerHeight;
    }
    window.addEventListener('mousemove', handleMouseMove);

    function render(time: number) {
      lerpedMouseRef.current.x += (mouseRef.current.x - lerpedMouseRef.current.x) * 0.03;
      lerpedMouseRef.current.y += (mouseRef.current.y - lerpedMouseRef.current.y) * 0.03;
      gl!.uniform1f(uTime, time);
      gl!.uniform2f(uMouse, lerpedMouseRef.current.x, lerpedMouseRef.current.y);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6, mixBlendMode: 'screen', zIndex: 0 }}
    />
  );
}
