var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ILayout, Label } from "../undym/layout.js";
import { Color } from "../undym/type.js";
import { Scene } from "../undym/scene.js";
import { Font } from "../graphics/graphics.js";
const GET_WHITE = (cnt) => Color.WHITE;
export default class Msg extends ILayout {
    constructor() {
        super();
        this.lines = [];
        this.wLim = 1;
        this.reserves = [];
        for (let i = 0; i < 30; i++) {
            this.lines.push(new Line());
        }
        this.font = Font.def;
    }
    set(name, color) {
        let r = new Reserve();
        r.name = name;
        r.br = true;
        if (typeof color === "object") {
            r.createColor = () => color;
        }
        else if (typeof color === "function") {
            r.createColor = color;
        }
        else {
            r.createColor = GET_WHITE;
        }
        this.reserves.push(r);
    }
    add(name, color) {
        let r = new Reserve();
        r.name = name;
        r.br = false;
        if (typeof color === "object") {
            r.createColor = () => color;
        }
        else if (typeof color === "function") {
            r.createColor = color;
        }
        else {
            r.createColor = GET_WHITE;
        }
        this.reserves.push(r);
    }
    setInner(r) {
        let l = this.lines[this.lines.length - 1];
        this.lines.unshift(l);
        this.lines.length -= 1;
        l.elms = [];
        this.addInner(r);
    }
    addInner(r) {
        let l = this.lines[0];
        let allowedW = this.wLim - l.totalW;
        for (let i = 0; i < r.name.length; i++) {
            let s = r.name.substring(0, r.name.length - i);
            let sw = this.font.measureRatioW(s);
            if (sw <= allowedW) {
                let e = new Elm();
                e.label = new Label(this.font, () => s);
                e.test_name = s;
                e.createColor = r.createColor;
                e.w = sw;
                this.lines[0].elms.push(e);
                if (i !== 0) {
                    this.set(r.name.substring(r.name.length - i, r.name.length), r.createColor);
                }
                break;
            }
        }
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    drawInner(bounds) {
        this.wLim = bounds.w;
        for (let r of this.reserves) {
            if (r.br) {
                this.setInner(r);
            }
            else {
                this.addInner(r);
            }
        }
        this.reserves = [];
        let fontRatioH = this.font.ratioH;
        let y = bounds.yh - fontRatioH;
        for (let i = 0; i < this.lines.length; i++) {
            let l = this.lines[i];
            let x = bounds.cx - l.totalW / 2;
            let beforeColor = Color.WHITE;
            for (let e of l.elms) {
                beforeColor = e.createColor(Date.now() / 30 + 10 * i);
                this.font.draw(e.test_name, { x: x, y: y }, beforeColor);
                x += e.w;
            }
            if (i === 0 && Scene.isWaiting()) {
                let dot = "";
                const dotNum = Date.now() / 80 % 5;
                for (let i = 0; i < dotNum; i++) {
                    dot += ".";
                }
                this.font.draw(dot, { x: x, y: y }, beforeColor);
            }
            y -= fontRatioH;
            if (y < bounds.y) {
                break;
            }
        }
    }
}
class Line {
    constructor() {
        this.elms = [];
    }
    /**ratio */
    get totalW() {
        let res = 0;
        for (let e of this.elms) {
            res += e.w;
        }
        return res;
    }
}
class Elm {
}
class Reserve {
}
