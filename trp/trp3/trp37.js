{
    let answer;

    createBase('trp37','trp_story_37','#eb9498',{
        init:(inside)=>{
            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.textContent = 'Q. \"undymente\"の読み'
                return a;
            })());
            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.style.cursor = 'pointer';
                a.style.textDecoration = 'underline';
                a.textContent = '1.あんでぃーめんて';
                a.addEventListener('click',()=>{
                    answer.textContent = 'クリア★';
                });
                return a;
            })());
            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.style.cursor = 'pointer';
                a.style.textDecoration = 'underline';
                a.textContent = '2.いんでぃーめんて';
                a.addEventListener('click',()=>{
                    answer.textContent = 'ちがう';
                });
                return a;
            })());
            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.style.cursor = 'pointer';
                a.style.textDecoration = 'underline';
                a.textContent = '3.うんでぃーめんて';
                a.addEventListener('click',()=>{
                    answer.textContent = 'ちがう';
                });
                return a;
            })());
            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.style.cursor = 'pointer';
                a.style.textDecoration = 'underline';
                a.textContent = '4.えんでぃーめんて';
                a.addEventListener('click',()=>{
                    answer.textContent = 'ちがう';
                });
                return a;
            })());
            inside.appendChild((()=>{
                let a = document.createElement('div');
                a.style.cursor = 'pointer';
                a.style.textDecoration = 'underline';
                a.textContent = '5.おんでぃーめんて';
                a.addEventListener('click',()=>{
                    answer.textContent = 'ちがう';
                });
                return a;
            })());
            
            inside.appendChild((()=>{
                answer = document.createElement('div');
                answer.textContent = '　';
                return answer;
            })());

        },
    });
}