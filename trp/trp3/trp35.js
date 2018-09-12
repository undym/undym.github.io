{
    const total_w_num = 50;
    const total_h_num = 50;
    const font_size = 0.5;
    let elements;
    let count = 0;
    let run_timer;

    const run = ()=>{
        for(let y = 0; y < elements.length; y++){
            for(let x = 0; x < elements[y].length; x++){
                // if(!elements[y][x]){continue;}
                let sin = Math.sin( (y * total_w_num + x * y) * Math.PI * 1 / total_w_num + count * 0.2 );
                let alpha = 1.0 - Math.abs( sin );
                // if(sin < 0){continue;}
                elements[y][x].style.color = `rgba(0,0,0,${alpha})`;
            }
        }
        count++;
        run_timer = setTimeout( run , 36 );
    };

    createBase('trp35','trp_story_35','#a58ac4',{
        init:(inside)=>{
            const CLEARS = ['ク','リ','ア','★'];
            inside.appendChild((()=>{
                let p = document.createElement('div');
                p.style.position = 'relative';
                let cx = total_w_num / 2;
                let cy = total_h_num / 2;
                let i = 0;
                elements = new Array( total_h_num );

                for(let y = 0; y < total_h_num; y++){
                    elements[y] = new Array( total_w_num );
                    for(let x = 0; x < total_w_num; x++){

                        let a = document.createElement('div');
                        a.textContent = CLEARS[i % CLEARS.length];
                        a.style.fontSize = font_size+'em';
                        a.style.position = 'absolute';
                        a.style.left = (x)+'em';
                        a.style.top  = (y)+'em';

                        p.appendChild( a );
                        elements[y][x] = a;
                        
                        i++;
                    }
                }

                return p;
            })());
            
            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.textContent = '　';
                a.style.fontSize = (total_h_num * font_size)+'em';
                return a;
            })());

        },
        open:(inside)=>{
            run();
        },
        close:(inside)=>{
            clearTimeout( run_timer );
        },
    });
}