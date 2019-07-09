export class EqPos {
    constructor(name) {
        this.toString = () => name;
        EqPos._values.push(this);
    }
    static values() { return this._values; }
}
EqPos._values = [];
EqPos.頭 = new EqPos("頭");
EqPos.武 = new EqPos("武");
EqPos.盾 = new EqPos("盾");
EqPos.体 = new EqPos("体");
EqPos.腰 = new EqPos("腰");
EqPos.腕 = new EqPos("腕");
EqPos.手 = new EqPos("手");
EqPos.指 = new EqPos("指");
EqPos.脚 = new EqPos("脚");
export class Eq {
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    constructor(name, info, pos, appearLv) {
        this.toString = () => name;
        this.info = info;
        this.pos = pos;
        Eq._values.push(this);
    }
    static values() { return this._values; }
    static posValues(pos) {
        if (this._posValues === undefined) {
            this._posValues = new Map();
            for (let p of EqPos.values()) {
                this._posValues.set(p, []);
            }
            for (let eq of this.values()) {
                this._posValues.get(eq.pos).push(eq);
            }
        }
        return this._posValues.get(pos);
    }
    /**各装備箇所のデフォルト装備を返す.*/
    static getDef(pos) {
        if (pos === EqPos.頭) {
            return this.髪;
        }
        if (pos === EqPos.武) {
            return this.恋人;
        }
        if (pos === EqPos.盾) {
            return this.板;
        }
        if (pos === EqPos.体) {
            return this.襤褸切れ;
        }
        if (pos === EqPos.腰) {
            return this.ひも;
        }
        if (pos === EqPos.腕) {
            return this.腕;
        }
        if (pos === EqPos.手) {
            return this.手;
        }
        if (pos === EqPos.指) {
            return this.肩身の指輪;
        }
        if (pos === EqPos.脚) {
            return this.きれいな靴;
        }
        return this.髪;
    }
    //--------------------------------------------------------------------------
    //
    //
    //
    //--------------------------------------------------------------------------
    phaseStart(unit) { }
    beforeDoAtk(action, attacker, target, dmg) { }
    beforeBeAtk(action, attacker, target, dmg) { }
    afterDoAtk(action, attacker, target, dmg) { }
    afterBeAtk(action, attacker, target, dmg) { }
}
Eq._values = [];
//--------------------------------------------------------------------------
//
//頭
//
//--------------------------------------------------------------------------
Eq.髪 = new class extends Eq {
    constructor() {
        super("髪", ["髪a", "髪b"], EqPos.頭, /*lv*/ 0);
    }
};
//--------------------------------------------------------------------------
//
//武
//
//--------------------------------------------------------------------------
Eq.恋人 = new class extends Eq {
    constructor() {
        super("恋人", ["恋人info"], EqPos.武, /*lv*/ 0);
    }
};
//--------------------------------------------------------------------------
//
//盾
//
//--------------------------------------------------------------------------
Eq.板 = new class extends Eq {
    constructor() {
        super("板", [], EqPos.盾, /*lv*/ 0);
    }
};
//--------------------------------------------------------------------------
//
//体
//
//--------------------------------------------------------------------------
Eq.襤褸切れ = new class extends Eq {
    constructor() {
        super("襤褸切れ", [], EqPos.体, /*lv*/ 0);
    }
};
//--------------------------------------------------------------------------
//
//腰
//
//--------------------------------------------------------------------------
Eq.ひも = new class extends Eq {
    constructor() {
        super("ひも", [], EqPos.腰, /*lv*/ 0);
    }
};
//--------------------------------------------------------------------------
//
//腕
//
//--------------------------------------------------------------------------
Eq.腕 = new class extends Eq {
    constructor() {
        super("腕", [], EqPos.腕, /*lv*/ 0);
    }
};
//--------------------------------------------------------------------------
//
//手
//
//--------------------------------------------------------------------------
Eq.手 = new class extends Eq {
    constructor() {
        super("手", [], EqPos.手, /*lv*/ 0);
    }
};
//--------------------------------------------------------------------------
//
//指
//
//--------------------------------------------------------------------------
Eq.肩身の指輪 = new class extends Eq {
    constructor() {
        super("肩身の指輪", [], EqPos.指, /*lv*/ 0);
    }
};
//--------------------------------------------------------------------------
//
//脚
//
//--------------------------------------------------------------------------
Eq.きれいな靴 = new class extends Eq {
    constructor() {
        super("きれいな靴", [], EqPos.脚, /*lv*/ 0);
    }
};
