import { Dungeon } from "./dungeon/dungeon.js";
import { Util, SceneType } from "./util.js";
import { Color } from "./undym/type.js";
import { Scene, wait } from "./undym/scene.js";
import { Unit, Prm } from "./unit.js";
import { FX_Str, FX_RotateStr } from "./fx/fx.js";
import { Targeting, Action } from "./force.js";
import { randomInt, choice } from "./undym/random.js";
import { Font } from "./graphics/graphics.js";
import { Num, Mix } from "./mix.js";
import { DungeonEvent } from "./dungeon/dungeonevent.js";
import { SaveData } from "./savedata.js";
import DungeonScene from "./scene/dungeonscene.js";
import { Battle } from "./battle.js";




export class ItemType{
    protected _values:Item[];

    private constructor(name:string){
        this.toString = ()=>name;
    }

    get values():ReadonlyArray<Item>{
        if(this._values === undefined){
            this._values = Item.values
                                .filter(item=> item.itemType === this);
        }
        return this._values;
    };

    static readonly 蘇生 = new ItemType("蘇生");
    static readonly HP回復 = new ItemType("HP回復");
    static readonly MP回復 = new ItemType("MP回復");
    
    static readonly ダンジョン = new ItemType("ダンジョン");

    static readonly 弾 = new ItemType("弾");

    static readonly メモ = new ItemType("メモ");
    static readonly 鍵 = new ItemType("鍵");
    static readonly 玉 = new ItemType("玉");
    static readonly 素材 = new ItemType("素材");

}


export class ItemParentType{
    private static _values:ItemParentType[] = [];
    static get values():ReadonlyArray<ItemParentType>{return this._values;}


    private constructor(
        name:string
        ,public readonly children:ReadonlyArray<ItemType>
    ){
        this.toString = ()=>name;

        ItemParentType._values.push(this);
    }

    static readonly 回復       = new ItemParentType("回復", [ItemType.蘇生, ItemType.HP回復, ItemType.MP回復]);
    static readonly ダンジョン  = new ItemParentType("ダンジョン", [ItemType.ダンジョン]);
    static readonly 戦闘       = new ItemParentType("戦闘", [ItemType.弾]);
    static readonly その他     = new ItemParentType("その他", [ItemType.メモ, ItemType.鍵, ItemType.玉, ItemType.素材]);
}

export const ItemDrop = {
    get NO()  {return 0;},
    get BOX() {return 1 << 0;},
    get TREE(){return 1 << 1;},
}

class ItemValues{
    private values = new Map<number,Item[]>();

    constructor(items:Item[]){
        for(const item of items){
            if(!this.values.has(item.rank)){
                this.values.set(item.rank, []);
            }

            (this.values.get(item.rank) as Item[]).push(item);
        }
    }

    get(rank:number):ReadonlyArray<Item>|undefined{
        return this.values.get(rank);
    }
}


export class Item implements Action, Num{
    private static _values:Item[] = [];
    static get values():ReadonlyArray<Item>{return this._values;}

    // private static _rankValues = new Map<number,Item[]>();
    // // private static _rankValues:{[key:number]:Item[];} = {};
    // static rankValues(rank:number):ReadonlyArray<Item>|undefined{
    //     return this._rankValues.get(rank);
    // }


    private static _consumableValues:Item[] = [];
    static consumableValues():ReadonlyArray<Item>{
        return this._consumableValues;
    }

    private static _dropTypeValues = new Map<number,ItemValues>();
    /**
     * 指定のタイプの指定のランクのアイテムを返す。そのランクにアイテムが存在しなければランクを一つ下げて再帰する。
     * @param dropType 
     * @param rank 
     */
    static rndItem(dropType:number, rank:number):Item{
        if(!this._dropTypeValues.has(dropType)){
            const typeValues = this.values.filter(item=> item.dropType & dropType);
            this._dropTypeValues.set(dropType, new ItemValues(typeValues));
        }

        const itemValues = this._dropTypeValues.get(dropType);
        if(itemValues){
            const rankValues = itemValues.get(rank);
            if(rankValues){
                for(let i = 0; i < 10; i++){
                    let tmp = choice(rankValues);
                    if(tmp.num < tmp.numLimit){return tmp;}
                }
            }

            if(rank <= 0){return Item.石;}
            return this.rndItem(dropType, rank-1);
        }
        
        return Item.石;
    }

    static fluctuateRank(baseRank:number, rankFluctuatePassProb = 0.4){
        let add = 0;

        while(Math.random() <= rankFluctuatePassProb){
            add += 0.5 + Math.random() * 0.5;
        }

        if(Math.random() < 0.5){
            add *= -1;
        }

        const res = (baseRank + add)|0;
        return res > 0 ? res : 0;
    }


    static readonly DEF_NUM_LIMIT = 999;


    num:number = 0;
    totalGetNum:number = 0;
    /**残り使用回数。*/
    remainingUseCount:number = 0;

    readonly uniqueName:string;
    readonly info:string[];
    readonly itemType:ItemType;
    readonly rank:number;
    /**宝箱から出るか。 */
    readonly box:boolean;
    readonly targetings:number;
    readonly consumable:boolean;
    /**所持上限. */
    readonly numLimit:number;
    readonly dropType:number;

    protected useInner:(user:Unit, target:Unit)=>void;
    
    protected constructor(args:{
        uniqueName:string,
        info:string[],
        type:ItemType,
        rank:number,
        drop:number,
        targetings?:number,
        numLimit?:number,
        consumable?:boolean,
        use?:(user:Unit,target:Unit)=>void,
    }){
        this.uniqueName = args.uniqueName;
        this.toString = ()=>this.uniqueName;
        this.info = args.info;
        this.itemType = args.type;
        this.rank = args.rank;
        this.dropType = args.drop;
        
        this.targetings = args.targetings ? args.targetings : Targeting.SELECT;
        this.numLimit = args.numLimit ? args.numLimit : Item.DEF_NUM_LIMIT;
        if(args.consumable){
            this.consumable = args.consumable;
            Item._consumableValues.push(this);
        }else{
            this.consumable = false;
        }

        if(args.use){
            this.useInner = args.use;
        }

        Item._values.push(this);

    }

    add(v:number){
        if(v > 0){       
            if(this.num + v > this.numLimit){
                v = this.numLimit - this.num;
                if(v <= 0){
                    Util.msg.set(`[${this}]はこれ以上入手できない`, Color.L_GRAY);
                    return;
                }
            }
        }

        Num.add(this, v);
    }

    async use(user:Unit, targets:Unit[]){
        if(!this.canUse()){return;}

        for(let t of targets){
            await this.useInner(user, t);
        }
        
        if(this.consumable) {this.remainingUseCount--;}
        else                {this.num--;}
    }

    canUse(){
        if(this.useInner === undefined){return false;}
        if(this.consumable && this.remainingUseCount <= 0){return false;}
        if(!this.consumable && this.num <= 0){return false;}
        return true;
    }
}



export namespace Item{
    //-----------------------------------------------------------------
    //
    //蘇生
    //
    //-----------------------------------------------------------------
    export const                         サンタクララ薬:Item = new class extends Item{
        constructor(){super({uniqueName:"サンタクララ薬", info:["一体をHP1で蘇生"],
                                type:ItemType.HP回復, rank:0,
                                consumable:true, drop:ItemDrop.NO,
                                use:async(user,target)=>{
                                    if(target.dead){
                                        target.dead = false;
                                        target.hp = 0;
                                        Battle.healHP(target, 1);
                                        if(SceneType.now === SceneType.BATTLE){
                                            Util.msg.set(`${target.name}は生き返った`); await wait();
                                        }
                                    }
                                }
        })}
    };
    //-----------------------------------------------------------------
    //
    //HP回復
    //
    //-----------------------------------------------------------------
    export const                         スティックパン:Item = new class extends Item{
        constructor(){super({uniqueName:"スティックパン", info:["HP+10+5%"],
                                type:ItemType.HP回復, rank:0,
                                consumable:true, drop:ItemDrop.NO,
                                use:async(user,target)=>{
                                    const value = (10 + target.prm(Prm.MAX_HP).total * 0.05)|0;
                                    Battle.healHP(target, value);
                                    if(SceneType.now === SceneType.BATTLE){
                                        Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright); await wait();
                                    }
                                },
        })}
    };
    export const                         硬化スティックパン:Item = new class extends Item{
        constructor(){super({uniqueName:"硬化スティックパン", info:["HP+30+5%"],
                                type:ItemType.HP回復, rank:0,
                                consumable:true, drop:ItemDrop.NO,
                                use:async(user,target)=>{
                                    const value = (30 + target.prm(Prm.MAX_HP).total * 0.05)|0;
                                    Battle.healHP(target, value);
                                    if(SceneType.now === SceneType.BATTLE){
                                        Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright); await wait();
                                    }
                                },
        })}
    };
    //-----------------------------------------------------------------
    //
    //MP回復
    //
    //-----------------------------------------------------------------
    export const                         赤い水:Item = new class extends Item{
        constructor(){super({uniqueName:"赤い水", info:["MP+10"],
                                type:ItemType.MP回復, rank:0,
                                consumable:true, drop:ItemDrop.NO,
                                use:async(user,target)=>{
                                    const value = 10;
                                    Battle.healMP(target, value)
                                    if(SceneType.now === SceneType.BATTLE){
                                        Util.msg.set(`${target.name}のMPが${value}回復した`, Color.GREEN.bright); await wait();
                                    }
                                },
        })}
    };
    //-----------------------------------------------------------------
    //
    //ダンジョン
    //
    //-----------------------------------------------------------------
    export const                         脱出ポッド:Item = new class extends Item{
        constructor(){super({uniqueName:"脱出ポッド", info:["ダンジョンから脱出する"],
                                type:ItemType.ダンジョン, rank:0,
                                consumable:true, drop:ItemDrop.NO,
                                use:async(user,target)=>{
                                    Scene.load( DungeonScene.ins );
                                    await DungeonEvent.ESCAPE_DUNGEON.happen();
                                },
        })}
        canUse(){
            return super.canUse() && SceneType.now === SceneType.DUNGEON;
        }
    };
    //-----------------------------------------------------------------
    //
    //弾
    //
    //-----------------------------------------------------------------
    export const                         散弾:Item = new class extends Item{
        constructor(){super({uniqueName:"散弾", info:["ショットガンに使用"],
                                type:ItemType.鍵, rank:0, consumable:true, drop:ItemDrop.NO,})}
    };
    export const                         夜叉の矢:Item = new class extends Item{
        constructor(){super({uniqueName:"夜叉の矢", info:["ヤクシャに使用"],
                                type:ItemType.鍵, rank:0, consumable:true, drop:ItemDrop.NO,})}
    };
    //-----------------------------------------------------------------
    //
    //メモ
    //
    //-----------------------------------------------------------------
    export const                         合成許可証:Item = new class extends Item{
        constructor(){super({uniqueName:"合成許可証", info:["合成が解放される"], 
                                type:ItemType.メモ, rank:0, drop:ItemDrop.NO, numLimit:1})}
    };
    export const                         消耗品のメモ:Item = new class extends Item{
        constructor(){super({uniqueName:"消耗品のメモ", info:["スティックパンなどの消耗品は","ダンジョンに入る度に補充される"], 
                                type:ItemType.メモ, rank:0, drop:ItemDrop.BOX, numLimit:1})}
    };
    //-----------------------------------------------------------------
    //
    //鍵
    //
    //-----------------------------------------------------------------
    export const                         はじまりの丘の鍵:Item = new class extends Item{
        constructor(){super({uniqueName:"はじまりの丘の鍵", info:[], type:ItemType.鍵, rank:0, drop:ItemDrop.NO,})}
    };
    export const                         再構成トンネルの鍵:Item = new class extends Item{
        constructor(){super({uniqueName:"再構成トンネルの鍵", info:[], type:ItemType.鍵, rank:0, drop:ItemDrop.NO,})}
    };
    export const                         リテの門の鍵:Item = new class extends Item{
        constructor(){super({uniqueName:"リ・テの門の鍵", info:[], type:ItemType.鍵, rank:0, drop:ItemDrop.NO,})}
    };
    export const                         黒平原の鍵:Item = new class extends Item{
        constructor(){super({uniqueName:"黒平原の鍵", info:[], type:ItemType.鍵, rank:0, drop:ItemDrop.NO,})}
    };
    export const                         黒遺跡の鍵:Item = new class extends Item{
        constructor(){super({uniqueName:"黒遺跡の鍵", info:[], type:ItemType.鍵, rank:0, drop:ItemDrop.NO,})}
    };
    //-----------------------------------------------------------------
    //
    //玉
    //
    //-----------------------------------------------------------------
    export const                         はじまりの丘の玉:Item = new class extends Item{
        constructor(){super({uniqueName:"はじまりの丘の玉", info:[], type:ItemType.玉, rank:0, drop:ItemDrop.NO,})}
    };
    export const                         再構成トンネルの玉:Item = new class extends Item{
        constructor(){super({uniqueName:"再構成トンネルの玉", info:[], type:ItemType.玉, rank:0, drop:ItemDrop.NO,})}
    };
    export const                         リテの門の玉:Item = new class extends Item{
        constructor(){super({uniqueName:"リ・テの門の玉", info:[], type:ItemType.玉, rank:0, drop:ItemDrop.NO,})}
    };
    export const                         黒平原の玉:Item = new class extends Item{
        constructor(){super({uniqueName:"黒平原の玉", info:[], type:ItemType.玉, rank:0, drop:ItemDrop.NO,})}
    };
    export const                         黒遺跡の玉:Item = new class extends Item{
        constructor(){super({uniqueName:"黒遺跡の玉", info:[], type:ItemType.玉, rank:0, drop:ItemDrop.NO,})}
    };
    //-----------------------------------------------------------------
    //
    //素材
    //
    //-----------------------------------------------------------------
    export const                         石:Item = new class extends Item{
        constructor(){super({uniqueName:"石", info:["いし"],
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    export const                         少女の心を持ったおっさん:Item = new class extends Item{
        constructor(){super({uniqueName:"少女の心を持ったおっさん", info:["いつもプリキュアの","話をしている"],
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    export const                         枝:Item = new class extends Item{
        constructor(){super({uniqueName:"枝", info:["えだ"],
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX | ItemDrop.TREE})}
    };
    export const                         土:Item = new class extends Item{
        constructor(){super({uniqueName:"土", info:["つち"],
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    export const                         水:Item = new class extends Item{
        constructor(){super({uniqueName:"水", info:["水"],
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    export const                         しいたけ:Item = new class extends Item{
        constructor(){super({uniqueName:"しいたけ", info:[],
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    export const                         朽ち果てた鍵:Item = new class extends Item{
        constructor(){super({uniqueName:"朽ち果てた鍵", info:[],
                                type:ItemType.素材, rank:1, drop:ItemDrop.BOX})}
    };
    export const                         エネルギー:Item = new class extends Item{
        constructor(){super({uniqueName:"エネルギー", info:["触るとビリビリする"],
                                type:ItemType.素材, rank:1, drop:ItemDrop.BOX})}
    };
    export const                         He:Item = new class extends Item{
        constructor(){super({uniqueName:"He", info:["ヘェッ"],
                                type:ItemType.素材, rank:2, drop:ItemDrop.BOX})}
    };
    export const                         黒い石:Item = new class extends Item{
        constructor(){super({uniqueName:"黒い石", info:["これは黒い！！！！！"],
                                type:ItemType.素材, rank:2, drop:ItemDrop.BOX})}
    };
    export const                         黒い砂:Item = new class extends Item{
        constructor(){super({uniqueName:"黒い砂", info:["黒い！！！！！"],
                                type:ItemType.素材, rank:2, drop:ItemDrop.BOX})}
    };
    export const                         黒い枝:Item = new class extends Item{
        constructor(){super({uniqueName:"黒い枝", info:["とても黒い！！！！！"],
                                type:ItemType.素材, rank:2, drop:ItemDrop.BOX})}
    };
    export const                         黒い青空:Item = new class extends Item{
        constructor(){super({uniqueName:"黒い青空", info:["すごく黒い！！！！！"],
                                type:ItemType.素材, rank:2, drop:ItemDrop.BOX})}
    };


    export const                         竹:Item = new class extends Item{
        constructor(){super({uniqueName:"竹", info:[],
                                type:ItemType.素材, rank:0, drop:ItemDrop.TREE})}
    };
    export const                         松:Item = new class extends Item{
        constructor(){super({uniqueName:"松", info:[],
                                type:ItemType.素材, rank:0, drop:ItemDrop.TREE})}
    };
    export const                         スギ:Item = new class extends Item{
        constructor(){super({uniqueName:"スギ", info:[],
                                type:ItemType.素材, rank:1, drop:ItemDrop.TREE})}
    };
    export const                         ヒノキ:Item = new class extends Item{
        constructor(){super({uniqueName:"ヒノキ", info:[],
                                type:ItemType.素材, rank:1, drop:ItemDrop.TREE})}
    };
    export const                         赤松:Item = new class extends Item{
        constructor(){super({uniqueName:"赤松", info:[],
                                type:ItemType.素材, rank:1, drop:ItemDrop.TREE})}
    };
    export const                         無法松:Item = new class extends Item{
        constructor(){super({uniqueName:"無法松", info:["通りすがりのたい焼き屋サン"],
                                type:ItemType.素材, rank:8, drop:ItemDrop.TREE})}
    };
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
}
