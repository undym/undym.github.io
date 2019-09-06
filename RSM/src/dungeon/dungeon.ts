
import { DungeonEvent } from "./dungeonevent.js";
import { Rect } from "../undym/type.js";
import { Job } from "../job.js";
import { Unit, EUnit, Prm } from "../unit.js";
import { Btn } from "../widget/btn.js";
import { Tec } from "../tec.js";
import { Item } from "../item.js";
import { Num } from "../mix.js";
import { Eq } from "../eq.js";
import { Util } from "../util.js";
import { cwait } from "../undym/scene.js";
import { Player } from "../player.js";



class Event{
    static createDef(rank:number){
        const events:[DungeonEvent,number][] = [];
        events.push([DungeonEvent.TREASURE,         0.001]);
        events.push([DungeonEvent.GET_TREASURE_KEY, 0.001]);
        events.push([DungeonEvent.BOX,              0.15]);
        events.push([DungeonEvent.BATTLE,           0.15]);
        events.push([DungeonEvent.TRAP,             0.04]);

        if(rank >= 1){
            events.push([DungeonEvent.TREE,         0.04]);
        }

        events.push([DungeonEvent.REST,             0.04]);

        return new Event(events);
    }


    private events:{ev:DungeonEvent, prob:number}[] = [];
    

    constructor(events:[DungeonEvent,number][]){
        for(const set of events){
            this.events.push( {ev:set[0], prob:set[1]} );
        }
    }


    remove(ev:DungeonEvent):this{
        this.events = this.events.filter(set=> set.ev !== ev);
        return this;
    }

    add(ev:DungeonEvent, prob:number):this{
        this.events.push( {ev:ev, prob:prob} );
        return this;
    }

    addFirst(ev:DungeonEvent, prob:number):this{
        this.events.unshift( {ev:ev, prob:prob} );
        return this;
    }

    rnd():DungeonEvent{
        for(const set of this.events){
            if(Math.random() < set.prob){
                return set.ev;
            }
        }
        return DungeonEvent.empty;
    }
}


export abstract class Dungeon{
    private static _values:Dungeon[] = [];
    static values():ReadonlyArray<Dungeon>{
        return this._values;
    }

    private static _valueOf:Map<string,Dungeon>;
    static valueOf(uniqueName:string){
        if(!this._valueOf){
            this._valueOf = new Map<string,Dungeon>();

            for(const d of this.values()){
                this._valueOf.set( d.uniqueName, d );
            }
        }
        return this._valueOf.get(uniqueName);
    }


    static now:Dungeon;
    static auNow:number = 0;

    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------


    clearNum:number = 0;

    get uniqueName():string{return this.args.uniqueName;}
    get rank():number{return this.args.rank;}
    get enemyLv():number{return this.args.enemyLv;}
    get au():number{return this.args.au;}
    get dungeonClearItem():Num{return this.args.clearItem();}
    get treasure():Num{return this.args.treasure();}
    get treasureKey():Num{return this.args.treasureKey();}
    get trendItems():Item[]{return this.args.trendItems();}

    private event:Event;
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    // private constructor(name:string, protected rank:number, protected enemyLv:number, protected au:number){
    protected constructor(
        private args:{
            uniqueName:string,
            rank:number,
            enemyLv:number,
            au:number,
            clearItem:()=>Num,
            treasure:()=>Num,
            treasureKey:()=>Num,
            trendItems:()=>Item[],
            event?:()=>Event,
        }
    ){

        Dungeon._values.push(this);
    }

    toString():string{return this.args.uniqueName;}
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    abstract isVisible():boolean;
    abstract setBossInner():void;
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    rndEvent():DungeonEvent{
        if(!this.event){
            this.event = this.args.event ? this.args.event() : Event.createDef(this.rank);
        }
        return this.event.rnd();
    }

    rndEnemyNum():number{
        const prob = 1.0 - (this.rank + 4) / (this.rank * this.rank + 5);
        let num = 0;
        for(let i = 0; i < Unit.enemies.length; i++){
            if(Math.random() <= prob){
                num++;
            }
        }
        return num === 0 ? 1 : num;
    }

    setEnemy(){
        let enemyNum = this.rndEnemyNum();
        for(let i = 0; i < enemyNum; i++){
            this.setEnemyInner( Unit.enemies[i], i );
        }
    }

    setEnemyInner(e:EUnit, ordinal:number){
        let lv = (Math.random() * 0.5 + 0.75) * this.enemyLv;
        let job = Job.rndJob(lv);
        job.setEnemy( e, lv );

        e.name += String.fromCharCode("A".charCodeAt(0) + ordinal);
    }

    setBoss(){
        for(let i = 0; i < Unit.enemies.length; i++){
            const e = Unit.enemies[i];
            this.setEnemyInner(e, i);

            e.prm(Prm.MAX_HP).base *= 3;
            e.hp = e.prm(Prm.MAX_HP).total;
            e.ep = Unit.DEF_MAX_EP;
        }

        this.setBossInner();

        for(let e of Unit.enemies){
            e.hp = e.prm(Prm.MAX_HP).total;
        }
    }

    async dungeonClearEvent(){

    }
    

    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
}

export namespace Dungeon{
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    export const                         はじまりの丘:Dungeon = new class extends Dungeon{
        constructor(){super({uniqueName:"はじまりの丘",
                                rank:0, enemyLv:1, au:50,
                                clearItem:()=>Item.はじまりの丘の玉,
                                treasure:()=>Eq.棒,
                                treasureKey:()=>Item.はじまりの丘の鍵,
                                trendItems:()=>[Item.石, Item.土, Item.枝,],
        });}
        isVisible = ()=>true;
        setBossInner = ()=>{
            let e = Unit.enemies[0];
            Job.しんまい.setEnemy(e, e.prm(Prm.LV).base);
            e.name = "聖戦士";
            e.prm(Prm.MAX_HP).base = 15;
            e.prm(Prm.STR).base = 6;
            //ボス以外の雑魚は0体
            for(let i = 1; i < Unit.enemies.length; i++){
                Unit.enemies[i].exists = false;
            }
        };
    };
    export const                         再構成トンネル:Dungeon = new class extends Dungeon{
        constructor(){super({uniqueName:"再構成トンネル",
                                rank:1, enemyLv:3, au:70,
                                clearItem:()=>Item.再構成トンネルの玉,
                                treasure:()=>Eq.安全靴,
                                treasureKey:()=>Item.再構成トンネルの鍵,
                                trendItems:()=>[Item.水],
        });}
        isVisible = ()=>Dungeon.はじまりの丘.clearNum > 0;
        setBossInner = ()=>{
            let e = Unit.enemies[0];
            Job.格闘家.setEnemy(e, e.prm(Prm.LV).base);
            e.name = "幻影";
            e.prm(Prm.MAX_HP).base = 23;
            e.prm(Prm.STR).base = 10;
            //ボス以外の雑魚は1体
            for(let i = 2; i < Unit.enemies.length; i++){
                Unit.enemies[i].exists = false;
            }
        };
        dungeonClearEvent = async()=>{
            if(!Player.よしこ.member){
                Player.よしこ.join();
                Util.msg.set(`よしこが仲間になった`); await cwait();
            }
        };
    };
    export const                         リテの門:Dungeon = new class extends Dungeon{
        constructor(){super({uniqueName:"リ・テの門",
                                rank:1, enemyLv:7, au:70,
                                clearItem:()=>Item.リテの門の玉,
                                treasure:()=>Eq.魔法の杖,
                                treasureKey:()=>Item.リテの門の鍵,
                                trendItems:()=>[Item.朽ち果てた鍵],
        });}
        isVisible = ()=>Dungeon.再構成トンネル.clearNum > 0;
        setBossInner = ()=>{
            let e = Unit.enemies[0];
            Job.魔法使い.setEnemy(e, e.prm(Prm.LV).base);
            e.name = "門番";
            e.prm(Prm.MAX_HP).base = 50;
            e.prm(Prm.STR).base = 7;
            e.prm(Prm.MAG).base = 10;
            //ボス以外の雑魚は2体
            for(let i = 3; i < Unit.enemies.length; i++){
                Unit.enemies[i].exists = false;
            }
        };
    };
    export const                         黒平原:Dungeon = new class extends Dungeon{
        constructor(){super({uniqueName:"黒平原",
                                rank:2, enemyLv:14, au:100,
                                clearItem:()=>Item.黒平原の玉,
                                treasure:()=>Eq.ゲルマンベルト,
                                treasureKey:()=>Item.黒平原の鍵,
                                trendItems:()=>[Item.黒い石, Item.黒い砂],
        });}
        isVisible = ()=>Dungeon.リテの門.clearNum > 0;
        setBossInner = ()=>{
            let e = Unit.enemies[0];
            Job.スネイカー.setEnemy(e, e.prm(Prm.LV).base);
            e.name = "牛";
            e.prm(Prm.MAX_HP).base = 120;
            //ボス以外の雑魚は2体
            for(let i = 3; i < Unit.enemies.length; i++){
                Unit.enemies[i].exists = false;
            }
        };
    };
    export const                         黒遺跡:Dungeon = new class extends Dungeon{
        constructor(){super({uniqueName:"黒遺跡",
                                rank:1, enemyLv:18, au:120,
                                clearItem:()=>Item.黒遺跡の玉,
                                treasure:()=>Eq.魔ヶ玉の指輪,
                                treasureKey:()=>Item.黒遺跡の鍵,
                                trendItems:()=>[Item.黒い枝, Item.黒い青空],
        });}
        isVisible = ()=>Dungeon.黒平原.clearNum > 0;
        setBossInner = ()=>{
            let e = Unit.enemies[0];
            Job.ダウザー.setEnemy(e, e.prm(Prm.LV).base);
            e.name = "古代兵器";
            e.prm(Prm.MAX_HP).base = 130;
        };
    };
}