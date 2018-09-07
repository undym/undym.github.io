{
    let run_timer;
    let clears;
    let y_deg = 0;
    let count = 0;

    function run(){
        for(let i = 0; i < clears.length; i++){
            let c = clears[i];
            c.style.left = Math.floor(window.innerWidth / 2 - c.offsetWidth / 2)+'px';
            c.style.top = (Math.sin( count * 0.1 + i * 0.4 ) * 2 + 2)+'em';
            let deg = y_deg + i * 15;
            c.style.transform = `rotateY(${deg}deg)`;
        }
        y_deg += 5;
        count++;
        run_timer = setTimeout( run, 36 );
    }
    createBase('trp30','trp_story_30','#f7806c',{
        init:(inside)=>{
            let p = document.createElement('div');
            p.style.position = 'relative';
            inside.appendChild(p);

            clears = [];

            for(let i = 0; i < 10; i++){
                p.appendChild((()=>{
                    let c = document.createElement('div');
                    c.style.display = 'inline-block';
                    c.style.position = 'absolute'
                    c.style.fontSize = '4em';
                    c.style.whiteSpace = 'nowrap';
                    c.textContent = '👺＜クリア★';
                    clears.push( c );
                    return c;
                })());
            }

            p.appendChild((()=>{
                let a = document.createElement('div');
                a.textContent = '　';
                a.style.fontSize = '14em';
                return a;
            })());
        },
        open:(inside)=>{
            run();
        },
        close:(inside)=>{
            clearTimeout( run_timer );
        }
    });
}