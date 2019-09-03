import { Rect, Color, Point } from "../undym/type.js";
import { Graphics, Font } from "../graphics/graphics.js";
export class FX {
    /**countは0スタート。 */
    static add(effect) {
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
    FX.add((count) => {
        const over = 3;
        let w = bounds.w - bounds.w * count / over;
        let ph = 8 / Graphics.pixelH;
        let h = ph - ph * count / over;
        let bh = (bounds.h - h) * 0.75;
        let y = bounds.y + bh - bh * count / (over - 1);
        Graphics.fillRect(new Rect(bounds.cx - w / 2, y, w, h), Color.GRAY);
        return count < over;
    });
};
FXTest.add(FX_Advance.name, () => FX_Advance(Rect.FULL));
export const FX_Return = (bounds) => {
    FX.add((count) => {
        const over = 3;
        let w = bounds.w * count / over;
        let ph = 8 / Graphics.pixelH;
        let h = ph * count / over;
        let bh = (bounds.h - h) * 0.75;
        let y = bounds.y + bh * (count - 1) / (over - 1);
        Graphics.fillRect(new Rect(bounds.cx - w / 2, y, w, h), Color.GRAY);
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
    let y = center.y - font.ratioH / 2;
    FX.add((count) => {
        const over = 30;
        let x2 = x;
        let y2 = y;
        let a = count < over / 2 ? 1 : 1 - (count - over / 2) / (over / 2);
        let col = new Color(color.r, color.g, color.b, a);
        for (let i = 0; i < strings.length; i++) {
            let shakeX = (1 / Graphics.pixelW) / 2 * (Math.random() * 2 - 1) / (count / over);
            let shakeY = (1 / Graphics.pixelH) / 2 * (Math.random() * 2 - 1) / (count / over);
            let x3 = x2 + shakeX;
            let y3 = y2 + shakeY;
            font.draw(strings[i], new Point(x3, y3), col);
            x2 += measures[i];
        }
        y -= (1 / Graphics.pixelH) / 2;
        return count < over;
    });
};
FXTest.add(FX_ShakeStr.name, () => FX_ShakeStr(new Font(30, Font.BOLD), "1234", FXTest.target, Color.RED));
export const FX_Str = (font, str, center, color) => {
    let strings = [];
    let measures = [];
    for (let i = 0; i < str.length; i++) {
        let s = str.substring(i, i + 1);
        strings.push(s);
        measures.push(font.measureRatioW(s));
    }
    const x = center.x - font.measureRatioW(str) / 2;
    let y = center.y - font.ratioH / 2;
    FX.add((count) => {
        const over = 30;
        let x2 = x;
        let y2 = y;
        let a = count < over / 2 ? 1 : 1 - (count - over / 2) / (over / 2);
        let col = new Color(color.r, color.g, color.b, a);
        for (let i = 0; i < strings.length; i++) {
            font.draw(strings[i], new Point(x2, y2), col);
            x2 += measures[i];
        }
        y -= (1 / Graphics.pixelH) / 2;
        return count < over;
    });
};
FXTest.add(FX_Str.name, () => FX_Str(new Font(30, Font.BOLD), "1234", FXTest.target, Color.GREEN));
export const FX_RotateStr = (font, str, center, color) => {
    let strings = [];
    let measures = [];
    for (let i = 0; i < str.length; i++) {
        let s = str.substring(i, i + 1);
        strings.push(s);
        measures.push(font.measureRatioW(s));
    }
    const x = center.x - font.measureRatioW(str) / 2;
    let y = center.y - font.ratioH / 2;
    const PI2 = Math.PI * 2;
    FX.add((count) => {
        const over = 30;
        const rotateOver = 8;
        let x2 = x;
        let y2 = y;
        let a = count < over / 2 ? 1 : 1 - (count - over / 2) / (over / 2);
        let col = new Color(color.r, color.g, color.b, a);
        for (let i = 0; i < strings.length; i++) {
            let rad = -Math.PI - PI2 * (count - i) / rotateOver;
            if (rad < -PI2) {
                rad = 0;
            }
            Graphics.rotate(/*rad*/ rad, /*center*/ { x: x2, y: y2 }, () => {
                font.draw(strings[i], new Point(-measures[i] / 2, -font.ratioH / 2), col);
            });
            x2 += measures[i];
        }
        y -= (1 / Graphics.pixelH) / 2;
        return count < over;
    });
};
FXTest.add(FX_RotateStr.name, () => FX_RotateStr(new Font(30, Font.BOLD), "12345", FXTest.target, Color.GREEN));
export const FX_Shake = (dstRatio, srcRatio = { x: -1, y: 0, w: 0, h: 0 }) => {
    if (srcRatio.x === -1) {
        srcRatio = dstRatio;
    }
    const over = 15;
    const shakeRange = 0.015;
    let tex;
    FX.add((count) => {
        if (count === 0) {
            tex = Graphics.createTexture(srcRatio);
        }
        const shake = () => {
            let v = shakeRange * (over - count) / over;
            if (Math.random() < 0.5) {
                return v;
            }
            else {
                return -v;
            }
        };
        let r = {
            x: dstRatio.x,
            y: dstRatio.y,
            w: dstRatio.w,
            h: dstRatio.h,
        };
        r.x += shake();
        r.y += shake();
        tex.draw(r);
        return count < over;
    });
};
FXTest.add(FX_Shake.name, () => FX_Shake({ x: 0, y: 0, w: 0.5, h: 0.5 }));
export const FX_格闘 = (center) => {
    let particles = [];
    for (let i = 0; i < 40; i++) {
        const pow = 0.0001 + Math.random() * 0.02;
        const rad = Math.PI * 2 * Math.random();
        particles.push({
            x: center.x,
            y: center.y,
            vx: Math.cos(rad) * pow,
            vy: Math.sin(rad) * pow,
            lifeTime: 3 + Math.random() * 15,
        });
    }
    FX.add((count) => {
        let exists = false;
        for (const p of particles) {
            if (p.lifeTime-- > 0) {
                exists = true;
                const size = (p.lifeTime * 0.7 + 1) / Graphics.pixelW;
                Graphics.fillOval(p, size, Color.RED);
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.85;
                p.vy *= 0.85;
            }
        }
        return exists;
    });
};
FXTest.add(FX_格闘.name, () => FX_格闘(FXTest.target));
export const FX_魔法 = (center) => {
    let particles = [];
    const iLoop = 5;
    const i2Loop = 10;
    for (let i = 0; i < iLoop; i++) {
        const r = Math.random();
        const g = Math.random();
        const b = Math.random();
        for (let i2 = 0; i2 < i2Loop; i2++) {
            particles.push({
                r: 0.01 + i2 * 0.01,
                rad: Math.PI * 2 * i / iLoop,
                ordinal: i2,
                color: new Color(r, g, b, 0.7 + 0.3 * i2 / i2Loop),
            });
        }
    }
    FX.add((count) => {
        const t = count % 2;
        let exists = false;
        for (const p of particles) {
            if (p.r > 0.002 && p.ordinal % 2 === t) {
                exists = true;
                const size = (p.r * 100 + 1) / Graphics.pixelW;
                const point = {
                    x: center.x + Math.cos(p.rad) * p.r,
                    y: center.y + Math.sin(p.rad) * p.r,
                };
                Graphics.fillOval(point, size, p.color);
                p.r *= 0.75;
                p.rad += 0.05 + (i2Loop - p.ordinal) * 0.18;
            }
        }
        return exists;
    });
};
FXTest.add(FX_魔法.name, () => FX_魔法(FXTest.target));
