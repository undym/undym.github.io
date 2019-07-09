import { GL, toGLPoints, createVShader, createFShader, createProgram } from "./gl.js";
export class Texture {
    static createStr(font, ...stringSets) {
        const size = font.measurePixel(stringSets.map(set => set[0]));
        return new Texture(size.w, size.h, () => {
            let x = 0;
            let y = 0;
            for (let i = 0; i < stringSets.length; i++) {
                const set = stringSets[i];
                font.draw(set[0], { x: x, y: y }, set[1]);
                y += font.size / size.h;
            }
        });
    }
    static get empty() {
        if (this._empty === undefined) {
            this._empty = new Texture(1, 1);
        }
        return this._empty;
    }
    get pixelW() { return this._pixelW; }
    get pixelH() { return this._pixelH; }
    get ratioW() { return this._ratioW; }
    get ratioH() { return this._ratioH; }
    constructor(pixelW, pixelH, draw) {
        const gl = GL.gl;
        if (Texture.program === undefined) {
            const vSrc = `
                    precision lowp float;
                    attribute vec2 vertex;
                    attribute vec2 textureVertex;

                    varying vec2 textureCoord;

                    void main(void) {
                        gl_Position = vec4(vertex, 0.0, 1.0);
                        textureCoord = textureVertex;

                    }
                `;
            const fSrc = `
                    precision lowp float;
        
                    uniform sampler2D sampler;
                    uniform vec4 color;

                    varying vec2 textureCoord;
                    
                    void main(void) {
                        gl_FragColor = texture2D(sampler, textureCoord) * color;
                    }
                `;
            const vShader = createVShader(gl, vSrc);
            const fShader = createFShader(gl, fSrc);
            Texture.program = createProgram(gl, vShader, fShader);
            gl.useProgram(Texture.program);
            Texture.vertexBuffer = gl.createBuffer();
            Texture.vertexAttr = gl.getAttribLocation(Texture.program, 'vertex');
            Texture.textureVertexBuffer = gl.createBuffer();
            Texture.textureVertexAttr = gl.getAttribLocation(Texture.program, 'textureVertex');
            Texture.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Texture.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array([0, 1, 2, 3]), gl.STATIC_DRAW);
            Texture.sampler = gl.getUniformLocation(Texture.program, "sampler");
            Texture.colorUniform = gl.getUniformLocation(Texture.program, "color");
        }
        this.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        // フレームバッファへのテクスチャの紐付け
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.PACK_ALIGNMENT, /*alignment*/ 1);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, /*alignment*/ 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.pixelW, this.pixelH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.setSizeNobind(pixelW, pixelH);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.color = { r: 1, g: 1, b: 1, a: 1 };
        if (draw !== undefined) {
            this.update(draw);
        }
    }
    clear() {
        const gl = GL.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    update(draw) {
        const gl = GL.gl;
        let bak = GL.getViewport();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        GL.setViewport(0, 0, this.pixelW, this.pixelH);
        draw();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        GL.setViewport(bak.x, bak.y, bak.w, bak.h);
    }
    setColorMod(_color) {
        this.color = _color;
    }
    getColorMod() { return this.color; }
    colorMod(_color, run) {
        const bak = this.color;
        this.setColorMod(_color);
        run();
        this.setColorMod(bak);
    }
    setSize(pixelW, pixelH) {
        GL.gl.bindTexture(GL.gl.TEXTURE_2D, this.texture);
        this.setSizeNobind(pixelW, pixelH);
        GL.gl.bindTexture(GL.gl.TEXTURE_2D, null);
    }
    setSizeNobind(pixelW, pixelH) {
        this._pixelW = pixelW;
        this._pixelH = pixelH;
        this._ratioW = pixelW / GL.getCanvas().width;
        this._ratioH = pixelH / GL.getCanvas().height;
        GL.gl.texImage2D(GL.gl.TEXTURE_2D, 0, GL.gl.RGBA, this.pixelW, this.pixelH, 0, GL.gl.RGBA, GL.gl.UNSIGNED_BYTE, null);
    }
    draw(dst, src) {
        const gl = GL.gl;
        const _dst = dst;
        const _src = (src !== undefined) ? src : { x: 0, y: 0, w: 1, h: 1 };
        gl.useProgram(Texture.program);
        gl.uniform4f(Texture.colorUniform, this.color.r, this.color.g, this.color.b, this.color.a);
        gl.uniform1i(Texture.sampler, 0);
        const vertex = toGLPoints([
            _dst.x, _dst.y,
            _dst.x + _dst.w, _dst.y,
            _dst.x, _dst.y + _dst.h,
            _dst.x + _dst.w, _dst.y + _dst.h,
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, Texture.vertexBuffer);
        gl.enableVertexAttribArray(Texture.vertexAttr);
        gl.vertexAttribPointer(Texture.vertexAttr, 2, gl.FLOAT, /*normalize*/ false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.DYNAMIC_DRAW);
        const textureVertex = [
            _src.x, _src.y + _src.h,
            _src.x + _src.w, _src.y + _src.h,
            _src.x, _src.y,
            _src.x + _src.w, _src.y,
        ];
        gl.bindBuffer(gl.ARRAY_BUFFER, Texture.textureVertexBuffer);
        gl.enableVertexAttribArray(Texture.textureVertexAttr);
        gl.vertexAttribPointer(Texture.textureVertexAttr, 2, gl.FLOAT, /*normalize*/ false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureVertex), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Texture.indexBuffer);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_SHORT, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    delete() {
        const gl = GL.gl;
        gl.deleteTexture(this.texture);
        gl.deleteFramebuffer(this.frameBuffer);
    }
}
export class Img {
    /***/
    constructor(src, lazyLoad = true) {
        this.loaded = false;
        this.lazyLoader = () => {
            const gl = GL.gl;
            if (Img.program === undefined) {
                const vShader = createVShader(gl, Img.vSrc);
                const fShader = createFShader(gl, Img.fSrc);
                Img.program = createProgram(gl, vShader, fShader);
                Img.indexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Img.indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array([0, 1, 2, 3]), gl.STATIC_DRAW);
                Img.vertexBuffer = gl.createBuffer();
                Img.vertexAttr = gl.getAttribLocation(Img.program, 'vertex');
                gl.enableVertexAttribArray(Img.vertexAttr);
                Img.textureVertexBuffer = gl.createBuffer();
                Img.textureVertexAttr = gl.getAttribLocation(Img.program, 'textureVertex');
                gl.enableVertexAttribArray(Img.textureVertexAttr);
                Img.sampler = gl.getUniformLocation(Img.program, 'sampler');
            }
            const program = Img.program;
            gl.useProgram(program);
            this.texture = gl.createTexture();
            this.image = new Image();
            this.image.crossOrigin = 'anonymous';
            this.image.onload = () => {
                // テクスチャオブジェクトの生成
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.bindTexture(gl.TEXTURE_2D, null);
                this.loaded = true;
            };
            this.image.src = src;
            this.lazyLoader = () => { };
        };
        if (!lazyLoad) {
            this.lazyLoader();
        }
    }
    static get empty() {
        if (this._empty === undefined) {
            this._empty = new class extends Img {
                constructor() {
                    super("");
                    this.draw = (bounds) => { };
                }
                get w() { return 1; }
                get h() { return 1; }
            };
        }
        return this._empty;
    }
    isLoaded() { return this.loaded; }
    draw(bounds, src) {
        this.lazyLoader();
        if (!this.loaded) {
            return;
        }
        if (src === undefined) {
            src = { x: 0, y: 0, w: 1, h: 1 };
        }
        const gl = GL.gl;
        gl.useProgram(Img.program);
        gl.uniform1i(Img.sampler, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, Img.vertexBuffer);
        gl.vertexAttribPointer(Img.vertexAttr, 2, gl.FLOAT, /*normalize*/ false, 0, 0);
        const vertex = toGLPoints([
            bounds.x, bounds.y,
            bounds.x + bounds.w, bounds.y,
            bounds.x, bounds.y + bounds.h,
            bounds.x + bounds.w, bounds.y + bounds.h,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, Img.textureVertexBuffer);
        gl.enableVertexAttribArray(Img.textureVertexAttr);
        gl.vertexAttribPointer(Img.textureVertexAttr, 2, gl.FLOAT, /*normalize*/ false, 0, 0);
        const textureVertex = [
            src.x, src.y,
            src.x + src.w, src.y,
            src.x, src.y + src.h,
            src.x + src.w, src.y + src.h,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureVertex), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Img.indexBuffer);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_SHORT, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.disableVertexAttribArray(Img.textureVertexAttr);
    }
    /**画像の読み込みが終わるまでは0を返す。 */
    get pixelW() { return this.image.width; }
    /**画像の読み込みが終わるまでは0を返す。 */
    get pixelH() { return this.image.height; }
    /**画像の読み込みが終わるまでは0を返す。 */
    get ratioW() { return this.image.width / GL.getCanvas().width; }
    /**画像の読み込みが終わるまでは0を返す。 */
    get ratioH() { return this.image.height / GL.getCanvas().height; }
    delete() {
        GL.gl.deleteTexture(this.texture);
    }
}
Img.vSrc = `
            precision lowp float;

            attribute vec2 vertex;
            attribute vec2 textureVertex;

            varying vec2 textureCoord;

            void main(void) {
                gl_Position = vec4(vertex, 0.0, 1.0);
                textureCoord = textureVertex;
            }
        `;
Img.fSrc = `
            precision lowp float;

            uniform sampler2D sampler;

            varying vec2 textureCoord;
            
            void main(void) {
                gl_FragColor = texture2D(sampler, textureCoord);
            }
        `;
