
import {ILayout, Label} from "../undym/layout.js";
import { Color, Rect } from "../undym/type.js";
import { Graphics, Font } from "../graphics/graphics.js";

export default class Gage extends ILayout{

    private leftLabel:Label;
    private rightLabel:Label;

    constructor(
        private now:()=>number,
        private max:()=>number,
        leftStr:()=>string,
        rightStr:()=>string,
        private color:()=>Color,
        private font:Font,
        private pixelH:number = 1,
    ){
        super();
        this.leftLabel = new Label(this.font, leftStr).setBase(Font.UPPER_LEFT);
        this.rightLabel = new Label(this.font, rightStr).setBase(Font.UPPER_RIGHT);
    }

    ctrlInner(bounds:Rect){

    }

    drawInner(bounds:Rect){
        let _max:number = this.max();
        let _now:number = this.now();
        if(_max > 0){
            let ratio:number = _now / _max;
            if(ratio < 0){ratio = 0;}
            if(ratio > 1){ratio = 1;}

            // let h = 0.07 * bounds.h;
            let h = Graphics.dotH * this.pixelH;
            let y = bounds.yh - h;
            Graphics.fillRect(new Rect(bounds.x, y, bounds.w, h), Color.D_GRAY);
            Graphics.fillRect(new Rect(bounds.x, y, bounds.w * ratio, h), this.color());
        }
        
        this.leftLabel.draw(bounds);
        
        this.rightLabel.draw(bounds);
    }

}