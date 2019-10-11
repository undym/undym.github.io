var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Scene } from "../undym/scene.js";
import { FlowLayout, ILayout, VariableLayout, XLayout, RatioLayout, Labels } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Rect, Color } from "../undym/type.js";
import { DrawSTBoxes, DrawUnitDetail, DrawPlayInfo } from "./sceneutil.js";
import { Place } from "../util.js";
import { Graphics, Font } from "../graphics/graphics.js";
import { List } from "../widget/list.js";
import { TownScene } from "./townscene.js";
import { FX_Str } from "../fx/fx.js";
import { PartySkill } from "../partyskill.js";
export class PartySkillScene extends Scene {
    constructor() {
        super();
        this.settingSkillList = new List();
        this.list = new List();
        this.choosedSkill = PartySkill.empty;
        this.choosedSkill = PartySkill.empty;
        SettingSkillMap.reset();
        this.setSettingSkillList();
        this.setList();
    }
    init() {
        super.clear();
        super.add(Place.TOP, DrawPlayInfo.ins);
        const pboxBounds = new Rect(0, 1 - Place.ST_H, 1, Place.ST_H);
        super.add(new Rect(0, Place.TOP.yh, 1, 1 - Place.TOP.h - pboxBounds.h), new XLayout()
            .add(this.settingSkillList)
            .add(this.list)
            .add((() => {
            const infoBounds = new Rect(0, 0, 1, 0.75);
            const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);
            return new RatioLayout()
                .add(infoBounds, ILayout.create({ draw: (bounds) => {
                    Graphics.fillRect(bounds, Color.D_GRAY);
                } }))
                .add(infoBounds, (() => {
                return new VariableLayout(() => {
                    const info = new Labels(Font.def)
                        .add(() => `[${this.choosedSkill}]`);
                    return this.choosedSkill !== PartySkill.empty ? info : ILayout.empty;
                });
            })())
                .add(btnBounds, (() => {
                const btns = [
                    new Btn("<<", () => {
                        Scene.load(TownScene.ins);
                    }),
                    (() => {
                        const set = new Btn("セット", () => __awaiter(this, void 0, void 0, function* () {
                            for (let i = 0; i < PartySkill.skills.length; i++) {
                                if (PartySkill.skills[i] === PartySkill.empty) {
                                    PartySkill.skills[i] = this.choosedSkill;
                                    FX_Str(Font.def, `${this.choosedSkill}をセットしました`, { x: 0.5, y: 0.5 }, Color.WHITE);
                                    SettingSkillMap.reset();
                                    this.setSettingSkillList();
                                    return;
                                }
                            }
                            FX_Str(Font.def, `セット枠に空きがありません`, { x: 0.5, y: 0.5 }, Color.WHITE);
                        }));
                        const unset = new Btn("外す", () => __awaiter(this, void 0, void 0, function* () {
                            for (let i = 0; i < PartySkill.skills.length; i++) {
                                if (PartySkill.skills[i] === this.choosedSkill) {
                                    PartySkill.skills[i] = PartySkill.empty;
                                    FX_Str(Font.def, `${this.choosedSkill}を外しました`, { x: 0.5, y: 0.5 }, Color.WHITE);
                                    SettingSkillMap.reset();
                                    this.setSettingSkillList();
                                    return;
                                }
                            }
                        }));
                        const noset = new Btn("-", () => { });
                        return new VariableLayout(() => {
                            if (this.choosedSkill === PartySkill.empty) {
                                return noset;
                            }
                            if (SettingSkillMap.has(this.choosedSkill)) {
                                return unset;
                            }
                            return set;
                        });
                    })(),
                ];
                const w = 2;
                const h = ((btns.length + 1) / w) | 0;
                const l = new FlowLayout(w, h);
                for (const o of btns) {
                    l.addFromLast(o);
                }
                return l;
            })());
        })()));
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
    }
    setSettingSkillList() {
        this.settingSkillList.clear(true);
        this.settingSkillList.add({
            center: () => `セット中`,
            groundColor: () => Color.D_GRAY,
        });
        PartySkill.skills
            .forEach((skill) => {
            if (skill === PartySkill.empty) {
                this.settingSkillList.add({
                    right: () => "-",
                });
            }
            else {
                let color = () => {
                    if (skill === this.choosedSkill) {
                        return Color.ORANGE;
                    }
                    return Color.WHITE;
                };
                this.settingSkillList.add({
                    right: () => `${skill}`,
                    rightColor: color,
                    groundColor: () => SettingSkillMap.has(skill) ? Color.D_CYAN : Color.BLACK,
                    push: (elm) => {
                        this.choosedSkill = skill;
                    },
                });
            }
        });
    }
    setList() {
        this.list.clear(true);
        this.list.add({
            center: () => `スキル`,
            groundColor: () => Color.D_GRAY,
        });
        PartySkill.values
            .filter(skill => skill.has && skill !== PartySkill.empty)
            .forEach((skill) => {
            let color = () => {
                if (skill === this.choosedSkill) {
                    return Color.ORANGE;
                }
                return Color.WHITE;
            };
            this.list.add({
                right: () => `${skill}`,
                rightColor: color,
                groundColor: () => SettingSkillMap.has(skill) ? Color.D_CYAN : Color.BLACK,
                push: (elm) => {
                    this.choosedSkill = skill;
                },
            });
        });
    }
}
class SettingSkillMap {
    static reset() {
        this.map.clear();
        for (const skill of PartySkill.skills) {
            this.map.set(skill, true);
        }
    }
    static has(skill) {
        return this.map.has(skill);
    }
}
SettingSkillMap.map = new Map();
