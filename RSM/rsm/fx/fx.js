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
        let w = bounds.w * count / over;
        let ph = 8 / Graphics.pixelH;
        let h = ph * count / over;
        let bh = (bounds.h - h) * 0.75;
        let y = bounds.y + bh * (count - 1) / (over - 1);
        Graphics.fillRect(new Rect(bounds.cx - w / 2, y, w, h), Color.GRAY);
        return count < over;
    });
};
FXTest.add(FX_Advance.name, () => FX_Advance(Rect.FULL));
export const FX_Return = (bounds) => {
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
                font.draw(strings[i], new Point(x2 - measures[i] / 2, y2 - font.ratioH / 2), col);
            });
            x2 += measures[i];
        }
        y -= (1 / Graphics.pixelH) / 2;
        return count < over;
    });
};
FXTest.add(FX_RotateStr.name, () => FX_RotateStr(new Font(30, Font.BOLD), "12345", FXTest.target, Color.GREEN));
// export const FX_Shake = (dstRatio:{x:number, y:number, w:number, h:number}, srcRatio = {x:-1, y:0, w:0, h:0})=>{
//     if(srcRatio.x === -1){
//         srcRatio = dstRatio;
//     }
//     const over = 15;
//     const shakeRange = 0.015;
//     let tex:Texture;
//     FX.add((count)=>{
//         if(count === 0){
//             tex = Graphics.createTexture(srcRatio);
//         }
//         const shake = ()=>{
//             let v = shakeRange * (over - count) / over;
//             if(Math.random() < 0.5) {return v;}
//             else                    {return -v;}
//         };
//         let r = {
//             x:dstRatio.x,
//             y:dstRatio.y,
//             w:dstRatio.w,
//             h:dstRatio.h,
//         };
//         r.x += shake();
//         r.y += shake();
//         tex.draw(r);
//         return count < over;
//     });
// };
export const FX_Shake = (dstRatio, draw) => {
    FX.add(count => {
        const over = 15;
        const shakeRange = 0.015;
        const shake = () => {
            let v = shakeRange * (over - count) / over;
            if (Math.random() < 0.5) {
                return v;
            }
            else {
                return -v;
            }
        };
        const r = new Rect(dstRatio.x + shake(), dstRatio.y + shake(), dstRatio.w, dstRatio.h);
        draw(r);
        return count < over;
    });
};
FXTest.add(FX_Shake.name, () => {
    const r = new Rect(0, 0, 0.5, 0.5);
    const tex = Graphics.createTexture(r);
    FX_Shake(r, bounds => tex.draw(bounds));
});
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
export const FX_神格 = (center) => {
    FX.add(count => {
        const over = 20;
        for (let i = 0; i < 3; i++) {
            Graphics.setLineWidth(6, () => {
                Graphics.rotate(Math.PI * 2 * 8 / 360, center, () => {
                    const x = center.x + Math.random() * Graphics.dotW * 6;
                    const y = center.y + Math.random() * Graphics.dotW * 6;
                    const color = new Color(0.5 + Math.random(), 0.5 + Math.random(), 0.5 + Math.random());
                    const w = Graphics.dotW * 30;
                    const h = w * 2;
                    //x
                    {
                        const p1 = new Point(x - w / 2, y);
                        const p2 = new Point(x + w / 2, y);
                        Graphics.line(p1, p2, color);
                    }
                    //y
                    {
                        const p1 = new Point(x, y - h / 3);
                        const p2 = new Point(x, y + h * 2 / 3);
                        Graphics.line(p1, p2, color);
                    }
                });
            });
        }
        return count < over;
    });
};
FXTest.add(FX_神格.name, () => FX_神格(FXTest.target));
export const FX_暗黒 = (center) => {
    const addParticle = (point, vec, size, color) => {
        const over = 12;
        const rad = Math.PI * 2 * Math.random();
        const v = vec;
        let vx = Math.cos(rad) * v;
        let vy = Math.sin(rad) * v;
        FX.add(count => {
            const r = size * (1 - count / over);
            // Graphics.fillOval(point, r, color);
            Graphics.fillRect(new Rect(point.x - r / 2, point.y - r / 2, r, r), color);
            point.x += vx;
            point.y += vy;
            vx *= 0.85;
            vy *= 0.85;
            return count < over;
        });
    };
    FX.add(count => {
        const over = 4;
        const start = new Point(center.x + 0.03, center.y - 0.07);
        const end = new Point(center.x - 0.03, center.y + 0.07);
        for (let i2 = 0; i2 < 2; i2++) {
            const count2 = count + i2 * 0.5;
            const x = (start.x * (over - count2) + end.x * count2) / over;
            const y = (start.y * (over - count2) + end.y * count2) / over;
            for (let i = 0; i < 25; i++) {
                const vec = 0.001 + Math.random() * 0.012 * (1 - count / over);
                const c = 0.1 + Math.random() * 0.2;
                addParticle({ x: x, y: y }, vec, /*size*/ 0.01 + 0.01 * Math.random() * (1 - count / over), new Color(c + Math.random() * 0.4, c, c));
            }
        }
        return count < over;
    });
};
FXTest.add(FX_暗黒.name, () => FX_暗黒(FXTest.target));
export const FX_練術 = (attacker, target) => {
    FX.add((count) => {
        const over = 20;
        const color = { r: 0, g: 0, b: 0, a: 1 };
        const rndColor = () => {
            color.g = Math.random();
            return color;
        };
        //line: attacker to target
        for (let i2 = 0; i2 < 2; i2++) {
            const points = [];
            const loop = 10;
            for (let i = 1; i < loop - 1; i++) {
                let x = (attacker.x * (loop - i) + target.x * i) / loop;
                let y = (attacker.y * (loop - i) + target.y * i) / loop;
                const rad = i * 0.6 + count * 1.2 + i2 * 0.6;
                const r = 0.05;
                x = x + Math.sin(rad ^ Number.MAX_SAFE_INTEGER * 1.0) * r;
                y = y + Math.sin(rad) * r;
                points.push({ x: x, y: y });
            }
            points.unshift(attacker);
            points.push(target);
            for (let i3 = 0; i3 < points.length - 1; i3++) {
                Graphics.setLineWidth(1 + (points.length - i3) / 2, () => {
                    Graphics.line(points[i3], points[i3 + 1], rndColor());
                });
            }
        }
        //line: target
        const loop = 20;
        const points = [];
        for (let i = 0; i < loop; i++) {
            const rad = Math.PI * 2 * i / loop * 2.5 + count * 0.6;
            const r = 0.025 * i / loop + 0.025 * Math.random();
            let x = target.x + Math.cos(rad) * r;
            let y = target.y + Math.sin(rad) * r;
            points.push({ x: x, y: y });
        }
        for (let i = 0; i < points.length - 1; i++) {
            Graphics.setLineWidth(1 + Math.random() * 6, () => {
                Graphics.line(points[i], points[i + 1], rndColor());
            });
        }
        return count < over;
    });
};
FXTest.add(FX_練術.name, () => FX_練術(FXTest.attacker, FXTest.target));
export const FX_過去 = (target) => {
    FX.add((count) => {
        const over = 20;
        const color = { r: 0, g: 0, b: 0, a: 1 };
        const rndColor = () => {
            color.r = color.g = color.b = Math.random();
            return color;
        };
        //line: target
        const loop = 40;
        const points = [];
        for (let i = 0; i < loop; i++) {
            const rad = Math.PI * 2 * i / loop * 2.5;
            const r = 0.025 * i / loop + 0.025 * Math.random();
            let x = target.x + Math.cos(rad) * r;
            let y = target.y + Math.sin(rad) * r;
            points.push({ x: x, y: y });
        }
        for (let i = 0; i < points.length - 1; i++) {
            Graphics.setLineWidth(1 + Math.random() * 6, () => {
                Graphics.line(points[i], points[i + 1], rndColor());
            });
        }
        return count < over;
    });
};
FXTest.add(FX_過去.name, () => FX_過去(FXTest.target));
export const FX_銃術 = (attacker, target) => {
    let particles = [];
    for (let i = 0; i < 20; i++) {
        const vecBase = 0.08;
        let vec = Math.random() * vecBase;
        if (Math.random() < 0.1) {
            vec *= 3;
        }
        const vecRad = Math.PI * 2 * Math.random();
        const lifeTime = 2 + ((vecBase - vec) * 250) | 0;
        let points = [];
        const vertex = 3 + (Math.random() * 6) | 0;
        for (let i = 0; i < vertex; i++) {
            const rad = Math.PI * 2 * (i + 1) / vertex;
            points.push({
                x: Math.cos(rad + Math.random() * 0.01) * (lifeTime * Math.random()) * 0.001,
                y: Math.sin(rad + Math.random() * 0.01) * (lifeTime * Math.random()) * 0.001,
            });
        }
        particles.push({
            x: target.x,
            y: target.y,
            vx: Math.cos(vecRad) * vec,
            vy: Math.sin(vecRad) * vec,
            lifeTime: lifeTime,
            lifeTimeLim: lifeTime,
            points: points,
        });
    }
    FX.add((count) => {
        let exists = false;
        for (const p of particles) {
            if (p.lifeTime-- > 0) {
                exists = true;
                let points = [];
                for (let _p of p.points) {
                    points.push({
                        x: p.x + _p.x,
                        y: p.y + _p.y,
                    });
                }
                Graphics.fillPolygon(points, new Color(1, 0, 0, p.lifeTime / p.lifeTimeLim));
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.5;
                p.vy *= 0.5;
            }
        }
        return exists;
    });
    FX.add((count) => {
        const over = 10;
        const a = 1.0 - count / over;
        Graphics.line(attacker, target, new Color(1, 1, 1, a));
        const r = 0.07 * count / over;
        Graphics.drawOval(target, r, new Color(1, 1, 1, a));
        return count < over;
    });
};
FXTest.add(FX_銃術.name, () => FX_銃術(FXTest.attacker, FXTest.target));
export const FX_回復 = (target) => {
    const addStar = (x, y) => {
        let w = Graphics.dotW * 10;
        let h = Graphics.dotH * 10;
        FX.add(count => {
            if (count % 2) {
                return true;
            }
            let _w = w;
            let _h = h;
            let lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                Graphics.setLineWidth(lineWidth++, () => {
                    Graphics.line(new Point(x - _w, y), new Point(x + _h, y), Color.WHITE);
                    Graphics.line(new Point(x, y - _w), new Point(x, y + _h), Color.WHITE);
                });
                _w /= 2;
                _h /= 2;
            }
            w *= 0.9;
            h *= 0.9;
            return count < 10;
        });
    };
    FX.add((count) => {
        const over = 20;
        const rad = count * 0.6;
        const r = 50;
        const x = target.x + Math.cos(rad) * (1 - count / over) * Graphics.dotW * r;
        const y = target.y + Math.sin(rad) * (1 - count / over) * Graphics.dotH * r;
        addStar(x, y);
        return count < over;
    });
};
FXTest.add(FX_回復.name, () => FX_回復(FXTest.target));
