{
    const DUMMY_TEXT = '　';
    const MISSILE_PRICE = 10;
    let dom = {
        time:undefined,
        prm:undefined,
        msg:undefined,
        buy_missile:undefined,
        use_missile:undefined,
    };
    let over;//ms
    let start_date;
    let update_timer;
    let prm = {
        vit:0,
        atk:0,
        def:0,
        yen:0,
    };
    let running = false;
    let missile;
    let kill_evil_num;

    const reset = ()=>{
        over = 20000;
        start_date = new Date();
        prm.vit = 0;
        prm.atk = 0;
        prm.def = 0;
        prm.yen = 0;
        missile = 0;
        kill_evil_num = 0;
        dom.msg.textContent = DUMMY_TEXT;
        dom.buy_missile.style.display = 'none';
        dom.use_missile.style.display = 'none';
        running = true;
    };

    const update = ()=>{
        if(!running){return;}

        dom.prm.textContent = `体力:${prm.vit} 攻撃:${prm.atk} 防御:${prm.def} お金:${prm.yen}円`;

        let now_date = new Date();
        let count_ms = now_date.getTime() - start_date.getTime();
        if(count_ms < over){
            let sec = Math.floor( (over - count_ms) / 1000 );
            let msec = ( '000' + (over - count_ms) ).slice(-3);
            dom.time.textContent = '大魔王襲来まであと'+sec+'.'+msec+'秒';
            update_timer = setTimeout( update, 36 );
        }else{
            dom.time.textContent = '大魔王襲来まであと0秒';
            dom.msg.textContent = 'あなたは大魔王に殺されてしまった！';
            running = false;
        }

    };

    createBase('trp32','trp_story_32','#286d47',{
        init:(inside)=>{
            inside.appendChild((()=>{
                dom.time = document.createElement('div');
                return dom.time;
            })());
            inside.appendChild((()=>{
                dom.prm = document.createElement('div');
                return dom.prm;
            })());
            inside.appendChild((()=>{
                dom.msg = document.createElement('div');
                return dom.msg;
            })());
            inside.appendChild((()=>{
                let p = document.createElement('div');
                let a = document.createElement('span');
                a.textContent = '訓練';
                a.style.cursor = 'pointer';
                a.style.textDecoration = 'underline';
                a.addEventListener('click',()=>{
                    if(!running){return;}

                    let rnd = Math.random();
                    let num = 4;
                    let value = 1;
                          if(rnd <= 1.0 / num * 1){
                            prm.vit += value;
                            dom.msg.textContent = `体力+${value}`;
                    }else if(rnd <= 1.0 / num * 2){
                            prm.atk += value;
                            dom.msg.textContent = `攻撃+${value}`;
                    }else if(rnd <= 1.0 / num * 3){
                            prm.def += value;
                            dom.msg.textContent = `防御+${value}`;
                    }else{
                            prm.yen += value;
                            dom.msg.textContent = `お金+${value}`;
                            if(prm.yen >= MISSILE_PRICE){
                                dom.buy_missile.style.display = 'block';
                            }
                    }
                });
                p.appendChild( a );
                return p;
            })());
            inside.appendChild((()=>{
                let p = document.createElement('div');
                let a = document.createElement('span');
                a.textContent = 'ミサイル購入';
                a.style.cursor = 'pointer';
                a.style.textDecoration = 'underline';
                a.addEventListener('click',()=>{
                    if(!running){return;}
                    if(prm.yen < MISSILE_PRICE){
                        dom.msg.textContent = 'お金ない';
                        return;
                    }

                    prm.yen -= MISSILE_PRICE;
                    missile++;
                    dom.use_missile.style.display = 'block';
                    dom.msg.textContent = 'ミサイル買った';
                });
                p.appendChild( dom.buy_missile = a );
                return p;
            })());
            inside.appendChild((()=>{
                let p = document.createElement('div');
                let a = document.createElement('span');
                a.textContent = 'ミサイル発射！';
                a.style.cursor = 'pointer';
                a.style.textDecoration = 'underline';
                a.addEventListener('click',()=>{
                    if(!missile){return;}

                    running = false;
                    kill_evil_num++;
                    if(kill_evil_num === 1){
                        dom.msg.textContent = '大魔王は粉々に砕け散った！クリア★';
                        return;
                    }
                    if(kill_evil_num === 2){
                        dom.msg.textContent = 'あなたも粉々に砕け散った！超クリア★';
                        return;
                    }
                });
                p.appendChild( dom.use_missile = a );
                return p;
            })());
        },
        open:(inside)=>{
            reset();
            update();
        },
        close:(inside)=>{
            clearTimeout( update_timer );
        },
    });
}