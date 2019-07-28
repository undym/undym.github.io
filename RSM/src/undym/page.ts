


export class Page{
    private constructor(){}

    static running = true;
    static isRunning(){return this.running;}

    static init(){
        window.addEventListener("beforeunload",ev=>{
            this.running = false;
            ev.preventDefault();
            return "";
        });
    }
}