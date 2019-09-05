import { Rect, Color, Size, Point } from "./type.js";
import { Graphics, Font } from "../graphics/graphics.js";


export abstract class ILayout{
    private static _empty:ILayout;
    static get empty(){
        if(this._empty === undefined){
            this._empty = new class extends ILayout{
                ctrlInner(bounds:Rect){};
                drawInner(bounds:Rect){};
            }
        }
        return this._empty;
    }

    static create(args:{
        ctrl?:(bounds:Rect)=>void,
        draw?:(bounds:Rect)=>void,
    }):ILayout
    {
        return new class extends ILayout{
            async ctrlInner(bounds:Rect){
                if(args.ctrl){await args.ctrl(bounds);}
            }
            drawInner(bounds:Rect){
                if(args.draw){args.draw(bounds);}
            }
        }
    }


    private outsideRatioMargin = {top:0 ,right:0, bottom:0, left:0};
    private outsidePixelMargin:{top:number, right:number, bottom:number, left:number};
    private ilayout_marginedBounds:Rect;
    private ilayout_boundsBak:Rect;
    private ilayout_UpdateBounds:boolean = true;

    constructor(){
        this.ilayout_marginedBounds = Rect.FULL;
        this.ilayout_boundsBak = Rect.FULL;
    }

    
    abstract ctrlInner(bounds:{x:number, y:number, w:number, h:number}):void;
    abstract drawInner(bounds:{x:number, y:number, w:number, h:number}):void;


    setOutsideRatioMargin(top:number, right:number, bottom:number, left:number):this{
        this.outsideRatioMargin = {
            top:top,
            right:right,
            bottom:bottom,
            left:left,
        };

        this.ilayout_UpdateBounds = true;
        return this;
    }

    setOutsidePixelMargin(top:number, right:number, bottom:number, left:number):this{
        this.outsidePixelMargin = {
            top:top,
            right:right,
            bottom:bottom,
            left:left,
        };
        
        this.ilayout_UpdateBounds = true;
        return this;
    }

    async ctrl(bounds:Rect){
        await this.ctrlInner( this.getMarginedBounds(bounds) );
    }

    draw(bounds:Rect):void{
        this.drawInner( this.getMarginedBounds(bounds) );
    }


    private getMarginedBounds(bounds:Rect):Rect{
        if(!this.ilayout_UpdateBounds){
            if(bounds.equals(this.ilayout_boundsBak)){return this.ilayout_marginedBounds;}
        }
        
        this.ilayout_UpdateBounds = false;
        this.ilayout_boundsBak = bounds;

        if(this.outsidePixelMargin !== undefined){
            const left   = this.outsidePixelMargin.left / Graphics.pixelW;
            const top    = this.outsidePixelMargin.top / Graphics.pixelH;
            const right  = this.outsidePixelMargin.right / Graphics.pixelW;
            const bottom = this.outsidePixelMargin.bottom / Graphics.pixelH;
            return this.ilayout_marginedBounds = new Rect(
                bounds.x + left
               ,bounds.y + top
               ,bounds.w - (left + right)
               ,bounds.h - (top + bottom)
           );
        }
        
        return this.ilayout_marginedBounds = new Rect(
             bounds.x + this.outsideRatioMargin.left
            ,bounds.y + this.outsideRatioMargin.top
            ,bounds.w - (this.outsideRatioMargin.left + this.outsideRatioMargin.right)
            ,bounds.h - (this.outsideRatioMargin.top + this.outsideRatioMargin.bottom)
        );
    }
}


export class Layout extends ILayout{
    private layouts:ILayout[] = [];

    constructor(){
        super();
    }

    clear(){
        this.layouts = [];
    }

    add(l:ILayout):Layout{
        this.layouts.push(l);
        return this;
    }

    async ctrlInner(bounds:Rect){
        for(let l of this.layouts){
            await l.ctrl(bounds);
        }
    }

    drawInner(bounds:Rect){
        for(let l of this.layouts){
            l.draw(bounds);
        }
    }
}


export class RatioLayout extends ILayout{

    private layouts:ILayout[] = [];
    private layoutBounds:Rect[] = [];

    constructor(){
        super();
    }

    clear(){
        this.layouts = [];
        this.layoutBounds = [];
    }

    add(bounds:Rect, l:ILayout):this{
        this.layoutBounds.push( bounds );
        this.layouts.push( l );
        return this;
    }

    async ctrlInner(bounds:Rect){
        for(let i = 0; i < this.layouts.length; i++){
            let rect = this.toChildBounds( bounds, this.layoutBounds[i] );
            await this.layouts[i].ctrl( rect );
        }
    }

    drawInner(bounds:Rect){
        for(let i = 0; i < this.layouts.length; i++){
            let rect = this.toChildBounds( bounds, this.layoutBounds[i] );
            this.layouts[i].draw( rect );
        }
    }

    private toChildBounds(original:Rect, child:Rect){
        return new Rect(
             original.x + child.x * original.w
            ,original.y + child.y * original.h
            ,original.w * child.w
            ,original.h * child.h
        );
    }
}


export class Label extends ILayout{
    private font:Font;
    private createStr:()=>string;
    private createColor:()=>Color;
    private base:string;
    private strBak:string = "";
    private strSize:Size;

    constructor(font:Font, createStr:()=>string, createColor?:()=>Color){
        super();
        this.font = font;
        this.createStr = createStr;
        this.createColor = createColor != null ? createColor : ()=>Color.WHITE;

        this.base = Font.LEFT;

        this.strSize = Size.ZERO;
    }

    setBase(base:string): this{
        this.base = base;
        return this;
    }

    setColor(color:()=>Color):this;
    setColor(color:Color):this;
    setColor(a:any): this{
        if(typeof a === "function"){
            this.createColor = a;
        }else{
            this.createColor = ()=>a;
        }
        return this;
    }

    async ctrlInner(bounds:Rect){

    }

    drawInner(bounds:Rect){
        // this.update();
        switch(this.base){
            case Font.UPPER_LEFT : this.font.draw( this.createStr(), bounds.upperLeft,  this.createColor() ); break;
            case Font.TOP        : this.font.draw( this.createStr(), bounds.top,        this.createColor(), this.base ); break;
            case Font.UPPER_RIGHT: this.font.draw( this.createStr(), bounds.upperRight, this.createColor(), this.base ); break;
            case Font.LEFT       : this.font.draw( this.createStr(), bounds.left,       this.createColor(), this.base ); break;
            case Font.CENTER     : this.font.draw( this.createStr(), bounds.center,     this.createColor(), this.base ); break;
            case Font.RIGHT      : this.font.draw( this.createStr(), bounds.right,      this.createColor(), this.base ); break;
            case Font.LOWER_LEFT : this.font.draw( this.createStr(), bounds.lowerLeft,  this.createColor(), this.base ); break;
            case Font.BOTTOM     : this.font.draw( this.createStr(), bounds.bottom,     this.createColor(), this.base ); break;
            case Font.LOWER_RIGHT: this.font.draw( this.createStr(), bounds.lowerRight, this.createColor(), this.base ); break;
        }
    }

    // private update(){
    //     const str = this.createStr();
    //     if(this.strBak === str){return;}
    //     this.strBak = str;
        
    //     this.strSize = this.font.measureRatioSize([str]);
    // }
    // /**ratio. */
    // get ratioW():number{
    //     return this.strSize.w;
    // }
    // /**ratio. */
    // get ratioH():number{
    //     return this.strSize.h;
    // }

}



export class VariableLayout extends ILayout{
    private getLayout:()=>ILayout;
    
    constructor(getLayout:()=>ILayout){
        super();
        this.getLayout = getLayout;
    }

    async ctrlInner(bounds:Rect){
        await this.getLayout().ctrl(bounds);
    }

    drawInner(bounds:Rect){
        this.getLayout().draw(bounds);
    }

}



export class XLayout extends ILayout{

    /*margin:ratio*/
    static createBounds(origin:Rect, length:number, margin:number):Rect[]{
        let childrenBounds:Rect[] = [];
        let totalW = origin.w - margin * (length - 1);
        let x = origin.x;
        let w = totalW / length;
        for(let i = 0; i < length; i++){
            childrenBounds.push(new Rect(x, origin.y, w, origin.h));

            x += w + margin;
        }
        return childrenBounds;
    }


    private layouts:ILayout[] = [];
    private childrenBounds:Rect[] = [];
    private update:boolean;
    private xBoundsBak:Rect;
    private margin:number = 0;

    constructor(){
        super();
    }

    clear(){
        this.layouts = [];
        this.childrenBounds = [];
    }

    add(l:ILayout):this{
        this.layouts.push(l);
        this.update = true;
        return this;
    }

    setRatioMargin(value:number):this{
        this.margin = value;
        this.update = true;
        return this;
    }

    setPixelMargin(value:number):this{
        return this.setRatioMargin( value / Graphics.pixelW );
    }

    async ctrlInner(bounds:Rect){
        this.updateXBounds(bounds);

        for(let i = 0; i < this.layouts.length; i++){
            await this.layouts[i].ctrl( this.childrenBounds[i] );
        }
    }

    drawInner(bounds:Rect){
        this.updateXBounds(bounds);

        for(let i = 0; i < this.layouts.length; i++){
            this.layouts[i].draw( this.childrenBounds[i] );
        }
    }

    private updateXBounds(parent:Rect):void{
        if(this.layouts.length === 0){return;}
        if(this.xBoundsBak != parent){
            this.xBoundsBak = parent;
            this.update = true;
        }
        if(!this.update){return;}
        this.update = false;

        this.childrenBounds = [];
        let totalW = parent.w - this.margin * (this.layouts.length - 1);
        let x = parent.x;
        let w = totalW / this.layouts.length;
        for(let i = 0; i < this.layouts.length; i++){
            this.childrenBounds.push(new Rect(x, parent.y, w, parent.h));

            x += w + this.margin;
        }
    }
}



export class YLayout extends ILayout{

    /*margin:ratio*/
    static createBounds(origin:Rect, length:number, margin:number):Rect[]{
        let childrenBounds:Rect[] = [];
        let totalH = origin.h - margin * (length - 1);
        let y = origin.y;
        let h = totalH / length;
        for(let i = 0; i < length; i++){
            childrenBounds.push(new Rect(origin.x, y, origin.w, h));
            y += h + margin;
        }
        return childrenBounds;
    }

    private layouts:ILayout[] = [];
    private childrenBounds:Rect[] = [];
    private update:boolean;
    private yBoundsBak:Rect;
    private margin:number = 0;

    constructor(){
        super();
    }

    clear(){
        this.layouts = [];
        this.childrenBounds = [];
    }

    add(l:ILayout):this{
        this.layouts.push(l);
        this.update = true;
        return this;
    }
    
    setRatioMargin(value:number):this{
        this.margin = value;
        this.update = true;
        return this;
    }
    
    setPixelMargin(value:number):this{
        return this.setRatioMargin( value / Graphics.pixelH );
    }


    async ctrlInner(bounds:Rect){
        this.updateYBounds(bounds);

        for(let i = 0; i < this.layouts.length; i++){
            await this.layouts[i].ctrl( this.childrenBounds[i] );
        }
    }

    drawInner(bounds:Rect){
        this.updateYBounds(bounds);

        for(let i = 0; i < this.layouts.length; i++){
            this.layouts[i].draw( this.childrenBounds[i] );
        }
    }

    private updateYBounds(parent:Rect):void{
        if(this.layouts.length === 0){return;}
        if(this.yBoundsBak != parent){
            this.yBoundsBak = parent;
            this.update = true;
        }
        if(!this.update){return;}
        this.update = false;

        this.childrenBounds = YLayout.createBounds( parent, this.layouts.length, this.margin );
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


export class FlowLayout extends ILayout{

    private w:number;
    private h:number;
    private layouts:ILayout[] = [];
    private index:number = 0;
    private indexFromLast:number;
    private updateBounds:boolean = true;
    private boundsBak:Rect;
    private childrenBoundsBak:Rect[] = [];
    private xMargin = 0;
    private yMargin = 0;

    constructor(w:number, h:number, private variableH:boolean = false){
        super();

        this.boundsBak = Rect.FULL;

        this.changeSize(w,h);
    }

    clear(){
        for(let i = 0; i < this.layouts.length; i++){
            this.layouts[i] = ILayout.empty;
        }

        this.index = 0;
        this.indexFromLast = this.layouts.length - 1;
        this.updateBounds = true;
    }

    changeSize(w:number, h:number){
        this.w = w;
        this.h = h;

        this.layouts = [];
        for(let i = 0; i < w * h; i++){
            this.layouts.push( ILayout.empty );
        }

        this.indexFromLast = this.layouts.length - 1;
        this.updateBounds = true;
    }

    set(index:number, l:ILayout):this{
        for(let i = this.layouts.length; i < index + 1; i++){
            this.layouts.push(ILayout.empty);
        }
        this.layouts[index] = l;
        return this;
    }

    setLast(l:ILayout):this{
        this.layouts[this.layouts.length - 1] = l;
        return this;
    }


    add(l:ILayout):this{
        if(this.index < this.layouts.length){
            this.layouts[this.index] = l;
            this.index++;
        }else{
            this.layouts.push(l);
            this.index++;
            this.updateBounds = true;
        }
        return this;
    }

    addFromLast(l:ILayout):this{
        if(this.indexFromLast >= 0){
            this.layouts[this.indexFromLast] = l;
            this.indexFromLast--;
        }
        return this;
    }
    /**ratio */
    setRatioMargin(xMargin:number, yMargin:number):this{
        this.xMargin = xMargin;
        this.yMargin = yMargin;
        this.updateBounds = true;
        return this;
    }

    get length(){return this.layouts.length;}
    get indexNow(){return this.index;}


    async ctrlInner(origin:Rect){
        let bounds:Rect[] = this.getBounds(origin);
        for(let i = 0; i < this.layouts.length; i++){
            await this.layouts[i].ctrl( bounds[i] );
        }
    }

    drawInner(origin:Rect){
        let bounds:Rect[] = this.getBounds(origin);
        for(let i = 0; i < this.layouts.length; i++){
            this.layouts[i].draw( bounds[i] );
        }
    }

    private getBounds(origin:Rect):Rect[]{
        if(!this.updateBounds){
            if(!this.boundsBak.equals(origin)){
                this.updateBounds = true;
            }

            if(!this.updateBounds){return this.childrenBoundsBak;}
        }

        this.updateBounds = false;

        this.childrenBoundsBak = [];
        let yRects:Rect[] = YLayout.createBounds(origin, this.h, /*margin*/this.yMargin);
        for(let y of yRects){
            let xRects:Rect[] = XLayout.createBounds( y, this.w, /*margin*/this.xMargin );
            for(let x of xRects){
                this.childrenBoundsBak.push(x);
            }
        }

        return this.childrenBoundsBak;
    }
}


export class InnerLayout extends ILayout{

    private layouts:ILayout[] = [];

    constructor(){
        super();
    }

    protected clear(){
        this.layouts = [];
    }

    protected add(l:ILayout):this{
        this.layouts.push( l );
        return this;
    }

    async ctrlInner(bounds:Rect){
        for(let l of this.layouts){
            await l.ctrl(bounds);
        }
    }

    drawInner(bounds:Rect){
        for(let l of this.layouts){
            l.draw(bounds);
        }
    }

}