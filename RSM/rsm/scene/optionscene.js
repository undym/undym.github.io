var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Scene } from "../undym/scene.js";
import { Util, Debug } from "../util.js";
import { Rect, Color } from "../undym/type.js";
import { ILayout, FlowLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { TownScene } from "./townscene.js";
import { List } from "../widget/list.js";
import { FXTest } from "../fx/fx.js";
import { Item, ItemType } from "../item.js";
import { Graphics } from "../graphics/graphics.js";
import { ActiveTec, PassiveTec } from "../tec.js";
import { Player } from "../player.js";
import { SaveData } from "../savedata.js";
export const createOptionBtn = () => {
    const w = 4;
    const h = 3;
    const l = new FlowLayout(w, h);
    setOptionBtn(l);
    return l;
};
const setOptionBtn = (l) => {
    l.clear();
    // l.add(new Btn("再読み込み", ()=>{
    //     window.location.href = window.location.href;
    // }));
    l.add(new Btn("データ削除", () => {
        setSaveDataDeleteBtn(l);
    }));
    l.addFromLast(new Btn("<<", () => {
        Scene.load(TownScene.ins);
    }));
    if (Debug.DEBUG) {
        l.addFromLast(new Btn("Debug", () => {
            setDebugBtn(l);
        }));
    }
};
const setSaveDataDeleteBtn = (l) => {
    Util.msg.set("セーブデータを削除しますか？");
    l.clear();
    l.add(new Btn("はい", () => {
        Util.msg.set("＞はい");
        setSaveDataDeleteBtn2(l);
    }));
    l.add(new Btn("いいえ", () => {
        Util.msg.set("＞いいえ");
        setOptionBtn(l);
    }));
    l.add(new Btn("どちらともいえない", () => {
        Util.msg.set("＞はっきりしなさい");
    }));
    l.addFromLast(new Btn("<<", () => {
        Util.msg.set("やめた");
        setOptionBtn(l);
    }));
};
const setSaveDataDeleteBtn2 = (l) => {
    l.clear();
    l.add(new Btn("削除実行", () => {
        SaveData.delete();
        window.location.href = window.location.href;
    }));
    l.addFromLast(new Btn("<<", () => {
        Util.msg.set("やめた");
        setOptionBtn(l);
    }));
};
const setDebugBtn = (l) => {
    l.clear();
    l.add(new Btn("GetAllItmes", () => {
        for (let item of Item.values()) {
            item.num = item.numLimit;
        }
        Util.msg.set("GetAllItems");
    }));
    l.add(new Btn("GetMaterials", () => {
        for (let item of ItemType.素材.values()) {
            item.num = item.numLimit;
        }
        Util.msg.set("GetMaterials");
    }));
    l.add(new Btn("TecMaster", () => {
        for (let p of Player.values()) {
            for (let tec of ActiveTec.values()) {
                p.ins.setMasteredTec(tec, true);
            }
            for (let tec of PassiveTec.values()) {
                p.ins.setMasteredTec(tec, true);
            }
        }
        Util.msg.set("TecMaster");
    }));
    l.add(new Btn("btnIsVisible", () => {
        Debug.btnIsVisible = !Debug.btnIsVisible;
        Util.msg.set(`Debug.btnIsVisible:${Debug.btnIsVisible}`);
    }));
    l.add(new Btn("EffectTest", () => {
        Scene.load(new EffectTest());
    }));
    l.addFromLast(new Btn("<<", () => {
        Scene.load(TownScene.ins);
    }));
    l.addFromLast(new Btn("Option", () => {
        setOptionBtn(l);
    }));
};
// export class OptionScene extends Scene{
//     private static _ins:OptionScene;
//     static get ins():OptionScene{return this._ins != null ? this._ins : (this._ins = new OptionScene());}
//     private info:string = "";
//     private constructor(){
//         super();
//     }
//     init(){
//         super.clear();
//         if(Util.DEBUG){
//             super.add(new Rect(0, 0, 0.2, 1),new YLayout()
//                 .add(new Label(Font.def, ()=>this.info))
//                 .add(new Btn(()=>"ITEM+99",()=>{
//                     for(let item of Item.values()){
//                         item.num += 99;
//                     }
//                     this.info = "ITEM+99";
//                 }))
//                 .add(new Btn(()=>"EffectTest",async()=>{
//                     Scene.load( new EffectTest() );
//                 }))
//                 .add(ILayout.empty)
//             );
//         }
//         {
//             let w = 0.2;
//             super.add(new Rect(1 - w, 0, w, 1),new YLayout()
//                 .add(ILayout.empty)
//                 .add(new Layout()
//                     .add(new Btn(()=>"再読み込み",()=>{
//                         window.location.href = window.location.href;
//                     }))
//                     .add(new MsgPopup("left", Font.def, [
//                         ["新しいバージョンがあれば更新されます",Color.WHITE],
//                     ]))
//                 )
//                 .add(new Btn(()=>"<-",()=>{
//                     Scene.load( FieldScene.ins );
//                 }))
//                 .add(ILayout.empty)
//             );
//         }
//     }
// }
class EffectTest extends Scene {
    init() {
        const _super = Object.create(null, {
            clear: { get: () => super.clear },
            add: { get: () => super.add }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let list = new List();
            _super.clear.call(this);
            _super.add.call(this, new Rect(0, 0.1, 0.2, 0.8), list);
            _super.add.call(this, Rect.FULL, ILayout.create({ draw: (bounds) => {
                    {
                        let w = 5 / Graphics.pixelW;
                        let h = 5 / Graphics.pixelH;
                        Graphics.fillRect(new Rect(FXTest.attacker.x - w / 2, FXTest.attacker.y - h / 2, w, h), Color.RED);
                    }
                    {
                        let w = 5 / Graphics.pixelW;
                        let h = 5 / Graphics.pixelH;
                        Graphics.fillRect(new Rect(FXTest.target.x - w / 2, FXTest.target.y - h / 2, w, h), Color.CYAN);
                    }
                } }));
            _super.add.call(this, new Rect(0.8, 0.8, 0.2, 0.2), new Btn(() => "<-", () => {
                Scene.load(TownScene.ins);
            }));
            for (let v of FXTest.values()) {
                list.add({
                    right: () => v.name,
                    push: () => v.run(),
                });
            }
        });
    }
}
