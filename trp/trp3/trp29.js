{
    let elements;
    let colors;
    let run_timer;
    let clear;
    let count = 0;

    function run(){
        for(let i = 0; i < elements.length; i++){
            elements[i].style.backgroundColor = colors[(i + count) % colors.length];
        }

        clear.style.left = Math.floor(window.innerWidth / 2 - clear.offsetWidth / 2)+'px';
        
        count+= 1;
        run_timer = setTimeout( run, 36 );
    }

    createBase('trp29','trp_story_29','#ff0000',{
        init:(inside)=>{
            let p = document.createElement('div');
            inside.appendChild(p);
            elements = new Array(200);
            for(let i = 0; i < elements.length; i++){
                let e = document.createElement('div');
                e.textContent = '　';
                e.style.width = '0.5%';
                e.style.height = '7em';
                e.style.cssFloat = 'right';

                elements[i] = e;
                p.appendChild(e);
            }

            p.appendChild((()=>{
                clear = document.createElement('div');
                clear.style.clear = 'both';
                clear.style.position = 'absolute'
                clear.style.fontSize = '5em';
                clear.textContent = 'クリア★';
                return clear;
            })());
            p.appendChild((()=>{
                let a = document.createElement('div');
                a.textContent = '　';
                return a;
            })());

            colors = new Array( elements.length );
            for(let i = 0; i < colors.length; i++){
                let r = 255;
                let g = 255;
                let b = 0;
                let rad = Math.PI * 2 * i / colors.length;
                rad *= 5;//1つの帯の中にこの数のループをつくる
                let a = Math.sin( rad ) / 2 + 0.5;
                colors[i] = `rgba(${r},${g},${b},${a})`;
            }
        },
        open:(inside)=>{
            run();
        },
        close:(inside)=>{
            clearTimeout( run_timer );
        }
    });
}