{
    class Graph{
        constructor(bar, bar_shadow, bar_light, bar_light_top, percent, height){
            this.bar = bar;
            this.bar_shadow = bar_shadow;
            this.bar_light = bar_light;
            this.bar_light_top = bar_light_top;
            this.percent = percent;
            this.height = height;
        }
    }
    let init = false;
    let count = 0;
    let graphs = [];

    const VALUES = [
        {name:"🐸" ,color:"magenta" ,percent:26},
        {name:"🍖" ,color:"orange" ,percent:29},
        {name:"🐗" ,color:"cyan" ,percent:70},
        {name:"🐱" ,color:"green" ,percent:28},
        {name:"🐶" ,color:"pink" ,percent:1},
        {name:"🐰" ,color:"teal" ,percent:80},
        {name:"👺" ,color:"red" ,percent:10},
        {name:"クリア★" ,color:"yellow" ,percent:180},
        
    ];

    function run(){
        const COUNT_MAX = 20;

        for(let i = 0; i < graphs.length; i++){
            let g = graphs[i];
            let h = g.height * count / COUNT_MAX;
            let top = (100 - h);

            g.bar_shadow.style.top = (top + 1)+'%';
            g.bar_shadow.style.height = (h - 1)+'%';

            g.bar.style.top = top+'%';
            g.bar.style.height = h+'%';

            g.bar_light.style.top = top+'%';
            g.bar_light.style.height = h+'%';

            g.bar_light_top.style.top = top+'%';

            g.percent.textContent = h+'%';
            g.percent.style.top = (top - 12)+'%';
        }

        if(++count <= COUNT_MAX){
            setTimeout( run ,50 );
        }

    }
    createBase('trp23','trp_story_23','#ff695e',(inside)=>{
        if(!init){
            init = true;
            
            const width = 300;
            const height = 200;
            let p = document.createElement('div');
            p.style.position = 'relative';
            p.style.left = '1em';
            p.style.width = width+'px';
            p.style.height = height+'px';
            p.style.backgroundColor = 'gray';

            let line = 9;
            for(let i = 0; i < line; i++){
                p.appendChild((()=>{
                    let a = document.createElement('div');
                    a.style.backgroundColor = 'white';
                    a.style.position = 'absolute';
                    a.style.width  = width+'px';
                    a.style.height = '1px';
                    a.style.left = '0px';
                    a.style.top = (height / (line + 1) * (i + 1))+'px';

                    return a;
                })());
            }

            for(let i = 0; i < VALUES.length; i++){
                let v = VALUES[i];

                let w = Math.floor( width / (VALUES.length + 1) );
                let w_half = Math.floor(w / 2);
                let percent = document.createElement('div');
                let bar_shadow = document.createElement('div');
                let bar = document.createElement('div');
                let bar_light = document.createElement('div');
                let bar_light_top = document.createElement('div');

                p.appendChild((()=>{
                    percent.style.position = 'absolute';
                    percent.style.left = Math.floor(w * i + w - w_half / 2 - 20)+'px';
                    percent.style.width = w_half+'px';
                    percent.style.textAlign = 'center';
                    return percent;
                })());
                p.appendChild((()=>{
                    bar_shadow.style.position = 'absolute';
                    bar_shadow.style.left = Math.floor(w * i + w - w_half / 2 + 2)+'px';
                    bar_shadow.style.width = w_half+'px';
                    bar_shadow.style.backgroundColor = 'black';
                    return bar_shadow;
                })());
                p.appendChild((()=>{
                    bar.style.position = 'absolute';
                    bar.style.left = Math.floor(w * i + w - w_half / 2)+'px';
                    bar.style.width = w_half+'px';
                    bar.style.backgroundColor = v.color;
                    return bar;
                })());
                p.appendChild((()=>{
                    bar_light.style.position = 'absolute';
                    bar_light.style.left = Math.floor(w * i + w - w_half / 2)+'px';
                    bar_light.style.width = '1px';
                    bar_light.style.backgroundColor = 'white';
                    return bar_light;
                })());
                p.appendChild((()=>{
                    bar_light_top.style.position = 'absolute';
                    bar_light_top.style.left = Math.floor(w * i + w - w_half / 2)+'px';
                    bar_light_top.style.width = w_half+'px';
                    bar_light_top.style.height = '1px';
                    bar_light_top.style.backgroundColor = 'white';
                    return bar_light_top;
                })());
                p.appendChild((()=>{
                    let name = document.createElement('div');
                    name.textContent = v.name;
                    name.style.position = 'absolute';
                    name.style.left = Math.floor(w * i + w - w_half / 2 - 18)+'px';
                    name.style.top = '100%';
                    name.style.whiteSpace = 'nowrap';
                    return name;
                })());
                graphs.push(new Graph(bar, bar_shadow, bar_light, bar_light_top, percent, v.percent));
            }

            inside.appendChild( p );
            inside.appendChild( document.createElement('br') );
        }

        count = 0;
        run();
    },(inside)=>{
    });
}