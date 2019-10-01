
import { TownScene } from "./scene/townscene.js";
import { Scene, wait } from "./undym/scene.js";
import {Util, SceneType, Debug, PlayData} from "./util.js";
import { Input } from "./undym/input.js";
import { Unit } from "./unit.js";
import { FX, FXTest } from "./fx/fx.js";
import { Dungeon } from "./dungeon/dungeon.js";
import { Player } from "./player.js";
import { Rect, Color, Point } from "./undym/type.js";
import { Graphics, Texture, Font } from "./graphics/graphics.js";
import { Item } from "./item.js";
import { SaveData, Version } from "./savedata.js";
import { DungeonEvent } from "./dungeon/dungeonevent.js";
import { XLayout, ILayout } from "./undym/layout.js";
import { Job } from "./job.js";
import { PartySkill } from "./partyskill.js";


{
    let runBtnVisible = false;
    const run = (()=>{
        const res = document.createElement("button");
        res.onclick = ()=>{
            window.location.href = window.location.href;
        };
        res.innerText = "再読み込み実行";
        res.style.position = "absolute";
        res.style.left = "33vw";
        res.style.top = "50vh";
        res.style.width = "33vw";
        res.style.height = "50vh";
        return res;
    })();
    const reload = (()=>{
        const reload = document.createElement("button");
        reload.onclick = ()=>{
            if(runBtnVisible){
                document.body.removeChild(run);
            }else{
                document.body.appendChild(run);
            }
            runBtnVisible = !runBtnVisible;
        };
        reload.innerText = "再読み込み";
        reload.style.position = "absolute";
        reload.style.top = "0px";
        reload.style.left = "0px";
        reload.style.width = "10vw";
        reload.style.height = "3vh";
        return reload;
    })();
    document.body.appendChild(reload);
}


window.onload = ()=>{
    {
        const loading = document.getElementById("loading") as HTMLElement;
        document.body.removeChild(loading);
    }

    console.log("start");

    
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const rotate = false;
    // const rotate:boolean = window.navigator.userAgent.indexOf("Mobile") !== -1;
    
    // if(rotate){
    //     canvas.style.width = "100vh";
    //     canvas.style.height = "100vw";
    //     canvas.style.transformOrigin = "top left";
    //     canvas.style.transform = "translateX(100vw) rotate(90deg)";
    // }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;


    setInput();

    const texture = new Texture({canvas:canvas});
    Graphics.setRenderTarget(texture);
    Input.init(canvas, rotate);

    init();

    if(SaveData.exists()){
        continueGame();
        ctrl();
    }else{
        newGame();
        Scene.load( TownScene.ins );
        ctrl();
    }

    // Scene.load(new TestScene());
    // ctrl();

    setInterval( draw, 1000 / 30 );


};

const ctrl = async()=>{
    await Scene.now.ctrl(Rect.FULL);
    
    Input.update();
    setTimeout(ctrl, 1000 / 60);
};

const draw = ()=>{
    Graphics.fillRect(Rect.FULL, Color.BLACK);
    Scene.now.draw(Rect.FULL);

    FX.draw();
};

const init = ()=>{
    Util.init();
    Unit.init();

    SceneType.TOWN.set();
    Dungeon.now = Dungeon.はじまりの丘;
    //画像読み込み
    for(const ev of DungeonEvent.values()){
        ev.getImg();
    }

    PartySkill.skills.length = PartySkill.DEF_PARTY_SKILL_NUM;
    PartySkill.skills.fill( PartySkill.empty );
};

const newGame = ()=>{
    Util.msg.set("NEW GAME");

    Player.スメラギ.join();

};

const continueGame = ()=>{
    Util.msg.set("CONTINUE");
    
    SaveData.load();
}

const setInput = ()=>{
    document.addEventListener("keydown", ev=>{
        if(Debug.DEBUG){
            if(ev.key === "d"){
                Debug.debugMode = !Debug.debugMode;
            }
        }
    });
};


class TestScene extends Scene{
    constructor(){
        super();
    }
    init(){
        super.clear();

        super.add(Rect.FULL, ILayout.create({draw:()=>{
            Graphics.fillRect(Rect.FULL, Color.GRAY);
        }}));

        const MAIN = new Rect(0, 0, 1, 0.8);
        const WIPE = new Rect(0, MAIN.yh, 0.2, 0.2);
        const MSG = new Rect(WIPE.xw, WIPE.y, 1 - WIPE.w, WIPE.h);

        super.add(Rect.FULL, ILayout.create({draw:()=>{
            if(Math.random() < 0.6){return;}
            for(let i = 0; i < 10; i++){
                const y = Math.random();
                Graphics.line({x:0, y:y}, {x:1, y:y}, Color.BLACK);
            }
        }}));

    }
}