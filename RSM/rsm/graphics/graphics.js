export class Texture {
    static get empty() {
        if (this._empty === undefined) {
            this._empty = new Texture({ size: { w: 1, h: 1 } });
        }
        return this._empty;
    }
    /**
     * canvasが設定されていればsizeを無視し、canvasが設定されていなければsizeのcanvasを生成する。
     * @param values
     */
    constructor(values) {
        if (values.canvas !== undefined) {
            this.canvas = values.canvas;
            this.ctx = this.canvas.getContext("2d");
        }
        else if (values.size !== undefined) {
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d");
            this.canvas.width = values.size.w;
            this.canvas.height = values.size.h;
        }
        this.ctx.imageSmoothingEnabled = false;
    }
    /**このTextureをRenderTargetにし、runを実行したのち元のTextureをRenderTargetに戻す。*/
    setRenderTarget(run) {
        const bak = Graphics.getRenderTarget();
        Graphics.setRenderTarget(this);
        run();
        Graphics.setRenderTarget(bak);
    }
    get pixelW() { return this.canvas.width; }
    get pixelH() { return this.canvas.height; }
}
export class Img {
    constructor(src) {
        this.loadComplete = false;
        this.image = new Image();
        this.image.crossOrigin = 'anonymous';
        if (src === "") {
            return;
        }
        this.image.onload = () => {
            this.loadComplete = true;
        };
        this.image.src = src;
    }
    static get empty() {
        if (this._empty === undefined) {
            this._empty = new class extends Img {
                constructor() { super(""); }
                draw(dst, src = { x: 0, y: 0, w: 1, h: 1 }) { }
            };
        }
        return this._empty;
    }
    draw(dst, src = { x: 0, y: 0, w: 1, h: 1 }) {
        if (!this.loadComplete) {
            return;
        }
        const ctx = Graphics.getRenderTarget().ctx;
        const w = Graphics.getRenderTarget().canvas.width;
        const h = Graphics.getRenderTarget().canvas.height;
        ctx.drawImage(this.image, /*sx*/ src.x * this.image.width, /*sy*/ src.y * this.image.height, /*sw*/ src.w * this.image.width, /*sh*/ src.h * this.image.height, /*dx*/ dst.x * w, /*dy*/ dst.y * h, /*dw*/ dst.w * w, /*dh*/ dst.h * h);
    }
    loaded() { return this.loadComplete; }
    /**読み込みが完了するまでは0を返す。 */
    get pixelW() { return this.image.width; }
    /**読み込みが完了するまでは0を返す。 */
    get pixelH() { return this.image.height; }
    /**現在のRenderTargetを基準としたサイズ比を返す。 */
    get ratioW() { return this.image.width / Graphics.getRenderTarget().pixelW; }
    /**現在のRenderTargetを基準としたサイズ比を返す。 */
    get ratioH() { return this.image.height / Graphics.getRenderTarget().pixelH; }
}
export class Graphics {
    constructor() { }
    static getRenderTarget() { return this.texture; }
    static setRenderTarget(texture) { this.texture = texture; }
    static clear(bounds) {
        this.texture.ctx.clearRect(bounds.x * this.texture.pixelW, bounds.y * this.texture.pixelH, bounds.w * this.texture.pixelW, bounds.h * this.texture.pixelH);
    }
    static fillRect(bounds, color) {
        this.texture.ctx.fillStyle = toHTMLColorString(color);
        this.texture.ctx.fillRect(bounds.x * this.texture.pixelW, bounds.y * this.texture.pixelH, bounds.w * this.texture.pixelW, bounds.h * this.texture.pixelH);
    }
    static drawRect(bounds, color) {
        this.texture.ctx.strokeStyle = toHTMLColorString(color);
        this.texture.ctx.strokeRect(bounds.x * this.texture.pixelW, bounds.y * this.texture.pixelH, bounds.w * this.texture.pixelW, bounds.h * this.texture.pixelH);
    }
    static line(p1, p2, color) {
        const ctx = this.texture.ctx;
        const w = this.texture.pixelW;
        const h = this.texture.pixelH;
        ctx.strokeStyle = toHTMLColorString(color);
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.closePath();
        ctx.stroke();
    }
    static lines(points, color) {
        if (points.length === 0) {
            return;
        }
        const ctx = this.texture.ctx;
        const w = this.texture.pixelW;
        const h = this.texture.pixelH;
        ctx.strokeStyle = toHTMLColorString(color);
        ctx.beginPath();
        ctx.moveTo(points[0].x * w, points[0].y * h);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x * w, points[i].y * h);
        }
        ctx.closePath();
        ctx.stroke();
    }
    static fillPolygon(points, color) {
        if (points.length === 0) {
            return;
        }
        const ctx = this.texture.ctx;
        const w = this.texture.pixelW;
        const h = this.texture.pixelH;
        ctx.fillStyle = toHTMLColorString(color);
        ctx.beginPath();
        ctx.moveTo(points[0].x * w, points[0].y * h);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x * w, points[i].y * h);
        }
        ctx.closePath();
        ctx.stroke();
    }
    static clip(bounds, run) {
        const ctx = this.texture.ctx;
        ctx.save();
        ctx.beginPath();
        if (bounds.rect !== undefined) {
            const rect = bounds.rect;
            ctx.rect(rect.x, rect.y, rect.w, rect.h);
        }
        if (bounds.arc !== undefined) {
            const arc = bounds.arc;
            ctx.arc(arc.cx, arc.cy, arc.r, arc.startRad, arc.endRad);
        }
        if (bounds.polygon !== undefined) {
            const polygon = bounds.polygon;
            if (polygon.length > 0) {
                ctx.moveTo(polygon[0].x, polygon[0].y);
                for (let i = 0; i < polygon.length; i++) {
                    ctx.lineTo(polygon[i].x, polygon[i].y);
                }
            }
        }
        ctx.closePath();
        ctx.clip();
        run();
        ctx.restore();
    }
    static rotate(rad, center, run) {
        const ctx = this.texture.ctx;
        const pw = center.x * this.pixelW;
        const ph = center.y * this.pixelH;
        ctx.beginPath();
        ctx.translate(pw, ph);
        ctx.rotate(rad);
        ctx.closePath();
        run();
        ctx.beginPath();
        ctx.rotate(-rad);
        ctx.translate(-pw, -ph);
        ctx.closePath();
    }
    static get pixelW() { return this.texture.pixelW; }
    static get pixelH() { return this.texture.pixelH; }
}
const toHTMLColorString = (color) => {
    const r = (color.r * 255) | 0;
    const g = (color.g * 255) | 0;
    const b = (color.b * 255) | 0;
    const a = color.a;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
};
export class Font {
    constructor(size, weight = Font.NORMAL, name = Font.MONOSPACE) {
        this.size = size;
        this.weight = weight;
        this.name = name;
        const htmlString = Font.createHTMLString(size, weight, name);
        this.toString = () => htmlString;
    }
    static get def() {
        return this.DEF ? this.DEF : (this.DEF = new Font(35));
    }
    static createHTMLString(size, weight, name) {
        //一度代入することにより、HTML側の表現を得る。
        Graphics.getRenderTarget().ctx.font = `${weight} ${size}px ${name}`;
        return Graphics.getRenderTarget().ctx.font;
    }
    draw(_str, point, color, base = Font.UPPER_LEFT) {
        const ctx = Graphics.getRenderTarget().ctx;
        ctx.fillStyle = toHTMLColorString(color);
        switch (base) {
            case Font.UPPER_LEFT:
                ctx.textBaseline = "top";
                ctx.textAlign = "left";
                break;
            case Font.TOP:
                ctx.textBaseline = "top";
                ctx.textAlign = "center";
                break;
            case Font.UPPER_RIGHT:
                ctx.textBaseline = "top";
                ctx.textAlign = "right";
                break;
            case Font.LEFT:
                ctx.textBaseline = "middle";
                ctx.textAlign = "left";
                break;
            case Font.CENTER:
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                break;
            case Font.RIGHT:
                ctx.textBaseline = "middle";
                ctx.textAlign = "right";
                break;
            case Font.LOWER_LEFT:
                ctx.textBaseline = "bottom";
                ctx.textAlign = "left";
                break;
            case Font.BOTTOM:
                ctx.textBaseline = "bottom";
                ctx.textAlign = "center";
                break;
            case Font.LOWER_RIGHT:
                ctx.textBaseline = "bottom";
                ctx.textAlign = "right";
                break;
        }
        if (ctx.font !== this.toString()) {
            ctx.font = this.toString();
        }
        ctx.fillText(_str, point.x * Graphics.pixelW, point.y * Graphics.pixelH);
    }
    // /**現在のRenderTargetのサイズを基準にしたもの。 */
    get ratioH() { return this.size / Graphics.pixelH; }
    measurePixelW(s) {
        if (Graphics.getRenderTarget().ctx.font !== this.toString()) {
            Graphics.getRenderTarget().ctx.font = this.toString();
        }
        return Graphics.getRenderTarget().ctx.measureText(s).width;
    }
    // /**現在のRenderTargetのサイズを基準にしたもの。 */
    measureRatioW(s) {
        return this.measurePixelW(s) / Graphics.pixelW;
    }
}
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
