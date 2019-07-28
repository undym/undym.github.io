import { Rect, Size, Color, Point } from "../undym/type.js";
import { ILayout } from "../undym/layout.js";
import { Input } from "../undym/input.js";
import { Font, Graphics } from "../graphics/graphics.js";



export class Popup extends ILayout{
    

    private drawHolding:(bounds:Rect)=>void;
    private dir:string;
    private size:Size;
    /**
     * 
     * @param dir "top" || "upperRight" || "right" || "lowerRigh" || "bottom" || "lowerLeft" || "left" || "upperLeft"
     * @param drawHolding 
     */
    constructor(dir:string, size:Size, drawHolding:(bounds:Rect)=>void){
        super();

        this.dir = dir;
        this.drawHolding = drawHolding;

        this.size = size;
    }

    async ctrlInner(bounds:Rect){

    }

    drawInner(bounds:Rect){
        if(Input.holding() > 3 && bounds.contains( Input.point )){
            let r = (()=>{
                let x = 0;
                let y = 0;
                const w = this.size.w;
                const h = this.size.h;
                     if(this.dir === "top")         {x = bounds.cx - w / 2; y = bounds.y - h;}
                else if(this.dir === "upperRight")  {x = bounds.xw;         y = bounds.cy - h;}
                else if(this.dir === "right")       {x = bounds.xw;         y = bounds.cy - h / 2;}
                else if(this.dir === "lowerRight")  {x = bounds.xw;         y = bounds.cy;}
                else if(this.dir === "bottom")      {x = bounds.cx - w / 2; y = bounds.yh;}
                else if(this.dir === "lowerLeft")   {x = bounds.x - w;      y = bounds.cy;}
                else if(this.dir === "left")        {x = bounds.x - w;      y = bounds.cy - h / 2;}
                else if(this.dir === "upperLeft")   {x = bounds.x - w;      y = bounds.cy - h;}

                     if(x < 0)      {x = 0;}
                else if(x + w > 1)  {x = 1 - w;}
                     if(y < 0)      {y = 0;}
                else if(y + h > 1)  {y = 1 - h;}

                return new Rect(x,y,w,h);
            })()

            this.drawHolding(r);
        }
    }
    
    delete(){}
}


export class MsgPopup extends ILayout{

    private popup:Popup;

    constructor(dir:string, font:Font, stringSets:[string,Color][]){
        super();

        let w = 0;
        let h = 0;
        for(let set of stringSets){
            let _w = font.measureRatioW(set[0]);
            if(w < _w){w = _w;}
            h += font.ratioH;
        }
        this.popup = new Popup(dir, new Size(w,h),(bounds)=>{
            Graphics.fillRect(bounds, Color.D_GRAY);

            let p = bounds.upperLeft;
            for(let set of stringSets){
                font.draw( set[0], p, set[1] );

                p = p.move(0, font.ratioH);
            }
        });
    }

    async ctrlInner(bounds:Rect){
        this.popup.ctrl(bounds);
    }

    drawInner(bounds:Rect){
        this.popup.draw(bounds);
    }

    delete(){}
}