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
import { Input } from "../undym/input.js";
import { Btn } from "./btn.js";
import { Graphics, Font } from "../graphics/graphics.js";
// type Values = {
//     left?:()=>string,
//     leftColor?:()=>Color,
//     center?:()=>string,
//     centerColor?:()=>Color,
//     right?:()=>string,
//     rightColor?:()=>Color,
//     push?:(elm:Elm)=>void,
//     hold?:(elm:Elm)=>void,
// };
export class List extends ILayout {
    constructor(aPageElmNum = 7) {
        super();
        this.elms = [];
        this.page = 0;
        this.update = true;
        this.aPageElmNum = aPageElmNum | 0;
        this.elmPanel = new YLayout();
        this.panel = new RatioLayout()
            .add(new Rect(0, 0, 1, 0.85 - 2 / Graphics.pixelH), this.elmPanel)
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
            let lim = ((this.elms.length - 1) / this.aPageElmNum) | 0;
            if (lim < 0) {
                lim = 0;
            }
            if (this.page > lim) {
                this.page = lim;
            }
            this.update = true;
        })));
    }
    clear(keepPage = false) {
        this.elms = [];
        this.update = true;
        if (!keepPage) {
            this.page = 0;
        }
    }
    // add(left:()=>string, right:()=>string, push:()=>void, hold?:()=>void){
    //     if(hold === undefined){hold = ()=>{};}
    //     let e = new Elm(left, right, push, hold);
    //     this.elms.push(e);
    //     this.update = true;
    // }
    add(args) {
        const e = new Elm(args);
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
    constructor(args) {
        super();
        this.push = args.push ? args.push : (elm) => { };
        this.hold = args.hold ? args.hold : (elm) => { };
        this.left = args.left;
        this.leftColor = args.leftColor ? args.leftColor : () => Color.WHITE;
        this.center = args.center;
        this.centerColor = args.centerColor ? args.centerColor : () => Color.WHITE;
        this.right = args.right;
        this.rightColor = args.rightColor ? args.rightColor : () => Color.WHITE;
        this.groundColor = args.groundColor ? args.groundColor : () => Color.BLACK;
        this.frameColor = args.frameColor ? args.frameColor : () => Color.L_GRAY;
        this.stringColor = args.stringColor ? args.stringColor : () => Color.WHITE;
        this.font = Font.def;
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Input.holding() > 4) {
                this.hold(this);
            }
            if (Input.pushed() && bounds.contains(Input.point)) {
                this.push(this);
            }
        });
    }
    drawInner(bounds) {
        Graphics.fillRect(bounds, this.groundColor());
        Graphics.drawRect(bounds, this.frameColor());
        if (this.left !== undefined) {
            const color = this.leftColor ? this.leftColor() : Color.WHITE;
            this.font.draw(this.left(), bounds.left, color, Font.LEFT);
        }
        if (this.right !== undefined) {
            const color = this.rightColor ? this.rightColor() : Color.WHITE;
            this.font.draw(this.right(), bounds.right, color, Font.RIGHT);
        }
        if (this.center !== undefined) {
            const color = this.centerColor ? this.centerColor() : Color.WHITE;
            this.font.draw(this.center(), bounds.center, color, Font.CENTER);
        }
    }
}
