var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Rect, Color, Size } from "./type.js";
import { Graphics, Font } from "../graphics/graphics.js";
export class ILayout {
    constructor() {
        this.outsideRatioMargin = { top: 0, right: 0, bottom: 0, left: 0 };
        this.ilayout_UpdateBounds = true;
        this.ilayout_marginedBounds = Rect.FULL;
        this.ilayout_boundsBak = Rect.FULL;
    }
    static get empty() {
        if (this._empty === undefined) {
            this._empty = new class extends ILayout {
                ctrlInner(bounds) { }
                ;
                drawInner(bounds) { }
                ;
            };
        }
        return this._empty;
    }
    static create(args) {
        return new class extends ILayout {
            ctrlInner(bounds) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (args.ctrl) {
                        yield args.ctrl(bounds);
                    }
                });
            }
            drawInner(bounds) {
                if (args.draw) {
                    args.draw(bounds);
                }
            }
        };
    }
    setOutsideRatioMargin(top, right, bottom, left) {
        this.outsideRatioMargin = {
            top: top,
            right: right,
            bottom: bottom,
            left: left,
        };
        this.ilayout_UpdateBounds = true;
        return this;
    }
    setOutsidePixelMargin(top, right, bottom, left) {
        this.outsidePixelMargin = {
            top: top,
            right: right,
            bottom: bottom,
            left: left,
        };
        this.ilayout_UpdateBounds = true;
        return this;
    }
    ctrl(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ctrlInner(this.getMarginedBounds(bounds));
        });
    }
    draw(bounds) {
        this.drawInner(this.getMarginedBounds(bounds));
    }
    getMarginedBounds(bounds) {
        if (!this.ilayout_UpdateBounds) {
            if (bounds.equals(this.ilayout_boundsBak)) {
                return this.ilayout_marginedBounds;
            }
        }
        this.ilayout_UpdateBounds = false;
        this.ilayout_boundsBak = bounds;
        if (this.outsidePixelMargin !== undefined) {
            const left = this.outsidePixelMargin.left / Graphics.pixelW;
            const top = this.outsidePixelMargin.top / Graphics.pixelH;
            const right = this.outsidePixelMargin.right / Graphics.pixelW;
            const bottom = this.outsidePixelMargin.bottom / Graphics.pixelH;
            return this.ilayout_marginedBounds = new Rect(bounds.x + left, bounds.y + top, bounds.w - (left + right), bounds.h - (top + bottom));
        }
        return this.ilayout_marginedBounds = new Rect(bounds.x + this.outsideRatioMargin.left, bounds.y + this.outsideRatioMargin.top, bounds.w - (this.outsideRatioMargin.left + this.outsideRatioMargin.right), bounds.h - (this.outsideRatioMargin.top + this.outsideRatioMargin.bottom));
    }
}
export class Layout extends ILayout {
    constructor() {
        super();
        this.layouts = [];
    }
    clear() {
        this.layouts = [];
    }
    add(l) {
        this.layouts.push(l);
        return this;
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let l of this.layouts) {
                yield l.ctrl(bounds);
            }
        });
    }
    drawInner(bounds) {
        for (let l of this.layouts) {
            l.draw(bounds);
        }
    }
}
export class RatioLayout extends ILayout {
    constructor() {
        super();
        this.layouts = [];
        this.layoutBounds = [];
    }
    clear() {
        this.layouts = [];
        this.layoutBounds = [];
    }
    add(bounds, l) {
        this.layoutBounds.push(bounds);
        this.layouts.push(l);
        return this;
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.layouts.length; i++) {
                let rect = this.toChildBounds(bounds, this.layoutBounds[i]);
                yield this.layouts[i].ctrl(rect);
            }
        });
    }
    drawInner(bounds) {
        for (let i = 0; i < this.layouts.length; i++) {
            let rect = this.toChildBounds(bounds, this.layoutBounds[i]);
            this.layouts[i].draw(rect);
        }
    }
    toChildBounds(original, child) {
        return new Rect(original.x + child.x * original.w, original.y + child.y * original.h, original.w * child.w, original.h * child.h);
    }
}
export class Label extends ILayout {
    constructor(font, createStr, createColor) {
        super();
        this.strBak = "";
        this.font = font;
        this.createStr = createStr;
        this.createColor = createColor != null ? createColor : () => Color.WHITE;
        this.base = Font.LEFT;
        this.strSize = Size.ZERO;
    }
    setBase(base) {
        this.base = base;
        return this;
    }
    setColor(color) {
        if (typeof color === "function") {
            this.createColor = color;
        }
        else {
            this.createColor = () => color;
        }
        return this;
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    drawInner(bounds) {
        switch (this.base) {
            case Font.UPPER_LEFT:
                this.font.draw(this.createStr(), bounds.upperLeft, this.createColor());
                break;
            case Font.TOP:
                this.font.draw(this.createStr(), bounds.top, this.createColor(), this.base);
                break;
            case Font.UPPER_RIGHT:
                this.font.draw(this.createStr(), bounds.upperRight, this.createColor(), this.base);
                break;
            case Font.LEFT:
                this.font.draw(this.createStr(), bounds.left, this.createColor(), this.base);
                break;
            case Font.CENTER:
                this.font.draw(this.createStr(), bounds.center, this.createColor(), this.base);
                break;
            case Font.RIGHT:
                this.font.draw(this.createStr(), bounds.right, this.createColor(), this.base);
                break;
            case Font.LOWER_LEFT:
                this.font.draw(this.createStr(), bounds.lowerLeft, this.createColor(), this.base);
                break;
            case Font.BOTTOM:
                this.font.draw(this.createStr(), bounds.bottom, this.createColor(), this.base);
                break;
            case Font.LOWER_RIGHT:
                this.font.draw(this.createStr(), bounds.lowerRight, this.createColor(), this.base);
                break;
        }
    }
}
export class Labels extends ILayout {
    constructor(font) {
        super();
        this.font = font;
        this.elms = [];
    }
    add(str, color = () => Color.WHITE, base = Font.UPPER_LEFT) {
        this.elms.push({
            ctrl: bounds => {
            },
            draw: bounds => {
                this.font.draw(str(), bounds, color(), base);
            },
            h: () => this.font.ratioH,
        });
        return this;
    }
    addArray(sets) {
        let height = 0;
        this.elms.push({
            ctrl: bounds => {
            },
            draw: bounds => {
                height = 0;
                let p = { x: bounds.x, y: bounds.y };
                for (const set of sets()) {
                    if (set[1] !== undefined) {
                        this.font.draw(set[0], p, set[1]);
                    }
                    else {
                        this.font.draw(set[0], p, Color.WHITE);
                    }
                    p.y += this.font.ratioH;
                    height += this.font.ratioH;
                }
            },
            h: () => height,
        });
        return this;
    }
    addln(str, color = () => Color.WHITE) {
        let strings = [];
        let boundsBak;
        let strBak;
        this.elms.push({
            ctrl: bounds => {
            },
            draw: bounds => {
                let s = str();
                if (boundsBak !== bounds || strBak !== s) {
                    boundsBak = bounds;
                    strBak = s;
                    strings = this.font.split(s, bounds.w);
                }
                let p = { x: bounds.x, y: bounds.y };
                let col = color();
                let fontH = this.font.ratioH;
                for (const _str of strings) {
                    this.font.draw(_str, p, col);
                    p.y += fontH;
                }
            },
            h: () => this.font.ratioH * strings.length,
        });
        return this;
    }
    addLayout(l, ratioH) {
        this.elms.push({
            ctrl: bounds => {
                l.ctrl(bounds);
            },
            draw: bounds => {
                l.draw(bounds);
            },
            h: () => ratioH(),
        });
        return this;
    }
    br() {
        this.elms.push({
            ctrl: bounds => { },
            draw: bounds => { },
            h: () => this.font.ratioH,
        });
        return this;
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const e of this.elms) {
                e.ctrl(bounds);
            }
        });
    }
    drawInner(bounds) {
        let y = bounds.y;
        for (const e of this.elms) {
            e.draw(new Rect(bounds.x, y, bounds.w, e.h()));
            y += e.h();
        }
    }
}
export class VariableLayout extends ILayout {
    constructor(getLayout) {
        super();
        this.getLayout = getLayout;
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getLayout().ctrl(bounds);
        });
    }
    drawInner(bounds) {
        this.getLayout().draw(bounds);
    }
}
export class XLayout extends ILayout {
    constructor() {
        super();
        this.layouts = [];
        this.childrenBounds = [];
        this.margin = 0;
    }
    /*margin:ratio*/
    static createBounds(origin, length, margin) {
        let childrenBounds = [];
        let totalW = origin.w - margin * (length - 1);
        let x = origin.x;
        let w = totalW / length;
        for (let i = 0; i < length; i++) {
            childrenBounds.push(new Rect(x, origin.y, w, origin.h));
            x += w + margin;
        }
        return childrenBounds;
    }
    clear() {
        this.layouts = [];
        this.childrenBounds = [];
    }
    add(l) {
        this.layouts.push(l);
        this.update = true;
        return this;
    }
    setRatioMargin(value) {
        this.margin = value;
        this.update = true;
        return this;
    }
    setPixelMargin(value) {
        return this.setRatioMargin(value / Graphics.pixelW);
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateXBounds(bounds);
            for (let i = 0; i < this.layouts.length; i++) {
                yield this.layouts[i].ctrl(this.childrenBounds[i]);
            }
        });
    }
    drawInner(bounds) {
        this.updateXBounds(bounds);
        for (let i = 0; i < this.layouts.length; i++) {
            this.layouts[i].draw(this.childrenBounds[i]);
        }
    }
    updateXBounds(parent) {
        if (this.layouts.length === 0) {
            return;
        }
        if (this.xBoundsBak != parent) {
            this.xBoundsBak = parent;
            this.update = true;
        }
        if (!this.update) {
            return;
        }
        this.update = false;
        this.childrenBounds = [];
        let totalW = parent.w - this.margin * (this.layouts.length - 1);
        let x = parent.x;
        let w = totalW / this.layouts.length;
        for (let i = 0; i < this.layouts.length; i++) {
            this.childrenBounds.push(new Rect(x, parent.y, w, parent.h));
            x += w + this.margin;
        }
    }
}
export class YLayout extends ILayout {
    constructor() {
        super();
        this.layouts = [];
        this.childrenBounds = [];
        this.margin = 0;
    }
    /*margin:ratio*/
    static createBounds(origin, length, margin) {
        let childrenBounds = [];
        let totalH = origin.h - margin * (length - 1);
        let y = origin.y;
        let h = totalH / length;
        for (let i = 0; i < length; i++) {
            childrenBounds.push(new Rect(origin.x, y, origin.w, h));
            y += h + margin;
        }
        return childrenBounds;
    }
    clear() {
        this.layouts = [];
        this.childrenBounds = [];
    }
    add(l) {
        this.layouts.push(l);
        this.update = true;
        return this;
    }
    setRatioMargin(value) {
        this.margin = value;
        this.update = true;
        return this;
    }
    setPixelMargin(value) {
        return this.setRatioMargin(value / Graphics.pixelH);
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateYBounds(bounds);
            for (let i = 0; i < this.layouts.length; i++) {
                yield this.layouts[i].ctrl(this.childrenBounds[i]);
            }
        });
    }
    drawInner(bounds) {
        this.updateYBounds(bounds);
        for (let i = 0; i < this.layouts.length; i++) {
            this.layouts[i].draw(this.childrenBounds[i]);
        }
    }
    updateYBounds(parent) {
        if (this.layouts.length === 0) {
            return;
        }
        if (this.yBoundsBak != parent) {
            this.yBoundsBak = parent;
            this.update = true;
        }
        if (!this.update) {
            return;
        }
        this.update = false;
        this.childrenBounds = YLayout.createBounds(parent, this.layouts.length, this.margin);
        // this.childrenBounds = [];
        // let totalH = parent.h - this.margin * (this.layouts.length - 1);
        // let y = parent.y;
        // let h = totalH / this.layouts.length;
        // for(let i = 0; i < this.layouts.length; i++){
        //     this.childrenBounds.push(new Rect(parent.x, y, parent.w, h));
        //     y += h + this.margin;
        // }
    }
}
export class FlowLayout extends ILayout {
    constructor(w, h, variableH = false) {
        super();
        this.variableH = variableH;
        this.layouts = [];
        this.index = 0;
        this.updateBounds = true;
        this.childrenBoundsBak = [];
        this.xMargin = 0;
        this.yMargin = 0;
        this.boundsBak = Rect.FULL;
        this.changeSize(w, h);
    }
    clear() {
        for (let i = 0; i < this.layouts.length; i++) {
            this.layouts[i] = ILayout.empty;
        }
        this.index = 0;
        this.indexFromLast = this.layouts.length - 1;
        this.updateBounds = true;
    }
    changeSize(w, h) {
        this.w = w;
        this.h = h;
        this.layouts = [];
        for (let i = 0; i < w * h; i++) {
            this.layouts.push(ILayout.empty);
        }
        this.indexFromLast = this.layouts.length - 1;
        this.updateBounds = true;
    }
    set(index, l) {
        for (let i = this.layouts.length; i < index + 1; i++) {
            this.layouts.push(ILayout.empty);
        }
        this.layouts[index] = l;
        return this;
    }
    setLast(l) {
        this.layouts[this.layouts.length - 1] = l;
        return this;
    }
    add(l) {
        if (this.index < this.layouts.length) {
            this.layouts[this.index] = l;
            this.index++;
        }
        else {
            this.layouts.push(l);
            this.index++;
            this.updateBounds = true;
        }
        return this;
    }
    addFromLast(l) {
        if (this.indexFromLast >= 0) {
            this.layouts[this.indexFromLast] = l;
            this.indexFromLast--;
        }
        return this;
    }
    /**ratio */
    setRatioMargin(xMargin, yMargin) {
        this.xMargin = xMargin;
        this.yMargin = yMargin;
        this.updateBounds = true;
        return this;
    }
    get length() { return this.layouts.length; }
    get indexNow() { return this.index; }
    ctrlInner(origin) {
        return __awaiter(this, void 0, void 0, function* () {
            let bounds = this.getBounds(origin);
            for (let i = 0; i < this.layouts.length; i++) {
                yield this.layouts[i].ctrl(bounds[i]);
            }
        });
    }
    drawInner(origin) {
        let bounds = this.getBounds(origin);
        for (let i = 0; i < this.layouts.length; i++) {
            this.layouts[i].draw(bounds[i]);
        }
    }
    getBounds(origin) {
        if (!this.updateBounds) {
            if (!this.boundsBak.equals(origin)) {
                this.updateBounds = true;
            }
            if (!this.updateBounds) {
                return this.childrenBoundsBak;
            }
        }
        this.updateBounds = false;
        this.childrenBoundsBak = [];
        let yRects = YLayout.createBounds(origin, this.h, /*margin*/ this.yMargin);
        for (let y of yRects) {
            let xRects = XLayout.createBounds(y, this.w, /*margin*/ this.xMargin);
            for (let x of xRects) {
                this.childrenBoundsBak.push(x);
            }
        }
        return this.childrenBoundsBak;
    }
}
export class InnerLayout extends ILayout {
    constructor() {
        super();
        this.layouts = [];
    }
    clear() {
        this.layouts = [];
    }
    add(l) {
        this.layouts.push(l);
        return this;
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let l of this.layouts) {
                yield l.ctrl(bounds);
            }
        });
    }
    drawInner(bounds) {
        for (let l of this.layouts) {
            l.draw(bounds);
        }
    }
}
