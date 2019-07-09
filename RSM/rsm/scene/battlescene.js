var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Scene, wait } from "../undym/scene.js";
import { Place, Util, PlayData, Colors } from "../util.js";
import { DrawSTBoxes, DrawDungeonData, DrawTop, DrawUnitDetail } from "./sceneutil.js";
import { VariableLayout, ILayout, Layout, YLayout, RatioLayout } from "../undym/layout.js";
import { Rect, Color } from "../undym/type.js";
import { Unit, PUnit, Prm } from "../unit.js";
import { Battle, BattleResult, BattleType } from "../battle.js";
import { ActiveTec, PassiveTec } from "../tec.js";
import { Input } from "../undym/input.js";
import { GL } from "../gl/gl.js";
import { Btn } from "../widget/btn.js";
import { Targeting, Action } from "../force.js";
import { List } from "../widget/list.js";
import { ItemScene } from "./itemscene.js";
import { Font } from "../gl/glstring.js";
export class BattleScene extends Scene {
    constructor() {
        super();
        this.tecInfo = { tec: undefined, user: Unit.players[0] };
        this.btnSpace = new Layout();
    }
    static get ins() { return this._ins != null ? this._ins : (this._ins = new BattleScene()); }
    // async startBattle():Promise<BattleResult>{
    //     this.battleResult = BattleResult.WIN;
    //     await super.start();
    //     return this.battleResult;
    // }
    init() {
        super.clear();
        super.add(Place.TOP, DrawTop.ins);
        // super.add(Place.DUNGEON_DATA, DrawDungeonData.ins);
        super.add(Place.DUNGEON_DATA, new VariableLayout(() => {
            if (this.tecInfo.tec === undefined) {
                return DrawDungeonData.ins;
            }
            return ILayout.empty;
        }));
        super.add(Place.DUNGEON_DATA, ILayout.createDraw((bounds) => {
            if (this.tecInfo.tec === undefined) {
                return;
            }
            const tec = this.tecInfo.tec;
            const f = Font.getDef();
            let p = bounds.upperLeft;
            f.draw(`[${tec}]`, p, Color.WHITE);
            p = p.move(0, f.getSizeRatio());
            if (tec instanceof ActiveTec) {
                const user = this.tecInfo.user;
                if (tec.mpCost > 0) {
                    let col = tec.mpCost <= user.prm(Prm.MP).base ? Color.WHITE : Color.GRAY;
                    f.draw(`MP:${tec.mpCost}`, p, col);
                }
                if (tec.tpCost > 0) {
                    let col = tec.tpCost <= user.prm(Prm.TP).base ? Color.WHITE : Color.GRAY;
                    f.draw(`TP:${tec.tpCost}`, p.move(bounds.w * 0.3, 0), col);
                }
            }
            else {
            }
            for (let s of tec.info) {
                f.draw(s, p = p.move(0, f.getSizeRatio()), Color.WHITE);
            }
            if (Input.holding() === 0) {
                this.tecInfo.tec = undefined;
            }
        }));
        super.add(Place.MSG, Util.msg);
        super.add(Place.BTN, this.btnSpace);
        super.add(Place.E_BOX, DrawSTBoxes.enemies);
        super.add(Place.P_BOX, DrawSTBoxes.players);
        super.add(Place.UNIT_DETAIL, DrawUnitDetail.ins);
        super.add(Rect.FULL, ILayout.createDraw((noUsed) => {
            if (!Battle.getPhaseUnit().exists) {
                return;
            }
            GL.fillRect(Battle.getPhaseUnit().bounds, new Color(0, 1, 1, 0.2));
        }));
        super.add(Rect.FULL, ILayout.createCtrl((noUsed) => __awaiter(this, void 0, void 0, function* () {
            if (Battle.start) {
                Battle.start = false;
                yield this.phaseEnd();
                return;
            }
        })));
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
                this.phaseEnd();
                return;
            }
            Util.msg.set(`${attacker.name}`, Colors.UNIT_NAME);
            Util.msg.add(`の行動`);
            attacker.prm(Prm.TP).base += 10;
            attacker.fixPrm();
            attacker.phaseStart();
            if (attacker instanceof PUnit) {
                this.setPlayerPhase(attacker);
                return;
            }
            else {
                let e = attacker;
                // let actionSet:[Action,Unit[]] = this.searchEnemyAction(e);
                // await actionSet[0].use(e, actionSet[1]);
                yield e.ai(e, Unit.all);
                this.phaseEnd();
                return;
            }
        });
    }
    // private searchEnemyAction(u:EUnit):[Action,Unit[]]{
    //     if(!u.exists || u.dead){
    //         return [Action.empty, []];
    //     }
    //     for(let set of u.gambits()){
    //         if(!set.tec.checkCost(u)){continue;}
    //         let targets = filterTargets( set.gambit, set.tec, u, Unit.all );
    //         if(targets.length > 0){
    //             return [set.tec, targets];
    //         }
    //     }
    //     return [Action.empty, []];
    // }
    setPlayerPhase(attacker) {
        const createTecBtn = (tec) => {
            let btn;
            if (tec instanceof ActiveTec) {
                if (tec.checkCost(attacker)) {
                    btn = new Btn(tec.toString(), () => __awaiter(this, void 0, void 0, function* () {
                        if (tec.targetings & Targeting.SELECT) {
                            Util.msg.set(`[${tec}]のターゲットを選択してください`);
                            Scene.load(new ChooseTarget({
                                choose: (targets) => __awaiter(this, void 0, void 0, function* () {
                                    Scene.set(this);
                                    Util.msg.set(`＞${targets[0].name}を選択`);
                                    yield tec.use(attacker, targets);
                                    this.phaseEnd();
                                }),
                                cancel: () => {
                                    Util.msg.set("＞キャンセル");
                                    Scene.set(this);
                                }
                            }));
                            return;
                        }
                        else {
                            let targets = Targeting.filter(tec.targetings, attacker, Unit.all);
                            yield tec.use(attacker, targets);
                            this.phaseEnd();
                        }
                    }));
                }
                else {
                    btn = new Btn(tec.toString(), () => __awaiter(this, void 0, void 0, function* () {
                        Util.msg.set(`[${tec}]は使用できません`);
                    }));
                    btn.groundColor = () => Color.D_GRAY;
                    btn.stringColor = () => Color.RED;
                }
            }
            else if (tec instanceof PassiveTec) {
                btn = new Btn(tec.toString(), () => { });
            }
            else {
                btn = new Btn("", () => { });
            }
            return new Layout()
                .add(btn)
                .add(ILayout.createCtrl((bounds) => {
                if (Input.holding() > 3 && bounds.contains(Input.point)) {
                    this.tecInfo.tec = tec;
                    this.tecInfo.user = attacker;
                }
            }));
        };
        const btns = (() => {
            const TOP_H = 0.15;
            let list = new List(/*drawAPage*/ 6);
            let top = new YLayout();
            let res = new RatioLayout()
                .add(new Rect(0, 0, 1, TOP_H), top)
                .add(new Rect(0, TOP_H, 1, 1 - TOP_H), list);
            top.add(new Btn(";ITEM", () => __awaiter(this, void 0, void 0, function* () {
                Scene.load(ItemScene.ins({
                    user: attacker,
                    selectUser: false,
                    use: (item, user) => __awaiter(this, void 0, void 0, function* () {
                        if (item.targetings & Targeting.SELECT) {
                            Util.msg.set(`[${item}]のターゲットを選択してください`);
                            Scene.load(new ChooseTarget({
                                choose: (targets) => __awaiter(this, void 0, void 0, function* () {
                                    Scene.set(this);
                                    yield item.use(user, targets);
                                    this.phaseEnd();
                                }),
                                cancel: () => {
                                    Scene.set(this);
                                    this.setPlayerPhase(attacker);
                                }
                            }));
                        }
                        else {
                            let targets = Targeting.filter(item.targetings, user, Unit.players);
                            if (targets.length > 0) {
                                Scene.set(this);
                                yield item.use(user, targets);
                                yield this.phaseEnd();
                            }
                        }
                    }),
                    returnScene: () => {
                        Scene.set(BattleScene.ins);
                    },
                }));
            })));
            for (let tec of attacker.tecs) {
                list.addLayout(createTecBtn(tec));
            }
            return res;
        })();
        this.btnSpace.clear();
        this.btnSpace.add(btns);
    }
}
class ChooseTarget extends Scene {
    constructor(actions) {
        super();
        this.chooseAction = actions.choose;
        this.cancelAction = actions.cancel;
    }
    init() {
        super.add(Rect.FULL, ILayout.createDraw((bounds) => {
            BattleScene.ins.draw(bounds);
        }));
        super.add(Rect.FULL, ILayout.createDraw((bounds) => {
            for (let u of Unit.all.filter(u => u.exists)) {
                let color = Color.RED;
                for (let i = 0; i < 4; i++) {
                    const col = color;
                    color = col.darker();
                    const v = ((Date.now() / 80 + i) % 4) | 0;
                    if (v === 0) {
                        GL.line(u.bounds.upperLeft, u.bounds.upperRight, col);
                        continue;
                    }
                    if (v === 1) {
                        GL.line(u.bounds.upperRight, u.bounds.lowerRight, col);
                        continue;
                    }
                    if (v === 2) {
                        GL.line(u.bounds.lowerRight, u.bounds.lowerLeft, col);
                        continue;
                    }
                    if (v === 3) {
                        GL.line(u.bounds.lowerLeft, u.bounds.upperLeft, col);
                        continue;
                    }
                }
            }
        }));
        super.add(Rect.FULL, ILayout.createCtrl((noUsed) => {
            if (Input.pushed()) {
                for (let u of Unit.all) {
                    if (!u.exists) {
                        continue;
                    }
                    if (u.bounds.contains(Input.point)) {
                        this.chooseAction([u]);
                        return;
                    }
                }
                this.cancelAction();
            }
        }));
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
        for (let p of Unit.players.filter(p => p.exists)) {
            yield p.addJobExp(1);
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
    // if(Battle.type === BattleType.BOSS){
    //     await finish();
    //     // Scene.set( FieldScene.ins );
    //     return;
    // }
    yield finish();
    yield Battle.battleEndAction(BattleResult.WIN);
    // Scene.set( DungeonScene.ins );
});
const lose = () => __awaiter(this, void 0, void 0, function* () {
    Battle.result = BattleResult.LOSE;
    Util.msg.set("負けた");
    yield wait();
    if (Battle.type === BattleType.NORMAL) {
        const lostYen = Math.floor(PlayData.yen / 3);
        PlayData.yen -= lostYen;
        Util.msg.set(`${lostYen}円失った...`, (cnt) => Color.RED);
        yield wait();
    }
    yield finish();
    yield Battle.battleEndAction(BattleResult.LOSE);
});
const finish = () => __awaiter(this, void 0, void 0, function* () {
    for (let e of Unit.enemies) {
        e.exists = false;
    }
    for (let u of Unit.all) {
        u.battleAction = [Action.empty, []];
    }
});
