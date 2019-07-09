import { Rect, Color, Point } from "../undym/type.js";
import { GL } from "../gl/gl.js";
import { Font } from "../gl/glstring.js";
export class FX {
    static set(effect) {
        let e = new Elm(effect);
        this.elms.push(e);
    }
    static draw() {
        for (let i = 0; i < this.elms.length; i++) {
            let e = this.elms[i];
            if (!e.exists) {
                this.elms.splice(i, 1);
                i--;
                continue;
            }
            e.draw();
        }
    }
}
FX.elms = [];
class Elm {
    constructor(effect) {
        this.count = 0;
        this.exists = true;
        this.effect = effect;
    }
    draw() {
        this.exists = this.effect(this.count);
        this.count++;
    }
}
export class FXTest {
    static get attacker() { return this._attacker !== undefined ? this._attacker : (this._attacker = new Point(0.3, 0.3)); }
    ;
    static get target() { return this._target !== undefined ? this._target : (this._target = new Point(0.6, 0.6)); }
    ;
    static add(name, run) {
        this.effects.push({ name: name, run: run });
    }
    static values() {
        return this.effects;
    }
}
// private static effects:[string,()=>void][] = [];
FXTest.effects = [];
export const FX_Advance = (bounds) => {
    FX.set((count) => {
        const over = 3;
        let w = bounds.w - bounds.w * count / over;
        let ph = GL.pixel.h * 8;
        let h = ph - ph * count / over;
        let bh = (bounds.h - h) * 0.75;
        let y = bounds.y + bh - bh * count / (over - 1);
        GL.fillRect(new Rect(bounds.cx - w / 2, y, w, h), Color.GRAY);
        return count < over;
    });
};
FXTest.add(FX_Advance.name, () => FX_Advance(Rect.FULL));
export const FX_Return = (bounds) => {
    FX.set((count) => {
        const over = 3;
        let w = bounds.w * count / over;
        let ph = GL.pixel.h * 8;
        let h = ph * count / over;
        let bh = (bounds.h - h) * 0.75;
        let y = bounds.y + bh * (count - 1) / (over - 1);
        GL.fillRect(new Rect(bounds.cx - w / 2, y, w, h), Color.GRAY);
        return count < over;
    });
};
FXTest.add(FX_Return.name, () => FX_Return(Rect.FULL));
export const FX_ShakeStr = (font, str, center, color) => {
    let strings = [];
    let measures = [];
    for (let i = 0; i < str.length; i++) {
        let s = str.substring(i, i + 1);
        strings.push(s);
        measures.push(font.measureRatioW(s));
    }
    const x = center.x - font.measureRatioW(str) / 2;
    let y = center.y - font.getSizeRatio() / 2;
    FX.set((count) => {
        const over = 30;
        let x2 = x;
        let y2 = y;
        let a = count < over / 2 ? 1 : 1 - (count - over / 2) / (over / 2);
        let col = new Color(color.r, color.g, color.b, a);
        for (let i = 0; i < strings.length; i++) {
            let shakeX = GL.pixel.w / 2 * (Math.random() * 2 - 1) / (count / over);
            let shakeY = GL.pixel.h / 2 * (Math.random() * 2 - 1) / (count / over);
            let x3 = x2 + shakeX;
            let y3 = y2 + shakeY;
            font.draw(strings[i], new Point(x3, y3), col);
            x2 += measures[i];
        }
        y -= GL.pixel.h / 2;
        return count < over;
    });
};
FXTest.add(FX_ShakeStr.name, () => FX_ShakeStr(Font.create(30, Font.BOLD), "1234", FXTest.target, Color.RED));
export const FX_Str = (font, str, center, color) => {
    let strings = [];
    let measures = [];
    for (let i = 0; i < str.length; i++) {
        let s = str.substring(i, i + 1);
        strings.push(s);
        measures.push(font.measureRatioW(s));
    }
    const x = center.x - font.measureRatioW(str) / 2;
    let y = center.y - font.getSizeRatio() / 2;
    FX.set((count) => {
        const over = 30;
        let x2 = x;
        let y2 = y;
        let a = count < over / 2 ? 1 : 1 - (count - over / 2) / (over / 2);
        let col = new Color(color.r, color.g, color.b, a);
        for (let i = 0; i < strings.length; i++) {
            font.draw(strings[i], new Point(x2, y2), col);
            x2 += measures[i];
        }
        y -= GL.pixel.h / 2;
        return count < over;
    });
};
FXTest.add(FX_Str.name, () => FX_Str(Font.create(30, Font.BOLD), "1234", FXTest.target, Color.GREEN));
