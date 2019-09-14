


export class Texture{
    private static _empty:Texture;
    static get empty():Texture{
        if(this._empty === undefined){
            this._empty = new Texture({pixelSize:{w:1,h:1}});
        }
        return this._empty;
    }

    readonly canvas:HTMLCanvasElement;
    readonly ctx:CanvasRenderingContext2D;

    /**
     * 優先順位: canvas > size > imageData
     * @param values 
     */
    constructor(args:{
        canvas?:HTMLCanvasElement,
        pixelSize?:{w:number, h:number},
        imageData?:ImageData,
    }){

        if(args.canvas){
            this.canvas = args.canvas;
            this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        }else if(args.pixelSize){
            this.canvas = document.createElement("canvas") as HTMLCanvasElement;
            this.canvas.width = args.pixelSize.w;
            this.canvas.height = args.pixelSize.h;
            this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        }else if(args.imageData){
            this.canvas = document.createElement("canvas") as HTMLCanvasElement;
            this.canvas.width = args.imageData.width;
            this.canvas.height = args.imageData.height;
            this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
            this.ctx.putImageData( args.imageData, 0, 0 );
        }

        this.ctx.imageSmoothingEnabled = false;
    }

    draw(dstRatio:{x:number, y:number, w:number, h:number}, srcRatio = {x:0, y:0, w:1, h:1}){
        const ctx = Graphics.getRenderTarget().ctx;
        const w = Graphics.getRenderTarget().canvas.width;
        const h = Graphics.getRenderTarget().canvas.height;
        ctx.drawImage(
             this.canvas
            ,/*sx*/srcRatio.x * this.canvas.width
            ,/*sy*/srcRatio.y * this.canvas.height
            ,/*sw*/srcRatio.w * this.canvas.width
            ,/*sh*/srcRatio.h * this.canvas.height
            ,/*dx*/dstRatio.x * w
            ,/*dy*/dstRatio.y * h
            ,/*dw*/dstRatio.w * w
            ,/*dh*/dstRatio.h * h
        );
    }
    /**このTextureをRenderTargetにし、runを実行したのち元のTextureをRenderTargetに戻す。*/
    setRenderTarget(run:()=>void){
        const bak = Graphics.getRenderTarget();
        Graphics.setRenderTarget(this);
        run();
        Graphics.setRenderTarget(bak);
    }

    /**canvas.width */
    get pixelW(){return this.canvas.width;}
    /**canvas.height */
    get pixelH(){return this.canvas.height;}
    /**1/canvas.width */
    get dotW(){return 1 / this.canvas.width;}
    /**1/canvas.height */
    get dotH(){return 1 / this.canvas.height;}
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

    draw(dstRatio:{x:number, y:number, w:number, h:number}, srcRatio = {x:0, y:0, w:1, h:1}){
        if(!this.loadComplete){return;}

        const ctx = Graphics.getRenderTarget().ctx;
        const w = Graphics.getRenderTarget().canvas.width;
        const h = Graphics.getRenderTarget().canvas.height;
        ctx.drawImage(
             this.image
            ,/*sx*/srcRatio.x * this.image.width
            ,/*sy*/srcRatio.y * this.image.height
            ,/*sw*/srcRatio.w * this.image.width
            ,/*sh*/srcRatio.h * this.image.height
            ,/*dx*/dstRatio.x * w
            ,/*dy*/dstRatio.y * h
            ,/*dw*/dstRatio.w * w
            ,/*dh*/dstRatio.h * h
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

    static set lineWidth(width:number){this.texture.ctx.lineWidth = width;}
    static setLineWidth(width:number, run:()=>void){
        const ctx = this.texture.ctx;
        const bak = ctx.lineWidth;
        ctx.lineWidth = width;

        run();

        ctx.lineWidth = bak;
    }

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

    /**rはtextureのwを基準にする。 */
    static drawOval(ratioCenter:{x:number, y:number}, ratioR:number, color:{r:number, g:number, b:number, a:number}){
        const ctx = this.texture.ctx;
        ctx.beginPath();
        ctx.arc(
            ratioCenter.x * this.texture.pixelW, 
            ratioCenter.y * this.texture.pixelH, 
            ratioR * this.texture.pixelW, 
            0, 
            Math.PI * 2);
        ctx.closePath();

        ctx.strokeStyle = toHTMLColorString(color);
        ctx.stroke();
    }
    /**rはtextureのwを基準にする。 */
    static fillOval(ratioCenter:{x:number, y:number}, ratioR:number, color:{r:number, g:number, b:number, a:number}){
        const ctx = this.texture.ctx;
        ctx.beginPath();
        ctx.arc(
            ratioCenter.x * this.texture.pixelW, 
            ratioCenter.y * this.texture.pixelH, 
            ratioR * this.texture.pixelW, 
            0, 
            Math.PI * 2);
        ctx.closePath();

        ctx.fillStyle = toHTMLColorString(color);
        ctx.fill();
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
        ctx.fill();
    }

    static clip(rect:{x:number, y:number, w:number, h:number}, run:()=>void):void;
    static clip(arc:{cx:number, cy:number, r:number, startRad:number, endRad:number}, run:()=>void):void;
    static clip(polygon:{x:number, y:number}[], run:()=>void):void;
    static clip(bounds:any ,run:()=>void):void{
        const ctx = this.texture.ctx;
        ctx.save();

        ctx.beginPath();
        
        if(bounds.w){
            const rect:{x:number, y:number, w:number, h:number} = bounds;
            ctx.rect( rect.x * Graphics.pixelW, rect.y * Graphics.pixelH, rect.w * Graphics.pixelW, rect.h * Graphics.pixelH );
        }
        else if(bounds.arc){
            const arc:{cx:number, cy:number, r:number, startRad:number, endRad:number} = bounds;
            ctx.arc( arc.cx, arc.cy, arc.r, arc.startRad, arc.endRad );
        }
        else{//polygon
            const polygon:{x:number, y:number}[] = bounds;
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

    static rotate(rad:number, centerRatio:{x:number, y:number}, run:()=>void){
        const ctx = this.texture.ctx;
        const pw = centerRatio.x * this.pixelW;
        const ph = centerRatio.y * this.pixelH;

        ctx.beginPath();
        ctx.translate(pw, ph);
        ctx.rotate(rad);
        ctx.translate(-pw, -ph);
        ctx.closePath();

        run();

        ctx.beginPath();
        ctx.translate(pw, ph);
        ctx.rotate(-rad);
        ctx.translate(-pw, -ph);
        ctx.closePath();
    }
    /**現在の画面からTextureを生成. */
    static createTexture(ratio:{x:number, y:number, w:number, h:number}):Texture{
        const imageData = this.texture.ctx.getImageData(
                                                ratio.x * this.pixelW,
                                                ratio.y * this.pixelH,
                                                ratio.w * this.pixelW,
                                                ratio.h * this.pixelH);
        return new Texture({imageData:imageData});
    }
    
    static setAlpha(alpha:number, run:()=>void){
        const ctx = this.texture.ctx;
        const bak = ctx.globalAlpha;
        ctx.globalAlpha = alpha;
        run();
        ctx.globalAlpha = bak;
    }
    
    static get pixelW(){return this.texture.pixelW;}
    static get pixelH(){return this.texture.pixelH;}
    /**1/canvas.width */
    static get dotW(){return this.texture.dotW;}
    /**1/canvas.height */
    static get dotH(){return this.texture.dotH;}
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

    static readonly NORMAL  = "normal";
    static readonly BOLD    = "bold";
    static readonly ITALIC  = "italic";


    constructor(
        public size:number,
        public weight:string=Font.NORMAL,
        public name:string=Font.MONOSPACE,
    ){
        size = size|0;
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

