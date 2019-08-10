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
import DungeonEvent from "./dungeon/dungeonevent.js";
import { SaveData } from "./savedata.js";




export class ItemType{
    protected _values:Item[];

    private constructor(name:string){
        this.toString = ()=>name;
    }

    values():ReadonlyArray<Item>{
        if(this._values === undefined){
            this._values = Item.values()
                                .filter(item=> item.itemType === this);
        }
        return this._values;
    };

    static readonly HP回復 = new ItemType("HP回復");
    static readonly MP回復 = new ItemType("MP回復");
    
    static readonly その他 = new ItemType("その他");

    static readonly 鍵 = new ItemType("鍵");
    static readonly 玉 = new ItemType("玉");
    static readonly 素材 = new ItemType("素材");
}


export class ItemParentType{
    private static _values:ItemParentType[] = [];
    static values():ReadonlyArray<ItemParentType>{return this._values;}


    private constructor(
        name:string
        ,public readonly children:ReadonlyArray<ItemType>
    ){
        this.toString = ()=>name;

        ItemParentType._values.push(this);
    }

    static readonly 回復 = new ItemParentType("回復", [ItemType.HP回復, ItemType.MP回復]);
    static readonly その他 = new ItemParentType("その他", [ItemType.その他]);
    static readonly 素材 = new ItemParentType("素材", [ItemType.鍵, ItemType.玉, ItemType.素材]);
}


export class Item implements Action, Num{
    private static _values:Item[] = [];
    static values():ReadonlyArray<Item>{
        return this._values;
    }

    private static _rankValues:{[key:number]:Item[];} = {};
    static rankValues(rank:number):ReadonlyArray<Item>|undefined{
        return this._rankValues[rank];
    }


    private static _consumableValues:Item[] = [];
    static consumableValues():ReadonlyArray<Item>{
        return this._consumableValues;
    }
    /**
     * 宝箱から出る指定ランクのアイテムを返す。そのランクにアイテムが存在しなければランクを一つ下げて再帰する。
     * @param rank 
     */
    static rndBoxRankItem(rank:number):Item{
        const values = this.rankValues(rank);
        if(!values){
            if(rank <= 0){return Item.石;}
            return this.rndBoxRankItem(rank-1);
        }

        for(let i = 0; i < 7; i++){
            let tmp = choice( values );
            if(tmp.box && tmp.rank <= rank && tmp.num < tmp.numLimit){
                return tmp;
            }
        }
        return Item.石;
    }

    static fluctuateRank(baseRank:number, passProbability = 0.3){
        let add = 0;

        while(Math.random() <= passProbability){
            add++;
        }

        if(Math.random() <= 0.5){
            return baseRank + add;
        }else{
            const res = baseRank - add;
            return res >= 0 ? res : 0 ;
        }
    }

    static readonly DEF_NUM_LIMIT = 999;

    num:number = 0;
    totalGetNum:number = 0;
    /**所持上限. */
    numLimit:number;
    /**そのダンジョン内で使用した数. */
    usedNum:number = 0;

    readonly uniqueName:string;
    readonly info:string[];
    readonly itemType:ItemType;
    readonly rank:number;
    /**宝箱から出るか。 */
    readonly box:boolean;
    readonly targetings:number;
    readonly consumable:boolean;

    protected useInner:(user:Unit, target:Unit)=>void;

    
    get mix():Mix|undefined{return this._mix ? this._mix : (this._mix = this.createMix());}
    private _mix:Mix|undefined;
    protected createMix():Mix|undefined{return undefined;}
    
    constructor(args:{
        uniqueName:string,
        info:string[],
        type:ItemType,
        rank:number,
        box:boolean,
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
        this.box = args.box;

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
        if(Item._rankValues[this.rank] === undefined){
            Item._rankValues[this.rank] = [];
        }
        Item._rankValues[this.rank].push(this);

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
        if(this.num <= 0 || this.usedNum >= this.num){return;}

        for(let t of targets){
            await this.useInner(user, t);
        }
        
        if(this.consumable) {this.usedNum++;}
        else                {this.num--;}
    }

    canUse(){
        if(this.useInner === undefined){return false;}
        if(this.num - this.usedNum <= 0){return false;}
        return true;
    }
    //-----------------------------------------------------------------
    //
    //HP回復
    //
    //-----------------------------------------------------------------
    static readonly                      スティックパン = new class extends Item{
        constructor(){super({uniqueName:"スティックパン", info:["HP+10"],
                                type:ItemType.HP回復, rank:0, box:false,
                                consumable:true,
                                use:async(user,target)=> await healHP(target, 10),
        })}
    };
    static readonly                      硬化スティックパン = new class extends Item{
        constructor(){super({uniqueName:"硬化スティックパン", info:["HP+10%"],
                                type:ItemType.HP回復, rank:0, box:false,
                                consumable:true,
                                use:async(user,target)=>await healHP(target, target.prm(Prm.MAX_HP).total() / 10),
        })}
        createMix(){return new Mix({
            result:[this, 1],
            limit:()=>5,
            materials:[[Item.石, 5], [Item.土, 5]],
        });}
    };
    //-----------------------------------------------------------------
    //
    //MP回復
    //
    //-----------------------------------------------------------------
    static readonly                      赤い水 = new class extends Item{
        constructor(){super({uniqueName:"赤い水", info:["MP+10"],
                                type:ItemType.MP回復, rank:0, box:false,
                                consumable:true,
                                use:async(user,target)=> await healMP(target, 10),
        })}
        createMix(){return new Mix({
            result:[this, 1],
            limit:()=>5,
            materials:[[Item.水, 5], [Item.土, 1]],
        });}
    };
    //-----------------------------------------------------------------
    //
    //その他
    //
    //-----------------------------------------------------------------
    static readonly                      脱出ポッド = new class extends Item{
        constructor(){super({uniqueName:"脱出ポッド", info:["ダンジョンから脱出する"],
                                type:ItemType.その他, rank:0, box:false,
                                consumable:true,
                                use:async(user,target)=>{
                                    await DungeonEvent.ESCAPE_DUNGEON.happen();
                                },
        })}
        canUse(){
            return super.canUse() && SceneType.now === SceneType.DUNGEON;
        }
    };
    static readonly                      記録用粘土板 = new class extends Item{
        constructor(){super({uniqueName:"記録用粘土板", info:["ダンジョン内でセーブする"],
                                type:ItemType.その他, rank:0, box:false,
                                consumable:true,
                                use:async(user,target)=>{
                                    SaveData.save();
                                },
        })}
        createMix(){return new Mix({
            result:[this, 1],
            limit:()=>1,
            materials:[[Item.石, 3], [Item.土, 3], [Item.枝, 3]],

        });}
        canUse(){
            return super.canUse() && SceneType.now === SceneType.DUNGEON;
        }
    };
    //-----------------------------------------------------------------
    //
    //鍵
    //
    //-----------------------------------------------------------------
    static readonly                      はじまりの丘の鍵 = new class extends Item{
        constructor(){super({uniqueName:"はじまりの丘の鍵", info:[""],
                                type:ItemType.鍵, rank:0, box:false})}
    };
    static readonly                      丘の上の鍵 = new class extends Item{
        constructor(){super({uniqueName:"丘の上の鍵", info:[""],
                                type:ItemType.鍵, rank:0, box:false})}
    };
    //-----------------------------------------------------------------
    //
    //玉
    //
    //-----------------------------------------------------------------
    static readonly                      はじまりの丘の玉 = new class extends Item{
        constructor(){super({uniqueName:"はじまりの丘の玉", info:[""],
                                type:ItemType.玉, rank:0, box:false})}
    };
    static readonly                      丘の上の玉 = new class extends Item{
        constructor(){super({uniqueName:"丘の上の玉", info:[""],
                                type:ItemType.玉, rank:0, box:false})}
    };
    //-----------------------------------------------------------------
    //
    //素材
    //
    //-----------------------------------------------------------------
    static readonly                      石 = new class extends Item{
        constructor(){super({uniqueName:"石", info:["いし"],
                                type:ItemType.素材, rank:0, box:true})}
    };
    static readonly                      枝 = new class extends Item{
        constructor(){super({uniqueName:"枝", info:["えだ"],
                                type:ItemType.素材, rank:0, box:true})}
    };
    static readonly                      土 = new class extends Item{
        constructor(){super({uniqueName:"土", info:["つち"],
                                type:ItemType.素材, rank:0, box:true})}
    };
    static readonly                      水 = new class extends Item{
        constructor(){super({uniqueName:"水", info:["水"],
                                type:ItemType.素材, rank:0, box:true})}
    };
    static readonly                      He = new class extends Item{
        constructor(){super({uniqueName:"He", info:["ヘェッ"],
                                type:ItemType.素材, rank:2, box:true})}
    };
    static readonly                      少女の心を持ったおっさん = new class extends Item{
        constructor(){super({uniqueName:"少女の心を持ったおっさん", info:["いつもプリキュアの話をしている"],
                                type:ItemType.素材, rank:5, box:true})}
    };
    static readonly                      しいたけ = new class extends Item{
        constructor(){super({uniqueName:"しいたけ", info:[""],
                                type:ItemType.素材, rank:0, box:false})}
    };
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
}

class ItemFont{
    private static _font:Font;
    static get font(){
        if(!this._font){
            this._font = new Font(30, Font.BOLD);
        }
        return this._font;
    }
}


const healHP = async(target:Unit, value:number)=>{
    value = value|0;
    target.hp += value;

    FX_RotateStr(ItemFont.font, `${value}`, target.bounds.center, Color.GREEN);
    Util.msg.set(`${target.name}のHPが${value}回復した`, Color.GREEN.bright); await wait();
};


const healMP = async(target:Unit, value:number)=>{
    value = value|0;
    target.mp += value;

    FX_RotateStr(ItemFont.font, `${value}`, target.bounds.center, Color.PINK);
    Util.msg.set(`${target.name}のMPが${value}回復した`, Color.GREEN.bright); await wait();
};