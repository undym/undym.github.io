import { Size } from "../undym/type.js";
import { StringTexture } from "./glstring.js";
export class GL {
    static get gl() { return this._gl; }
    static getCanvas() { return this.canvas; }
    /**
        内部解像度は実際の大きさにinnerResolutionをかけたものになる。
        canvas.width = canvas.clientWidth * innerResolution;
        canvas.height = canvas.clientHeight * innerResolution;
    **/
    static init(canvas, innerResolution) {
        this.canvas = canvas;
        this.innerResolution = innerResolution;
        this.canvas.width = this.canvas.clientWidth * innerResolution;
        this.canvas.height = this.canvas.clientHeight * innerResolution;
        this._pixel = new Size(1 / this.canvas.width, 1 / this.canvas.height);
        this._gl = this.canvas.getContext('webgl');
        this.setViewport(0, 0, this.canvas.width, this.canvas.height);
        // 深度テストを有効化
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.BLEND);
        this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
        // gl.enable(GL.CULL_FACE);
        // 近くにある物体は、遠くにある物体を覆い隠す
        this._gl.depthFunc(this._gl.LEQUAL);
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        Figure.init();
        StringTexture.init();
    }
    static clear(color) {
        if (color === undefined) {
            color = { r: 0, g: 0, b: 0, a: 1 };
        }
        Figure.fillRect(0, 0, 1, 1, color);
    }
    static setViewport(x, y, w, h) {
        this.viewport.x = x;
        this.viewport.y = this.canvas.height - (y + h) * this.canvas.height;
        this.viewport.w = w;
        this.viewport.h = h;
        this.gl.viewport(x, y, w, h);
    }
    static getViewport() { return this.viewport; }
    /**0~1の値で描画範囲を指定。**/
    static fillRect(bounds, color) {
        Figure.fillRect(bounds.x, bounds.y, bounds.x + bounds.w, bounds.y + bounds.h, color);
    }
    /**0~1の値で描画範囲を指定。**/
    static drawRect(bounds, color) {
        Figure.drawRect(bounds.x, bounds.y, bounds.x + bounds.w, bounds.y + bounds.h, color);
    }
    static drawPolygon(points, color) {
        Figure.drawPolygon(points, color);
    }
    // static fillPolygon(points:Array<Point>):void{
    //     Figure.fillPolygon(points, this.color);
    // }
    // /**0~1**/
    static line(p1, p2, color) {
        Figure.line(p1.x, p1.y, p2.x, p2.y, color);
    }
    static get pixel() { return this._pixel; }
    static clip(bounds, action) {
        let bak = GL.getViewport();
        GL.setViewport(bounds.x * this.canvas.width, this.canvas.height - (bounds.y + bounds.h) * this.canvas.height, bounds.w * this.canvas.width, bounds.h * this.canvas.height);
        action();
        GL.setViewport(bak.x, bak.y, bak.w, bak.h);
    }
}
GL.viewport = { x: 0, y: 0, w: 0, h: 0 };
class Figure {
    constructor() { }
    static init() {
        const gl = GL.gl;
        this.indexBuffer = gl.createBuffer();
        this.vertexBuffer = gl.createBuffer();
        const vSrc = `
                precision lowp float;
                attribute vec2 vertex;
                void main(void) {
                    gl_Position = vec4(vertex, 0.0, 1.0);
                }
            `;
        const fSrc = `
                precision lowp float;
                uniform vec4 color;
                void main(void) {
                    gl_FragColor = color;
                }
            `;
        const vShader = createVShader(gl, vSrc);
        const fShader = createFShader(gl, fSrc);
        this.program = createProgram(gl, vShader, fShader);
        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.vertexAttr = gl.getAttribLocation(this.program, 'vertex');
        gl.enableVertexAttribArray(this.vertexAttr);
        this.rectIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.rectIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array([0, 1, 2, 3]), gl.STATIC_DRAW);
        this.lineIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array([0, 1]), gl.STATIC_DRAW);
        this.colorUniform = gl.getUniformLocation(this.program, 'color');
    }
    static fillRect(x1, y1, x2, y2, color) {
        const gl = GL.gl;
        gl.useProgram(this.program);
        gl.uniform4f(this.colorUniform, color.r, color.g, color.b, color.a);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.vertexAttr, 2, gl.FLOAT, false, 0, 0);
        const points = toGLPoints([
            x1, y1,
            x2, y1,
            x1, y2,
            x2, y2,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.rectIndexBuffer);
        gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_SHORT, 0);
    }
    static drawRect(x1, y1, x2, y2, color) {
        const gl = GL.gl;
        gl.useProgram(this.program);
        gl.uniform4f(this.colorUniform, color.r, color.g, color.b, color.a);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.vertexAttr, 2, gl.FLOAT, false, 0, 0);
        let points = toGLPoints([
            x1, y1,
            x2, y1,
            x2, y2,
            x1, y2,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.rectIndexBuffer);
        gl.drawElements(gl.LINE_LOOP, 4, gl.UNSIGNED_SHORT, 0);
    }
    static drawPolygon(polygonPoints, color) {
        let points = [];
        let polygonIndex = [];
        let i = 0;
        for (let p of polygonPoints) {
            points.push(p.x);
            points.push(p.y);
            polygonIndex.push(i++);
        }
        let polygonIndex16 = new Int16Array(polygonIndex);
        points = toGLPoints(points);
        let gl = GL.gl;
        gl.useProgram(this.program);
        gl.uniform4f(this.colorUniform, color.r, color.g, color.b, color.a);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.vertexAttr, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, polygonIndex16, gl.STATIC_DRAW);
        gl.drawElements(gl.LINE_LOOP, polygonIndex16.length, gl.UNSIGNED_SHORT, 0);
    }
    // static fillPolygon(polygonPoints:Array<Point>, color:Color){
    //     if(polygonPoints.length <= 1){return;}
    //     if(polygonPoints.length === 2){this.drawPolygon( polygonPoints, color );}
    //     let points:number[] = [];
    //     let totalX:number = 0;
    //     let totalY:number = 0;
    //     for(let p of polygonPoints){
    //         points.push( p.x );
    //         points.push( p.y );
    //         totalX += p.x;
    //         totalY += p.y;
    //     }
    //     let polygonIndex:number[] = [];
    //     const cx = totalX / polygonPoints.length;
    //     const cy = totalY / polygonPoints.length;
    //     for(let i = 0; i < polygonPoints.length; i++){
    //         polygonIndex.push( i );
    //         polygonIndex.push( polygonPoints.length );
    //     }
    //     polygonIndex.push(0);
    //     points.push(cx);
    //     points.push(cy);
    //     const polygonIndex16 = new Int16Array( polygonIndex );
    //     points = toGLPoints(points);
    //     let gl = GL.gl;
    //     gl.useProgram(this.program);
    //     gl.uniform4f(this.colorUniform, color.r, color.g, color.b, color.a);
    //     gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    //     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
    //     gl.vertexAttribPointer(this.vertexAttr, 2, gl.FLOAT, false, 0, 0);
    //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    //     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, polygonIndex16, gl.STATIC_DRAW);
    //     gl.drawElements(gl.TRIANGLE_STRIP, polygonIndex16.length, gl.UNSIGNED_SHORT, 0);
    // }
    static line(x1, y1, x2, y2, color) {
        const points = toGLPoints([
            x1, y1,
            x2, y2,
        ]);
        let gl = GL.gl;
        gl.useProgram(this.program);
        gl.uniform4f(this.colorUniform, color.r, color.g, color.b, color.a);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.vertexAttr, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer);
        gl.drawElements(gl.LINES, 2, gl.UNSIGNED_SHORT, 0);
    }
}
export function createVShader(gl, vSrc) {
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vSrc);
    gl.compileShader(vShader);
    // gl.getShaderParameter(vShader, GL.COMPILE_STATUS);
    return vShader;
}
export function createFShader(gl, fSrc) {
    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fSrc);
    gl.compileShader(fShader);
    // gl.getShaderParameter(fShader, GL.COMPILE_STATUS);
    return fShader;
}
export function createProgram(gl, vShader, fShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    // gl.getProgramParameter(program, GL.LINK_STATUS);
    return program;
}
export function toGLPoints(origin) {
    let points = [];
    let i = 0;
    while (i < origin.length - 1) {
        points.push(origin[i] * 2 - 1);
        points.push(origin[i + 1] * -2 + 1);
        i += 2;
    }
    return points;
}
