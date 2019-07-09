var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GL } from "../gl/gl.js";
import { Rect, Color, Size } from "./type.js";
import { Font } from "../gl/glstring.js";
export class ILayout {
    // private pushListeneres:((bounds:Rect)=>void)[] = [];
    // clearPushListener(){this.pushListeneres = [];}
    // addPushListener(listener:(bounds:Rect)=>void){this.pushListeneres.push(listener);}
    // private holdListeneres:((bounds:Rect)=>void)[] = [];
    // clearHoldListener(){this.holdListeneres = [];}
    // addHoldListener(listener:(bounds:Rect)=>void){this.holdListeneres.push(listener);}
    constructor() {
        this.outsideMarginTop = 0;
        this.outsideMarginRight = 0;
        this.outsideMarginBottom = 0;
        this.outsideMarginLeft = 0;
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
                delete() { }
            };
        }
        return this._empty;
    }
    static create(_ctrl, _draw) {
        return new class extends ILayout {
            ctrlInner(bounds) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield _ctrl(bounds);
                });
            }
            drawInner(bounds) {
                _draw(bounds);
            }
            delete() { }
        };
    }
    static createCtrl(_ctrl) {
        return new class extends ILayout {
            ctrlInner(bounds) {
                return __awaiter(this, void 0, void 0, function* () { yield _ctrl(bounds); });
            }
            drawInner(bounds) { }
            delete() { }
        };
    }
    static createDraw(_draw) {
        return new class extends ILayout {
            ctrlInner(bounds) {
                return __awaiter(this, void 0, void 0, function* () { });
            }
            drawInner(bounds) { _draw(bounds); }
            delete() { }
        };
    }
    setOutsideMargin(top, right, bottom, left) {
        this.outsideMarginTop = top;
        this.outsideMarginRight = right;
        this.outsideMarginBottom = bottom;
        this.outsideMarginLeft = left;
        this.ilayout_UpdateBounds = true;
        return this;
    }
    setOutsidePixelMargin(top, right, bottom, left) {
        this.outsideMarginTop = top / GL.getCanvas().height;
        this.outsideMarginRight = right / GL.getCanvas().width;
        this.outsideMarginBottom = bottom / GL.getCanvas().height;
        this.outsideMarginLeft = left / GL.getCanvas().width;
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
        return this.ilayout_marginedBounds = new Rect(bounds.x + this.outsideMarginLeft, bounds.y + this.outsideMarginTop, bounds.w - (this.outsideMarginLeft + this.outsideMarginRight), bounds.h - (this.outsideMarginTop + this.outsideMarginBottom));
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
    setColor(a) {
        if (typeof a === "function") {
            this.createColor = a;
        }
        else {
            this.createColor = () => a;
        }
        return this;
    }
    ctrlInner(bounds) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    drawInner(bounds) {
        this.update();
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
    update() {
        const str = this.createStr();
        if (this.strBak === str) {
            return;
        }
        this.strBak = str;
        this.strSize = this.font.measureRatioSize([str]);
    }
    /**ratio. */
    get ratioW() {
        return this.strSize.w;
    }
    /**ratio. */
    get ratioH() {
        return this.strSize.h;
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
    setMargin(value) {
        this.margin = value;
        this.update = true;
        return this;
    }
    setPixelMargin(value) {
        return this.setMargin(value / GL.getCanvas().width);
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
    /*ratio*/
    setMargin(value) {
        this.margin = value;
        this.update = true;
        return this;
    }
    setPixelMargin(value) {
        return this.setMargin(value / GL.getCanvas().height);
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
// export class FlowLayout extends ILayout{
//     private w:number;
//     private h:number;
//     private layouts:ILayout[] = [];
//     private index:number = 0;
//     private updateBounds:boolean = true;
//     private boundsBak:Rect;
//     private childrenBoundsBak:Rect[] = [];
//     private xMargin = 0;
//     private yMargin = 0;
//     constructor(w:number, h:number){
//         super();
//         this.boundsBak = Rect.FULL;
//         this.changeSize(w,h);
//     }
//     clear(){
//         for(let i = 0; i < this.layouts.length; i++){
//             this.layouts[i] = ILayout.empty;
//         }
//         this.index = 0;
//         this.updateBounds = true;
//     }
//     changeSize(w:number, h:number){
//         this.w = w;
//         this.h = h;
//         this.layouts = [];
//         for(let i = 0; i < w * h; i++){
//             this.layouts.push( ILayout.empty );
//         }
//         this.updateBounds = true;
//     }
//     set(index:number, l:ILayout):this{
//         this.layouts[index] = l;
//         return this;
//     }
//     add(l:ILayout):this{
//         if(this.index < this.layouts.length){
//             this.layouts[this.index] = l;
//             this.index++;
//         }
//         return this;
//     }
//     /**ratio */
//     setMargin(xMargin:number, yMargin:number):this{
//         this.xMargin = xMargin;
//         this.yMargin = yMargin;
//         this.updateBounds = true;
//         return this;
//     }
//     get length(){return this.layouts.length;}
//     async ctrlInner(origin:Rect){
//         let bounds:Rect[] = this.getBounds(origin);
//         for(let i = 0; i < bounds.length; i++){
//             this.layouts[i].ctrl( bounds[i] );
//         }
//     }
//     drawInner(origin:Rect){
//         let bounds:Rect[] = this.getBounds(origin);
//         for(let i = 0; i < bounds.length; i++){
//             this.layouts[i].draw( bounds[i] );
//         }
//     }
//     private getBounds(origin:Rect):Rect[]{
//         if(!this.updateBounds){
//             if(!this.boundsBak.equals(origin)){
//                 this.updateBounds = true;
//             }
//             if(!this.updateBounds){return this.childrenBoundsBak;}
//         }
//         this.updateBounds = false;
//         this.childrenBoundsBak = [];
//         let yRects:Rect[] = YLayout.createBounds(origin, this.h, /*margin*/this.yMargin);
//         for(let y of yRects){
//             let xRects:Rect[] = XLayout.createBounds( y, this.w, /*margin*/this.xMargin );
//             for(let x of xRects){
//                 this.childrenBoundsBak.push(x);
//             }
//         }
//         return this.childrenBoundsBak;
//     }
// }
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
