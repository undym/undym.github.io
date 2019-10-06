import { Dungeon } from "./dungeon/dungeon.js";
import { Util, SceneType } from "./util.js";
import { Color, Point } from "./undym/type.js";
import { Scene, wait } from "./undym/scene.js";
import { Unit, Prm, PUnit } from "./unit.js";
import { FX_Str, FX_RotateStr } from "./fx/fx.js";
import { Targeting, Action } from "./force.js";
import { randomInt, choice } from "./undym/random.js";
import { Font } from "./graphics/graphics.js";
import { Num, Mix } from "./mix.js";
import { DungeonEvent } from "./dungeon/dungeonevent.js";
import { SaveData } from "./savedata.js";
import DungeonScene from "./scene/dungeonscene.js";
import { Battle } from "./battle.js";
import { Tec } from "./tec.js";




export class ItemType{
    protected _values:Item[];

    private constructor(name:string){
        this.toString = ()=>name;
    }

    get values():ReadonlyArray<Item>{
        if(!this._values){
            this._values = Item.values
                                .filter(item=> item.itemType === this);
        }
        return this._values;
    };

    static readonly 蘇生 = new ItemType("蘇生");
    static readonly HP回復 = new ItemType("HP回復");
    static readonly MP回復 = new ItemType("MP回復");
    
    static readonly ダンジョン = new ItemType("ダンジョン");
    static readonly 竿 = new ItemType("竿");
    static readonly 弾 = new ItemType("弾");
    
    static readonly ドーピング = new ItemType("ドーピング");
    static readonly 書 = new ItemType("書");

    static readonly メモ = new ItemType("メモ");
    static readonly 素材 = new ItemType("素材");
    static readonly 固有素材 = new ItemType("固有素材");
    static readonly 合成素材 = new ItemType("合成素材");
    static readonly 植物 = new ItemType("植物");
    static readonly 土 = new ItemType("土");
    static readonly 水 = new ItemType("水");
    static readonly 魚 = new ItemType("魚");
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
    static readonly ダンジョン  = new ItemParentType("ダンジョン", [ItemType.ダンジョン, ItemType.竿, ItemType.弾]);
    static readonly 強化       = new ItemParentType("強化", [ItemType.ドーピング, ItemType.書]);
    static readonly その他     = new ItemParentType("その他",    [
                                                                    ItemType.メモ, ItemType.素材, ItemType.固有素材,
                                                                    ItemType.合成素材, ItemType.植物, ItemType.土, ItemType.水,
                                                                    ItemType.魚,
                                                                ]);
}

export enum ItemDrop{
    NO      = 0,
    BOX     = 1 << 0,
    TREE    = 1 << 1,
    STRATUM = 1 << 2,
    LAKE    = 1 << 3,
    FISHING = 1 << 4,
}
// export const ItemDrop = {
//     get NO()  {return 0;},
//     get BOX() {return 1 << 0;},
//     get TREE(){return 1 << 1;},
//     get DIG() {return 1 << 2;},
// }

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
            const typeValues = this.values.filter(item=> item.dropTypes & dropType);
            this._dropTypeValues.set(dropType, new ItemValues(typeValues));
        }

        const itemValues = this._dropTypeValues.get(dropType);
        if(itemValues){
            const rankValues = itemValues.get(rank);
            if(rankValues){
                for(let i = 0; i < 10; i++){
                    let tmp = choice( rankValues );
                    if(tmp.num < tmp.numLimit){return tmp;}
                }
            }

            if(rank <= 0){return Item.石;}
            return this.rndItem(dropType, rank-1);
        }
        
        return Item.石;
    }
    /**
     * return res > 0 ? res : 0;
     * */
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


    static readonly DEF_NUM_LIMIT = 9999;


    num:number = 0;
    totalGetCount:number = 0;
    /**残り使用回数。*/
    remainingUseNum:number = 0;

    get uniqueName():string {return this.args.uniqueName;}
    get info():string       {return this.args.info;}
    get itemType():ItemType {return this.args.type;}
    get rank():number       {return this.args.rank;}
    get targetings():number {return this.args.targetings ? this.args.targetings : Targeting.SELECT;}
    get consumable():boolean{return this.args.consumable ? this.args.consumable : false;}
    /**所持上限. */
    get numLimit():number   {return this.args.numLimit ? this.args.numLimit : Item.DEF_NUM_LIMIT;}
    get dropTypes():number  {return this.args.drop;}

    
    protected constructor(
        private args:{
            uniqueName:string,
            info:string,
            type:ItemType,
            rank:number,
            drop:number,
            targetings?:number,
            numLimit?:number,
            consumable?:boolean,
            use?:(user:Unit,target:Unit)=>void,
        }
    ){
        
        if(args.consumable){
            Item._consumableValues.push(this);
        }

        Item._values.push(this);

    }

    toString():string{return this.uniqueName;}

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
        if(!this.canUse(user, targets)){return;}

        for(let t of targets){
            await this.useInner(user, t);
        }
        
        if(this.consumable) {this.remainingUseNum--;}
        else                {this.num--;}
    }

    protected async useInner(user:Unit, target:Unit){
        if(this.args.use){await this.args.use(user, target);}
    }

    canUse(user:Unit, targets:Unit[]){
        if(!this.args.use){return false;}
        if(this.consumable && this.remainingUseNum <= 0){return false;}
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
        constructor(){super({uniqueName:"サンタクララ薬", info:"一体をHP1で蘇生",
                                type:ItemType.蘇生, rank:0,
                                consumable:true, drop:ItemDrop.NO,
                                use:async(user,target)=>{
                                    if(target.dead){
                                        target.dead = false;
                                        target.hp = 0;
                                        Unit.healHP(target, 1);
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
        constructor(){super({uniqueName:"スティックパン", info:"HP+5%+20",
                                type:ItemType.HP回復, rank:0,
                                consumable:true, drop:ItemDrop.NO,
                                use:async(user,target)=>{
                                    const value = target.prm(Prm.MAX_HP).total * 0.05 + 20;
                                    Unit.healHP(target, value);
                                    if(SceneType.now === SceneType.BATTLE){
                                        Util.msg.set(`${target.name}のHPが${value|0}回復した`, Color.GREEN.bright); await wait();
                                    }
                                },
        })}
    };
    export const                         硬化スティックパン:Item = new class extends Item{
        constructor(){super({uniqueName:"硬化スティックパン", info:"HP+5%+50",
                                type:ItemType.HP回復, rank:0,
                                consumable:true, drop:ItemDrop.NO,
                                use:async(user,target)=>{
                                    const value = target.prm(Prm.MAX_HP).total * 0.05 + 50;
                                    Unit.healHP(target, value);
                                    if(SceneType.now === SceneType.BATTLE){
                                        Util.msg.set(`${target.name}のHPが${value|0}回復した`, Color.GREEN.bright); await wait();
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
        constructor(){super({uniqueName:"赤い水", info:"MP+10%+5",
                                type:ItemType.MP回復, rank:0,
                                consumable:true, drop:ItemDrop.NO,
                                use:async(user,target)=>{
                                    const value = target.prm(Prm.MAX_MP).total * 0.05 + 5;
                                    Unit.healMP(target, value)
                                    if(SceneType.now === SceneType.BATTLE){
                                        Util.msg.set(`${target.name}のMPが${value|0}回復した`, Color.GREEN.bright); await wait();
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
        constructor(){super({uniqueName:"脱出ポッド", info:"ダンジョンから脱出する",
                                type:ItemType.ダンジョン, rank:0,
                                consumable:true, drop:ItemDrop.NO,
                                use:async(user,target)=>{
                                    Scene.load( DungeonScene.ins );
                                    await DungeonEvent.ESCAPE_DUNGEON.happen();
                                },
        })}
        canUse(user:Unit, targets:Unit[]){
            return super.canUse( user, targets ) && SceneType.now === SceneType.DUNGEON;
        }
    };
    //-----------------------------------------------------------------
    //
    //竿
    //
    //-----------------------------------------------------------------
    export const                         ボロい釣竿:Item = new class extends Item{//shop
        constructor(){super({uniqueName:"ボロい釣竿", info:"釣りに使用　稀に壊れる",
                                type:ItemType.竿, rank:10, drop:ItemDrop.NO,})}
    };
    export const                         マーザン竿:Item = new class extends Item{//shop
        constructor(){super({uniqueName:"マーザン竿", info:"釣りに使用　稀に壊れる Rank+0.5",
                                type:ItemType.竿, rank:10, drop:ItemDrop.NO,})}
    };
    //-----------------------------------------------------------------
    //
    //弾
    //
    //-----------------------------------------------------------------
    export const                         散弾:Item = new class extends Item{
        constructor(){super({uniqueName:"散弾", info:"ショットガンに使用",
                                type:ItemType.弾, rank:10, consumable:true, drop:ItemDrop.NO,})}
    };
    export const                         夜叉の矢:Item = new class extends Item{
        constructor(){super({uniqueName:"夜叉の矢", info:"ヤクシャに使用",
                                type:ItemType.弾, rank:10, consumable:true, drop:ItemDrop.NO,})}
    };
    //-----------------------------------------------------------------
    //
    //ドーピング
    //
    //-----------------------------------------------------------------
    export const                         いざなみの命:Item = new class extends Item{
        constructor(){super({uniqueName:"いざなみの命", info:"最大HP+2",
                                type:ItemType.ドーピング, rank:10, drop:ItemDrop.BOX,
                                use:async(user,target)=>{
                                    target.prm(Prm.MAX_HP).base += 2;
                                    FX_Str(Font.def, `${target.name}の最大HP+2`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;}
    };
    export const                         おおげつ姫:Item = new class extends Item{
        constructor(){super({uniqueName:"おおげつ姫", info:"最大MP+1",
                                type:ItemType.ドーピング, rank:10, drop:ItemDrop.BOX,
                                use:async(user,target)=>{
                                    target.prm(Prm.MAX_MP).base += 1;
                                    FX_Str(Font.def, `${target.name}の最大MP+1`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;}
    };
    export const                         アラハバキ神:Item = new class extends Item{
        constructor(){super({uniqueName:"アラハバキ神", info:"最大TP+1",
                                type:ItemType.ドーピング, rank:10, drop:ItemDrop.BOX,
                                use:async(user,target)=>{
                                    target.prm(Prm.MAX_TP).base += 1;
                                    FX_Str(Font.def, `${target.name}の最大TP+1`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;}
    };
    export const                         この花咲くや姫:Item = new class extends Item{
        constructor(){super({uniqueName:"この花咲くや姫", info:"力+1",
                                type:ItemType.ドーピング, rank:10, drop:ItemDrop.BOX,
                                use:async(user,target)=>{
                                    target.prm(Prm.STR).base += 1;
                                    FX_Str(Font.def, `${target.name}の力+1`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;}
    };
    export const                         つくよみの命:Item = new class extends Item{
        constructor(){super({uniqueName:"つくよみの命", info:"魔+1",
                                type:ItemType.ドーピング, rank:10, drop:ItemDrop.BOX,
                                use:async(user,target)=>{
                                    target.prm(Prm.MAG).base += 1;
                                    FX_Str(Font.def, `${target.name}の魔+1`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;}
    };
    export const                         よもつおお神:Item = new class extends Item{
        constructor(){super({uniqueName:"よもつおお神", info:"光+1",
                                type:ItemType.ドーピング, rank:10, drop:ItemDrop.BOX,
                                use:async(user,target)=>{
                                    target.prm(Prm.LIG).base += 1;
                                    FX_Str(Font.def, `${target.name}の光+1`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;}
    };
    export const                         わたつみの神:Item = new class extends Item{
        constructor(){super({uniqueName:"わたつみの神", info:"闇+1",
                                type:ItemType.ドーピング, rank:10, drop:ItemDrop.BOX,
                                use:async(user,target)=>{
                                    target.prm(Prm.DRK).base += 1;
                                    FX_Str(Font.def, `${target.name}の闇+1`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;}
    };
    export const                         へつなぎさびこの神:Item = new class extends Item{
        constructor(){super({uniqueName:"へつなぎさびこの神", info:"鎖+1",
                                type:ItemType.ドーピング, rank:10, drop:ItemDrop.BOX,
                                use:async(user,target)=>{
                                    target.prm(Prm.CHN).base += 1;
                                    FX_Str(Font.def, `${target.name}の鎖+1`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;}
    };
    export const                         ほのかぐつちの神:Item = new class extends Item{
        constructor(){super({uniqueName:"ほのかぐつちの神", info:"過+1",
                                type:ItemType.ドーピング, rank:10, drop:ItemDrop.BOX,
                                use:async(user,target)=>{
                                    target.prm(Prm.PST).base += 1;
                                    FX_Str(Font.def, `${target.name}の過+1`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;}
    };
    export const                         たけみかづちの命:Item = new class extends Item{
        constructor(){super({uniqueName:"たけみかづちの命", info:"銃+1",
                                type:ItemType.ドーピング, rank:10, drop:ItemDrop.BOX,
                                use:async(user,target)=>{
                                    target.prm(Prm.GUN).base += 1;
                                    FX_Str(Font.def, `${target.name}の銃+1`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;}
    };
    export const                         すさのおの命:Item = new class extends Item{
        constructor(){super({uniqueName:"すさのおの命", info:"弓+1",
                                type:ItemType.ドーピング, rank:10, drop:ItemDrop.BOX,
                                use:async(user,target)=>{
                                    target.prm(Prm.ARR).base += 1;
                                    FX_Str(Font.def, `${target.name}の弓+1`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;}
    };
    //-----------------------------------------------------------------
    //
    //書
    //
    //-----------------------------------------------------------------
    export const                         兵法指南の書:Item = new class extends Item{
        constructor(){super({uniqueName:"兵法指南の書", info:"技のセット可能数を6に増やす",
                                type:ItemType.書, rank:10, drop:ItemDrop.NO,
                                use:async(user,target)=>{
                                    target.tecs.push( Tec.empty );
                                    FX_Str(Font.def, `${target.name}の技セット可能数が6になった`, Point.CENTER, Color.WHITE);
                                },
        })}
        canUse(user:Unit, targets:Unit[]){
            for(const u of targets){
                if(!(u instanceof PUnit && u.tecs.length === 5) ){return false;}
            }
            return super.canUse( user, targets ) && SceneType.now !== SceneType.BATTLE;
        }
    };
    //-----------------------------------------------------------------
    //
    //メモ
    //
    //-----------------------------------------------------------------
    export const                         消耗品のメモ:Item = new class extends Item{
        constructor(){super({uniqueName:"消耗品のメモ", info:"スティックパンなどの一部消耗品はダンジョンに入る度に補充される", 
                                type:ItemType.メモ, rank:0, drop:ItemDrop.BOX, numLimit:1})}
    };
    export const                         夏のメモ:Item = new class extends Item{
        constructor(){super({uniqueName:"夏のメモ", info:"夏はいつ終わるの？", 
                                type:ItemType.メモ, rank:1, drop:ItemDrop.BOX, numLimit:1})}
    };
    export const                         合成許可証:Item = new class extends Item{
        constructor(){super({uniqueName:"合成許可証", info:"合成が解放される", 
                                type:ItemType.メモ, rank:10, drop:ItemDrop.NO, numLimit:1})}
    };
    export const                         パーティースキル取り扱い許可証:Item = new class extends Item{
        constructor(){super({uniqueName:"パーティースキル取り扱い許可証", info:"パーティースキルが解放される", 
                                type:ItemType.メモ, rank:10, drop:ItemDrop.NO, numLimit:1})}
    };
    //-----------------------------------------------------------------
    //
    //素材BoxRank0
    //
    //-----------------------------------------------------------------
    export const                         石:Item = new class extends Item{
        constructor(){super({uniqueName:"石", info:"",
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    export const                         少女の心を持ったおっさん:Item = new class extends Item{
        constructor(){super({uniqueName:"少女の心を持ったおっさん", info:"いつもプリキュアの話をしている",
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    export const                         紙:Item = new class extends Item{
        constructor(){super({uniqueName:"紙", info:"",
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    export const                         しいたけ:Item = new class extends Item{
        constructor(){super({uniqueName:"しいたけ", info:"",
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    export const                         葛:Item = new class extends Item{
        constructor(){super({uniqueName:"葛", info:"",
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    export const                         短針:Item = new class extends Item{
        constructor(){super({uniqueName:"短針", info:"",
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    export const                         草:Item = new class extends Item{
        constructor(){super({uniqueName:"草", info:"",
                                type:ItemType.素材, rank:0, drop:ItemDrop.BOX})}
    };
    //-----------------------------------------------------------------
    //
    //素材BoxRank1
    //
    //-----------------------------------------------------------------
    export const                         朽ち果てた鍵:Item = new class extends Item{
        constructor(){super({uniqueName:"朽ち果てた鍵", info:"",
                                type:ItemType.素材, rank:1, drop:ItemDrop.BOX})}
    };
    export const                         エネルギー:Item = new class extends Item{
        constructor(){super({uniqueName:"エネルギー", info:"触るとビリビリする",
                                type:ItemType.素材, rank:1, drop:ItemDrop.BOX})}
    };
    export const                         ひも:Item = new class extends Item{
        constructor(){super({uniqueName:"ひも", info:"",
                                type:ItemType.素材, rank:1, drop:ItemDrop.BOX})}
    };
    export const                         消えない炎:Item = new class extends Item{
        constructor(){super({uniqueName:"消えない炎", info:"たまに消える",
                                type:ItemType.素材, rank:1, drop:ItemDrop.BOX})}
    };
    //-----------------------------------------------------------------
    //
    //素材BoxRank2
    //
    //-----------------------------------------------------------------
    export const                         He:Item = new class extends Item{
        constructor(){super({uniqueName:"He", info:"",
                                type:ItemType.素材, rank:2, drop:ItemDrop.BOX})}
    };
    export const                         Li:Item = new class extends Item{
        constructor(){super({uniqueName:"Li", info:"",
                                type:ItemType.素材, rank:2, drop:ItemDrop.BOX})}
    };
    export const                         黒い枝:Item = new class extends Item{
        constructor(){super({uniqueName:"黒い枝", info:"とても黒い！！！！！",
                                type:ItemType.素材, rank:2, drop:ItemDrop.BOX})}
    };
    export const                         黒い青空:Item = new class extends Item{
        constructor(){super({uniqueName:"黒い青空", info:"",
                                type:ItemType.素材, rank:2, drop:ItemDrop.BOX})}
    };
    //-----------------------------------------------------------------
    //
    //素材BoxRank3
    //
    //-----------------------------------------------------------------
    export const                         鋼鉄:Item = new class extends Item{
        constructor(){super({uniqueName:"鋼鉄", info:"とてもかたい",
                                type:ItemType.素材, rank:3, drop:ItemDrop.BOX})}
    };
    export const                         おにく:Item = new class extends Item{
        constructor(){super({uniqueName:"おにく", info:"",
                                type:ItemType.素材, rank:3, drop:ItemDrop.BOX})}
    };
    //-----------------------------------------------------------------
    //
    //素材BoxRank4
    //
    //-----------------------------------------------------------------
    export const                         チタン:Item = new class extends Item{
        constructor(){super({uniqueName:"チタン", info:"",
                                type:ItemType.素材, rank:4, drop:ItemDrop.BOX})}
    };
    //-----------------------------------------------------------------
    //
    //固有素材
    //
    //-----------------------------------------------------------------
    export const                         はじまりの丘チール:Item = new class extends Item{
        constructor(){super({uniqueName:"はじまりの丘チール", info:"はじまりの丘をクリアするともらえる記念チール", 
                                type:ItemType.固有素材, rank:10, drop:ItemDrop.NO,})}
    };
    export const                         リテの門チール:Item = new class extends Item{
        constructor(){super({uniqueName:"リ・テの門チール", info:"リテの門をクリアするともらえる記念チール", 
                                type:ItemType.固有素材, rank:10, drop:ItemDrop.NO,})}
    };
    //-----------------------------------------------------------------
    //
    //合成素材
    //
    //-----------------------------------------------------------------
    export const                         布:Item = new class extends Item{
        constructor(){super({uniqueName:"布", info:"",
                                type:ItemType.合成素材, rank:4, drop:ItemDrop.NO})}
    };
    //-----------------------------------------------------------------
    //
    //木
    //
    //-----------------------------------------------------------------
    export const                         枝:Item = new class extends Item{
        constructor(){super({uniqueName:"枝", info:"",
                                type:ItemType.植物, rank:0, drop:ItemDrop.BOX | ItemDrop.TREE})}
    };
    export const                         葉っぱ:Item = new class extends Item{
        constructor(){super({uniqueName:"葉っぱ", info:"",
                                type:ItemType.植物, rank:0, drop:ItemDrop.BOX | ItemDrop.TREE})}
    };
    export const                         竹:Item = new class extends Item{
        constructor(){super({uniqueName:"竹", info:"",
                                type:ItemType.植物, rank:0, drop:ItemDrop.TREE})}
    };
    export const                         松:Item = new class extends Item{
        constructor(){super({uniqueName:"松", info:"",
                                type:ItemType.植物, rank:0, drop:ItemDrop.TREE})}
    };
    export const                         スギ:Item = new class extends Item{
        constructor(){super({uniqueName:"スギ", info:"",
                                type:ItemType.植物, rank:1, drop:ItemDrop.TREE})}
    };
    export const                         赤松:Item = new class extends Item{
        constructor(){super({uniqueName:"赤松", info:"",
                                type:ItemType.植物, rank:1, drop:ItemDrop.TREE})}
    };
    export const                         ヒノキ:Item = new class extends Item{
        constructor(){super({uniqueName:"ヒノキ", info:"",
                                type:ItemType.植物, rank:2, drop:ItemDrop.TREE})}
    };
    export const                         無法松:Item = new class extends Item{
        constructor(){super({uniqueName:"無法松", info:"通りすがりのたい焼き屋サン",
                                type:ItemType.植物, rank:8, drop:ItemDrop.TREE})}
    };
    //-----------------------------------------------------------------
    //
    //土
    //
    //-----------------------------------------------------------------
    export const                         イズミミズ:Item = new class extends Item{
        constructor(){super({uniqueName:"イズミミズ", info:"",
                                type:ItemType.土, rank:0, drop:ItemDrop.STRATUM})}
    };
    export const                         土:Item = new class extends Item{
        constructor(){super({uniqueName:"土", info:"",
                                type:ItemType.土, rank:0, drop:ItemDrop.BOX | ItemDrop.STRATUM})}
    };
    export const                         銅:Item = new class extends Item{
        constructor(){super({uniqueName:"銅", info:"",
                                type:ItemType.土, rank:1, drop:ItemDrop.BOX | ItemDrop.STRATUM})}
    };
    export const                         黒い石:Item = new class extends Item{
        constructor(){super({uniqueName:"黒い石", info:"",
                                type:ItemType.土, rank:2, drop:ItemDrop.BOX | ItemDrop.STRATUM})}
    };
    export const                         黒い砂:Item = new class extends Item{
        constructor(){super({uniqueName:"黒い砂", info:"",
                                type:ItemType.土, rank:2, drop:ItemDrop.BOX | ItemDrop.STRATUM})}
    };
    export const                         鉄:Item = new class extends Item{
        constructor(){super({uniqueName:"鉄", info:"かたい",
                                type:ItemType.土, rank:2, drop:ItemDrop.BOX | ItemDrop.STRATUM})}
    };
    export const                         岩:Item = new class extends Item{
        constructor(){super({uniqueName:"岩", info:"",
                                type:ItemType.土, rank:3, drop:ItemDrop.BOX | ItemDrop.STRATUM})}
    };
    //-----------------------------------------------------------------
    //
    //水
    //
    //-----------------------------------------------------------------
    export const                         水:Item = new class extends Item{
        constructor(){super({uniqueName:"水", info:"",
                                type:ItemType.水, rank:0, drop:ItemDrop.BOX | ItemDrop.LAKE})}
    };
    export const                         血:Item = new class extends Item{
        constructor(){super({uniqueName:"血", info:"",
                                type:ItemType.水, rank:0, drop:ItemDrop.BOX | ItemDrop.LAKE})}
    };
    export const                         ほぐし水:Item = new class extends Item{
        constructor(){super({uniqueName:"ほぐし水", info:"",
                                type:ItemType.水, rank:1, drop:ItemDrop.BOX | ItemDrop.LAKE})}
    };
    //-----------------------------------------------------------------
    //
    //魚
    //
    //-----------------------------------------------------------------
    export const                         コイキング:Item = new class extends Item{
        constructor(){super({uniqueName:"コイキング", info:"",
                                type:ItemType.魚, rank:0, drop:ItemDrop.FISHING})}
    };
    export const                         かに:Item = new class extends Item{
        constructor(){super({uniqueName:"かに", info:"",
                                type:ItemType.魚, rank:0, drop:ItemDrop.FISHING})}
    };
    export const                         ルアー:Item = new class extends Item{
        constructor(){super({uniqueName:"ルアー", info:"",
                                type:ItemType.魚, rank:0, drop:ItemDrop.FISHING})}
    };
    export const                         あむ:Item = new class extends Item{
        constructor(){super({uniqueName:"あむ", info:"",
                                type:ItemType.魚, rank:0, drop:ItemDrop.FISHING})}
    };
    export const                         はねこ:Item = new class extends Item{
        constructor(){super({uniqueName:"はねこ", info:"",
                                type:ItemType.魚, rank:0, drop:ItemDrop.FISHING})}
    };
    export const                         おじさん:Item = new class extends Item{
        constructor(){super({uniqueName:"おじさん", info:"",
                                type:ItemType.魚, rank:1, drop:ItemDrop.FISHING})}
    };
    export const                         緑亀:Item = new class extends Item{
        constructor(){super({uniqueName:"緑亀", info:"",
                                type:ItemType.魚, rank:1, drop:ItemDrop.FISHING})}
    };
    export const                         タイヤクラゲ:Item = new class extends Item{
        constructor(){super({uniqueName:"タイヤクラゲ", info:"タイヤみたいなクラゲ。けっこう丈夫、食べるとお腹+4",
                                type:ItemType.魚, rank:1, drop:ItemDrop.FISHING})}
    };
    export const                         RANK2:Item = new class extends Item{
        constructor(){super({uniqueName:"RANK2", info:"",
                                type:ItemType.魚, rank:2, drop:ItemDrop.FISHING})}
    };
    export const                         ミソヅケ:Item = new class extends Item{
        constructor(){super({uniqueName:"ミソヅケ", info:"",
                                type:ItemType.魚, rank:2, drop:ItemDrop.FISHING})}
    };
    export const                         ブレインうさぎ:Item = new class extends Item{
        constructor(){super({uniqueName:"ブレインうさぎ", info:"",
                                type:ItemType.魚, rank:2, drop:ItemDrop.FISHING})}
    };
    export const                         魂のない子:Item = new class extends Item{
        constructor(){super({uniqueName:"魂のない子", info:"魂が宿っていない人造人間の子....食べるとお腹+28",
                                type:ItemType.魚, rank:3, drop:ItemDrop.FISHING})}
    };
    export const                         ウェーブコイラバタフラ:Item = new class extends Item{
        constructor(){super({uniqueName:"ウェーブコイラバタフラ", info:"宇宙がビックバンとビッククランチを繰り返す史中を超",
                                type:ItemType.魚, rank:3, drop:ItemDrop.FISHING})}
    };
    export const                         ウェーブコイラバタフライ:Item = new class extends Item{
        constructor(){super({uniqueName:"ウェーブコイラバタフライ", info:"宇宙がビックバンとビッククランチを繰り返す史中を超えて生き続ける超生物....食べるとお腹+26",
                                type:ItemType.魚, rank:4, drop:ItemDrop.FISHING})}
    };
    export const                         メモ:Item = new class extends Item{
        constructor(){super({uniqueName:"メモ", info:"かつてアールエスというゲームで最強と言われたキャラクター",
                                type:ItemType.魚, rank:4, drop:ItemDrop.FISHING})}
    };
    export const                         MMMMM:Item = new class extends Item{
        constructor(){super({uniqueName:"ＭＭＭＭＭ", info:"ＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭＭ",
                                type:ItemType.魚, rank:5, drop:ItemDrop.FISHING})}
    };
    export const                         ペガサス:Item = new class extends Item{
        constructor(){super({uniqueName:"ペガサス", info:"奇妙な踊りを踊る馬",
                                type:ItemType.魚, rank:5, drop:ItemDrop.FISHING})}
    };
    export const                         ドラゴン:Item = new class extends Item{
        constructor(){super({uniqueName:"ドラゴン", info:"VEGA",
                                type:ItemType.魚, rank:5, drop:ItemDrop.FISHING})}
    };
    export const                         ウェポン:Item = new class extends Item{
        constructor(){super({uniqueName:"ウェポン", info:"",
                                type:ItemType.魚, rank:6, drop:ItemDrop.FISHING})}
    };
    export const                         一号:Item = new class extends Item{
        constructor(){super({uniqueName:"一号", info:"",
                                type:ItemType.魚, rank:6, drop:ItemDrop.FISHING})}
    };
    export const                         零号:Item = new class extends Item{
        constructor(){super({uniqueName:"零号", info:"",
                                type:ItemType.魚, rank:6, drop:ItemDrop.FISHING})}
    };
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
}
