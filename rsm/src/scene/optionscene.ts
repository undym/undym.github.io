import { Scene } from "../undym/scene.js";
import { Place, Util, Debug, PlayData } from "../util.js";
import { Rect, Color, Size } from "../undym/type.js";
import { YLayout, ILayout, Layout, Label, FlowLayout } from "../undym/layout.js";
import { Btn } from "../widget/btn.js";
import { TownScene } from "./townscene.js";
import { List } from "../widget/list.js";
import { FXTest } from "../fx/fx.js";
import { Item, ItemType } from "../item.js";
import { Font, Graphics } from "../graphics/graphics.js";
import { ActiveTec, PassiveTec } from "../tec.js";
import { Player } from "../player.js";
import { SaveData } from "../savedata.js";
import { DungeonEvent } from "../dungeon/dungeonevent.js";
import { EqEar, Eq } from "../eq.js";
import { PartySkill } from "../partyskill.js";


export const createOptionBtn = ()=>{
    const w = 4;
    const h = 3;
    const l = new FlowLayout(w,h);

    setOptionBtn(l);

    return l;
};

const setOptionBtn = (l:FlowLayout)=>{
    l.clear();

    // l.add(new Btn("再読み込み", ()=>{
    //     window.location.href = window.location.href;
    // }));
    l.add(new Btn("データ削除", ()=>{
        setSaveDataDeleteBtn(l);
    }));


    l.addFromLast(new Btn("<<", ()=>{
        Scene.load( TownScene.ins );
    }));

    if(Debug.debugMode){
        l.addFromLast(new Btn("Debug", ()=>{
            setDebugBtn(l);
        }));
    }
};

const setSaveDataDeleteBtn = (l:FlowLayout)=>{
    Util.msg.set("セーブデータを削除しますか？");

    l.clear();
    l.add(new Btn("はい", ()=>{
        Util.msg.set("＞はい");
        setSaveDataDeleteBtn2(l);
    }));
    l.add(new Btn("いいえ", ()=>{
        Util.msg.set("＞いいえ");
        setOptionBtn(l);
    }));
    l.addFromLast(new Btn("<<", ()=>{
        Util.msg.set("やめた");
        setOptionBtn(l);
    }));
};

const setSaveDataDeleteBtn2 = (l:FlowLayout)=>{
    l.clear();
    l.add(new Btn("削除実行", ()=>{
        SaveData.delete();
        window.location.href = window.location.href;
    }));
    l.addFromLast(new Btn("<<", ()=>{
        Util.msg.set("やめた");
        setOptionBtn(l);
    }));
};

const setDebugBtn = (l:FlowLayout)=>{
    l.clear();

    l.add(new Btn("アイテム入手", ()=>{
        for(let item of Item.values){
            item.num = item.numLimit;
        }
        Util.msg.set("アイテム入手");
    }));
    l.add(new Btn("素材入手", ()=>{
        for(let item of ItemType.素材.values){
            item.num = item.numLimit;
        }
        Util.msg.set("素材入手");
    }));
    l.add(new Btn("技習得", ()=>{
        for(let p of Player.values){
            for(let tec of ActiveTec.values){
                p.ins.setMasteredTec(tec, true);
            }   
            for(let tec of PassiveTec.values){
                p.ins.setMasteredTec(tec, true);
            }   
        }
        
        Util.msg.set("技習得");
    }));
    l.add(new Btn("装備入手", ()=>{
        for(const eq of EqEar.values){
            eq.num += 1;
        }
        for(const eq of Eq.values){
            eq.num += 1;
        }
        
        Util.msg.set("装備入手");
    }));
    l.add(new Btn("パーティースキル入手", ()=>{
        for(const skill of PartySkill.values){
            skill.has = true;
        }
        
        Util.msg.set("パーティースキル入手");
    }));
    l.add(new Btn("金", ()=>{
        const value = 99999;
        PlayData.yen += value;

        Util.msg.set(`yen+${value}`);
    }));
    l.add(new Btn("EffectTest", ()=>{
        Scene.load(new EffectTest());
    }));

    
    l.addFromLast(new Btn("<<", ()=>{
        Scene.load( TownScene.ins );
    }));
    l.addFromLast(new Btn("Option", ()=>{
        setOptionBtn(l);
    }));
};


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
            Scene.load( TownScene.ins );
        }));

        for(let v of FXTest.values()){
            list.add({
                right:()=> v.name,
                push:()=> v.run(),
            });
        }
    }
    
}