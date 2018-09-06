{
    let run_timer;
    let clear;
    let y_deg = 0;
    let count = 0;

    function run(){
        clear.style.left = Math.floor(window.innerWidth / 2 - clear.offsetWidth / 2)+'px';
        clear.style.top = (Math.sin( count * 0.1 ) * 2 + 2)+'em';
        clear.style.transform = `rotateY(${y_deg}deg)`;
        y_deg += 5;
        count++;
        run_timer = setTimeout( run, 36 );
    }
    createBase('trp30','trp_story_30','#f7806c',{
        init:(inside)=>{
            let p = document.createElement('div');
            inside.appendChild(p);

            p.appendChild((()=>{
                clear = document.createElement('div');
                clear.style.display = 'inline-block';
                clear.style.position = 'relative'
                clear.style.fontSize = '4em';
                clear.textContent = '👺＜クリア★';
                return clear;
            })());

            p.appendChild((()=>{
                let a = document.createElement('div');
                a.textContent = '　';
                a.style.fontSize = '12em';
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