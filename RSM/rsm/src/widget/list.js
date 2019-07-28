var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Rect, Color } from "../undym/type.js";
import { ILayout, YLayout, RatioLayout, XLayout } from "../undym/layout.js";
import { GL } from "../gl/gl.js";
import { Input } from "../undym/input.js";
import { Btn } from "./btn.js";
import { Font } from "../gl/glstring.js";
export class List extends ILayout {
    constructor(aPageElmNum = 7) {
        super();
        this.elms = [];
        this.page = 0;
        this.update = true;
        this.aPageElmNum = aPageElmNum;
        this.elmPanel = new YLayout();
        this.panel = new RatioLayout()
            .add(new Rect(0, 0, 1, 0.85 - GL.pixel.h * 2), this.elmPanel)
            .add(new Rect(0, 0.85, 1, 0.15), new XLayout()
            .add(new Btn(() => "＜", () => {
            this.page--;
            if (this.page < 0) {
                this.page = 0;
            }
            this.update = true;
        }))
            .add(new Btn(() => "＞", () => {
            this.page++;
            let lim = this.elms.length / this.aPageElmNum - 1;
            if (lim < 0) {
                lim = 0;
            }
            if (this.page > lim) {
                this.page = lim;
            }
            this.update = true;
        })));
    }
    clear() {
        this.elms = [];
        this.update = true;
    }
    // add(left:()=>string, right:()=>string, push:()=>void, hold?:()=>void){
    //     if(hold === undefined){hold = ()=>{};}
    //     let e = new Elm(left, right, push, hold);
    //     this.elms.push(e);
    //     this.update = true;
    // }
    add(values) {
        const e = new Elm(values);
        this.elms.push(e);
        this.update = true;
        return e;
    }
    addLayout(l) {
        this.elms.push(l);
        this.update = true;
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.update) {
                this.update = false;
                this.elmPanel.clear();
                for (let i = this.page * this.aPageElmNum; i < (this.page + 1) * this.aPageElmNum; i++) {
                    if (i < this.elms.length) {
                        this.elmPanel.add(this.elms[i]);
                    }
                    else {
                        this.elmPanel.add(ILayout.empty);
                    }
                }
            }
            yield this.panel.ctrl(bounds);
        });
    }
    drawInner(bounds) {
        this.panel.draw(bounds);
    }
}
class Elm extends ILayout {
    constructor(values) {
        super();
        this.values = values;
        this.font = Font.def;
        this.groundColor = () => Color.BLACK;
        this.frameColor = () => Color.L_GRAY;
        this.stringColor = () => Color.WHITE;
        // if(values.hold !== undefined)   {this.hold = values.hold;}
        // if(values.left !== undefined)   {this.left = values.left;}
        // if(values.right !== undefined)  {this.right = values.right;}
        // if(values.center !== undefined) {this.center = values.center;}
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Input.holding() > 4) {
                if (this.values.hold !== undefined) {
                    this.values.hold(this);
                }
            }
            if (Input.pushed() && bounds.contains(Input.point)) {
                if (this.values.push !== undefined) {
                    this.values.push(this);
                }
            }
        });
    }
    drawInner(bounds) {
        GL.fillRect(bounds, this.groundColor());
        GL.drawRect(bounds, this.frameColor());
        if (this.values.left !== undefined) {
            const color = this.values.leftColor ? this.values.leftColor() : Color.WHITE;
            this.font.draw(this.values.left(), bounds.left, color, Font.LEFT);
        }
        if (this.values.right !== undefined) {
            const color = this.values.rightColor ? this.values.rightColor() : Color.WHITE;
            this.font.draw(this.values.right(), bounds.right, color, Font.RIGHT);
        }
        if (this.values.center !== undefined) {
            const color = this.values.centerColor ? this.values.centerColor() : Color.WHITE;
            this.font.draw(this.values.center(), bounds.center, color, Font.CENTER);
        }
    }
}
