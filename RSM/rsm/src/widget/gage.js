import { ILayout, Label } from "../undym/layout.js";
import { GL } from "../gl/gl.js";
import { Color, Rect } from "../undym/type.js";
import { Font } from "../gl/glstring.js";
export default class Gage extends ILayout {
    constructor(now, max, leftStr, rightStr, color, font) {
        super();
        this.now = now;
        this.max = max;
        this.leftLabel = new Label(font, leftStr).setBase(Font.UPPER_LEFT);
        this.rightLabel = new Label(font, rightStr).setBase(Font.UPPER_RIGHT);
        this.color = color;
        this.font = font;
    }
    ctrlInner(bounds) {
    }
    drawInner(bounds) {
        let _max = this.max();
        let _now = this.now();
        if (_max > 0) {
            let ratio = _now / _max;
            if (ratio < 0) {
                ratio = 0;
            }
            if (ratio > 1) {
                ratio = 1;
            }
            // let h = 0.07 * bounds.h;
            let h = 1 / GL.getCanvas().height;
            let y = bounds.yh - h;
            GL.fillRect(new Rect(bounds.x, y, bounds.w, h), Color.D_GRAY);
            GL.fillRect(new Rect(bounds.x, y, bounds.w * ratio, h), this.color());
        }
        this.leftLabel.draw(bounds);
        this.rightLabel.draw(bounds);
    }
}
