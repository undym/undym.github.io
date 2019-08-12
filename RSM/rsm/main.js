var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TownScene } from "./scene/townscene.js";
import { Scene } from "./undym/scene.js";
import { Util, SceneType, Debug } from "./util.js";
import { Input } from "./undym/input.js";
import { Unit } from "./unit.js";
import { FX } from "./fx/fx.js";
import { Dungeon } from "./dungeon/dungeon.js";
import { Player } from "./player.js";
import { Rect, Color } from "./undym/type.js";
import { Page } from "./undym/page.js";
import { Graphics, Texture } from "./graphics/graphics.js";
import { Item } from "./item.js";
import { SaveData } from "./savedata.js";
import DungeonEvent from "./dungeon/dungeonevent.js";
window.onload = () => {
    console.log("start");
    Page.init();
    const canvas = document.getElementById("canvas");
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
        const run = (() => {
            const res = document.createElement("button");
            res.onclick = () => {
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
        const reload = (() => {
            const reload = document.createElement("button");
            reload.onclick = () => {
                if (runBtnVisible) {
                    document.body.removeChild(run);
                }
                else {
                    document.body.appendChild(run);
                }
                runBtnVisible = !runBtnVisible;
            };
            reload.innerText = "再読み込み";
            reload.style.position = "absolute";
            reload.style.top = "0px";
            reload.style.left = "0px";
            reload.style.width = "10vw";
            reload.style.height = "5vh";
            return reload;
        })();
        document.body.appendChild(reload);
    }
    setInput();
    const texture = new Texture({ canvas: canvas });
    Graphics.setRenderTarget(texture);
    Input.init(canvas, rotate);
    init();
    if (SaveData.exists()) {
        continueGame();
        Scene.load(TownScene.ins);
        ctrl();
    }
    else {
        newGame();
        Scene.load(TownScene.ins);
        ctrl();
    }
    setInterval(draw, 1000 / 30);
};
const ctrl = () => __awaiter(this, void 0, void 0, function* () {
    yield Scene.now.ctrl(Rect.FULL);
    Input.update();
    setTimeout(ctrl, 1000 / 30);
});
const draw = () => {
    Graphics.fillRect(Rect.FULL, Color.BLACK);
    Scene.now.draw(Rect.FULL);
    FX.draw();
};
const init = () => {
    Util.init();
    Unit.init();
    SceneType.now = SceneType.TOWN;
    Dungeon.now = Dungeon.はじまりの丘;
    //画像読み込み
    for (const ev of DungeonEvent.values()) {
        ev.getImg();
    }
};
const newGame = () => {
    Util.msg.set("NEW GAME");
    Player.スメラギ.join();
    const setItemNum = (item, num) => {
        item.num = num;
        item.totalGetNum = num;
    };
    setItemNum(Item.スティックパン, 5);
    setItemNum(Item.脱出ポッド, 1);
};
const continueGame = () => {
    Util.msg.set("CONTINUE");
    SaveData.load();
};
const setInput = () => {
    document.addEventListener("keydown", ev => {
        if (Debug.DEBUG) {
            if (ev.key === "d") {
                Debug.debugMode = !Debug.debugMode;
            }
        }
    });
};
