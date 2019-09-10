import { Util, Place, PlayData, SceneType } from "../util.js";
import { Btn } from "../widget/btn.js";
import { Dungeon } from "./dungeon.js";
import { Scene, cwait, wait } from "../undym/scene.js";
import { TownScene } from "../scene/townscene.js";
import { Item, ItemDrop } from "../item.js";
import { ILayout, YLayout, XLayout, VariableLayout, FlowLayout } from "../undym/layout.js";
import { Color } from "../undym/type.js";
import { Unit, Prm } from "../unit.js";
import { FX, FX_Advance, FX_Return } from "../fx/fx.js";
import { Battle, BattleType, BattleResult } from "../battle.js";
import { BattleScene } from "../scene/battlescene.js";
import DungeonScene from "../scene/dungeonscene.js";
import { ItemScene } from "../scene/itemscene.js";
import { Targeting, Dmg } from "../force.js";
import { Img } from "../graphics/graphics.js";
import { SaveData } from "../savedata.js";
import { Input } from "../undym/input.js";


export abstract class DungeonEvent{
    static _values:DungeonEvent[] = [];
    static values():ReadonlyArray<DungeonEvent>{
        return this._values;
    }

    static now:DungeonEvent;

    private img:Img;
    getImg():Img{return this.img ? this.img : (this.img = this.createImg());}
    protected createImg():Img{return Img.empty;}
    
    abstract createBtnLayout():ILayout;

    protected constructor(){
        DungeonEvent._values.push(this);
    }

    async happen(){
        DungeonEvent.now = this;
        await this.happenInner();
    }
    protected abstract happenInner():void;
    
    isZoomImg():boolean{return true;}



}



export namespace DungeonEvent{
    export const empty:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        happenInner = ()=>{Util.msg.set("");};
        createBtnLayout = ()=> createDefLayout();
    };
    export const BOX:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        createImg = ()=> new Img("img/box.png");
        happenInner = async()=>{Util.msg.set("宝箱だ")};
        createBtnLayout = ()=> createDefLayout()
                                .set(ReturnBtn.index, new Btn("開ける", async()=>{
                                    await DungeonEvent.OPEN_BOX.happen();
                                }))
                                ;
    };
    export const OPEN_BOX:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        createImg = ()=> new Img("img/box_open.png");
        isZoomImg = ()=> false;
        happenInner = async()=>{
            let openNum = 1;
            let openBoost = 0.3;
            while(Math.random() <= openBoost){
                openNum++;
                openBoost /= 2;
            }
            let baseRank = Dungeon.now.rank / 2;
            for(let i = 0; i < openNum; i++){
                const itemRank = Item.fluctuateRank( baseRank );
                let item = Item.rndItem( ItemDrop.BOX, itemRank );
                let addNum = 1;
                item.add( addNum );

                if(i < openNum - 1){
                    await wait();
                }
            }

            if(Math.random() < 0.15){
                const trends = Dungeon.now.trendItems;
                if(trends.length > 0){
                    const item = trends[ (Math.random() * trends.length)|0 ];
                    await wait();
                    item.add(1);
                }
            }
        };
        createBtnLayout = DungeonEvent.empty.createBtnLayout;
    };
    export const TREASURE:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        createImg = ()=> new Img("img/treasure.png");
        happenInner = async()=>{
            Util.msg.set("財宝の箱だ！")
        };
        createBtnLayout = ()=> createDefLayout()
                                .set(ReturnBtn.index, new Btn("開ける", async()=>{
                                    if(Dungeon.now.treasureKey.num > 0){
                                        Dungeon.now.treasureKey.num--;
                                        await DungeonEvent.OPEN_TREASURE.happen();
                                    }else{
                                        Util.msg.set("鍵を持っていない");
                                    }
                                }))
                                ;
    };
    export const OPEN_TREASURE:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        createImg = ()=> new Img("img/treasure_open.png");
        happenInner = async()=>{
            await Dungeon.now.treasure.add(1);
        };
        createBtnLayout = DungeonEvent.empty.createBtnLayout;
    };
    export const GET_TREASURE_KEY:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        happenInner = async()=>{
            await Dungeon.now.treasureKey.add(1);
        };
        createBtnLayout = DungeonEvent.empty.createBtnLayout;
    };
    export const TRAP:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        createImg = ()=> new Img("img/trap.png");
        happenInner = ()=>{
            Util.msg.set("罠だ");
        };
        createBtnLayout = ()=> createDefLayout()
                                .set(ReturnBtn.index, new Btn("解除", async()=>{
                                    await  DungeonEvent.TRAP_BROKEN.happen();
                                }))
                                .set(AdvanceBtn.index, new Btn("進む", async()=>{
                                    Util.msg.set("引っかかった！", Color.RED); await wait();

                                    for(let p of Unit.players){
                                        if(!p.exists || p.dead){continue;}

                                        const dmg = new Dmg({absPow: p.prm(Prm.MAX_HP).total / 5});
                                        await p.doDmg(dmg); await wait();
                                        await p.judgeDead();
                                    }

                                    DungeonEvent.empty.happen();
                                }).dontMove())
                                ;
    };
    export const TRAP_BROKEN:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        createImg = ()=> new Img("img/trap_broken.png");
        isZoomImg = ()=> false;
        happenInner = ()=>{
            Util.msg.set("解除した");
        };
        createBtnLayout = DungeonEvent.empty.createBtnLayout;
    };
    export const REST:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        happenInner = async()=>{
            Util.msg.set("休めそうな場所がある...");
        };
        createBtnLayout = ()=> createDefLayout()
                                .set(ReturnBtn.index, new Btn("休む", async()=>{
                                    for(const p of Unit.players){
                                        if(p.exists && !p.dead){
                                            Battle.healHP(p, p.prm(Prm.MAX_HP).total * 0.2);
                                            Battle.healMP(p, p.prm(Prm.MAX_MP).total * 0.2);
                                        }
                                    }
                                    DungeonEvent.empty.happen();
                                }))
                                ;
    };
    export const TREE:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        createImg = ()=> new Img("img/tree.png");
        happenInner = ()=>{
            Util.msg.set("木だ");
        };
        createBtnLayout = ()=> createDefLayout()
                                .set(ReturnBtn.index, new Btn("切る", async()=>{
                                    await DungeonEvent.TREE_BROKEN.happen();
                                }))
                                .set(AdvanceBtn.index, new Btn("進む", async()=>{
                                    Util.msg.set("いてっ！", Color.RED); await wait();

                                    for(let p of Unit.players){
                                        if(!p.exists || p.dead){continue;}

                                        const dmg = new Dmg({absPow: p.prm(Prm.MAX_HP).total / 10});
                                        await p.doDmg(dmg); await wait();
                                        await p.judgeDead();
                                    }
                                }).dontMove())
                                ;
    };
    export const TREE_BROKEN:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        createImg = ()=> new Img("img/tree_broken.png");
        isZoomImg = ()=> false;
        happenInner = async()=>{
            let openNum = 1;
            let openBoost = 0.3;
            while(Math.random() <= openBoost){
                openNum++;
                openBoost /= 2;
            }
            let baseRank = Dungeon.now.rank / 2;
            for(let i = 0; i < openNum; i++){
                const itemRank = Item.fluctuateRank( baseRank );
                let item = Item.rndItem( ItemDrop.TREE, itemRank );
                let addNum = 1;
                item.add( addNum );

                if(i < openNum - 1){
                    await wait();
                }
            }
        };
        createBtnLayout = DungeonEvent.empty.createBtnLayout;
    };
    export const BATTLE:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        happenInner = async()=>{
            Util.msg.set("敵が現れた！");
            Dungeon.now.setEnemy();
            Battle.setup( BattleType.NORMAL, (result)=>{
                switch(result){
                    case BattleResult.WIN:
                        SaveData.save();
                        Scene.load( DungeonScene.ins );
                        break;
                    case BattleResult.LOSE:
                        DungeonEvent.ESCAPE_DUNGEON.happen();
                        break;
                    case BattleResult.ESCAPE:
                        Scene.load( DungeonScene.ins );
                        break;
                }
            });
            Scene.load( BattleScene.ins );
        };
        createBtnLayout = DungeonEvent.empty.createBtnLayout;
    };
    export const BOSS_BATTLE:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        happenInner = async()=>{
            Util.msg.set(`[${Dungeon.now}]のボスが現れた！`, Color.WHITE.bright);
            Dungeon.now.setBoss();
            Battle.setup( BattleType.BOSS, async(result)=>{
                switch(result){
                    case BattleResult.WIN:
                        await DungeonEvent.CLEAR_DUNGEON.happen();
                        break;
                    case BattleResult.LOSE:
                        await DungeonEvent.ESCAPE_DUNGEON.happen();
                        break;
                    case BattleResult.ESCAPE:
                        await DungeonEvent.ESCAPE_DUNGEON.happen();
                        break;
                }
            });
            Scene.load( BattleScene.ins );
        };
        createBtnLayout = DungeonEvent.empty.createBtnLayout;
    };
    export const ESCAPE_DUNGEON:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        happenInner = async()=>{

            Util.msg.set(`${Dungeon.now.toString()}を脱出します...`); await cwait(); await wait();
            
            Scene.load( TownScene.ins );
            
            SaveData.save();
        };
        createBtnLayout = ()=> ILayout.empty;
    };
    export const CLEAR_DUNGEON:DungeonEvent = new class extends DungeonEvent{
        constructor(){super();}
        happenInner = async()=>{
            let yen = Dungeon.now.au * (Dungeon.now.enemyLv / 10 + 1) * (1 + Dungeon.now.clearNum * 0.02);
            yen = yen|0;
    
            Dungeon.now.clearNum++;
            Util.msg.set(`[${Dungeon.now}]を踏破した！`, Color.WHITE.bright); await cwait();
    
            PlayData.yen += yen;
            Util.msg.set(`報奨金${yen}円入手`, Color.YELLOW.bright); await cwait();

            Dungeon.now.dungeonClearItem.add(1); await cwait();

            await Dungeon.now.dungeonClearEvent();
            
            DungeonEvent.ESCAPE_DUNGEON.happen();
        };
        createBtnLayout = ()=> ILayout.empty;
    };
}




const createDefLayout = ()=>{
    //0,1,2,
    //3,4,5,
    return new FlowLayout(3,2)
            .set(ItemBtn.index, ItemBtn.ins)
            .set(ReturnBtn.index, ReturnBtn.ins)
            .set(AdvanceBtn.index, AdvanceBtn.ins)
            ;
};

class AdvanceBtn{
    static get index(){return 1;}

    private static _ins:Btn;
    static get ins():Btn{
        if(!this._ins){
            this._ins = new Btn(()=>"進む", async()=>{
                FX_Advance( Place.MAIN );

                Dungeon.auNow += 1;
                if(Dungeon.auNow >= Dungeon.now.au){
                    Dungeon.auNow = Dungeon.now.au;

                    await DungeonEvent.BOSS_BATTLE.happen();
                    return;
                }
    
                await Dungeon.now.rndEvent().happen();
            });
        }
        return this._ins;
    }
}


class ReturnBtn{
    static get index(){return 4;}
    
    private static _ins:Btn;
    static get ins():Btn{
        if(!this._ins){
            this._ins = new Btn(()=>"戻る", async()=>{
                FX_Return( Place.MAIN );
                Dungeon.auNow -= 1;
                if(Dungeon.auNow < 0){
                    Dungeon.auNow = 0;
                    await DungeonEvent.ESCAPE_DUNGEON.happen();
                    return;
                }
    
                await Dungeon.now.rndEvent().happen();
            });
        }
        return this._ins;
    }
}


class ItemBtn{
    static get index(){return 3;}

    private static _ins:Btn;
    static get ins():Btn{
        if(!this._ins){
            this._ins = new Btn(()=>"アイテム", async()=>{
                Scene.load( ItemScene.ins({
                    selectUser:true,
                    user:Unit.players[0],
                    use:async(item,user)=>{
                        if(item.targetings & Targeting.SELECT){
                            await item.use( user, [user] );
                        }else{
                            let targets = Targeting.filter( item.targetings, user, Unit.players, /*num*/1 );
                            
                            if(targets.length > 0){
                                await item.use( user, targets );
                            }
                        }
                    },
                    returnScene:()=>{
                       Scene.set( DungeonScene.ins );
                    }, 
                }));
            });
        }
        return this._ins;
    }
}
