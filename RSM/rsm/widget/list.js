var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Rect, Color, Point } from "../undym/type.js";
import { ILayout, YLayout, RatioLayout, Label } from "../undym/layout.js";
import { Input } from "../undym/input.js";
import { Graphics, Font } from "../graphics/graphics.js";
export class List extends ILayout {
    constructor(aPageElmNum = 12) {
        super();
        this.LEFT = 0;
        this.CENTER = 1;
        this.RIGHT = 2;
        this.elms = [];
        this.panels = [];
        this.elmPanels = [];
        this.page = 0;
        this.update = true;
        this.hold = false;
        this.holdPoint = Point.ZERO;
        this.slide = { x: 0, y: 0 };
        this.aPageElmNum = aPageElmNum | 0;
        for (let i = 0; i < 3; i++) {
            const yLayout = new YLayout();
            this.elmPanels.push(yLayout);
            this.panels.push(new RatioLayout()
                .add(new Rect(0, 0, 1, 0.95), yLayout));
        }
        this.pageLayout = new RatioLayout()
            .add(new Rect(0, 0.95, 1, 0.05), new Label(Font.def, () => `${this.page}/${this.pageLim}`).setBase(Font.CENTER));
    }
    clear(keepPage = false) {
        this.elms = [];
        this.update = true;
        if (!keepPage) {
            this.page = 0;
        }
    }
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
            const contains = bounds.contains(Input.point);
            if (Input.holding === 0 && this.hold) {
                this.hold = false;
                if (this.slide.x >= bounds.w * 0.4) {
                    const pageBak = this.page;
                    this.movePage(-1);
                    if (pageBak !== this.page) {
                        this.slide.x -= bounds.w;
                    }
                }
                else if (this.slide.x <= -bounds.w * 0.4) {
                    const pageBak = this.page;
                    this.movePage(1);
                    if (pageBak !== this.page) {
                        this.slide.x += bounds.w;
                    }
                }
            }
            if (Input.holding === 1 && contains) {
                this.hold = true;
                this.holdPoint = Input.point;
            }
            if (this.hold) {
                this.slide.x = Input.x - this.holdPoint.x;
            }
            else {
                this.slide.x *= 0.50;
                this.slide.y *= 0.50;
            }
            if (this.update) {
                this.update = false;
                let _page = this.page - 1;
                for (const e of this.elmPanels) {
                    e.clear();
                    if (_page >= 0) {
                        for (let i = _page * this.aPageElmNum; i < (_page + 1) * this.aPageElmNum; i++) {
                            if (i < this.elms.length) {
                                e.add(this.elms[i]);
                            }
                            else {
                                e.add(ILayout.empty);
                            }
                        }
                    }
                    _page++;
                }
            }
            yield this.panels[this.CENTER].ctrl(bounds);
        });
    }
    drawInner(bounds) {
        Graphics.clip(bounds, () => {
            let x = bounds.x - bounds.w + this.slide.x;
            let y = bounds.y + this.slide.y;
            for (const p of this.panels) {
                const r = new Rect(x, y, bounds.w, bounds.h);
                p.draw(r);
                x += bounds.w;
            }
        });
        this.pageLayout.draw(bounds);
    }
    get pageLim() {
        let res = ((this.elms.length - 1) / this.aPageElmNum) | 0;
        return res >= 0 ? res : 0;
    }
    movePage(value) {
        this.page += value;
        this.update = true;
        if (this.page < 0) {
            this.page = 0;
        }
        let lim = this.pageLim;
        if (this.page > lim) {
            this.page = lim;
        }
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
            if (Input.holding > 4) {
                this.hold(this);
            }
            if (Input.click && bounds.contains(Input.point)) {
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
// export class List extends ILayout{
//     private elms:ILayout[] = [];
//     private aPageElmNum:number;
//     private panel:RatioLayout;
//     private elmPanel:YLayout;
//     private page = 0;
//     private update:boolean = true;
//     constructor(aPageElmNum:number = 12){
//         super();
//         this.aPageElmNum = aPageElmNum|0;
//         this.elmPanel = new YLayout();
//         this.panel = new RatioLayout()
//                         .add(new Rect(0, 0, 1, 0.85 - 2 / Graphics.pixelH), this.elmPanel)
//                         .add(new Rect(0, 0.85, 1, 0.15), new XLayout()
//                             .add(new Btn(()=>"＜", ()=>{
//                                 this.page--;
//                                 if(this.page < 0){this.page = 0;}
//                                 this.update = true;
//                             }))
//                             .add(new Btn(()=>"＞", ()=>{
//                                 this.page++;
//                                 let lim = ((this.elms.length - 1) / this.aPageElmNum)|0;
//                                 if(lim < 0){lim = 0;}
//                                 if(this.page > lim){this.page = lim;}
//                                 this.update = true;
//                             }))
//                         )
//                         ;
//     }
//     clear(keepPage = false){
//         this.elms = [];
//         this.update = true;
//         if(!keepPage){
//             this.page = 0;
//         }
//     }
//     // add(left:()=>string, right:()=>string, push:()=>void, hold?:()=>void){
//     //     if(hold === undefined){hold = ()=>{};}
//     //     let e = new Elm(left, right, push, hold);
//     //     this.elms.push(e);
//     //     this.update = true;
//     // }
//     add(args:{
//         push?:(elm:Elm)=>void,
//         hold?:(elm:Elm)=>void,
//         left?:()=>string,
//         leftColor?:()=>Color,
//         right?:()=>string,
//         rightColor?:()=>Color,
//         center?:()=>string,
//         centerColor?:()=>Color,
//         groundColor?:()=>Color,
//         frameColor?:()=>Color,
//         stringColor?:()=>Color,
//     }):Elm{
//         const e = new Elm(args);
//         this.elms.push(e);
//         this.update = true;
//         return e;
//     }
//     addLayout(l:ILayout){
//         this.elms.push(l);
//         this.update = true;
//     }
//     async ctrlInner(bounds:Rect){
//         if(this.update){
//             this.update = false;
//             this.elmPanel.clear();
//             for(let i = this.page * this.aPageElmNum; i < (this.page+1) * this.aPageElmNum; i++){
//                 if(i < this.elms.length){
//                     this.elmPanel.add( this.elms[i] );
//                 }else{
//                     this.elmPanel.add( ILayout.empty );
//                 }
//             }
//         }
//         await this.panel.ctrl(bounds);
//     }
//     drawInner(bounds:Rect){
//         this.panel.draw(bounds);
//     }
// }
// class Elm extends ILayout{
//     left:(()=>string) | undefined;
//     leftColor:()=>Color;
//     center:(()=>string) | undefined;
//     centerColor:()=>Color;
//     right:(()=>string) | undefined;
//     rightColor:()=>Color;
//     push:(elm:Elm)=>void;
//     hold:(elm:Elm)=>void;
//     font:Font;
//     groundColor:()=>Color;
//     frameColor:()=>Color;
//     stringColor:()=>Color;
//     constructor(args:{
//         push?:(elm:Elm)=>void,
//         hold?:(elm:Elm)=>void,
//         left?:()=>string,
//         leftColor?:()=>Color,
//         center?:()=>string,
//         centerColor?:()=>Color,
//         right?:()=>string,
//         rightColor?:()=>Color,
//         groundColor?:()=>Color,
//         frameColor?:()=>Color,
//         stringColor?:()=>Color,
//     }){
//         super();
//         this.push = args.push ? args.push : (elm)=>{};
//         this.hold = args.hold ? args.hold : (elm)=>{};
//         this.left = args.left;
//         this.leftColor = args.leftColor ? args.leftColor : ()=>Color.WHITE;
//         this.center = args.center;
//         this.centerColor = args.centerColor ? args.centerColor : ()=>Color.WHITE;
//         this.right = args.right;
//         this.rightColor = args.rightColor ? args.rightColor : ()=>Color.WHITE;
//         this.groundColor = args.groundColor ? args.groundColor : ()=>Color.BLACK;
//         this.frameColor  = args.frameColor ? args.frameColor : ()=>Color.L_GRAY;
//         this.stringColor = args.stringColor ? args.stringColor : ()=>Color.WHITE;
//         this.font = Font.def;
//     }
//     async ctrlInner(bounds:Rect){
//         if(Input.holding > 4){
//             this.hold(this);
//         }
//         if(Input.pushed && bounds.contains( Input.point )){
//             this.push(this);
//         }
//     }
//     drawInner(bounds:Rect){
//         Graphics.fillRect(bounds, this.groundColor());
//         Graphics.drawRect(bounds, this.frameColor());
//         if(this.left !== undefined){
//             const color = this.leftColor ? this.leftColor() : Color.WHITE;
//             this.font.draw( this.left(), bounds.left, color, Font.LEFT );
//         }
//         if(this.right !== undefined){
//             const color = this.rightColor ? this.rightColor() : Color.WHITE;
//             this.font.draw( this.right(), bounds.right, color, Font.RIGHT );
//         }
//         if(this.center !== undefined){
//             const color = this.centerColor ? this.centerColor() : Color.WHITE;
//             this.font.draw( this.center(), bounds.center, color, Font.CENTER );
//         }
//     }
// }
