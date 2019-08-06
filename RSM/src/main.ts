
import { TownScene } from "./scene/townscene.js";
import { Scene, wait } from "./undym/scene.js";
import {Util, SceneType} from "./util.js";
import { Input } from "./undym/input.js";
import { Unit } from "./unit.js";
import { FX, FXTest } from "./fx/fx.js";
import { Dungeon } from "./dungeon/dungeon.js";
import { Player } from "./player.js";
import { Rect, Color, Point } from "./undym/type.js";
import { Page } from "./undym/page.js";
import { Graphics, Texture, Font } from "./graphics/graphics.js";
import { Item } from "./item.js";
import { SaveData } from "./savedata.js";


window.onload = ()=>{
    console.log("start");

    Page.init();

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
                    runBtnVisible = false;
                    document.body.removeChild(run);
                }else{
                    runBtnVisible = true;
                    document.body.appendChild(run);
                }
                runBtnVisible = !runBtnVisible;
            };
            reload.innerText = "再読み込み";
            reload.style.position = "absolute";
            reload.style.top = "0px";
            reload.style.left = "0px";
            return reload;
        })();
        document.body.appendChild(reload);
    }

    const texture = new Texture({canvas:canvas});
    Graphics.setRenderTarget(texture);
    Input.init(canvas, rotate);
    Util.init();
    Unit.init();

    init();

    if(SaveData.exists()){
        continueGame();
        Scene.load( TownScene.ins );
        ctrl();
    }else{
        newGame();
        Scene.load( TownScene.ins );
        ctrl();
    }

    setInterval( draw, 1000 / 30 );

};

const ctrl = async()=>{
    await Scene.now.ctrl(Rect.FULL);
    
    Input.update();
    setTimeout(ctrl, 1000 / 30);
};

const draw = ()=>{
    Graphics.fillRect(Rect.FULL, Color.BLACK);
    Scene.now.draw(Rect.FULL);

    FX.draw();
};

const init = ()=>{
    SceneType.now = SceneType.TOWN;
    Dungeon.now = Dungeon.はじまりの丘;
};

const newGame = ()=>{
    Util.msg.set("NEW GAME");

    Player.スメラギ.join();

    const setItemNum = (item:Item, num:number)=>{
        item.num = num;
        item.totalGetNum = num;
    }
    
    setItemNum(Item.スティックパン, 5);
    setItemNum(Item.脱出ポッド, 1);
};

const continueGame = ()=>{
    Util.msg.set("CONTINUE");
    
    SaveData.load();
}