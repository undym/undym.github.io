
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
    static createDef(){
        return  new Event(
                      this.BATTLE
                    | this.BOX
                    | this.TRAP
                    | this.TREASURE
                );
    }
    static readonly BATTLE  = 1 << 0;
    static readonly BOX     = 1 << 1;
    static readonly TREE    = 1 << 2;
    static readonly TRAP    = 1 << 3;
    static readonly TREASURE= 1 << 4;

    private events:number;
    
    constructor(events:number){
        this.events = events;
    }

    remove(ev:number):this{
        this.events = this.events & (~ev);
        return this;
    }

    add(ev:number):this{
        this.events = this.events | ev;
        return this;
    }

    // has(ev:number):boolean{
    //     return this.events & ev ? true : false;
    // }

    rnd():DungeonEvent{
        if(this.events & Event.TREASURE){
            if(Math.random() < 0.001){return DungeonEvent.TREASURE;}
            if(Math.random() < 0.001){return DungeonEvent.GET_TREASURE_KEY;}
        }

        if(this.events & Event.BOX      && Math.random() < 0.20){return DungeonEvent.BOX;}
        
        if(this.events & Event.BATTLE   && Math.random() < 0.20){return DungeonEvent.BATTLE;}
        if(this.events & Event.TRAP     && Math.random() < 0.04){return DungeonEvent.TRAP;}
        
        if(this.events & Event.TREE     && Math.random() < 0.06){return DungeonEvent.TREE;}

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

    readonly uniqueName:string;
    readonly rank:number;
    readonly enemyLv:number;
    readonly au:number;
    readonly clearItem:()=>Num;
    private  _treasure:()=>Num;
    get treasure():Num{return this._treasure();}
    private _treasureKey:()=>Num;
    get treasureKey():Num{return this._treasureKey();}
    readonly trendItems:()=>Item[];

    private readonly event:Event;
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    // private constructor(name:string, protected rank:number, protected enemyLv:number, protected au:number){
    protected constructor(args:{
        uniqueName:string,
        rank:number,
        enemyLv:number,
        au:number,
        clearItem:()=>Num,
        treasure:()=>Num,
        treasureKey:()=>Num,
        trendItems:()=>Item[],
        event:Event,
    }){
        this.uniqueName = args.uniqueName;
        this.toString = ()=>this.uniqueName;

        this.rank        = args.rank;
        this.enemyLv     = args.enemyLv;
        this.au          = args.au;
        this.clearItem   = args.clearItem;
        this._treasure   = args.treasure;
        this._treasureKey= args.treasureKey;
        this.trendItems  = args.trendItems;
        this.event       = args.event;

        Dungeon._values.push(this);
    }

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
            this.setEnemyInner( Unit.enemies[i] );
        }
    }

    setEnemyInner(e:EUnit){
        let lv = (Math.random() * 0.5 + 0.75) * this.enemyLv;
        let job = Job.rndJob(lv);
        job.setEnemy( e, lv );
    }

    setBoss(){
        for(let e of Unit.enemies){
            this.setEnemyInner(e);

            e.prm(Prm.MAX_HP).base *= 3;
            e.hp = e.prm(Prm.MAX_HP).total;
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
                                event:Event.createDef(),
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
                                event:Event.createDef().add(Event.TREE),
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
                                rank:1, enemyLv:5, au:70,
                                clearItem:()=>Item.リテの門の玉,
                                treasure:()=>Eq.魔法の杖,
                                treasureKey:()=>Item.リテの門の鍵,
                                trendItems:()=>[],
                                event:Event.createDef().add(Event.TREE),
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
}