var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Scene } from "../undym/scene.js";
import { Place } from "../util.js";
import { DrawSTBoxes, DrawUnitDetail, DrawPlayInfo } from "./sceneutil.js";
import { ILayout, RatioLayout, VariableLayout, FlowLayout, XLayout, Labels } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Unit } from "../unit.js";
import { List } from "../widget/list.js";
import { Rect, Color } from "../undym/type.js";
import { Item, ItemParentType } from "../item.js";
import { Input } from "../undym/input.js";
import { Graphics, Font } from "../graphics/graphics.js";
export class ItemScene extends Scene {
    constructor() {
        super();
        this.selected = false;
        this.list = new List();
    }
    static ins(args) {
        this._ins ? this._ins : (this._ins = new ItemScene());
        this._ins.selectUser = args.selectUser;
        this._ins.user = args.user;
        this._ins.use = args.use;
        this._ins.returnScene = args.returnScene;
        return this._ins;
    }
    init() {
        this.selected = false;
        this.selectedItem = Item.石;
        super.clear();
        super.add(Place.TOP, DrawPlayInfo.ins);
        const pboxBounds = new Rect(0, 1 - Place.ST_H, 1, Place.ST_H);
        const mainBounds = new Rect(0, Place.TOP.yh, 1, 1 - Place.TOP.h - pboxBounds.h);
        super.add(mainBounds, new XLayout()
            .add(this.list)
            .add((() => {
            const infoBounds = new Rect(0, 0, 1, 0.4);
            const btnBounds = new Rect(0, infoBounds.yh, 1, 1 - infoBounds.yh);
            return new RatioLayout()
                .add(infoBounds, ILayout.create({ draw: (bounds) => {
                    Graphics.fillRect(bounds, Color.D_GRAY);
                } }))
                .add(infoBounds, (() => {
                const info = new Labels(Font.def)
                    .add(() => `[${this.selectedItem}]`, () => Color.WHITE)
                    .add(() => {
                    const num = this.selectedItem.consumable
                        ? `${this.selectedItem.remainingUseNum}/${this.selectedItem.num}`
                        : `${this.selectedItem.num}`;
                    const limit = this.selectedItem.num >= this.selectedItem.numLimit ? "（所持上限）" : "";
                    return `${num}個${limit}`;
                }, () => Color.WHITE)
                    .add(() => `<${this.selectedItem.itemType}>`, () => Color.WHITE)
                    .add(() => `Rank:${this.selectedItem.rank}`, () => Color.WHITE)
                    .addln(() => this.selectedItem.info, () => Color.WHITE);
                return new VariableLayout(() => this.selected ? info : ILayout.empty);
            })())
                .add(btnBounds, (() => {
                const otherBtns = [
                    new Btn("<<", () => {
                        this.returnScene();
                    }),
                    (() => {
                        const canUse = new Btn(() => "使用", () => __awaiter(this, void 0, void 0, function* () {
                            yield this.use(this.selectedItem, this.user);
                        }));
                        const cantUse = new Btn(() => "-", () => { });
                        return new VariableLayout(() => {
                            if (!this.selected || !this.selectedItem.canUse(this.user, [this.user])) {
                                return cantUse;
                            }
                            return canUse;
                        });
                    })(),
                ];
                const w = 2;
                const h = ((otherBtns.length + ItemParentType.values.length + 1) / w) | 0;
                const l = new FlowLayout(w, h);
                for (let type of ItemParentType.values) {
                    l.add(new Btn(type.toString(), () => {
                        this.setList(type);
                    }));
                }
                for (const o of otherBtns) {
                    l.addFromLast(o);
                }
                return l;
            })());
        })()));
        super.add(pboxBounds, DrawSTBoxes.players);
        super.add(new Rect(pboxBounds.x, pboxBounds.y - Place.MAIN.h, pboxBounds.w, Place.MAIN.h), DrawUnitDetail.ins);
        super.add(Rect.FULL, ILayout.create({ draw: (bounds) => {
                Graphics.fillRect(this.user.bounds, new Color(0, 1, 1, 0.2));
            } }));
        super.add(Rect.FULL, ILayout.create({ ctrl: (bounds) => {
                if (!this.selectUser) {
                    return;
                }
                if (!Input.click) {
                    return;
                }
                for (let p of Unit.players.filter(p => p.exists)) {
                    if (p.bounds.contains(Input.point)) {
                        this.user = p;
                        break;
                    }
                }
            } }));
        this.setList(ItemParentType.回復);
    }
    setList(parentType) {
        this.list.clear();
        for (let type of parentType.children) {
            this.list.add({
                center: () => `${type}`,
                groundColor: () => Color.D_GRAY,
            });
            for (let item of type.values.filter(item => item.num > 0)) {
                this.list.add({
                    left: () => {
                        if (item.consumable) {
                            return `${item.remainingUseNum}/${item.num}`;
                        }
                        return `${item.num}`;
                    },
                    right: () => `${item}`,
                    groundColor: () => item === this.selectedItem ? Color.D_CYAN : Color.BLACK,
                    push: (elm) => {
                        this.selected = true;
                        this.selectedItem = item;
                    },
                });
            }
        }
    }
}
