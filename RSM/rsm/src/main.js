var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FieldScene } from "./scene/fieldscene.js";
import { Scene } from "./undym/scene.js";
import { Util } from "./util.js";
import { GL } from "./gl/gl.js";
import { Input } from "./undym/input.js";
import { Unit } from "./unit.js";
import { FX } from "./fx/fx.js";
import { DungeonArea } from "./dungeon/dungeon.js";
import { Player } from "./player.js";
import { Rect } from "./undym/type.js";
import { Page } from "./undym/page.js";
window.onload = () => {
    console.log("start");
    Page.init();
    let canvas = document.getElementById("canvas");
    const rotate = window.navigator.userAgent.indexOf("Mobile") !== -1;
    if (rotate) {
        canvas.style.width = "100vh";
        canvas.style.height = "100vw";
        canvas.style.transformOrigin = "top left";
        canvas.style.transform = "translateX(100vw) rotate(90deg)";
    }
    const innerResolution = 1.0;
    GL.init(canvas, innerResolution);
    Input.init(canvas, rotate);
    Util.init();
    Unit.init();
    newGame();
    function ctrl() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Scene.now.ctrl(Rect.FULL);
            Input.update();
            setTimeout(ctrl, 1000 / 30);
        });
    }
    function draw() {
        Scene.now.draw(Rect.FULL);
        FX.draw();
        GL.gl.flush();
        //isContextLost(): たとえばモバイルデバイスで電源イベントが発生したなどの理由 でwebglコンテキストが失われ、作り直さなければならない場合 は、trueを返す。
        //if(GL.getGL().isContextLost())
    }
    Scene.load(FieldScene.ins);
    ctrl();
    setInterval(draw, 1000 / 30);
};
const newGame = () => {
    //test
    Unit.setPlayer(0, Player.ルイン.ins);
    Unit.setPlayer(1, Player.ピアー.ins);
    Unit.setPlayer(2, Player.test1.ins);
    Unit.setPlayer(3, Player.test2.ins);
    DungeonArea.now = DungeonArea.再構成トンネル;
};
