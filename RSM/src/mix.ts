import { Util } from "./util.js";
import { Color } from "./undym/type.js";


export class Num{
    static add(obj:Num, v:number){
        v = v|0;
        if(v > 0){    
            const newItem = obj.totalGetNum === 0;
            if(newItem){
                Util.msg.set("new", Color.rainbow);
            }else{
                Util.msg.set("");
            }

            obj.num += v;
            obj.totalGetNum += v;
            Util.msg.add(`[${obj}]を${v}個手に入れた(${obj.num})`, cnt=>Color.GREEN.wave(Color.YELLOW, cnt));

            if(newItem){
                for(let str of obj.info){
                    Util.msg.set(`"${str}"`, Color.GREEN);
                }
            }
        }
        if(v < 0){
            obj.num += v;
        }
    }

    info:string[];
    /**セーブデータのため、通常はadd()/reduce()を通して増減させる。 */
    num:number;
    totalGetNum:number;
    add:(v:number)=>void;
}

export class Mix{
    static readonly LIMIT_INF = Number.POSITIVE_INFINITY;


    readonly materials:{object:Num, num:number}[] = [];
    readonly result:{object:Num, num:number}|undefined;
    /**合成回数上限. */
    readonly countLimit:()=>number;
    private readonly action:()=>void;
    /**合成回数. */
    count = 0;

    /**
     * 
     * limit:合成限界.
     * action:合成時に発生する効果。
     */
    constructor(args:{
        materials:[Num, number][];
        limit?:()=>number;
        result?:[Num, number];
        action?:()=>void;
    }){
        for(let m of args.materials){
            this.materials.push({object: m[0], num: m[1]});
        }

        if(args.limit){
            this.countLimit = args.limit;
        }else{
            this.countLimit = ()=>Mix.LIMIT_INF;
        }

        if(args.result){
            const re = args.result;
            this.result = {object: re[0], num: re[1]};
        }

        if(args.action){
            this.action = args.action;
        }
    }

    isVisible():boolean{
        if(!this.materials){return false;}
        return this.materials[0].object.num > 0 && this.count < this.countLimit();
    }

    canRun(){
        if(this.count >= this.countLimit()){return false;}

        for(let m of this.materials){
            if(m.object.num < m.num){
                return false;
            }
        }

        return true;
    }

    run(){
        if(!this.canRun()){return;}

        this.count++;
        
        for(let m of this.materials){
            m.object.add(-m.num);
        }

        if(this.result){
            this.result.object.add( this.result.num );
        }

        if(this.action){
            this.action();
        }
    }
}
