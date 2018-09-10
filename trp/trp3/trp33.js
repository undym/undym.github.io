{
    let bg;
    let clear;
    let alpha = 0;

    const run = ()=>{
        clear.style.left = (window.innerWidth / 2 - clear.offsetWidth / 2)+'px';
        clear.style.top = (window.innerHeight / 2 - clear.offsetHeight / 2)+'px';
        clear.style.color = `rgba(255,255,255,${alpha})`;
        if(alpha < 1){
            alpha += 0.007;
            setTimeout( run, 36 );
        }
    };

    createBase('trp33','trp_story_33','#dcf7ff',{
        init:(inside)=>{
            document.body.appendChild((()=>{
                bg = document.createElement('div');
                bg.style.position = 'fixed';
                bg.style.backgroundColor = 'black';
                bg.style.top = '0px';
                bg.style.left = '0px';
                bg.style.width = window.innerWidth+'px';
                bg.style.height = window.innerHeight+'px';
                bg.appendChild((()=>{
                    clear = document.createElement('div');
                    clear.textContent = 'クリア★';
                    clear.style.position = 'absolute';
                    clear.style.fontSize = '10em';
                    clear.style.userSelect = 'none';
                    return clear;
                })());
                return bg;
            })());
        },
        open:(inside)=>{
            run();
        },
        close:(inside)=>{
        },
    });
}