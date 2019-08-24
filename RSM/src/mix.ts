import { Util } from "./util.js";
import { Color } from "./undym/type.js";
import { Item } from "./item.js";
import { Player } from "./player.js";


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
    private static _values:Mix[] = [];
    static values():ReadonlyArray<Mix>{return this._values;}

    private static _valueOf = new Map<string,Mix>();
    static valueOf(uniqueName:string):Mix|undefined{
        return this._valueOf.get(uniqueName);
    }

    static readonly LIMIT_INF = Number.POSITIVE_INFINITY;

    // readonly materials:{object:Num, num:number}[] = [];
    // readonly result:{object:Num, num:number}|undefined;
    get materials():ReadonlyArray<{object:Num, num:number}>{
        let res:{object:Num, num:number}[] = [];
        for(const m of this.args.materials()){
            res.push({object:m[0], num:m[1]});
        }
        return res;
    }
    get result():{object:Num, num:number}|undefined{
        const res = this.args.result;
        if(res){
            const r = res();
            return {object:r[0], num:r[1]};
        }
        return undefined;
    }

    get countLimit(){return this.args.limit ? this.args.limit : Mix.LIMIT_INF;}
    get uniqueName(){return this.args.uniqueName;}
    get info():string[]|undefined{return this.args.info;}
    /**合成回数. */
    count = 0;
    /**
     * 
     * limit:合成限界.
     * action:合成時に発生する効果。
     */
    constructor(
        private args:{
            uniqueName:string,
            limit:number,
            materials:()=>[Num, number][],
            result?:()=>[Num, number],
            action?:()=>void,
            info?:string[],
        }
    ){
        this.toString = ()=>this.uniqueName;

        Mix._values.push(this);
        if(Mix._valueOf.has(args.uniqueName)) {console.log("Mix._valueOf.has:", `"${args.uniqueName}"`);}
        else                                  {Mix._valueOf.set( args.uniqueName, this );}
    }

    isVisible():boolean{
        if(!this.materials){return false;}
        return this.materials[0].object.num > 0 && this.count < this.countLimit;
    }

    canRun(){
        if(this.count >= this.countLimit){return false;}

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

        if(this.args.action){
            this.args.action();
        }
    }
}


export namespace Mix{
    //--------------------------------------------------------
    //
    //建築
    //
    //--------------------------------------------------------
    //--------------------------------------------------------
    //
    //装備
    //
    //--------------------------------------------------------
    //--------------------------------------------------------
    //
    //アイテム
    //
    //--------------------------------------------------------
    const           サンタクララ薬 = new Mix({
        uniqueName:"サンタクララ薬", limit:5,
        result:()=>[Item.サンタクララ薬, 1],
        materials:()=>[[Item.再構成トンネルの玉, 1], [Item.ヒノキ, 5], [Item.しいたけ, 5], [Item.水, 5]],
    });
    const           硬化スティックパン = new Mix({
        uniqueName:"硬化スティックパン", limit:5,
        result:()=>[Item.硬化スティックパン, 1],
        materials:()=>[[Item.はじまりの丘の玉, 1], [Item.石, 5], [Item.土, 5]],
    });
}