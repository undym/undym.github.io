import { Rect, Color, Point } from "../undym/type.js";
import { Graphics, Font } from "../graphics/graphics.js";



export class FX{
    private static elms:Elm[] = [];

    static set(effect:(count:number)=>boolean):void{
        let e = new Elm(effect);
        this.elms.push(e);
    }

    static draw():void{
        for(let i = 0; i < this.elms.length; i++){
            let e = this.elms[i];

            if(!e.exists){
                this.elms.splice(i,1);
                i--;
                continue;
            }

            e.draw();
        }
    }
}


class Elm{
    count = 0;
    effect:(count:number)=>boolean;
    exists:boolean = true;

    constructor(effect:(count:number)=>boolean){
        this.effect = effect;
    }

    draw():void{
        this.exists = this.effect(this.count);
        this.count++;
    }
}



export class FXTest{
    // private static effects:[string,()=>void][] = [];
    private static effects:{
        name:string,
        run:()=>void,
    }[] = [];

    private static _attacker:Point;
    static get attacker(){return this._attacker !== undefined ? this._attacker : (this._attacker = new Point(0.3,0.3))};
    
    private static _target:Point;
    static get target(){return this._target !== undefined ? this._target : (this._target = new Point(0.6,0.6))};

    static add(name:string, run:()=>void){
        this.effects.push({name:name, run:run});
    }

    static values():ReadonlyArray<{name:string, run:()=>void}>{
        return this.effects;
    }
}



export const FX_Advance = (bounds:Rect)=>{
    FX.set((count)=>{
        const over = 3;

        let w = bounds.w - bounds.w * count / over;
        let ph = 8 / Graphics.pixelH; 
        let h = ph - ph * count / over;
        let bh = (bounds.h - h) * 0.75;
        let y = bounds.y + bh - bh * count / (over - 1);
        Graphics.fillRect(new Rect(bounds.cx - w / 2, y, w, h), Color.GRAY);

        return count < over;
    });
}
FXTest.add(FX_Advance.name,()=> FX_Advance(Rect.FULL));


export const FX_Return = (bounds:Rect)=>{
    FX.set((count)=>{
        const over = 3;

        let w = bounds.w * count / over;
        let ph = 8 / Graphics.pixelH; 
        let h = ph * count / over;
        let bh = (bounds.h - h) * 0.75;
        let y = bounds.y + bh * (count - 1) / (over - 1);
        Graphics.fillRect(new Rect(bounds.cx - w / 2, y, w, h), Color.GRAY);

        return count < over;
    });
}
FXTest.add(FX_Return.name,()=> FX_Return(Rect.FULL));



export const FX_ShakeStr = (font:Font, str:string, center:{x:number,y:number}, color:Color)=>{
    let strings:string[] = [];
    let measures:number[] = [];
    for(let i = 0; i < str.length; i++){
        let s = str.substring(i,i+1);
        strings.push( s );
        measures.push( font.measureRatioW(s) );
    }
    const x = center.x - font.measureRatioW(str) / 2;
    let y = center.y - font.ratioH / 2;

    FX.set((count)=>{
        const over = 30;

        let x2 = x;
        let y2 = y;
        let a = count < over / 2 ? 1 : 1 - (count - over / 2) / (over / 2);
        let col = new Color( color.r, color.g, color.b, a );
        for(let i = 0; i < strings.length; i++){
            let shakeX = (1 / Graphics.pixelW) / 2 * (Math.random() * 2 - 1) / (count / over);
            let shakeY = (1 / Graphics.pixelH) / 2 * (Math.random() * 2 - 1) / (count / over);
            let x3 = x2 + shakeX;
            let y3 = y2 + shakeY;

            font.draw( strings[i], new Point(x3,y3), col );
            x2 += measures[i];
        }

        y -= (1 / Graphics.pixelH) / 2;

        return count < over;
    });
}
FXTest.add(FX_ShakeStr.name,()=> FX_ShakeStr(new Font(30, Font.BOLD), "1234", FXTest.target, Color.RED));



export const FX_Str = (font:Font, str:string, center:{x:number,y:number}, color:Color)=>{
    let strings:string[] = [];
    let measures:number[] = [];
    for(let i = 0; i < str.length; i++){
        let s = str.substring(i,i+1);
        strings.push( s );
        measures.push( font.measureRatioW(s) );
    }
    const x = center.x - font.measureRatioW(str) / 2;
    let y = center.y - font.ratioH / 2;

    FX.set((count)=>{
        const over = 30;

        let x2 = x;
        let y2 = y;
        let a = count < over / 2 ? 1 : 1 - (count - over / 2) / (over / 2);
        let col = new Color( color.r, color.g, color.b, a );
        for(let i = 0; i < strings.length; i++){
            font.draw( strings[i], new Point(x2,y2), col );
            x2 += measures[i];
        }

        y -= (1 / Graphics.pixelH) / 2;

        return count < over;
    });
}
FXTest.add(FX_Str.name,()=> FX_Str(new Font(30, Font.BOLD), "1234", FXTest.target, Color.GREEN));


export const FX_RotateStr = (font:Font, str:string, center:{x:number,y:number}, color:Color)=>{
    let strings:string[] = [];
    let measures:number[] = [];
    for(let i = 0; i < str.length; i++){
        let s = str.substring(i,i+1);
        strings.push( s );
        measures.push( font.measureRatioW(s) );
    }
    const x = center.x - font.measureRatioW(str) / 2;
    let y = center.y - font.ratioH / 2;
    const PI2 = Math.PI * 2;

    FX.set((count)=>{
        const over = 30;
        const rotateOver = 6;

        let x2 = x;
        let y2 = y;
        let a = count < over / 2 ? 1 : 1 - (count - over / 2) / (over / 2);
        let col = new Color( color.r, color.g, color.b, a );
        for(let i = 0; i < strings.length; i++){
            let rad = -Math.PI - PI2 * (count - (strings.length - i)) / rotateOver;
            if(rad < -PI2){rad = 0;}
            Graphics.rotate(/*rad*/rad, /*center*/{x:x2, y:y2}, ()=>{
                font.draw( strings[i], new Point(-measures[i] / 2, -font.ratioH / 2), col );
            });
            x2 += measures[i];
        }

        y -= (1 / Graphics.pixelH) / 2;

        return count < over;
    });
}
FXTest.add(FX_RotateStr.name,()=> FX_RotateStr(new Font(30, Font.BOLD), "12345", FXTest.target, Color.GREEN));