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
import { DrawSTBoxes, DrawTop, DrawUnitDetail } from "./sceneutil.js";
import { YLayout, ILayout, VariableLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { Unit } from "../unit.js";
import { List } from "../widget/list.js";
import { Rect, Color } from "../undym/type.js";
import { ItemParentType } from "../item.js";
import { Input } from "../undym/input.js";
import { Graphics, Font } from "../graphics/graphics.js";
export class ItemScene extends Scene {
    static ins(actions) {
        this._ins != null ? this._ins : (this._ins = new ItemScene());
        this._ins.selectUser = actions.selectUser;
        this._ins.user = actions.user;
        this._ins.use = actions.use;
        this._ins.returnScene = actions.returnScene;
        return this._ins;
    }
    constructor() {
        super();
        this.list = new List();
    }
    init() {
        this.selectedItem = undefined;
        super.clear();
        super.add(Place.TOP, DrawTop.ins);
        {
            const w = Place.E_BOX.w + Place.MAIN.w;
            let listBounds;
            listBounds = new Rect(1 / Graphics.pixelW, Place.MAIN.y, w * 0.3, Place.MAIN.h);
            super.add(listBounds, this.list);
            let typeBounds = new Rect(listBounds.xw, Place.MAIN.y, w * 0.3, Place.MAIN.h);
            let types = new YLayout();
            for (let type of ItemParentType.values()) {
                types.add(new Btn(() => type.toString(), () => {
                    this.setList(type);
                }));
            }
            super.add(typeBounds, types);
            let infoBounds = new Rect(typeBounds.xw, Place.MAIN.y, w - (listBounds.w + typeBounds.w), Place.MAIN.h);
            super.add(infoBounds, ILayout.createDraw((bounds) => {
                Graphics.fillRect(bounds, Color.D_GRAY);
                if (this.selectedItem !== undefined) {
                    let item = this.selectedItem;
                    let font = Font.getDef();
                    let p = bounds.upperLeft.move(1 / Graphics.pixelW, 2 / Graphics.pixelH);
                    font.draw(`[${item}]`, p, Color.WHITE);
                    font.draw(`所持数:${item.num}個`, p = p.move(0, font.ratioH), Color.WHITE);
                    font.draw(`<${item.itemType}>`, p = p.move(0, font.ratioH), Color.WHITE);
                    font.draw(`Rank:${item.rank}`, p = p.move(0, font.ratioH), Color.WHITE);
                    p = p.move(0, font.ratioH);
                    for (let s of item.info) {
                        font.draw(s, p = p.move(0, font.ratioH), Color.WHITE);
                    }
                }
            }));
        }
        super.add(Place.BTN, new YLayout()
            .add(ILayout.empty)
            .add(ILayout.empty)
            .add((() => {
            const canUse = new Btn(() => "使用", () => __awaiter(this, void 0, void 0, function* () {
                yield this.use(this.selectedItem, this.user);
                // if(this.battle){
                //     Util.msg.set(`;${ItemScene.selectedItem}`);
                //     // this.end();
                //     return;
                // }else{
                //     const item = ItemScene.selectedItem as Item;
                //     if(item.targetings & Targeting.SELECT){
                //         await item.use( this.user, [this.user] );
                //     }else{
                //         let targets = Targeting.filter( item.targetings, this.user, Unit.players );
                //         if(targets.length > 0){
                //             await item.use( this.user, targets );
                //         }
                //     }
                // }
            }));
            const cantUse = new Btn(() => "使用", () => { });
            cantUse.stringColor = () => Color.GRAY;
            return new VariableLayout(() => {
                if (this.selectedItem === undefined || !this.selectedItem.canUse()) {
                    return cantUse;
                }
                return canUse;
            });
        })())
            .add(new Btn(() => "<-", () => {
            this.returnScene();
        })));
        super.add(Place.P_BOX, DrawSTBoxes.players);
        super.add(Place.UNIT_DETAIL, DrawUnitDetail.ins);
        super.add(Rect.FULL, ILayout.createDraw((noUsed) => {
            Graphics.fillRect(this.user.bounds, new Color(0, 1, 1, 0.2));
        }));
        super.add(Rect.FULL, ILayout.createCtrl((noUsed) => {
            if (!this.selectUser) {
                return;
            }
            if (!Input.pushed()) {
                return;
            }
            for (let p of Unit.players.filter(p => p.exists)) {
                if (p.bounds.contains(Input.point)) {
                    this.user = p;
                    break;
                }
            }
        }));
        this.setList(ItemParentType.回復);
    }
    setList(parentType) {
        this.list.clear();
        for (let type of parentType.children) {
            this.list.add({
                center: () => `${type}`
            });
            for (let item of type.values().filter(item => item.num > 0)) {
                this.list.add({
                    left: () => `${item.num < 99 ? item.num : 99}`,
                    right: () => `${item}`,
                    push: (elm) => {
                        this.selectedItem = item;
                    },
                });
            }
        }
    }
}
