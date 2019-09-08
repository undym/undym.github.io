import { ILayout, Label } from "../undym/layout.js";
import { Rect, Color } from "../undym/type.js";
import { Input } from "../undym/input.js";
import { Font, Graphics } from "../graphics/graphics.js";


export class Btn extends ILayout{

    private name:()=>string;
    private push:()=>void;
    private font:Font;
    private cursorON:boolean = false;
    groundColor:()=>Color;
    frameColor:()=>Color;
    stringColor:()=>Color;
    count:number = 0;
    noMove = false;
    boundsContainsHold = false;

    constructor(name:()=>string, push:()=>void);
    constructor(name:string, push:()=>void);
    constructor(name:any, push:()=>void){
        super();

        if(typeof name === "string"){
            this.name = ()=>name;
        }else if(typeof name === "function"){
            this.name = name;
        }


        this.push = push;

        this.font = Font.def;

        this.groundColor = ()=>Color.BLACK;
        this.frameColor  = ()=>Color.L_GRAY;
        this.stringColor = ()=>Color.WHITE;

        this.groundColor = ()=>new Color(0.8, 0.8, 0.8);
        this.frameColor  = ()=>new Color(0.5, 0.5, 0.5);
        this.stringColor = ()=>Color.BLACK;
        
    }
    

    dontMove():Btn{
        this.noMove = true;
        return this;
    }

    async ctrlInner(bounds:Rect){
        let contains = bounds.contains( Input.point );
        this.cursorON = contains && Input.holding > 0 && this.boundsContainsHold;
        
        if(contains){
            if(Input.holding === 1){
                this.boundsContainsHold = true;
            }

            if(Input.holding === 0 && this.boundsContainsHold){
                await this.push();
            }
        }

        if(Input.holding === 0){
            this.boundsContainsHold = false;
        }
    }

    drawInner(bounds:Rect){
        const moveLim = bounds.w / 2;
        let move = moveLim - moveLim * this.count / (this.count + 1);
        if(this.noMove){move = 0;}
        
        let rect = new Rect(bounds.x - move, bounds.y, bounds.w, bounds.h);
        Graphics.fillRect(rect, this.cursorON ? this.groundColor().darker() : this.groundColor());
        Graphics.drawRect(rect, this.frameColor());
        this.font.draw( this.name(), rect.center, this.stringColor(), Font.CENTER);

        this.count += 4;
    }
    
}