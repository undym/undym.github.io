import { Util } from "./util.js";
import { Color } from "./undym/type.js";
import { Item } from "./item.js";
import { Player } from "./player.js";
import { Eq } from "./eq.js";
import { Prm } from "./unit.js";


export class Num{
    static add(obj:Num, v:number){
        v = v|0;
        if(v > 0){    
            const newItem = obj.totalGetCount === 0;
            if(newItem){
                Util.msg.set("new", Color.rainbow);
            }else{
                Util.msg.set("");
            }

            obj.num += v;
            obj.totalGetCount += v;
            Util.msg.add(`[${obj}]を${v}個手に入れた(${obj.num})`, cnt=>Color.GREEN.wave(Color.YELLOW, cnt));

            if(newItem && obj.info.length > 0){
                Util.msg.set(`"`, Color.YELLOW);
                Util.msg.add(obj.info, Color.YELLOW);
                Util.msg.add(`"`, Color.YELLOW);
            }
        }
        if(v < 0){
            obj.num += v;
        }
    }

    info:string;
    /**totalGetCountとの整合性を取るため、通常はadd()を通して増減させる。 */
    num:number;
    totalGetCount:number;
    add:(v:number)=>void;
}



export class Mix{
    private static _values:Mix[] = [];
    static get values():ReadonlyArray<Mix>{return this._values;}

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
    get info():string|undefined{return this.args.info;}
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
            info?:string,
            isVisible?:()=>boolean,
        }
    ){

        Mix._values.push(this);
        if(Mix._valueOf.has(args.uniqueName)) {console.log("Mix._valueOf.has:", `"${args.uniqueName}"`);}
        else                                  {Mix._valueOf.set( args.uniqueName, this );}
    }

    toString(){return this.uniqueName;}

    isVisible():boolean{
        if(!this.materials){return false;}
        if(this.args.isVisible && !this.args.isVisible()){return false;}
        return this.materials[0].object.totalGetCount > 0 && this.count < this.countLimit;
    }

    canRun(){
        if(this.countLimit !== Mix.LIMIT_INF && this.count >= this.countLimit){return false;}

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
    const           しいたけのサラダ:Mix = new Mix({
        uniqueName:"しいたけのサラダ", limit:10, info:"スメラギの力+1",
        materials:()=>[[Item.しいたけ, 5], [Item.葉っぱ, 5], [Item.枝, 5]],
        action:()=>{
            Player.スメラギ.ins.prm(Prm.STR).base += 1;
        },
    });
    const           赤い水:Mix = new Mix({
        uniqueName:"赤い水", limit:10, info:"よしこの魔+1",
        materials:()=>[[Item.血, 5], [Item.水, 5], [Item.ほぐし水, 1]],
        action:()=>{
            Player.よしこ.ins.prm(Prm.MAG).base += 1;
        },
    });
    //--------------------------------------------------------
    //
    //装備
    //
    //--------------------------------------------------------
    
    //頭

    const           マーザンの角:Mix = new Mix({
        uniqueName:"マーザンの角", limit:2,
        result:()=>[Eq.マーザンの角, 1],
        materials:()=>[[Item.マーザンの鱗, 2], [Item.RANK2, 5]],
    });

    //武器

    const           う棒:Mix = new Mix({
        uniqueName:"う棒", limit:1,
        result:()=>[Eq.う棒, 1],
        materials:()=>[[Item.竹, 2], [Item.短針, 5], [Item.葛, 5]],
    });
    const           銅剣:Mix = new Mix({
        uniqueName:"銅剣", limit:1,
        result:()=>[Eq.銅剣, 1],
        materials:()=>[[Item.銅, 5], [Item.短針, 5], [Item.葛, 5]],
        isVisible:()=>う棒.count > 0,
    });
    const           はがねの剣:Mix = new Mix({
        uniqueName:"はがねの剣", limit:1,
        result:()=>[Eq.はがねの剣, 1],
        materials:()=>[[Item.鋼鉄, 10], [Item.短針, 5], [Item.葛, 5]],
        isVisible:()=>銅剣.count > 0,
    });

    const           杖:Mix = new Mix({
        uniqueName:"杖", limit:1,
        result:()=>[Eq.杖, 1],
        materials:()=>[[Item.枝, 5], [Item.朽ち果てた鍵, 5], [Item.草, 5]],
    });
    const           スギの杖:Mix = new Mix({
        uniqueName:"スギの杖", limit:1,
        result:()=>[Eq.スギの杖, 1],
        materials:()=>[[Item.スギ, 5], [Item.朽ち果てた鍵, 5], [Item.草, 5]],
        isVisible:()=>杖.count > 0,
    });
    const           ヒノキの杖:Mix = new Mix({
        uniqueName:"ヒノキの杖", limit:1,
        result:()=>[Eq.ヒノキの杖, 1],
        materials:()=>[[Item.ヒノキ, 5], [Item.朽ち果てた鍵, 5], [Item.草, 5]],
        isVisible:()=>スギの杖.count > 0,
    });
    
    const           木の鎖:Mix = new Mix({
        uniqueName:"木の鎖", limit:1,
        result:()=>[Eq.木の鎖, 1],
        materials:()=>[[Item.松, 5], [Item.血, 5], [Item.土, 5]],
    });
    const           銅の鎖:Mix = new Mix({
        uniqueName:"銅の鎖", limit:1,
        result:()=>[Eq.銅の鎖, 1],
        materials:()=>[[Item.銅, 5], [Item.血, 5], [Item.土, 5]],
        isVisible:()=>木の鎖.count > 0,
    });
    const           鉄の鎖:Mix = new Mix({
        uniqueName:"鉄の鎖", limit:1,
        result:()=>[Eq.鉄の鎖, 1],
        materials:()=>[[Item.鉄, 5], [Item.血, 5], [Item.土, 5]],
        isVisible:()=>銅の鎖.count > 0,
    });
    
    const           パチンコ:Mix = new Mix({
        uniqueName:"パチンコ", limit:1,
        result:()=>[Eq.パチンコ, 1],
        materials:()=>[[Item.ひも, 5], [Item.竹, 5], [Item.石, 5]],
    });
    const           ボウガン:Mix = new Mix({
        uniqueName:"ボウガン", limit:1,
        result:()=>[Eq.ボウガン, 1],
        materials:()=>[[Item.短針, 5], [Item.竹, 5], [Item.石, 5]],
        isVisible:()=>パチンコ.count > 0,
    });
    const           投石器:Mix = new Mix({
        uniqueName:"投石器", limit:1,
        result:()=>[Eq.投石器, 1],
        materials:()=>[[Item.岩, 5], [Item.竹, 5], [Item.石, 5]],
        isVisible:()=>ボウガン.count > 0,
    });
    
    //盾

    const           銅板:Mix = new Mix({
        uniqueName:"銅板", limit:2,
        result:()=>[Eq.銅板, 1],
        materials:()=>[[Item.銅, 3], [Item.枝, 3], [Item.土, 3]],
    });
    const           鉄板:Mix = new Mix({
        uniqueName:"鉄板", limit:2,
        result:()=>[Eq.鉄板, 1],
        materials:()=>[[Item.鉄, 3], [Item.枝, 3], [Item.土, 3]],
        isVisible:()=>銅板.count > 0,
    });
    const           鋼鉄板:Mix = new Mix({
        uniqueName:"鋼鉄板", limit:2,
        result:()=>[Eq.鋼鉄板, 1],
        materials:()=>[[Item.鋼鉄, 3], [Item.枝, 3], [Item.土, 3]],
        isVisible:()=>鉄板.count > 0,
    });
    const           チタン板:Mix = new Mix({
        uniqueName:"チタン板", limit:2,
        result:()=>[Eq.チタン板, 1],
        materials:()=>[[Item.チタン, 3], [Item.枝, 3], [Item.土, 3]],
        isVisible:()=>鋼鉄板.count > 0,
    });
    
    //体
    
    const           草の服:Mix = new Mix({
        uniqueName:"草の服", limit:2,
        result:()=>[Eq.草の服, 1],
        materials:()=>[[Item.草, 5], [Item.葛, 3], [Item.しいたけ, 3]],
    });
    const           布の服:Mix = new Mix({
        uniqueName:"布の服", limit:2,
        result:()=>[Eq.布の服, 1],
        materials:()=>[[Item.布, 2], [Item.黒い石, 3], [Item.しいたけ, 5]],
    });
    const           皮の服:Mix = new Mix({
        uniqueName:"皮の服", limit:2,
        result:()=>[Eq.皮の服, 1],
        materials:()=>[[Item.布, 2], [Item.少女の心を持ったおっさん, 5], [Item.しいたけ, 5]],
        isVisible:()=>布の服.count > 0,
    });
    const           木の鎧:Mix = new Mix({
        uniqueName:"木の鎧", limit:2,
        result:()=>[Eq.木の鎧, 1],
        materials:()=>[[Item.布, 2], [Item.スギ, 5], [Item.ヒノキ, 5]],
        isVisible:()=>皮の服.count > 0,
    });
    const           防弾チョッキ:Mix = new Mix({
        uniqueName:"防弾チョッキ", limit:2,
        result:()=>[Eq.防弾チョッキ, 1],
        materials:()=>[[Item.マーザンの鱗, 3], [Item.黒い石, 10]],
    });
    
    //手

    const           カンベレグ:Mix = new Mix({
        uniqueName:"カンベレグ", limit:1,
        result:()=>[Eq.カンベレグ, 1],
        materials:()=>[[Item.黒い青空, 5], [Item.エネルギー, 5]],
    });
    const           パウアハッハ:Mix = new Mix({
        uniqueName:"パウアハッハ", limit:1,
        result:()=>[Eq.パウアハッハ, 1],
        materials:()=>[[Item.消えない炎, 5], [Item.黒い枝, 5], [Item.黒い砂, 5]],
    });
    //--------------------------------------------------------
    //
    //アイテム
    //
    //--------------------------------------------------------
    const           硬化スティックパン:Mix = new Mix({
        uniqueName:"硬化スティックパン", limit:10,
        result:()=>[Item.硬化スティックパン, 1],
        materials:()=>[[Item.はじまりの丘チール, 2], [Item.石, 5], [Item.土, 5]],
    });
    const           布:Mix = new Mix({
        uniqueName:"布", limit:Mix.LIMIT_INF,
        result:()=>[Item.布, 1],
        materials:()=>[[Item.草, 5], [Item.枝, 1]],
        isVisible:()=>草の服.count > 0,
    });
    const           兵法指南の書:Mix = new Mix({
        uniqueName:"兵法指南の書", limit:Mix.LIMIT_INF,
        result:()=>[Item.兵法指南の書, 1],
        materials:()=>[[Item.リテの門チール, 2], [Item.葉っぱ, 10], [Item.紙, 10]],
    });
    const           五輪の書:Mix = new Mix({
        uniqueName:"五輪の書", limit:Mix.LIMIT_INF,
        result:()=>[Item.五輪の書, 1],
        materials:()=>[[Item.クリスタル, 1], [Item.イズミジュエリー, 3], [Item.紙, 10]],
    });
    const           天地創造の書:Mix = new Mix({
        uniqueName:"天地創造の書", limit:Mix.LIMIT_INF,
        result:()=>[Item.天地創造の書, 1],
        materials:()=>[[Item.血粉末, 1], [Item.サファイア, 3], [Item.紙, 10]],
    });
}