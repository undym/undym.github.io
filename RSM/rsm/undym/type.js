export class Color {
    constructor(r, g, b, a = 1) {
        /**
         * range:変動範囲.rgbが-range~+rangeの範囲で変動する
         * spd:変動速度.
         * Math.sin( Math.PI * 2 * count * spd ) * range
         * */
        this.bright = (count, range = 0.3, spd = 0.02) => {
            if (count === undefined) {
                count = Date.now() / 30;
            }
            function round(v) {
                if (v < 0) {
                    return 0;
                }
                if (v > 1) {
                    return 1;
                }
                return v;
            }
            let sin = Math.sin(Math.PI * 2 * count * spd) * range;
            return new Color(round(this.r + sin), round(this.g + sin), round(this.b + sin), this.a);
        };
        this.wave = (color, count, spd = 0.02) => {
            if (!count) {
                count = Date.now() / 30;
            }
            let ratio1 = (1 + Math.sin(Math.PI * 2 * count * spd)) / 2;
            let ratio2 = 1 - ratio1;
            return new Color(this.r * ratio1 + color.r * ratio2, this.g * ratio1 + color.g * ratio2, this.b * ratio1 + color.b * ratio2, this.a * ratio1 + color.a * ratio2);
        };
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    brighter() {
        let mul = 1.3;
        let _r = this.r * mul;
        if (_r > 1) {
            _r = 1;
        }
        let _g = this.g * mul;
        if (_g > 1) {
            _g = 1;
        }
        let _b = this.b * mul;
        if (_b > 1) {
            _b = 1;
        }
        return new Color(_r, _g, _b, this.a);
    }
    darker() {
        let mul = 0.7;
        return new Color(this.r * mul, this.g * mul, this.b * mul, this.a);
    }
    /**一度呼び出せばキャッシュされる。 */
    toString() {
        if (this.HTMLString === undefined) {
            let r = Math.floor(this.r * 255);
            let g = Math.floor(this.g * 255);
            let b = Math.floor(this.b * 255);
            let a = this.a;
            this.HTMLString = `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return this.HTMLString;
    }
    equals(c) {
        return (c.r === this.r
            && c.g === this.g
            && c.b === this.b
            && c.a === this.a);
    }
}
Color.CLEAR = new Color(0, 0, 0, 0);
Color.WHITE = new Color(1, 1, 1, 1);
Color.BLACK = new Color(0, 0, 0, 1);
Color.GRAY = new Color(0.5, 0.5, 0.5, 1);
Color.L_GRAY = new Color(0.7, 0.7, 0.7, 1);
Color.D_GRAY = new Color(0.2, 0.2, 0.2, 1);
Color.RED = new Color(1, 0, 0, 1);
Color.D_RED = new Color(0.7, 0, 0, 1);
Color.GREEN = new Color(0, 1, 0, 1);
Color.D_GREEN = new Color(0, 0.7, 0, 1);
Color.BLUE = new Color(0, 0, 1, 1);
Color.YELLOW = new Color(1, 1, 0, 1);
Color.CYAN = new Color(0, 1, 1, 1);
Color.D_CYAN = new Color(0, 0.7, 0.7, 1);
Color.ORANGE = new Color(1, 0.6, 0, 1);
Color.PINK = new Color(1, 0.75, 0.8, 1);
/** 肌色*/
Color.WHEAT = new Color(0.95, 0.85, 0.6, 1);
Color.RAINBOW = [Color.RED, Color.YELLOW, Color.CYAN, Color.BLUE, Color.GREEN, Color.ORANGE, Color.PINK, Color.GRAY];
// static rainbow(count:number):Color{
//     let i = Math.floor(count / 5) % this.RAINBOW.length;
//     return this.RAINBOW[i];
// }
Color.rainbow = (count) => {
    let i = Math.floor(count / 5) % Color.RAINBOW.length;
    return Color.RAINBOW[i];
};
export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    move(addX, addY) {
        return new Point(this.x + addX, this.y + addY);
    }
}
Point.ZERO = new Point(0, 0);
Point.ONE = new Point(1, 1);
Point.CENTER = new Point(0.5, 0.5);
export class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    get xw() { return this.x + this.w; }
    get yh() { return this.y + this.h; }
    get cx() { return this.x + this.w / 2; }
    get cy() { return this.y + this.h / 2; }
    get upperLeft() { return new Point(this.x, this.y); }
    get top() { return new Point(this.cx, this.y); }
    get upperRight() { return new Point(this.xw, this.y); }
    get left() { return new Point(this.x, this.cy); }
    get center() { return new Point(this.cx, this.cy); }
    get right() { return new Point(this.xw, this.cy); }
    get lowerLeft() { return new Point(this.x, this.yh); }
    get bottom() { return new Point(this.cx, this.yh); }
    get lowerRight() { return new Point(this.xw, this.yh); }
    contains(p) {
        return p.x >= this.x && p.x <= this.xw && p.y >= this.y && p.y <= this.yh;
    }
    equals(r) {
        return (this.x === r.x && this.y === r.y && this.w === r.w && this.h === r.h);
    }
}
Rect.FULL = new Rect(0, 0, 1, 1);
Rect.ZERO = new Rect(0, 0, 0, 0);
export class Size {
    constructor(w, h) {
        this.w = w;
        this.h = h;
    }
}
Size.ZERO = new Size(0, 0);
