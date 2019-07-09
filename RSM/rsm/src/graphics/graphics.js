export class Texture {
    static createFromCanvas(canvas, innerResolution) {
    }
    // constructor(canvas:HTMLCanvasElement, innerResolution:number){
    /**
     *
     * @param values
     * canvasが設定されていればsizeを無視し、canvasが設定されていなければsizeのcanvasを生成する。
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
            // this.canvas.height = this.canvas.clientHeight * innerResolution;
        }
    }
    fillRect(bounds, color) {
        this.ctx.fillStyle = toHTMLColorString(color);
        this.ctx.fillRect(bounds.x * this.canvas.width, bounds.y * this.canvas.height, bounds.w * this.canvas.width, bounds.h * this.canvas.height);
    }
    drawRect(bounds, color) {
        this.ctx.strokeStyle = toHTMLColorString(color);
        this.ctx.strokeRect(bounds.x * this.canvas.width, bounds.y * this.canvas.height, bounds.w * this.canvas.width, bounds.h * this.canvas.height);
    }
    setFont(font) {
        this.ctx.font = font.toString();
    }
    str(_str, point, color) {
        this.ctx.fillStyle = toHTMLColorString(color);
        this.ctx.fillText(_str, point.x, point.y);
    }
    pixelW() { return 1 / this.canvas.width; }
    pixelH() { return 1 / this.canvas.height; }
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
    static getDef() {
        return this.DEF !== undefined ? this.DEF : (this.DEF = new Font(18));
    }
    static createHTMLString(size, weight, name) {
        return `${weight} ${size}px ${name}`;
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
