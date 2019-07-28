import { Scene } from "../undym/scene.js";
import { Place, Util } from "../util.js";
import { Rect, Color, Size } from "../undym/type.js";
import { YLayout, ILayout, Layout, Label, FlowLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { FieldScene } from "./fieldscene.js";
import { List } from "../widget/list.js";
import { FXTest } from "../fx/fx.js";
import { Input } from "../undym/input.js";
import { Popup, MsgPopup } from "../widget/popup.js";
import { Item } from "../item.js";
import { Font, Graphics } from "../graphics/graphics.js";
import { ActiveTec, PassiveTec } from "../tec.js";
import { Player } from "../player.js";


export const createOptionBtn = ()=>{
    const w = 4;
    const h = 3;
    const l = new FlowLayout(w,h);

    setOptionBtn(l);

    return l;
};

const setOptionBtn = (l:FlowLayout)=>{
    l.clear();

    l.add(new Btn("再読み込み", ()=>{
        window.location.href = window.location.href;
    }));

    if(Util.DEBUG){
    }

    l.addFromLast(new Btn("<<", ()=>{
        Scene.load( FieldScene.ins );
    }));

    if(Util.DEBUG){
        l.addFromLast(new Btn("Debug", ()=>{
            setDebugBtn(l);
        }));
    }
};

const setDebugBtn = (l:FlowLayout)=>{
    l.clear();

    l.add(new Btn("GetAllItmes", ()=>{
        for(let item of Item.values()){
            item.num = item.numLimit;
        }
        Util.msg.set("GetAllItems");
    }));
    l.add(new Btn("TecMaster", ()=>{
        for(let p of Player.values()){
            for(let tec of ActiveTec.values()){
                p.ins.setMasteredTec(tec, true);
            }   
            for(let tec of PassiveTec.values()){
                p.ins.setMasteredTec(tec, true);
            }   
        }
        
        Util.msg.set("WeAreMaster!!");
    }));
    l.add(new Btn("EffectTest", ()=>{
        Scene.load(new EffectTest());
    }));

    
    l.addFromLast(new Btn("<<", ()=>{
        Scene.load( FieldScene.ins );
    }));
    l.addFromLast(new Btn("Option", ()=>{
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
//                 .add(new Label(Font.getDef(), ()=>this.info))
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
//                     .add(new MsgPopup("left", Font.getDef(), [
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



class EffectTest extends Scene{

    async init() {
        let list = new List();
        super.clear();
        super.add(new Rect(0, 0.1, 0.2, 0.8), list);
        super.add(Rect.FULL, ILayout.create({draw:(bounds)=>{
            {
                let w = 5 / Graphics.pixelW;
                let h = 5 / Graphics.pixelH;
                Graphics.fillRect( new Rect(FXTest.attacker.x - w / 2, FXTest.attacker.y - h / 2, w, h ), Color.RED );
            }
            {
                let w = 5 / Graphics.pixelW;
                let h = 5 / Graphics.pixelH;
                Graphics.fillRect( new Rect(FXTest.target.x - w / 2, FXTest.target.y - h / 2, w, h ), Color.CYAN );
            }
        }}));
        super.add(new Rect(0.8, 0.8, 0.2, 0.2),new Btn(()=>"<-",()=>{
            Scene.load( FieldScene.ins );
        }));

        for(let v of FXTest.values()){
            list.add({
                right:()=> v.name,
                push:()=> v.run(),
            });
        }
    }
    
}