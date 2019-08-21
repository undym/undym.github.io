var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Scene, wait } from "../undym/scene.js";
import { Place, Util, PlayData, SceneType } from "../util.js";
import { DrawSTBoxes, DrawDungeonData, DrawUnitDetail, DrawPlayInfo } from "./sceneutil.js";
import { VariableLayout, ILayout, Layout, FlowLayout } from "../undym/layout.js";
import { Rect, Color } from "../undym/type.js";
import { Unit, PUnit, Prm } from "../unit.js";
import { Battle, BattleResult, BattleType } from "../battle.js";
import { Tec, ActiveTec, PassiveTec } from "../tec.js";
import { Input } from "../undym/input.js";
import { Btn } from "../widget/btn.js";
import { Targeting } from "../force.js";
import { ItemScene } from "./itemscene.js";
import { Font, Graphics } from "../graphics/graphics.js";
let btnSpace;
export class BattleScene extends Scene {
    constructor() {
        super();
        this.tecInfo = { tec: undefined, user: Unit.players[0] };
        btnSpace = new Layout();
    }
    static get ins() { return this._ins ? this._ins : (this._ins = new BattleScene()); }
    init() {
        super.clear();
        super.add(Place.TOP, DrawPlayInfo.ins);
        super.add(Place.DUNGEON_DATA, new VariableLayout(() => {
            if (!this.tecInfo.tec || this.tecInfo.tec === Tec.empty) {
                return DrawDungeonData.ins;
            }
            return ILayout.empty;
        }));
        super.add(Place.DUNGEON_DATA, ILayout.create({ draw: (bounds) => {
                if (!this.tecInfo.tec || this.tecInfo.tec === Tec.empty) {
                    return;
                }
                const tec = this.tecInfo.tec;
                const f = Font.def;
                let p = bounds.upperLeft;
                f.draw(`[${tec}]`, p, Color.GREEN);
                p = p.move(0, f.ratioH);
                if (tec instanceof ActiveTec) {
                    let mpW = 0;
                    let tpW = 0;
                    const user = this.tecInfo.user;
                    if (tec.mpCost > 0) {
                        let col = tec.mpCost <= user.mp ? Color.WHITE : Color.GRAY;
                        const s = `MP:${tec.mpCost} `;
                        f.draw(s, p, col);
                        mpW = f.measureRatioW(s);
                    }
                    if (tec.tpCost > 0) {
                        let col = tec.tpCost <= user.tp ? Color.WHITE : Color.GRAY;
                        const s = `TP:${tec.tpCost} `;
                        f.draw(s, p.move(mpW, 0), col);
                        tpW = f.measureRatioW(s);
                    }
                    if (tec.epCost > 0) {
                        let col = tec.epCost <= user.ep ? Color.WHITE : Color.GRAY;
                        f.draw(`EP:${tec.epCost}`, p.move(tpW, 0), col);
                    }
                }
                else {
                }
                for (let s of tec.info) {
                    f.draw(s, p = p.move(0, f.ratioH), Color.WHITE);
                }
            } }));
        super.add(Place.MSG, Util.msg);
        super.add(Place.BTN, btnSpace);
        super.add(Place.E_BOX, DrawSTBoxes.enemies);
        super.add(Place.P_BOX, DrawSTBoxes.players);
        super.add(Place.MAIN, DrawUnitDetail.ins);
        super.add(Rect.FULL, ILayout.create({ draw: (noUsed) => {
                if (!Battle.getPhaseUnit().exists) {
                    return;
                }
                Graphics.fillRect(Battle.getPhaseUnit().bounds, new Color(0, 1, 1, 0.2));
            } }));
        super.add(Rect.FULL, ILayout.create({ ctrl: (noUsed) => __awaiter(this, void 0, void 0, function* () {
                if (Battle.start) {
                    Battle.start = false;
                    SceneType.now = SceneType.BATTLE;
                    //init
                    for (const u of Unit.all) {
                        u.tp = 0;
                    }
                    for (const u of Unit.all) {
                        u.battleStart();
                    }
                    yield this.phaseEnd();
                    return;
                }
            }) }));
    }
    phaseEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let u of Unit.all) {
                yield u.judgeDead();
            }
            if (Unit.players.every(u => !u.exists || u.dead)) {
                yield lose();
                return;
            }
            if (Unit.enemies.every(u => !u.exists || u.dead)) {
                yield win();
                return;
            }
            Battle.phase = (Battle.phase + 1) % Unit.all.length;
            if (Battle.phase === Battle.firstPhase) {
                Battle.turn++;
                Util.msg.set(`----------${Battle.turn}ターン目----------`, Color.L_GRAY);
                yield wait();
            }
            let attacker = Battle.getPhaseUnit();
            if (!attacker.exists || attacker.dead) {
                yield this.phaseEnd();
                return;
            }
            Util.msg.set(`${attacker.name}`, Color.ORANGE);
            Util.msg.add(`の行動`);
            attacker.prm(Prm.TP).base += 10;
            attacker.phaseStart();
            for (const u of Unit.all) {
                u.judgeDead();
            }
            if (attacker.dead) {
                yield this.phaseEnd();
                return;
            }
            if (attacker instanceof PUnit) {
                yield this.setPlayerPhase(attacker);
                return;
            }
            else {
                let e = attacker;
                yield e.ai(e, Unit.all);
                yield this.phaseEnd();
                return;
            }
        });
    }
    setPlayerPhase(attacker) {
        return __awaiter(this, void 0, void 0, function* () {
            const createTecBtn = (tec) => {
                let btn;
                if (tec instanceof ActiveTec) {
                    btn = new Btn(tec.toString(), () => __awaiter(this, void 0, void 0, function* () {
                        this.tecInfo.tec = undefined;
                        if (tec.targetings & Targeting.SELECT) {
                            Util.msg.set(`[${tec}]のターゲットを選択してください`);
                            yield this.setChooseTargetBtn(attacker, (targets) => __awaiter(this, void 0, void 0, function* () {
                                if (!targets[0].dead
                                    || (tec.targetings & Targeting.WITH_DEAD || tec.targetings & Targeting.ONLY_DEAD)) {
                                    Util.msg.set(`＞${targets[0].name}を選択`);
                                    yield tec.use(attacker, targets);
                                    yield this.phaseEnd();
                                }
                            }));
                            return;
                        }
                        else {
                            let targets = [];
                            const attackNum = tec.rndAttackNum();
                            for (let i = 0; i < attackNum; i++) { //攻撃回数分ターゲットを追加
                                targets = targets.concat(Targeting.filter(tec.targetings, attacker, Unit.all));
                            }
                            // let targets = Targeting.filter( tec.targetings, attacker, Unit.all, tec.rndAttackNum() );
                            yield tec.use(attacker, targets);
                            yield this.phaseEnd();
                        }
                    }));
                    if (!tec.checkCost(attacker)) {
                        btn.groundColor = () => Color.GRAY;
                        btn.stringColor = () => Color.D_RED;
                    }
                }
                else if (tec instanceof PassiveTec) {
                    btn = new Btn(`-${tec}-`, () => {
                    });
                    btn.groundColor = () => Color.D_GRAY;
                    btn.stringColor = () => Color.L_GRAY;
                }
                else {
                    return ILayout.empty;
                }
                return new Layout()
                    .add(btn)
                    .add(ILayout.create({ ctrl: (bounds) => {
                        if (bounds.contains(Input.point) && Input.holding() >= 4) {
                            this.tecInfo.tec = tec;
                            this.tecInfo.user = attacker;
                        }
                    } }));
            };
            const w = 4;
            const h = 3;
            const l = new FlowLayout(w, h);
            const drawOnePage = w * (h - 1);
            for (let i = attacker.tecPage * drawOnePage; i < (attacker.tecPage + 1) * drawOnePage; i++) {
                if (i >= attacker.tecs.length) {
                    break;
                }
                l.add(createTecBtn(attacker.tecs[i]));
            }
            l.addFromLast(new Btn("ITEM", () => __awaiter(this, void 0, void 0, function* () {
                Scene.load(ItemScene.ins({
                    user: attacker,
                    selectUser: false,
                    use: (item, user) => __awaiter(this, void 0, void 0, function* () {
                        Scene.set(this);
                        if (item.targetings & Targeting.SELECT) {
                            Util.msg.set(`[${item}]のターゲットを選択してください`);
                            this.setChooseTargetBtn(attacker, (targets) => __awaiter(this, void 0, void 0, function* () {
                                yield item.use(user, targets);
                                yield this.phaseEnd();
                            }));
                        }
                        else {
                            let targets = Targeting.filter(item.targetings, user, Unit.players);
                            yield item.use(user, targets);
                            yield this.phaseEnd();
                        }
                    }),
                    returnScene: () => {
                        Scene.set(BattleScene.ins);
                    },
                }));
            })));
            l.addFromLast(new Btn("何もしない", () => __awaiter(this, void 0, void 0, function* () {
                yield Tec.何もしない.use(attacker, [attacker]);
                yield this.phaseEnd();
            })));
            const tecPageLim = ((attacker.tecs.length - 1) / drawOnePage) | 0;
            const newerTecPage = new Btn(">", () => __awaiter(this, void 0, void 0, function* () {
                attacker.tecPage++;
                yield this.setPlayerPhase(attacker);
            }));
            l.addFromLast(new VariableLayout(() => {
                return attacker.tecPage < tecPageLim ? newerTecPage : ILayout.empty;
            }));
            const olderTecPage = new Btn("<", () => __awaiter(this, void 0, void 0, function* () {
                attacker.tecPage--;
                yield this.setPlayerPhase(attacker);
            }));
            l.addFromLast(new VariableLayout(() => {
                return attacker.tecPage > 0 ? olderTecPage : ILayout.empty;
            }));
            btnSpace.clear();
            btnSpace.add(l);
        });
    }
    setChooseTargetBtn(attacker, chooseAction) {
        return __awaiter(this, void 0, void 0, function* () {
            const l = new FlowLayout(4, 3);
            const addBtn = (unit) => __awaiter(this, void 0, void 0, function* () {
                if (!unit.exists) {
                    l.add(ILayout.empty);
                    return;
                }
                const btn = new Btn(unit.name, () => __awaiter(this, void 0, void 0, function* () {
                    yield chooseAction([unit]);
                }));
                if (unit.dead) {
                    btn.groundColor = () => new Color(1, 0.3, 0.3);
                }
                l.add(btn);
            });
            for (let e of Unit.enemies) {
                addBtn(e);
            }
            for (let p of Unit.players) {
                addBtn(p);
            }
            l.addFromLast(new Btn("<<", () => __awaiter(this, void 0, void 0, function* () {
                Util.msg.set("＞キャンセル");
                yield this.setPlayerPhase(attacker);
            })));
            btnSpace.clear();
            btnSpace.add(l);
        });
    }
}
const win = () => __awaiter(this, void 0, void 0, function* () {
    Battle.result = BattleResult.WIN;
    Util.msg.set("勝った");
    yield wait();
    {
        let exp = 0;
        Unit.enemies
            .filter(e => e.exists)
            .forEach(e => exp += e.prm(Prm.EXP).base);
        exp = exp | 0;
        Util.msg.set(`${exp}の経験値を入手`, Color.CYAN.bright);
        yield wait();
        for (let p of Unit.players.filter(p => p.exists)) {
            yield p.addExp(exp);
        }
    }
    {
        let exp = 0;
        Unit.enemies
            .filter(e => e.exists)
            .forEach(e => exp += 1);
        for (let p of Unit.players.filter(p => p.exists)) {
            yield p.addJobExp(exp);
        }
    }
    {
        let yen = 0;
        Unit.enemies
            .filter(e => e.exists)
            .forEach(e => yen += e.yen);
        yen = yen | 0;
        PlayData.yen += yen;
        Util.msg.set(`${yen}円入手`, Color.YELLOW.bright);
        yield wait();
    }
    yield finish();
    yield Battle.battleEndAction(BattleResult.WIN);
});
const lose = () => __awaiter(this, void 0, void 0, function* () {
    Battle.result = BattleResult.LOSE;
    Util.msg.set("負けた");
    yield wait();
    if (Battle.type === BattleType.NORMAL) {
        const lostYen = (PlayData.yen / 3) | 0;
        PlayData.yen -= lostYen;
        Util.msg.set(`${lostYen}円失った...`, (cnt) => Color.RED);
        yield wait();
    }
    yield finish();
    yield Battle.battleEndAction(BattleResult.LOSE);
});
const finish = () => __awaiter(this, void 0, void 0, function* () {
    for (const e of Unit.enemies) {
        e.exists = false;
    }
    for (const p of Unit.players) {
        for (const prm of Prm.values()) {
            p.prm(prm).battle = 0;
        }
    }
    btnSpace.clear();
});
