import { Size, Color } from "../undym/type.js";
import { GL, toGLPoints, createVShader, createFShader, createProgram } from "./gl.js";
class StringStrage {
    constructor() {
        this.pixelBounds = new Map();
        this.offsetX = 0;
        this.offsetY = 0;
        this.w = 512;
        this.h = 512;
        const gl = GL.gl;
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        const vSrc = `
            precision lowp float;
            attribute vec2 vertex;
            void main(void) {
                gl_Position = vec4(vertex, 0.0, 1.0);
            }
        `;
        const fSrc = `
            precision lowp float;

            uniform sampler2D sampler;
            uniform vec2 oldTextureSize;
            
            void main(void) {
                vec2 v = vec2(
                     gl_FragCoord.x / oldTextureSize[0]
                    ,gl_FragCoord.y / oldTextureSize[1]
                );
                gl_FragColor = texture2D(sampler, v);
            }
        `;
        const vShader = createVShader(gl, vSrc);
        const fShader = createFShader(gl, fSrc);
        this.program = createProgram(gl, vShader, fShader);
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.vertexAttr = gl.getAttribLocation(this.program, 'vertex');
        gl.enableVertexAttribArray(this.vertexAttr);
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array([0, 1, 2, 3]), gl.STATIC_DRAW);
    }
    textureExpansion() {
        const gl = GL.gl;
        let newTexture = gl.createTexture();
        const newW = this.w;
        const newH = this.h * 2;
        gl.bindTexture(gl.TEXTURE_2D, newTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, newW, newH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        // フレームバッファを作成
        let frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        // フレームバッファへのテクスチャの紐付け
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, newTexture, 0);
        //------
        const points = toGLPoints([
            0, 0.5,
            1, 0.5,
            0, 1,
            1, 1,
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.vertexAttr, 2, gl.FLOAT, /*normalize*/ false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.useProgram(this.program);
        const sampler = gl.getUniformLocation(this.program, 'sampler');
        const oldTextureSize = gl.getUniformLocation(this.program, 'oldTextureSize');
        gl.uniform2f(oldTextureSize, this.w, this.h);
        gl.uniform1i(sampler, 0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_SHORT, 0);
        //------
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.deleteFramebuffer(frameBuffer);
        gl.deleteTexture(this.texture);
        this.texture = newTexture;
        this.w = newW;
        this.h = newH;
    }
}
export class StringTexture {
    constructor() { }
    static init() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = 128;
        this.canvas.height = 128;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";
        this.ctx.fillStyle = Color.WHITE.toString();
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
        const gl = GL.gl;
        const vShader = createVShader(gl, vSrc);
        const fShader = createFShader(gl, fSrc);
        this.program = createProgram(gl, vShader, fShader);
        // gl.useProgram(this.program);
        this.vertexBuffer = gl.createBuffer();
        this.vertexAttr = gl.getAttribLocation(this.program, 'vertex');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(this.vertexAttr);
        this.textureVertexBuffer = gl.createBuffer();
        this.textureVertexAttr = gl.getAttribLocation(this.program, 'textureVertex');
        this.indexBufferExpansion(30);
        this.sampler = gl.getUniformLocation(this.program, 'sampler');
        this.colorUniform = gl.getUniformLocation(this.program, 'color');
    }
    static getPixelW(font, str) {
        const strage = this.loadStrage(font, str);
        let w = 0;
        for (let i = 0; i < str.length; i++) {
            const s = str.substring(i, i + 1);
            w += strage.pixelBounds.get(s).w;
        }
        return w;
    }
    static getRatioW(font, str) {
        return this.getPixelW(font, str) / GL.getViewport().w;
    }
    static getPixelH(font, str) {
        const strage = this.loadStrage(font, str);
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            const s = str.substring(i, i + 1);
            h += strage.pixelBounds.get(s).h;
        }
        return h;
    }
    static getRatioH(font, str) {
        return this.getPixelH(font, str) / GL.getViewport().h;
    }
    static draw(font, str, ratioX, ratioY, color) {
        if (str.length === 0) {
            return;
        }
        let strage = this.loadStrage(font, str);
        const gl = GL.gl;
        gl.bindTexture(gl.TEXTURE_2D, strage.texture);
        gl.useProgram(this.program);
        gl.uniform4f(this.colorUniform, color.r, color.g, color.b, color.a);
        gl.uniform1i(this.sampler, 0);
        let view = GL.getViewport();
        let vertex = [];
        let textureVertex = [];
        for (let i = 0; i < str.length; i++) {
            const s = str.substring(i, i + 1);
            const charBounds = strage.pixelBounds.get(s);
            const dx = ratioX;
            const dy = ratioY;
            const dw = charBounds.w / view.w;
            const dh = charBounds.h / view.h;
            vertex = vertex.concat(toGLPoints([
                dx, dy,
                dx + dw, dy,
                dx, dy + dh,
                dx + dw, dy + dh,
            ]));
            const charRatioX1 = charBounds.x / strage.w;
            const charRatioY1 = charBounds.y / strage.h;
            const charRatioX2 = (charBounds.x + charBounds.w) / strage.w;
            const charRatioY2 = (charBounds.y + charBounds.h) / strage.h;
            textureVertex.push(charRatioX1, charRatioY1, charRatioX2, charRatioY1, charRatioX1, charRatioY2, charRatioX2, charRatioY2);
            ratioX += dw;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.vertexAttr, 2, gl.FLOAT, /*normalize*/ false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureVertexBuffer);
        gl.enableVertexAttribArray(this.textureVertexAttr);
        gl.vertexAttribPointer(this.textureVertexAttr, 2, gl.FLOAT, /*normalize*/ false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureVertex), gl.DYNAMIC_DRAW);
        this.indexBufferExpansion(str.length);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferes[str.length - 1]);
        gl.drawElements(gl.TRIANGLE_STRIP, vertex.length / 2, gl.UNSIGNED_SHORT, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.disableVertexAttribArray(this.textureVertexAttr);
        // let strage = this.loadStrage(font, str);
        // const gl = GL.gl;
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        // gl.vertexAttribPointer(this.vertexAttr, 2, gl.FLOAT, /*normalize*/false, 0, 0);
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.textureVertexBuffer);
        // gl.enableVertexAttribArray(this.textureVertexAttr);
        // gl.vertexAttribPointer(this.textureVertexAttr, 2, gl.FLOAT, /*normalize*/false, 0, 0);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        // gl.bindTexture(gl.TEXTURE_2D, strage.texture);
        // gl.useProgram(this.program);
        // gl.uniform4f(this.colorUniform, color.r, color.g, color.b, color.a);
        // gl.uniform1i(this.sampler, 0);
        // let view = GL.getViewport();
        // for(let i = 0; i < str.length; i++){
        //     const s = str.substring(i, i+1);
        //     const charBounds = strage.pixelBounds.get(s) as Rect;
        //     gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        //     let bounds = new Rect( ratioX, ratioY, charBounds.w / view.w, charBounds.h / view.h );
        //     const points:number[] = toGLPoints([
        //         bounds.x , bounds.y,
        //         bounds.xw, bounds.y,
        //         bounds.x , bounds.yh,
        //         bounds.xw, bounds.yh,
        //     ]);
        //     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
        //     gl.bindBuffer(gl.ARRAY_BUFFER, this.textureVertexBuffer);
        //     const charRatioX1 = charBounds.x  / strage.w;
        //     const charRatioY1 = charBounds.y  / strage.h;
        //     const charRatioX2 = charBounds.xw / strage.w;
        //     const charRatioY2 = charBounds.yh / strage.h;
        //     const textureVertex:number[] = [
        //         charRatioX1, charRatioY1,
        //         charRatioX2, charRatioY1,
        //         charRatioX1, charRatioY2,
        //         charRatioX2, charRatioY2,
        //     ];
        //     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureVertex), gl.DYNAMIC_DRAW);
        //     gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_SHORT, 0);
        //     ratioX += bounds.w;
        // }
        // gl.bindTexture(gl.TEXTURE_2D, null);
        // gl.disableVertexAttribArray(this.textureVertexAttr);
    }
    static loadStrage(font, str) {
        if (this.stringStrages.get(font) === undefined) {
            this.stringStrages.set(font, new StringStrage());
        }
        const strage = this.stringStrages.get(font);
        const gl = GL.gl;
        for (let i = 0; i < str.length; i++) {
            let s = str.substring(i, i + 1);
            if (strage.pixelBounds.get(s) === undefined) {
                this.ctx.font = font.toString();
                const measure = this.ctx.measureText(s).width;
                const w = measure !== 0 ? measure : 1;
                const h = font.size + 1; //fillTextでy=1の位置から描画するので
                if (strage.offsetX + w >= strage.w) {
                    strage.offsetX = 0;
                    strage.offsetY += h;
                    if (strage.offsetY + h >= strage.h) {
                        strage.textureExpansion();
                    }
                }
                this.ctx.clearRect(0, 0, w, h);
                this.ctx.fillText(s, 0, 1); //一部記号が1pixel上にはみ出るのでy=1から描画して他の文字の部分にはみでないように
                const imgData = this.ctx.getImageData(0, 0, w, h - 1).data;
                gl.bindTexture(gl.TEXTURE_2D, strage.texture);
                gl.texSubImage2D(gl.TEXTURE_2D, 0, strage.offsetX, strage.offsetY, w, h - 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(imgData));
                // strage.pixelBounds.set(s, new Rect(strage.offsetX, strage.offsetY, w, h-1));
                strage.pixelBounds.set(s, {
                    x: strage.offsetX,
                    y: strage.offsetY,
                    w: w,
                    h: h - 1,
                });
                strage.offsetX += w;
            }
        }
        return strage;
    }
    /**
     * indexBufferesが指定サイズより小さかった場合、そのサイズまで拡大する。
     */
    static indexBufferExpansion(size) {
        const gl = GL.gl;
        for (let i = this.indexBufferes.length; i < size; i++) {
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            let indexes = [];
            for (let i2 = 0; i2 < i + 1; i2++) {
                const i4 = i2 * 4;
                indexes.push(i4 + 2, i4 + 0, i4 + 3, i4 + 1);
            }
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indexes), gl.STATIC_DRAW);
            this.indexBufferes.push(buffer);
        }
    }
}
StringTexture.stringStrages = new Map();
// private static tmpStringTextures = new Map<[Font,string], {texture:Texture, beforeUsedTime:number}>();
// private static tmpStringTextures = new Map<Font, Map<string, {texture:Texture, beforeUsedTime:number}>>();
StringTexture.indexBufferes = [];
export class Font {
    constructor(size, weight = Font.NORMAL, name = Font.MONOSPACE) {
        this.size = size;
        this.weight = weight;
        this.name = name;
        this._toString = Font.createString(size, weight, name);
    }
    static getDef() {
        return this.DEF !== undefined ? this.DEF : (this.DEF = this.create(18));
    }
    /**
     *
     * @param size
     * @param weight
     * @param name
     * 指定のフォントをプールから渡す。
     */
    static create(size, weight = Font.NORMAL, name = Font.MONOSPACE) {
        const str = Font.createString(size, weight, name);
        if (this.pool.has(str)) {
            return this.pool.get(str);
        }
        const font = new Font(size, weight, name);
        this.pool.set(str, font);
        return font;
    }
    static createString(size, weight, name) {
        return `${weight} ${size}px ${name}`;
    }
    toString() { return this._toString; }
    /**現在のframebufferのサイズを基準にしたもの。 */
    getSizeRatio() { return this.size / GL.getViewport().h; }
    draw(str, point, color, base = Font.UPPER_LEFT) {
        switch (base) {
            case Font.UPPER_LEFT:
                StringTexture.draw(this, str, point.x, point.y, color);
                break;
            case Font.TOP:
                StringTexture.draw(this, str, point.x - this.measureRatioW(str) / 2, point.y, color);
                break;
            case Font.UPPER_RIGHT:
                StringTexture.draw(this, str, point.x - this.measureRatioW(str), point.y, color);
                break;
            case Font.LEFT:
                StringTexture.draw(this, str, point.x, point.y - this.getSizeRatio() / 2, color);
                break;
            case Font.CENTER:
                StringTexture.draw(this, str, point.x - this.measureRatioW(str) / 2, point.y - this.getSizeRatio() / 2, color);
                break;
            case Font.RIGHT:
                StringTexture.draw(this, str, point.x - this.measureRatioW(str), point.y - this.getSizeRatio() / 2, color);
                break;
            case Font.RIGHT:
                StringTexture.draw(this, str, point.x - this.measureRatioW(str), point.y - this.getSizeRatio() / 2, color);
                break;
            case Font.LOWER_LEFT:
                StringTexture.draw(this, str, point.x, point.y - this.getSizeRatio(), color);
                break;
            case Font.BOTTOM:
                StringTexture.draw(this, str, point.x - this.measureRatioW(str) / 2, point.y - this.getSizeRatio(), color);
                break;
            case Font.LOWER_RIGHT:
                StringTexture.draw(this, str, point.x - this.measureRatioW(str), point.y - this.getSizeRatio(), color);
                break;
        }
    }
    measurePixelW(s) {
        return StringTexture.getPixelW(this, s);
    }
    /**最大の幅と合計の高さを返す。 */
    measurePixel(strings) {
        let w = 0;
        let h = 0;
        for (let s of strings) {
            let _w = this.measurePixelW(s);
            if (w < _w) {
                w = _w;
            }
            h += this.size;
        }
        return new Size(w, h);
    }
    /**現在のframebufferのサイズを基準にしたもの。 */
    measureRatioW(s) {
        return this.measurePixelW(s) / GL.getViewport().w;
    }
    /**最大の幅と合計の高さを返す。
     * 現在のframebufferのサイズを基準にしたもの。
    */
    measureRatioSize(strings) {
        const size = this.measurePixel(strings);
        const view = GL.getViewport();
        return new Size(size.w / view.w, size.h / view.h);
    }
}
Font.pool = new Map();
Font.MONOSPACE = "monospace";
Font.UPPER_LEFT = "upperLeft";
Font.TOP = "top";
Font.UPPER_RIGHT = "upperRight";
Font.LEFT = "left";
Font.CENTER = "center";
Font.RIGHT = "right";
Font.LOWER_LEFT = "lowerLeft";
Font.BOTTOM = "bottom";
Font.LOWER_RIGHT = "lowerRight";
Font.NORMAL = "normal";
Font.BOLD = "bold";
