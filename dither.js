/**
 * Dither WebGL Effect — Vanilla JS port of the provided React/Three.js Dither component.
 * Uses the exact same GLSL shaders (wave + Bayer dither) and renders to a <canvas>.
 */

(function () {
    /**
     * waveVertexShader — identical to the React component
     */
    const waveVS = `
    attribute vec2 a_position;
    varying vec2 vUv;
    void main() {
      vUv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

    /**
     * waveFragmentShader — identical to the React component
     */
    const waveFS = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform float waveSpeed;
    uniform float waveFrequency;
    uniform float waveAmplitude;
    uniform vec3 waveColor;
    uniform vec2 mousePos;
    uniform int enableMouseInteraction;
    uniform float mouseRadius;

    vec4 mod289_4(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289_4(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

    float cnoise(vec2 P) {
      vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
      vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
      Pi = mod289_4(Pi);
      vec4 ix = Pi.xzxz;
      vec4 iy = Pi.yyww;
      vec4 fx = Pf.xzxz;
      vec4 fy = Pf.yyww;
      vec4 i = permute(permute(ix) + iy);
      vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
      vec4 gy = abs(gx) - 0.5;
      vec4 tx = floor(gx + 0.5);
      gx = gx - tx;
      vec2 g00 = vec2(gx.x, gy.x);
      vec2 g10 = vec2(gx.y, gy.y);
      vec2 g01 = vec2(gx.z, gy.z);
      vec2 g11 = vec2(gx.w, gy.w);
      vec4 norm = taylorInvSqrt(vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11)));
      g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
      float n00 = dot(g00, vec2(fx.x, fy.x));
      float n10 = dot(g10, vec2(fx.y, fy.y));
      float n01 = dot(g01, vec2(fx.z, fy.z));
      float n11 = dot(g11, vec2(fx.w, fy.w));
      vec2 fade_xy = fade(Pf.xy);
      vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
      return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 1.0;
      float freq = waveFrequency;
      for (int i = 0; i < 4; i++) {
        value += amp * abs(cnoise(p));
        p *= freq;
        amp *= waveAmplitude;
      }
      return value;
    }

    float pattern(vec2 p) {
      vec2 p2 = p - time * waveSpeed;
      return fbm(p + fbm(p2));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      uv -= 0.5;
      uv.x *= resolution.x / resolution.y;
      float f = pattern(uv);
      if (enableMouseInteraction == 1) {
        vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
        mouseNDC.x *= resolution.x / resolution.y;
        float dist = length(uv - mouseNDC);
        float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
        f -= 0.5 * effect;
      }
      vec3 col = mix(vec3(0.0), waveColor, f);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

    /**
     * ditherFragmentShader — Bayer 8x8 ordered dither post-process (two-pass approach)
     * Implemented as a second pass that reads the first pass texture.
     */
    const ditherFS = `
    precision highp float;
    uniform sampler2D uTexture;
    uniform vec2 resolution;
    uniform float colorNum;
    uniform float pixelSize;

    float bayerMatrix8x8(int x, int y) {
      float m[64];
      m[0]=0.0/64.0;  m[1]=48.0/64.0; m[2]=12.0/64.0; m[3]=60.0/64.0; m[4]=3.0/64.0;  m[5]=51.0/64.0; m[6]=15.0/64.0; m[7]=63.0/64.0;
      m[8]=32.0/64.0; m[9]=16.0/64.0; m[10]=44.0/64.0;m[11]=28.0/64.0;m[12]=35.0/64.0;m[13]=19.0/64.0;m[14]=47.0/64.0;m[15]=31.0/64.0;
      m[16]=8.0/64.0; m[17]=56.0/64.0;m[18]=4.0/64.0; m[19]=52.0/64.0;m[20]=11.0/64.0;m[21]=59.0/64.0;m[22]=7.0/64.0; m[23]=55.0/64.0;
      m[24]=40.0/64.0;m[25]=24.0/64.0;m[26]=36.0/64.0;m[27]=20.0/64.0;m[28]=43.0/64.0;m[29]=27.0/64.0;m[30]=39.0/64.0;m[31]=23.0/64.0;
      m[32]=2.0/64.0; m[33]=50.0/64.0;m[34]=14.0/64.0;m[35]=62.0/64.0;m[36]=1.0/64.0; m[37]=49.0/64.0;m[38]=13.0/64.0;m[39]=61.0/64.0;
      m[40]=34.0/64.0;m[41]=18.0/64.0;m[42]=46.0/64.0;m[43]=30.0/64.0;m[44]=33.0/64.0;m[45]=17.0/64.0;m[46]=45.0/64.0;m[47]=29.0/64.0;
      m[48]=10.0/64.0;m[49]=58.0/64.0;m[50]=6.0/64.0; m[51]=54.0/64.0;m[52]=9.0/64.0; m[53]=57.0/64.0;m[54]=5.0/64.0; m[55]=53.0/64.0;
      m[56]=42.0/64.0;m[57]=26.0/64.0;m[58]=38.0/64.0;m[59]=22.0/64.0;m[60]=41.0/64.0;m[61]=25.0/64.0;m[62]=37.0/64.0;m[63]=21.0/64.0;
      return m[y * 8 + x];
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      /* Snap to pixelSize grid */
      vec2 snappedUV = (floor(gl_FragCoord.xy / pixelSize) * pixelSize) / resolution;
      vec3 color = texture2D(uTexture, snappedUV).rgb;

      /* Bayer dither */
      int x = int(mod(floor(gl_FragCoord.x / pixelSize), 8.0));
      int y = int(mod(floor(gl_FragCoord.y / pixelSize), 8.0));
      float threshold = bayerMatrix8x8(x, y) - 0.25;
      float step = 1.0 / (colorNum - 1.0);
      color += threshold * step;
      float bias = 0.2;
      color = clamp(color - bias, 0.0, 1.0);
      color = floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

    const ditherVS = `
    attribute vec2 a_position;
    varying vec2 vUv;
    void main() {
      vUv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(gl, vs, fs) {
        const program = gl.createProgram();
        gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vs));
        gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    /**
     * initDither(canvas, options)
     * Initialises the WebGL dither effect on the given canvas.
     * Returns a cleanup function.
     */
    function initDither(canvas, opts = {}) {
        const {
            waveColor = [0.5, 0.5, 0.5],
            waveSpeed = 0.05,
            waveFrequency = 3.0,
            waveAmplitude = 0.3,
            colorNum = 4.0,
            pixelSize = 2.0,
            enableMouseInteraction = true,
            mouseRadius = 0.3,
        } = opts;

        const gl = canvas.getContext('webgl', { antialias: true, preserveDrawingBuffer: true });
        if (!gl) { console.warn('WebGL not supported'); return () => { }; }

        /* Build programs */
        const waveProgram = createProgram(gl, waveVS, waveFS);
        const ditherProgram = createProgram(gl, ditherVS, ditherFS);

        /* Full-screen quad */
        const quad = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        /* Framebuffer + texture for wave pass */
        let fbTex = gl.createTexture();
        let fb = gl.createFramebuffer();

        function resizeFBTex() {
            gl.bindTexture(gl.TEXTURE_2D, fbTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbTex, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        resizeFBTex();

        /* Uniforms cache */
        const waveUniforms = {
            resolution: gl.getUniformLocation(waveProgram, 'resolution'),
            time: gl.getUniformLocation(waveProgram, 'time'),
            waveSpeed: gl.getUniformLocation(waveProgram, 'waveSpeed'),
            waveFrequency: gl.getUniformLocation(waveProgram, 'waveFrequency'),
            waveAmplitude: gl.getUniformLocation(waveProgram, 'waveAmplitude'),
            waveColor: gl.getUniformLocation(waveProgram, 'waveColor'),
            mousePos: gl.getUniformLocation(waveProgram, 'mousePos'),
            enableMouseInteraction: gl.getUniformLocation(waveProgram, 'enableMouseInteraction'),
            mouseRadius: gl.getUniformLocation(waveProgram, 'mouseRadius'),
        };
        const ditherUniforms = {
            uTexture: gl.getUniformLocation(ditherProgram, 'uTexture'),
            resolution: gl.getUniformLocation(ditherProgram, 'resolution'),
            colorNum: gl.getUniformLocation(ditherProgram, 'colorNum'),
            pixelSize: gl.getUniformLocation(ditherProgram, 'pixelSize'),
        };

        const mouse = { x: 0, y: 0 };
        const onMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
            mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
        };
        if (enableMouseInteraction) canvas.addEventListener('mousemove', onMouseMove);

        /* Resize observer */
        const ro = new ResizeObserver(() => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.floor(canvas.offsetWidth * dpr);
            canvas.height = Math.floor(canvas.offsetHeight * dpr);
            resizeFBTex();
        });
        ro.observe(canvas);
        /* initial size */
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(canvas.offsetWidth * dpr);
        canvas.height = Math.floor(canvas.offsetHeight * dpr);
        resizeFBTex();

        let startTime = performance.now();
        let rafId;

        function render() {
            rafId = requestAnimationFrame(render);
            const t = (performance.now() - startTime) / 1000;
            const w = canvas.width, h = canvas.height;

            /* -- Pass 1: wave into framebuffer -- */
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.viewport(0, 0, w, h);
            gl.useProgram(waveProgram);

            gl.bindBuffer(gl.ARRAY_BUFFER, quad);
            const posLoc = gl.getAttribLocation(waveProgram, 'a_position');
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

            gl.uniform2f(waveUniforms.resolution, w, h);
            gl.uniform1f(waveUniforms.time, t);
            gl.uniform1f(waveUniforms.waveSpeed, waveSpeed);
            gl.uniform1f(waveUniforms.waveFrequency, waveFrequency);
            gl.uniform1f(waveUniforms.waveAmplitude, waveAmplitude);
            gl.uniform3f(waveUniforms.waveColor, waveColor[0], waveColor[1], waveColor[2]);
            gl.uniform2f(waveUniforms.mousePos, mouse.x, mouse.y);
            gl.uniform1i(waveUniforms.enableMouseInteraction, enableMouseInteraction ? 1 : 0);
            gl.uniform1f(waveUniforms.mouseRadius, mouseRadius);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            /* -- Pass 2: dither to canvas -- */
            gl.viewport(0, 0, w, h);
            gl.useProgram(ditherProgram);

            gl.bindBuffer(gl.ARRAY_BUFFER, quad);
            const posLoc2 = gl.getAttribLocation(ditherProgram, 'a_position');
            gl.enableVertexAttribArray(posLoc2);
            gl.vertexAttribPointer(posLoc2, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, fbTex);
            gl.uniform1i(ditherUniforms.uTexture, 0);
            gl.uniform2f(ditherUniforms.resolution, w, h);
            gl.uniform1f(ditherUniforms.colorNum, colorNum);
            gl.uniform1f(ditherUniforms.pixelSize, pixelSize * dpr);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        render();

        return function cleanup() {
            cancelAnimationFrame(rafId);
            ro.disconnect();
            if (enableMouseInteraction) canvas.removeEventListener('mousemove', onMouseMove);
            gl.deleteProgram(waveProgram);
            gl.deleteProgram(ditherProgram);
            gl.deleteBuffer(quad);
            gl.deleteTexture(fbTex);
            gl.deleteFramebuffer(fb);
        };
    }

    /* Auto-initialise all [data-dither] canvases when DOM is ready */
    function autoInit() {
        document.querySelectorAll('canvas[data-dither]').forEach(canvas => {
            const opts = {
                waveColor: JSON.parse(canvas.dataset.waveColor || '[0.4,0.3,0.8]'),
                waveSpeed: parseFloat(canvas.dataset.waveSpeed || '0.05'),
                waveFrequency: parseFloat(canvas.dataset.waveFrequency || '3'),
                waveAmplitude: parseFloat(canvas.dataset.waveAmplitude || '0.3'),
                colorNum: parseFloat(canvas.dataset.colorNum || '4'),
                pixelSize: parseFloat(canvas.dataset.pixelSize || '2'),
                enableMouseInteraction: canvas.dataset.mousePara !== 'false',
                mouseRadius: parseFloat(canvas.dataset.mouseRadius || '0.3'),
            };
            initDither(canvas, opts);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    window.initDither = initDither;
})();
