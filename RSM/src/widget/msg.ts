
import {ILayout, Label} from "../undym/layout.js";
import { Color, Rect, Point } from "../undym/type.js";
import { Scene } from "../undym/scene.js";
import { randomInt } from "../undym/random.js";
import { Font, Graphics } from "../graphics/graphics.js";


const GET_WHITE = (cnt:number)=>Color.WHITE;

export default class Msg extends ILayout{
    private lines:Line[] = [];
    private wLim:number = 1;
    private font:Font;
    private reserves:Reserve[] = [];

    constructor(){
        super();

        for(let i = 0; i < 30; i++){
            this.lines.push(new Line());
        }

        this.font = Font.getDef();
    }

    set(name:string, color?:Color):void;
    set(name:string, createColor?:(cnt:number)=>Color):void;
    set(name:string, color?:any):void{
        let r = new Reserve();
        r.name = name;
        r.br = true;
             if(typeof color === "object")  {r.createColor = ()=>color;}
        else if(typeof color === "function"){r.createColor = color;}
        else                                {r.createColor = GET_WHITE;}

        this.reserves.push(r);
    }

    add(name:string, color?:Color):void;
    add(name:string, createColor?:(cnt:number)=>Color):void;
    add(name:string, color?:any):void{
        let r = new Reserve();
        r.name = name;
        r.br = false;
             if(typeof color === "object")  {r.createColor = ()=>color;}
        else if(typeof color === "function"){r.createColor = color;}
        else                                {r.createColor = GET_WHITE;}

        this.reserves.push(r);
    }

    private setInner(r:Reserve){
        let l = this.lines[ this.lines.length - 1 ];
        this.lines.unshift(l);
        this.lines.length -= 1;

        l.elms = [];

        this.addInner(r);
    }

    private addInner(r:Reserve){
        let l = this.lines[0];
        let allowedW = this.wLim - l.totalW;
        
        for(let i = 0; i < r.name.length; i++){
            let s = r.name.substring(0, r.name.length - i);
            let sw = this.font.measureRatioW(s);
            if(sw <= allowedW){
                let e = new Elm();
                e.label = new Label( this.font, ()=>s );
                e.test_name = s;
                e.createColor = r.createColor;
                e.w = sw;
                this.lines[0].elms.push(e);

                if(i !== 0){
                    this.set( r.name.substring(r.name.length - i, r.name.length), r.createColor );
                }
                break;
            }
        }
    }

    async ctrlInner(bounds:Rect){

    }

    drawInner(bounds:Rect){
        this.wLim = bounds.w;

        for(let r of this.reserves){
            if(r.br){this.setInner(r);}
            else    {this.addInner(r);}
        }
        this.reserves = [];


        let fontRatioH = this.font.ratioH;

        let y = bounds.yh - fontRatioH;
        for(let i = 0; i < this.lines.length; i++){
            let l = this.lines[i];
            let x = bounds.cx - l.totalW / 2;
            let beforeColor:Color = Color.WHITE;
            for(let e of l.elms){
                beforeColor = e.createColor( Date.now() / 30 + 10 * i );
                this.font.draw( e.test_name, {x:x, y:y}, beforeColor );

                x += e.w;
            }

            if(i === 0 && Scene.isWaiting()){
                let dot = "";
                const dotNum = Date.now() / 80 % 5;
                for(let i = 0; i < dotNum; i++){
                    dot += ".";
                }
                this.font.draw( dot, {x:x, y:y}, beforeColor );
            }

            y -= fontRatioH;
            if(y < bounds.y){break;}
        }


    }

}
class Line{
    elms:Elm[] = [];
    /**ratio */
    get totalW():number{
        let res = 0;
        for(let e of this.elms){
            res += e.w;
        }
        return res;
    }
}

class Elm{
    label:Label;
    test_name:string;
    // name:string;
    createColor:(cnt:number)=>Color;
    /**ratio */
    w:number;
}

class Reserve{
    name:string;
    createColor:(cnt:number)=>Color;
    br:boolean;
}