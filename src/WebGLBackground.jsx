// WebGLBackground.jsx
import React, { useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    // Calculate aspect ratio correctly to prevent stretching
    float aspect = u_resolution.x / u_resolution.y;
    vec2 st = vec2(uv.x * aspect, uv.y);

    float t = u_time * 0.00015;

    float v1 = sin(st.x * 1.5 + t) + cos(st.y * 1.2 + t * 0.8);
    float v2 = sin(st.x * 2.0 - t * 0.5) + cos(st.y * 2.5 + t * 1.2);
    
    // Combine and smooth
    float v = (v1 + v2) * 0.25 + 0.5;

    vec3 col = mix(u_color1, u_color2, smoothstep(0.1, 0.6, v));
    col = mix(col, u_color3, smoothstep(0.4, 0.9, v));

    gl_FragColor = vec4(col, 1.0);
  }
`;

function hexToRgb(hex) {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    return [r, g, b];
}

const WebGLBackground = ({ theme = 'dark' }) => {
    const canvasRef = useRef(null);
    const prefersReducedMotion = useRef(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    useEffect(() => {
        if (prefersReducedMotion.current) return;

        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl', {
            alpha: false,
            antialias: false,
            depth: false,
            powerPreference: "low-power"
        });

        if (!gl) return;

        // Compile shaders
        const compileShader = (type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        gl.useProgram(program);

        // Quad covering the screen
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1.0, -1.0,
                1.0, -1.0,
                -1.0, 1.0,
                -1.0, 1.0,
                1.0, -1.0,
                1.0, 1.0,
            ]),
            gl.STATIC_DRAW
        );

        const positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const timeLocation = gl.getUniformLocation(program, "u_time");
        const color1Location = gl.getUniformLocation(program, "u_color1");
        const color2Location = gl.getUniformLocation(program, "u_color2");
        const color3Location = gl.getUniformLocation(program, "u_color3");

        let animationFrameId;
        let startTime = performance.now();

        const resize = () => {
            // Lower resolution for better performance & softer look (pixelated blur)
            const dpr = window.devicePixelRatio || 1;
            // Scale down internal resolution by 0.5 for performance, keeping CSS 100vw/vh
            const scale = Math.min(dpr, 1.5) * 0.5;
            const w = document.documentElement.clientWidth;
            const h = document.documentElement.clientHeight;

            canvas.width = w * scale;
            canvas.height = h * scale;

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        };

        window.addEventListener('resize', resize);
        resize();

        const render = (time) => {
            let c1, c2, c3;
            if (theme === 'green-aurora') {
                c1 = hexToRgb('#020a04');
                c2 = hexToRgb('#051a0a');
                c3 = hexToRgb('#082b11');
            } else if (theme === 'blue-earth') {
                c1 = hexToRgb('#02040a');
                c2 = hexToRgb('#050a1a');
                c3 = hexToRgb('#08112b');
            } else if (theme === 'light') {
                c1 = hexToRgb('#fcfafb');
                c2 = hexToRgb('#f4ebec');
                c3 = hexToRgb('#eedbdc');
            } else {
                c1 = hexToRgb('#0a0202');
                c2 = hexToRgb('#1a0505');
                c3 = hexToRgb('#2b0808');
            }

            gl.uniform3fv(color1Location, c1);
            gl.uniform3fv(color2Location, c2);
            gl.uniform3fv(color3Location, c3);

            gl.uniform1f(timeLocation, time - startTime);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationFrameId = requestAnimationFrame(render);
        };

        render(performance.now());

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
            gl.deleteProgram(program);
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            gl.deleteBuffer(buffer);
        };
    }, [theme]);

    if (prefersReducedMotion.current) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -2,
                pointerEvents: 'none',
                opacity: 1
            }}
        />
    );
};

export default WebGLBackground;
