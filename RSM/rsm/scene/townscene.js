var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Scene } from "../undym/scene.js";
import { ILayout, VariableLayout, FlowLayout } from "../undym/layout.js";
import { Place, Util, PlayData, Debug, SceneType } from "../util.js";
import { Btn } from "../widget/btn.js";
import { Dungeon } from "../dungeon/dungeon.js";
import { Rect, Color, Point } from "../undym/type.js";
import DungeonScene from "./dungeonscene.js";
import { DungeonEvent } from "../dungeon/dungeonevent.js";
import { DrawUnitDetail, DrawSTBoxes, DrawPlayInfo } from "./sceneutil.js";
import { Unit, Prm } from "../unit.js";
import { createOptionBtn } from "./optionscene.js";
import { ItemScene } from "./itemscene.js";
import { Targeting } from "../force.js";
import { Font, Graphics, Texture } from "../graphics/graphics.js";
import { Item } from "../item.js";
import { JobChangeScene } from "./jobchangescene.js";
import { SetTecScene } from "./settecscene.js";
import { MixScene } from "./mixscene.js";
import { EqScene } from "./eqscene.js";
import { ConditionType } from "../condition.js";
import { ShopScene } from "./shopscene.js";
import { FX } from "../fx/fx.js";
let choosedDungeon;
let visibleDungeonEnterBtn = false;
export class TownScene extends Scene {
    static get ins() { return this._ins ? this._ins : (this._ins = new TownScene()); }
    constructor() {
        super();
    }
    init() {
        super.clear();
        super.add(Place.TOP, DrawPlayInfo.ins);
        // const drawBG:(bounds:Rect)=>void = (()=>{
        //     if(Battle.type === BattleType.BOSS){
        //     }
        //     if(Battle.type === BattleType.EX){
        //     }
        //     // return (bounds)=>{};
        // })();
        // super.add(Place.MAIN, ILayout.create({draw:(bounds)=>{
        //     Graphics.clip(bounds,()=>{
        //         drawBG(bounds); 
        //     });
        // }}));
        super.add(Place.MSG, Util.msg);
        super.add(Place.BTN, new VariableLayout(() => TownBtn.ins));
        super.add(Place.P_BOX, DrawSTBoxes.players);
        super.add(Place.MAIN, DrawUnitDetail.ins);
        //----------------------------------------------------
        SceneType.TOWN.set();
        TownBtn.reset();
        fullCare();
        //----------------------------------------------------
    }
}
const fullCare = () => {
    for (let u of Unit.players) {
        u.dead = false;
        u.hp = u.prm(Prm.MAX_HP).total;
        u.mp = u.prm(Prm.MAX_MP).total;
        u.ep = u.prm(Prm.MAX_EP).total;
        for (const type of ConditionType.values) {
            u.clearCondition(type);
        }
    }
};
class TownBtn {
    static get ins() { return this._ins; }
    static reset() {
        const l = new FlowLayout(4, 3);
        l.add(new Btn("ダンジョン", () => {
            this.setDungeonBtn();
        }));
        if (PlayData.masteredAnyJob || Debug.debugMode) {
            l.add(new Btn("職業", () => {
                Scene.load(new JobChangeScene());
            }));
            l.add(new Btn("技のセット", () => {
                Scene.load(new SetTecScene());
            }));
        }
        if (PlayData.gotAnyEq || Debug.debugMode) {
            l.add(new Btn("装備", () => {
                Scene.load(new EqScene());
            }));
        }
        if (Item.合成許可証.num > 0 || Debug.debugMode) {
            l.add(new Btn("合成", () => {
                Scene.load(new MixScene());
            }));
        }
        l.add(new Btn("お店", () => {
            Scene.load(new ShopScene());
        }));
        l.add(new Btn("アイテム", () => {
            Scene.load(ItemScene.ins({
                selectUser: true,
                user: Unit.players[0],
                use: (item, user) => __awaiter(this, void 0, void 0, function* () {
                    if (item.targetings & Targeting.SELECT) {
                        yield item.use(user, [user]);
                    }
                    else {
                        let targets = Targeting.filter(item.targetings, user, Unit.players, /*num*/ 1);
                        if (targets.length > 0) {
                            yield item.use(user, targets);
                        }
                    }
                }),
                returnScene: () => {
                    Scene.load(TownScene.ins);
                },
            }));
        }));
        l.add(new Btn("OPTION", () => {
            this._ins = createOptionBtn();
        }));
        this._ins = l;
        visibleDungeonEnterBtn = false;
    }
    static setDungeonBtn() {
        const w = 4;
        const h = 3;
        const l = new FlowLayout(w, h);
        const onePageDrawDungeonNum = w * (h - 1);
        let num = 0;
        // 0, 1, 2, 3,
        // 4, 5, 6, 7,
        // 8, 9,10,11,
        const visibleDungeons = Dungeon.values.filter(d => d.isVisible() || Debug.debugMode);
        for (let i = this.dungeonPage * onePageDrawDungeonNum; i < visibleDungeons.length; i++) {
            const d = visibleDungeons[i];
            l.add(new Btn(() => `${d}`, () => {
                choosedDungeon = d;
                visibleDungeonEnterBtn = true;
                Util.msg.set("");
                Util.msg.set(`[${d}]`);
                Util.msg.set(`Rank:${d.rank}`);
                Util.msg.set(`Lv:${d.enemyLv}`);
                Util.msg.set(`攻略回数:${d.dungeonClearCount}`, d.dungeonClearCount > 0 ? Color.WHITE : Color.GRAY);
                if (d.treasure.totalGetNum > 0) {
                    Util.msg.set(`財宝:${d.treasure}(${d.treasure.num}個)`);
                }
                else {
                    Util.msg.set(`財宝:${"？".repeat(d.treasure.toString().length)}`, Color.GRAY);
                }
                Util.msg.set(`EX討伐回数:${d.exKillCount}`, d.exKillCount > 0 ? Color.WHITE : Color.GRAY);
            }));
            if (++num >= onePageDrawDungeonNum) {
                break;
            }
        }
        const pageLim = ((visibleDungeons.length - 1) / onePageDrawDungeonNum) | 0;
        l.addFromLast(new Btn(() => "<<", () => {
            this.reset();
        }));
        const enter = new Btn("侵入", () => {
            if (choosedDungeon === undefined) {
                return;
            }
            Dungeon.now = choosedDungeon;
            Dungeon.auNow = 0;
            DungeonEvent.now = DungeonEvent.empty;
            for (let item of Item.consumableValues()) {
                item.remainingUseCount = item.num;
            }
            Util.msg.set(`${choosedDungeon}に侵入しました`);
            setDungeonNameFX(choosedDungeon.toString(), Place.MAIN);
            Scene.load(DungeonScene.ins);
        });
        l.addFromLast(new VariableLayout(() => {
            return visibleDungeonEnterBtn ? enter : ILayout.empty;
        }));
        const toNewer = new Btn(">", () => {
            this.dungeonPage++;
            visibleDungeonEnterBtn = false;
        });
        l.addFromLast(new VariableLayout(() => {
            return this.dungeonPage < pageLim ? toNewer : ILayout.empty;
        }));
        const toOlder = new Btn("<", () => {
            this.dungeonPage--;
            visibleDungeonEnterBtn = false;
        });
        l.addFromLast(new VariableLayout(() => {
            return this.dungeonPage > 0 ? toOlder : ILayout.empty;
        }));
        visibleDungeonEnterBtn = false;
        this._ins = l;
    }
}
TownBtn.dungeonPage = 0;
const setDungeonNameFX = (name, bounds) => {
    const fontSize = 60;
    const font = new Font(fontSize, Font.ITALIC);
    const tex = new Texture({ pixelSize: { w: font.measurePixelW(name), h: fontSize } });
    tex.setRenderTarget(() => {
        font.draw(name, Point.ZERO, Color.WHITE);
    });
    const flash = () => {
        const addX = 0.01;
        const addY = 0.01;
        const b = new Rect(bounds.x - addX, bounds.y - addY, bounds.w + addX * 2, bounds.h + addY * 2);
        let alpha = 1.0;
        FX.add((count) => {
            Graphics.setAlpha(alpha, () => {
                tex.draw(b);
            });
            alpha -= 0.1;
            return alpha > 0;
        });
    };
    let alpha = 1.0;
    FX.add((count) => {
        const countLim = 15;
        let w = count / countLim * tex.pixelW;
        if (w > tex.pixelW) {
            w = tex.pixelW;
            if (alpha === 1.0) {
                flash();
            }
            alpha -= 0.04;
            if (alpha <= 0) {
                return false;
            }
        }
        Graphics.setAlpha(alpha, () => {
            for (let i = 0; i < w; i += 2) {
                tex.draw({
                    x: bounds.x + i / tex.pixelW * bounds.w,
                    y: bounds.y,
                    w: 1 / tex.pixelW * bounds.w,
                    h: bounds.h,
                }, {
                    x: i / tex.pixelW,
                    y: 0,
                    w: 1 / tex.pixelW,
                    h: 1,
                });
            }
            const add = tex.pixelW % 2 + 1;
            for (let i = tex.pixelW - add; i > tex.pixelW - w; i -= 2) {
                tex.draw({
                    x: bounds.x + i / tex.pixelW * bounds.w,
                    y: bounds.y,
                    w: 1 / tex.pixelW * bounds.w,
                    h: bounds.h,
                }, {
                    x: i / tex.pixelW,
                    y: 0,
                    w: 1 / tex.pixelW,
                    h: 1,
                });
            }
        });
        return true;
    });
};
