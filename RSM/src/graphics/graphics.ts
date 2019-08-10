


export class Texture{
    private static _empty:Texture;
    static get empty():Texture{
        if(this._empty === undefined){
            this._empty = new Texture({size:{w:1,h:1}});
        }
        return this._empty;
    }

    readonly canvas:HTMLCanvasElement;
    readonly ctx:CanvasRenderingContext2D;

    /**
     * canvasが設定されていればsizeを無視し、canvasが設定されていなければsizeのcanvasを生成する。
     * @param values 
     */
    constructor(values:{
        canvas?:HTMLCanvasElement,
        size?:{w:number, h:number},
    }){

        if(values.canvas !== undefined){
            this.canvas = values.canvas;
            this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        }else if(values.size !== undefined){
            this.canvas = document.createElement("canvas") as HTMLCanvasElement;
            this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
            this.canvas.width = values.size.w;
            this.canvas.height = values.size.h;
        }

        this.ctx.imageSmoothingEnabled = false;
    }

    /**このTextureをRenderTargetにし、runを実行したのち元のTextureをRenderTargetに戻す。*/
    setRenderTarget(run:()=>void){
        const bak = Graphics.getRenderTarget();
        Graphics.setRenderTarget(this);
        run();
        Graphics.setRenderTarget(bak);
    }

    get pixelW(){return this.canvas.width;}
    get pixelH(){return this.canvas.height;}
}


export class Img{
    private static _empty:Img;
    static get empty():Img{
        if(this._empty === undefined){
            this._empty = new class extends Img{
                constructor(){super("");}
                draw(dst:{x:number, y:number, w:number, h:number}, src = {x:0, y:0, w:1, h:1}){}
            };
        }
        return this._empty;
    }
    private image:HTMLImageElement;
    private loadComplete = false;

    constructor(src:string){
        this.image = new Image();
        this.image.crossOrigin = 'anonymous';
        if(src === ""){return;}

        this.image.onload = ()=>{
            this.loadComplete = true;
        };
        this.image.src = src;
    }

    draw(dst:{x:number, y:number, w:number, h:number}, src = {x:0, y:0, w:1, h:1}){
        if(!this.loadComplete){return;}

        const ctx = Graphics.getRenderTarget().ctx;
        const w = Graphics.getRenderTarget().canvas.width;
        const h = Graphics.getRenderTarget().canvas.height;
        ctx.drawImage(
             this.image
            ,/*sx*/src.x * this.image.width
            ,/*sy*/src.y * this.image.height
            ,/*sw*/src.w * this.image.width
            ,/*sh*/src.h * this.image.height
            ,/*dx*/dst.x * w
            ,/*dy*/dst.y * h
            ,/*dw*/dst.w * w
            ,/*dh*/dst.h * h
        );
    }

    loaded(){return this.loadComplete;}

    /**読み込みが完了するまでは0を返す。 */
    get pixelW(){return this.image.width;}
    /**読み込みが完了するまでは0を返す。 */
    get pixelH(){return this.image.height;}
    /**現在のRenderTargetを基準としたサイズ比を返す。 */
    get ratioW(){return this.image.width / Graphics.getRenderTarget().pixelW;}
    /**現在のRenderTargetを基準としたサイズ比を返す。 */
    get ratioH(){return this.image.height / Graphics.getRenderTarget().pixelH;}
}


export class Graphics{
    private constructor(){}

    private static texture:Texture;
    

    static getRenderTarget()                {return this.texture;}
    static setRenderTarget(texture:Texture) {this.texture = texture;}


    static clear(bounds:{x:number, y:number, w:number, h:number}){
        this.texture.ctx.clearRect(
            bounds.x * this.texture.pixelW
           ,bounds.y * this.texture.pixelH
           ,bounds.w * this.texture.pixelW
           ,bounds.h * this.texture.pixelH
        );
    }

    static fillRect(bounds:{x:number, y:number, w:number, h:number}, color:{r:number, g:number, b:number, a:number}){
        this.texture.ctx.fillStyle = toHTMLColorString(color);
        this.texture.ctx.fillRect( 
             bounds.x * this.texture.pixelW
            ,bounds.y * this.texture.pixelH
            ,bounds.w * this.texture.pixelW
            ,bounds.h * this.texture.pixelH
            );
    }

    static drawRect(bounds:{x:number, y:number, w:number, h:number}, color:{r:number, g:number, b:number, a:number}){
        this.texture.ctx.strokeStyle = toHTMLColorString(color);
        this.texture.ctx.strokeRect( 
             bounds.x * this.texture.pixelW
            ,bounds.y * this.texture.pixelH
            ,bounds.w * this.texture.pixelW
            ,bounds.h * this.texture.pixelH
            );
    }

    static line(p1:{x:number, y:number}, p2:{x:number, y:number}, color:{r:number, g:number, b:number, a:number}){
        const ctx = this.texture.ctx;
        const w = this.texture.pixelW;
        const h = this.texture.pixelH;

        ctx.strokeStyle = toHTMLColorString(color);
        ctx.beginPath();

        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);

        ctx.closePath();
        ctx.stroke();
    }

    static lines(points:{x:number, y:number}[], color:{r:number, g:number, b:number, a:number}){
        if(points.length === 0){return;}

        const ctx = this.texture.ctx;
        const w = this.texture.pixelW;
        const h = this.texture.pixelH;

        ctx.strokeStyle = toHTMLColorString(color);
        ctx.beginPath();

        ctx.moveTo(points[0].x * w, points[0].y * h);
        for(let i = 1; i < points.length; i++){
            ctx.lineTo(points[i].x * w, points[i].y * h);
        }

        ctx.closePath();
        ctx.stroke();

    }

    static fillPolygon(points:{x:number, y:number}[], color:{r:number, g:number, b:number, a:number}){
        if(points.length === 0){return;}

        const ctx = this.texture.ctx;
        const w = this.texture.pixelW;
        const h = this.texture.pixelH;
        ctx.fillStyle = toHTMLColorString(color);
        ctx.beginPath();

        ctx.moveTo(points[0].x * w, points[0].y * h);
        for(let i = 1; i < points.length; i++){
            ctx.lineTo(points[i].x * w, points[i].y * h);
        }

        ctx.closePath();
        ctx.stroke();
    }

    static clip(
        bounds:{
            rect?:{x:number, y:number, w:number, h:number},
            arc?:{cx:number, cy:number, r:number, startRad:number, endRad:number},
            polygon?:{x:number, y:number}[],
        }
        ,run:()=>void
    ){
        const ctx = this.texture.ctx;
        ctx.save();

        ctx.beginPath();
        if(bounds.rect !== undefined){
            const rect = bounds.rect;
            ctx.rect( rect.x, rect.y, rect.w, rect.h );
        }
        if(bounds.arc !== undefined){
            const arc = bounds.arc;
            ctx.arc( arc.cx, arc.cy, arc.r, arc.startRad, arc.endRad );
        }
        if(bounds.polygon !== undefined){
            const polygon = bounds.polygon;
            if(polygon.length > 0){
                ctx.moveTo( polygon[0].x, polygon[0].y );
                for(let i = 0; i < polygon.length; i++){
                    ctx.lineTo( polygon[i].x, polygon[i].y );
                }
            }
        }

        ctx.closePath();
        ctx.clip();
        
        run();

        ctx.restore();
    }

    static rotate(rad:number, center:{x:number, y:number}, run:()=>void){
        const ctx = this.texture.ctx;
        const pw = center.x * this.pixelW;
        const ph = center.y * this.pixelH;

        ctx.beginPath();
        ctx.translate(pw, ph);
        ctx.rotate(rad);
        ctx.closePath();

        run();

        ctx.beginPath();
        ctx.rotate(-rad);
        ctx.translate(-pw, -ph);
        ctx.closePath();
    }
    
    static get pixelW(){return this.texture.pixelW;}
    static get pixelH(){return this.texture.pixelH;}
}

const toHTMLColorString = (color:{r:number, g:number, b:number, a:number})=>{
    const r = (color.r * 255)|0;
    const g = (color.g * 255)|0;
    const b = (color.b * 255)|0;
    const a = color.a;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}


export class Font{
    private static DEF:Font;
    static get def():Font{
        return this.DEF ? this.DEF : (this.DEF = new Font(35));
    }

    static createHTMLString(size:number, weight:string, name:string){
        //一度代入することにより、HTML側の表現を得る。
        Graphics.getRenderTarget().ctx.font = `${weight} ${size}px ${name}`;
        return Graphics.getRenderTarget().ctx.font;
    }

    static readonly MONOSPACE:string = "monospace";

    static readonly UPPER_LEFT  = "upperLeft";
    static readonly TOP         = "top";
    static readonly UPPER_RIGHT = "upperRight";
    static readonly LEFT        = "left";
    static readonly CENTER      = "center";
    static readonly RIGHT       = "right";
    static readonly LOWER_LEFT  = "lowerLeft";
    static readonly BOTTOM      = "bottom";
    static readonly LOWER_RIGHT = "lowerRight";

    static readonly NORMAL = "normal";
    static readonly BOLD = "bold";


    constructor(
        public size:number,
        public weight:string=Font.NORMAL,
        public name:string=Font.MONOSPACE,
    ){
        const htmlString = Font.createHTMLString(size, weight, name);
        this.toString = ()=>htmlString;
    }

    draw(_str:string, point:{x:number, y:number}, color:{r:number, g:number, b:number, a:number}, base:string = Font.UPPER_LEFT){
        const ctx = Graphics.getRenderTarget().ctx;
        ctx.fillStyle = toHTMLColorString(color);

        switch(base){
            case Font.UPPER_LEFT:
                ctx.textBaseline = "top";
                ctx.textAlign    = "left";
                break;
            case Font.TOP:
                ctx.textBaseline = "top";
                ctx.textAlign    = "center";
                break;
            case Font.UPPER_RIGHT:
                ctx.textBaseline = "top";
                ctx.textAlign    = "right";
                break;
            case Font.LEFT:
                ctx.textBaseline = "middle";
                ctx.textAlign    = "left";
                break;
            case Font.CENTER:
                ctx.textBaseline = "middle";
                ctx.textAlign    = "center";
                break;
            case Font.RIGHT:
                ctx.textBaseline = "middle";
                ctx.textAlign    = "right";
                break;
            case Font.LOWER_LEFT:
                ctx.textBaseline = "bottom";
                ctx.textAlign    = "left";
                break;
            case Font.BOTTOM:
                ctx.textBaseline = "bottom";
                ctx.textAlign    = "center";
                break;
            case Font.LOWER_RIGHT:
                ctx.textBaseline = "bottom";
                ctx.textAlign    = "right";
                break;
        }

        if(ctx.font !== this.toString()){
            ctx.font = this.toString();
        }
        ctx.fillText(_str, point.x * Graphics.pixelW, point.y * Graphics.pixelH);
    }
    // /**現在のRenderTargetのサイズを基準にしたもの。 */
    get ratioH(){return this.size / Graphics.pixelH;}

    measurePixelW(s:string):number{
        if(Graphics.getRenderTarget().ctx.font !== this.toString()){
            Graphics.getRenderTarget().ctx.font = this.toString();
        }
        return Graphics.getRenderTarget().ctx.measureText(s).width;
    }
    // /**現在のRenderTargetのサイズを基準にしたもの。 */
    measureRatioW(s:string):number{
        return this.measurePixelW(s) / Graphics.pixelW;
    }

}

