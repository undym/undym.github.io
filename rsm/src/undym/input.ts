import { Point } from "./type.js";


export class Input{
    private static _click:boolean = false;
    private static _x:number = 0;
    private static _y:number = 0;
    private static canvas:HTMLCanvasElement;
    private static touch:boolean;
    private static hold:number = 0;
    private static _holding:boolean = false;

    static init(canvas:HTMLCanvasElement, rotate:boolean){
        this.canvas = canvas;


        const setXYMouse = (ev:MouseEvent)=>{
            let rect = this.canvas.getBoundingClientRect();
            if(rotate){
                this._x = ev.clientY - rect.left;
                this._y = this.canvas.clientHeight - ev.clientX - rect.top;
            }else{
                this._x = ev.clientX - rect.left;
                this._y = ev.clientY - rect.top;
            }
        };
        const setXYTouch = (ev:TouchEvent)=>{
            let rect = this.canvas.getBoundingClientRect();
            if(rotate){
                this._x = ev.touches[0].clientY- rect.top;
                this._y = this.canvas.clientHeight - ev.touches[0].clientX - rect.left;
            }else{
                this._x = ev.touches[0].clientX - rect.left;
                this._y = ev.touches[0].clientY - rect.top;
            }
        };

        this.canvas.addEventListener("mousedown",(ev)=>{
            if(this.touch){return;}

            this._holding = true;
            setXYMouse(ev);
        });
        this.canvas.addEventListener("mouseup",(ev)=>{
            if(this.touch){return;}
            
            this._holding = false;
            this.hold = 0;
            setXYMouse(ev);
        });
        this.canvas.addEventListener("mouseout",(ev)=>{
            if(this.touch){return;}
            
            this._holding = false;
            this.hold = 0;
        });
        this.canvas.addEventListener("click", (ev)=>{
            if(this.touch){return;}

            this._click = true;
            
            setXYMouse(ev);
        });
        this.canvas.addEventListener("mousemove", (ev)=>{
            if(this.touch){return;}

            setXYMouse(ev);
        });
        
        this.canvas.addEventListener("touchstart", (ev)=>{
            this.touch = true;
            this._holding = true;
            if(ev.touches.length >= 2){return;}
            
            setXYTouch(ev);

        });
        this.canvas.addEventListener("touchmove", (ev)=>{
            ev.preventDefault();
            
            if(ev.touches.length >= 2){return;}
            
            setXYTouch(ev);
        });
        this.canvas.addEventListener("touchend", (ev)=>{
            this._holding = false;
            this.hold = 0;
            if(ev.touches.length >= 2){return;}

            this._click = true;
            
            setXYTouch(ev);
        });


    }

    static update(){
        this._click = false;

        if(this._holding){
            this.hold++;
        }
    }

    static clear(){
        this._click = false;
        this.hold = 0;
    }

    static get point(){return new Point(this.x, this.y);}
    static get x(){return this._x / this.canvas.clientWidth;}
    static get y(){return this._y / this.canvas.clientHeight;}
    
    static get click():boolean{return this._click;}

    static get holding():number{return this.hold;}
}