

export class Color{
    static readonly CLEAR    = new Color(0   ,0   ,0   ,0   );
    static readonly WHITE    = new Color(1   ,1   ,1   ,1   );
    static readonly BLACK    = new Color(0   ,0   ,0   ,1   );
    static readonly GRAY     = new Color(0.5 ,0.5 ,0.5 ,1   );
    static readonly L_GRAY   = new Color(0.7 ,0.7 ,0.7 ,1   );
    static readonly D_GRAY   = new Color(0.2 ,0.2 ,0.2 ,1   );
    static readonly RED      = new Color(1   ,0   ,0   ,1   );
    static readonly D_RED    = new Color(0.7 ,0   ,0   ,1   );
    static readonly GREEN    = new Color(0   ,1   ,0   ,1   );
    static readonly D_GREEN  = new Color(0   ,0.7 ,0   ,1   );
    static readonly BLUE     = new Color(0   ,0   ,1   ,1   );
    static readonly YELLOW   = new Color(1   ,1   ,0   ,1   );
    static readonly CYAN     = new Color(0   ,1   ,1   ,1   );
    static readonly D_CYAN   = new Color(0   ,0.7 ,0.7 ,1   );
    static readonly ORANGE   = new Color(1   ,0.6 ,0   ,1   );
    static readonly PINK     = new Color(1   ,0.75,0.8 ,1   );
    /** 肌色*/
    static readonly WHEAT    = new Color(0.95,0.85,0.6 ,1   );

    
    private static RAINBOW = [Color.RED ,Color.YELLOW ,Color.CYAN ,Color.BLUE ,Color.GREEN ,Color.ORANGE ,Color.PINK ,Color.GRAY];
    // static rainbow(count:number):Color{
    //     let i = Math.floor(count / 5) % this.RAINBOW.length;
    //     return this.RAINBOW[i];
    // }

    static readonly rainbow = (count:number):Color=>{
        let i = Math.floor(count / 5) % Color.RAINBOW.length;
        return Color.RAINBOW[i];
    };

    private HTMLString:string;

    constructor(
        readonly r:number, 
        readonly g:number, 
        readonly b:number, 
        readonly a:number = 1
    ){
    }

    /**
     * range:変動範囲.rgbが-range~+rangeの範囲で変動する
     * spd:変動速度.
     * Math.sin( Math.PI * 2 * count * spd ) * range
     * */
    readonly bright = (count?:number, range:number = 0.3, spd:number = 0.02):Color=>{
        if(count === undefined){
            count = Date.now() / 30;
        }

        function round(v:number):number{
            if(v < 0){return 0;}
            if(v > 1){return 1;}
            return v;
        }

        let sin = Math.sin( Math.PI * 2 * count * spd ) * range;
        return  new Color(
                     round(this.r + sin)
                    ,round(this.g + sin)
                    ,round(this.b + sin)
                    ,this.a
                );
    };

    readonly wave = (color:Color, count?:number, spd:number = 0.02):Color=>{
        if(!count)  {count = Date.now() / 30;}

        let ratio1 = (1 + Math.sin( Math.PI * 2 * count * spd )) / 2;
        let ratio2 = 1 - ratio1;
        return  new Color(
                      this.r * ratio1 + color.r * ratio2
                     ,this.g * ratio1 + color.g * ratio2
                     ,this.b * ratio1 + color.b * ratio2
                     ,this.a * ratio1 + color.a * ratio2
                );
    };

    brighter():Color{
        let mul = 1.3;
        let _r = this.r * mul;
        if(_r > 1){_r = 1;}
        let _g = this.g * mul;
        if(_g > 1){_g = 1;}
        let _b = this.b * mul;
        if(_b > 1){_b = 1;}
        return new Color(
             _r
            ,_g
            ,_b
            ,this.a
        );
    }
    
    darker():Color{
        let mul = 0.7;
        return new Color(
             this.r * mul
            ,this.g * mul
            ,this.b * mul
            ,this.a
        );
    }
    /**一度呼び出せばキャッシュされる。 */
    toString():string{
        if(this.HTMLString === undefined){
            let r = Math.floor( this.r * 255 );
            let g = Math.floor( this.g * 255 );
            let b = Math.floor( this.b * 255 );
            let a = this.a;
            this.HTMLString = `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return this.HTMLString;
    }

    equals(c:Color):boolean{
        return  (
                       c.r === this.r
                    && c.g === this.g
                    && c.b === this.b
                    && c.a === this.a
                );
    }
}


export class Point{
    static readonly ZERO = new Point(0,0);
    static readonly ONE = new Point(1,1);
    static readonly CENTER = new Point(0.5,0.5);

    constructor(
        readonly x:number, 
        readonly y:number
    ){
    }

    move(addX:number, addY:number):Point{
        return new Point(this.x + addX, this.y + addY);
    }
}


export class Rect{
    static readonly FULL = new Rect(0,0,1,1);
    static readonly ZERO = new Rect(0,0,0,0);

    constructor(
        readonly x:number, 
        readonly y:number, 
        readonly w:number, 
        readonly h:number
    ){
    }

    get xw():number{return this.x + this.w;}
    get yh():number{return this.y + this.h;}
    get cx():number{return this.x + this.w / 2;}
    get cy():number{return this.y + this.h / 2;}
    get upperLeft():Point {return new Point(this.x,  this.y);}
    get top():Point       {return new Point(this.cx, this.y);}
    get upperRight():Point{return new Point(this.xw, this.y);}
    get left():Point      {return new Point(this.x,  this.cy);}
    get center():Point    {return new Point(this.cx, this.cy);}
    get right():Point     {return new Point(this.xw, this.cy);}
    get lowerLeft():Point {return new Point(this.x,  this.yh);}
    get bottom():Point    {return new Point(this.cx, this.yh);}
    get lowerRight():Point{return new Point(this.xw, this.yh);}

    contains(p:Point):boolean{
        return p.x >= this.x && p.x <= this.xw && p.y >= this.y && p.y <= this.yh;
    }

    equals(r:Rect):boolean{
        return (this.x === r.x && this.y === r.y && this.w === r.w && this.h === r.h);
    }
}


export class Size{
    static readonly ZERO = new Size(0,0);
    
    constructor(
        readonly w:number, 
        readonly h:number
    ){
    }
}