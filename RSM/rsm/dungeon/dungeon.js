var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DungeonEvent } from "./dungeonevent.js";
import { Job } from "../job.js";
import { Unit, Prm } from "../unit.js";
import { Item } from "../item.js";
import { Eq } from "../eq.js";
import { Util } from "../util.js";
import { cwait, wait } from "../undym/scene.js";
import { Player } from "../player.js";
import { choice } from "../undym/random.js";
// class Event{
//     static createDef(rank:number){
//         const events:[()=>DungeonEvent,()=>number,()=>boolean][] = [];
//         events.push([()=>DungeonEvent.GET_TREASURE_KEY, ()=>0.0015, ()=>true]);
//         events.push([()=>DungeonEvent.TREASURE,         ()=>0.001 , ()=>true]);
//         events.push([()=>DungeonEvent.EX_BATTLE,        ()=>0.001 , ()=>Dungeon.now.dungeonClearCount > 0]);
//         events.push([()=>DungeonEvent.BOX,              ()=>0.15  , ()=>true]);
//         events.push([()=>DungeonEvent.BATTLE,           ()=>0.15  , ()=>true]);
//         events.push([()=>DungeonEvent.TRAP,             ()=>0.04  , ()=>true]);
//         if(rank >= 1){
//             events.push([()=>DungeonEvent.TREE,         ()=>0.03  , ()=>true]);
//         }
//         events.push([()=>DungeonEvent.REST,             ()=>0.03  , ()=>true]);
//         return new Event(events);
//     }
//     private events:{ev:()=>DungeonEvent, prob:()=>number, isHappen:()=>boolean}[] = [];
//     constructor(events:[()=>DungeonEvent,()=>number,()=>boolean][]){
//         for(const set of events){
//             this.events.push( {ev:set[0], prob:set[1], isHappen:set[2]} );
//         }
//     }
//     // remove(ev:DungeonEvent):this{
//     //     this.events = this.events.filter(set=> set.ev !== ev);
//     //     return this;
//     // }
//     add(ev:()=>DungeonEvent, prob:()=>number, isHappen:()=>boolean):this{
//         this.events.push( {ev:ev, prob:prob, isHappen:isHappen} );
//         return this;
//     }
//     addFirst(ev:()=>DungeonEvent, prob:()=>number, isHappen:()=>boolean):this{
//         this.events.unshift( {ev:ev, prob:prob, isHappen:isHappen} );
//         return this;
//     }
//     rnd():DungeonEvent{
//         for(const set of this.events){
//             if(set.isHappen() && Math.random() < set.prob()){
//                 return set.ev();
//             }
//         }
//         return DungeonEvent.empty;
//     }
//     // has(ev:DungeonEvent):boolean{
//     //     for(const set of this.events){
//     //         if(set.ev === ev){return true;}
//     //     }
//     //     return false;
//     // }
// }
export class Dungeon {
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    // private constructor(name:string, protected rank:number, protected enemyLv:number, protected au:number){
    constructor(args) {
        this.args = args;
        //-----------------------------------------------------------------
        //
        //
        //
        //-----------------------------------------------------------------
        this.treasureKey = 0;
        this.dungeonClearCount = 0;
        this.exKillCount = 0;
        Dungeon._values.push(this);
    }
    static get values() { return this._values; }
    static valueOf(uniqueName) {
        if (!this._valueOf) {
            this._valueOf = new Map();
            for (const d of this.values) {
                this._valueOf.set(d.uniqueName, d);
            }
        }
        return this._valueOf.get(uniqueName);
    }
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    get uniqueName() { return this.args.uniqueName; }
    get rank() { return this.args.rank; }
    /** クリア回数による補正をかけていないもの。*/
    get originalEnemyLv() { return this.args.enemyLv; }
    /**クリア回数の補正をかけたもの。 */
    get enemyLv() {
        const _clearCount = this.dungeonClearCount < 20 ? this.dungeonClearCount : 20;
        const res = this.args.enemyLv * (1 + _clearCount * 0.05) + _clearCount;
        return res | 0;
    }
    get au() { return this.args.au; }
    get treasures() { return this.args.treasures(); }
    rndTreasure() {
        if (this.treasures.length === 0) {
            return undefined;
        }
        return choice(this.treasures);
    }
    get exItem() { return this.args.exItem(); }
    get trendItems() { return this.args.trendItems(); }
    toString() { return this.args.uniqueName; }
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    rndEvent() {
        if (Math.random() < 0.002) {
            if (this.treasureKey === 0) {
                if (Math.random() < 0.8) {
                    return DungeonEvent.GET_TREASURE_KEY;
                }
                else {
                    return DungeonEvent.TREASURE;
                }
            }
            else {
                return Math.random() < 0.5 ? DungeonEvent.GET_TREASURE_KEY : DungeonEvent.TREASURE;
            }
        }
        if (Dungeon.now.dungeonClearCount > 0 && Math.random() < 0.001) {
            return DungeonEvent.EX_BATTLE;
        }
        if (Math.random() < 0.15) {
            return DungeonEvent.BOX;
        }
        if (Math.random() < 0.15) {
            return DungeonEvent.BATTLE;
        }
        if (Math.random() < 0.04) {
            return DungeonEvent.TRAP;
        }
        if (this.rank >= 1 && Math.random() < 0.01) {
            return DungeonEvent.TREE;
        }
        if (this.rank >= 2 && Math.random() < 0.01) {
            return DungeonEvent.STRATUM;
        }
        if (this.rank >= 3 && Math.random() < 0.01) {
            return DungeonEvent.LAKE;
        }
        //(10 + rank * 1) / (10 + rank * 6)
        //[rank = 0,  1 / 1] [rank = 1,  11 / 16] [rank = 5,  15 / 40] [rank = 10, 20 / 70 = 2 / 7]
        if (Math.random() < 0.02 * (10 + this.rank) / (10 + this.rank * 6)) {
            return DungeonEvent.REST;
        }
        return DungeonEvent.empty;
    }
    rndEnemyNum() {
        const prob = 1.0 - (this.rank + 4) / (this.rank * this.rank + 5);
        let num = 0;
        for (let i = 0; i < Unit.enemies.length; i++) {
            if (Math.random() <= prob) {
                num++;
            }
        }
        return num === 0 ? 1 : num;
    }
    setEnemy(num = -1) {
        if (num === -1) {
            num = this.rndEnemyNum();
        }
        for (let i = 0; i < num; i++) {
            const e = Unit.enemies[i];
            this.setEnemyInner(e);
            e.name += String.fromCharCode("A".charCodeAt(0) + i);
        }
    }
    setEnemyInner(e) {
        Job.rndSetEnemy(e, (Math.random() * 0.5 + 0.75) * this.enemyLv);
    }
    setBoss() {
        this.setEnemy(Unit.enemies.length);
        for (const e of Unit.enemies) {
            e.prm(Prm.MAX_HP).base *= 3;
            e.ep = Unit.DEF_MAX_EP;
        }
        this.setBossInner();
        for (let e of Unit.enemies) {
            e.hp = e.prm(Prm.MAX_HP).total;
        }
    }
    setEx() {
        for (const e of Unit.enemies) {
            const _killCount = this.exKillCount < 10 ? this.exKillCount : 10;
            const lv = this.originalEnemyLv * (1 + _killCount * 0.1);
            const job = Job.rndJob(lv);
            job.setEnemy(e, lv);
            e.prm(Prm.MAX_HP).base *= 3;
            e.ep = Unit.DEF_MAX_EP;
        }
        this.setExInner();
        for (let e of Unit.enemies) {
            e.hp = e.prm(Prm.MAX_HP).total;
        }
    }
    dungeonClearEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.dungeonClearCount <= 100 && this.dungeonClearCount % 10 === 0) {
                Util.msg.set(`[${this}]を${this.dungeonClearCount}回踏破！`);
                yield cwait();
                Item.いざなみの命.add(1);
                yield wait();
                Item.おおげつ姫.add(1);
                yield wait();
                Item.アラハバキ神.add(1);
                yield wait();
                Item.この花咲くや姫.add(1);
                yield wait();
                Item.つくよみの命.add(1);
                yield wait();
                Item.よもつおお神.add(1);
                yield wait();
                Item.わたつみの神.add(1);
                yield wait();
                Item.へつなぎさびこの神.add(1);
                yield wait();
                Item.ほのかぐつちの神.add(1);
                yield wait();
                Item.たけみかづちの命.add(1);
                yield wait();
                Item.すさのおの命.add(1);
                yield wait();
            }
        });
    }
}
Dungeon._values = [];
Dungeon.auNow = 0;
(function (Dungeon) {
    //-----------------------------------------------------------------
    //
    //
    //
    //-----------------------------------------------------------------
    Dungeon.はじまりの丘 = new class extends Dungeon {
        constructor() {
            super({ uniqueName: "はじまりの丘",
                rank: 0, enemyLv: 1, au: 50,
                treasures: () => [Eq.棒],
                exItem: () => Eq.瑠璃,
                trendItems: () => [Item.石, Item.枝,],
            });
            this.isVisible = () => true;
            this.setBossInner = () => {
                let e = Unit.enemies[0];
                Job.しんまい.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "聖戦士";
                e.prm(Prm.MAX_HP).base = 15;
                e.prm(Prm.STR).base = 6;
                //ボス以外の雑魚は0体
                for (let i = 1; i < Unit.enemies.length; i++) {
                    Unit.enemies[i].exists = false;
                }
            };
            this.setExInner = () => {
                let e = Unit.enemies[0];
                Job.しんまい.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "Ex聖戦士";
                e.prm(Prm.MAX_HP).base = 30;
                e.prm(Prm.STR).base = 12;
            };
        }
        dungeonClearEvent() {
            const _super = Object.create(null, {
                dungeonClearEvent: { get: () => super.dungeonClearEvent }
            });
            return __awaiter(this, void 0, void 0, function* () {
                yield _super.dungeonClearEvent.call(this);
                Item.はじまりの丘チール.add(1);
                yield cwait();
            });
        }
    };
    Dungeon.再構成トンネル = new class extends Dungeon {
        constructor() {
            super({ uniqueName: "再構成トンネル",
                rank: 1, enemyLv: 3, au: 70,
                treasures: () => [Eq.安全靴],
                exItem: () => Eq.手甲,
                trendItems: () => [Item.土, Item.水],
            });
            this.isVisible = () => Dungeon.はじまりの丘.dungeonClearCount > 0;
            this.setBossInner = () => {
                let e = Unit.enemies[0];
                Job.格闘家.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "幻影";
                e.prm(Prm.MAX_HP).base = 23;
                e.prm(Prm.STR).base = 10;
                //ボス以外の雑魚は1体
                for (let i = 2; i < Unit.enemies.length; i++) {
                    Unit.enemies[i].exists = false;
                }
            };
            this.setExInner = () => {
                let e = Unit.enemies[0];
                Job.格闘家.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "Ex幻影";
                e.prm(Prm.MAX_HP).base = 40;
                e.prm(Prm.STR).base = 15;
            };
        }
        dungeonClearEvent() {
            const _super = Object.create(null, {
                dungeonClearEvent: { get: () => super.dungeonClearEvent }
            });
            return __awaiter(this, void 0, void 0, function* () {
                yield _super.dungeonClearEvent.call(this);
                if (!Player.よしこ.member) {
                    Player.よしこ.join();
                    Util.msg.set(`よしこが仲間になった`);
                    yield cwait();
                }
            });
        }
        ;
    };
    Dungeon.リテの門 = new class extends Dungeon {
        constructor() {
            super({ uniqueName: "リ・テの門",
                rank: 1, enemyLv: 7, au: 70,
                treasures: () => [Eq.魔法の杖],
                exItem: () => Eq.魔女のとんがり帽,
                trendItems: () => [Item.朽ち果てた鍵],
            });
            this.isVisible = () => Dungeon.再構成トンネル.dungeonClearCount > 0;
            this.setBossInner = () => {
                let e = Unit.enemies[0];
                Job.魔法使い.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "門番";
                e.prm(Prm.MAX_HP).base = 50;
                e.prm(Prm.STR).base = 7;
                e.prm(Prm.MAG).base = 10;
                //ボス以外の雑魚は2体
                for (let i = 3; i < Unit.enemies.length; i++) {
                    Unit.enemies[i].exists = false;
                }
            };
            this.setExInner = () => {
                let e = Unit.enemies[0];
                Job.魔法使い.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "Ex門番";
                e.prm(Prm.MAX_HP).base = 80;
                e.prm(Prm.STR).base = 20;
                e.prm(Prm.MAG).base = 12;
            };
        }
        dungeonClearEvent() {
            const _super = Object.create(null, {
                dungeonClearEvent: { get: () => super.dungeonClearEvent }
            });
            return __awaiter(this, void 0, void 0, function* () {
                yield _super.dungeonClearEvent.call(this);
                Item.リテの門チール.add(1);
                yield cwait();
            });
        }
    };
    Dungeon.黒平原 = new class extends Dungeon {
        constructor() {
            super({ uniqueName: "黒平原",
                rank: 2, enemyLv: 14, au: 100,
                treasures: () => [Eq.ゲルマンベルト],
                exItem: () => Eq.オホーツクのひも,
                trendItems: () => [Item.黒い石, Item.黒い砂],
            });
            this.isVisible = () => Dungeon.リテの門.dungeonClearCount > 0;
            this.setBossInner = () => {
                let e = Unit.enemies[0];
                Job.スネイカー.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "牛";
                e.prm(Prm.MAX_HP).base = 120;
                //ボス以外の雑魚は2体
                for (let i = 3; i < Unit.enemies.length; i++) {
                    Unit.enemies[i].exists = false;
                }
            };
            this.setExInner = () => {
                let e = Unit.enemies[0];
                Job.スネイカー.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "ヤギ";
                e.prm(Prm.MAX_HP).base = 140;
                e.prm(Prm.CHN).base = 20;
            };
        }
    };
    Dungeon.黒遺跡 = new class extends Dungeon {
        constructor() {
            super({ uniqueName: "黒遺跡",
                rank: 0, enemyLv: 18, au: 120,
                treasures: () => [Eq.魔ヶ玉の指輪],
                exItem: () => Eq.ゴーレムの腕,
                trendItems: () => [Item.黒い枝, Item.黒い青空],
            });
            this.isVisible = () => Dungeon.黒平原.dungeonClearCount > 0;
            this.setBossInner = () => {
                let e = Unit.enemies[0];
                Job.ダウザー.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "古代兵器";
                e.prm(Prm.MAX_HP).base = 130;
            };
            this.setExInner = () => {
                let e = Unit.enemies[0];
                Job.ダウザー.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "Ex古代兵器";
                e.prm(Prm.MAX_HP).base = 130;
                e.prm(Prm.PST).base = 30;
            };
        }
    };
    Dungeon.PAIN = new class extends Dungeon {
        constructor() {
            super({ uniqueName: "PAIN",
                rank: 1, enemyLv: 24, au: 100,
                treasures: () => [Eq.ニケ],
                exItem: () => Eq.鉄下駄,
                trendItems: () => [],
            });
            this.isVisible = () => Dungeon.黒遺跡.dungeonClearCount > 0;
            this.setBossInner = () => {
                let e = Unit.enemies[0];
                Job.ガンマン.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "にこ";
                e.prm(Prm.MAX_HP).base = 200;
            };
            this.setExInner = () => {
                let e = Unit.enemies[0];
                Job.ガンマン.setEnemy(e, e.prm(Prm.LV).base);
                e.name = "Exにこ";
                e.prm(Prm.MAX_HP).base = 400;
            };
        }
    };
    // export const                         CSTEF:Dungeon = new class extends Dungeon{
    //     constructor(){super({uniqueName:"C･STEF",
    //                             rank:3, enemyLv:24, au:200,
    //                             treasures:  ()=>[],
    //                             exItem:     ()=>Eq.鉄下駄,
    //                             trendItems: ()=>[],
    //     });}
    //     isVisible = ()=>Dungeon.PAIN.dungeonClearCount > 0;
    //     setBossInner = ()=>{
    //         let e = Unit.enemies[0];
    //         Job.天使.setEnemy(e, e.prm(Prm.LV).base);
    //         e.name = "エンジェル";
    //         e.prm(Prm.MAX_HP).base = 200;
    //     };
    //     setExInner = ()=>{
    //         let e = Unit.enemies[0];
    //         Job.天使.setEnemy(e, e.prm(Prm.LV).base);
    //         e.name = "Exエンジェル";
    //         e.prm(Prm.MAX_HP).base = 400;
    //     };
    // };
})(Dungeon || (Dungeon = {}));
