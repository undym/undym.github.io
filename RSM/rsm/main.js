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
import { Input } from "./undym/input.js";
import { Unit } from "./unit.js";
import { FX } from "./fx/fx.js";
import { DungeonArea } from "./dungeon/dungeon.js";
import { Player } from "./player.js";
import { Rect, Color } from "./undym/type.js";
import { Page } from "./undym/page.js";
import { Graphics, Texture } from "./graphics/graphics.js";
import { Item } from "./item.js";
window.onload = () => {
    console.log("start");
    Page.init();
    let canvas = document.getElementById("canvas");
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
    const texture = new Texture({ canvas: canvas });
    Graphics.setRenderTarget(texture);
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
        Graphics.fillRect(Rect.FULL, Color.BLACK);
        Scene.now.draw(Rect.FULL);
        FX.draw();
    }
    Scene.load(FieldScene.ins);
    ctrl();
    setInterval(draw, 1000 / 30);
};
const newGame = () => {
    //test
    Unit.setPlayer(0, Player.ルイン.ins);
    Unit.setPlayer(1, Player.ピアー.ins);
    Item.スティックパン.num = 5;
    Item.スティックパン.totalGetNum = Item.スティックパン.num;
    DungeonArea.now = DungeonArea.再構成トンネル;
};
