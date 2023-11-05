
let barra = new Image();
barra.src = "img/barra.svg"

let imMesa1 = new Image();
imMesa1.src = "img/mesa1.png";

let imSilla1 = new Image();
imSilla1.src = "img/silla1.png";

let imSilla2 = new Image();
imSilla2.src = "img/silla2.png";

let pjs = new Image();
pjs.src = "img/pjs.png";

window.onload = function () {

    //tamaño canvas
    const CANVASWIDTH = 1500;
    const CANVASHEIGHT = 800;
    //tamaño mesa
    const MESAWIDTH = 100;
    const MESAHEIGHT = 100;
    //tamaño sillas
    const SILLAWIDTH = 50;
    const SILLAHEIGHT = 50;
    //tamaño prota
    const PROTAWIDTH = 50;
    const PROTAHEIGHT = 100;
    //velocidad del prota
    const VELOCIDAD = 10;
    let prota;


    let ctx;



    class Protagonista {
        constructor() {
            this.sprite = [[43, 132], [73, 132], [43, 198], [73, 198], [40, 3], [73, 3], [43, 69], [73, 69]];
            this.x = 10;
            this.y = 600;
            this.animacion;
            this.moviendo = false;
            this.posicion = 0;
            this.direccion = 0;
        }

        moverDerecha() {
            if (this.x < (CANVASWIDTH - 40)) {
                this.x = this.x + VELOCIDAD;
            } else {
                this.x = (CANVASWIDTH - 40);
            }
        }

        moverIzquierda() {
            if (this.x > 0) {
                this.x = this.x - VELOCIDAD;
            } else {
                this.x = 0;
            }
        }

        moverArriba() {
            if (this.y > 0) {
                this.y = this.y - VELOCIDAD;
            } else {
                this.y = 0;
            }
        }

        moverAbajo() {
            if (this.y < (CANVASHEIGHT - 40)) {
                this.y = this.y + VELOCIDAD;
            } else {
                this.y = (CANVASHEIGHT - 40);
            }
        }
    }

    class Mesa {
        constructor(x, y) {
            this.mesa = [x, (y + SILLAHEIGHT + 10)];
            this.silla1 = [(x + 25), y];
            this.silla2 = [(x + 25), (y + SILLAHEIGHT + 20 + MESAHEIGHT)];
        }

        dibujar() {
            ctx.drawImage(imSilla1, this.silla1[0], this.silla1[1], SILLAWIDTH, SILLAHEIGHT);
            ctx.drawImage(imMesa1, this.mesa[0], this.mesa[1], MESAWIDTH, MESAHEIGHT);
            ctx.drawImage(imSilla2, this.silla2[0], this.silla2[1], SILLAWIDTH, SILLAHEIGHT);
        }
    }






    function activaMovimiento(event) {

        if (!prota.moviendo && event.keyCode > 36 && event.keyCode < 41) {
            prota.animacion = setInterval(dibujarProta, 1000 / 10);
            prota.moviendo = true;
            prota.direccion = event.keyCode
        }


    }

    function desactivaMovimiento(event) {
        if (prota.moviendo && event.keyCode > 36 && event.keyCode < 41 && event.keyCode == prota.direccion) {
            clearInterval(prota.animacion);
            prota.moviendo = false;
            switch (event.keyCode) {
                case 39:
                    prota.posicion = 0;
                    break;
                case 38:
                    prota.posicion = 2;
                    break;
                case 40:
                    prota.posicion = 4;
                    break;
                case 37:
                    prota.posicion = 6;
                    break;
            }
            prota.direccion = 0;
            dibujarProta();

        }
    }

    function dibujarProta() { 
        
        ctx.clearRect(prota.x, prota.y, PROTAWIDTH, PROTAHEIGHT);
            switch (prota.direccion) {
                case 37:
                    prota.moverIzquierda();
                    prota.posicion = ((prota.posicion + 1) % 2) + 6;
                    break;
                case 38:
                    prota.moverArriba();
                    prota.posicion = ((prota.posicion + 1) % 2) + 2;
                    break;
                case 39:
                    prota.moverDerecha();
                    prota.posicion = (prota.posicion + 1) % 2;
                    break;
                case 40:

                    prota.moverAbajo();
                    prota.posicion = ((prota.posicion + 1) % 2) + 4;
                    break;
            }


        comprobarChoque(300, 100, MESAWIDTH, (SILLAHEIGHT*2+20+MESAHEIGHT));
        
        ctx.drawImage(pjs, prota.sprite[prota.posicion][0], prota.sprite[prota.posicion][1], 30, 60, prota.x, prota.y, PROTAWIDTH, PROTAHEIGHT);

    }

    function comprobarChoque(x_, y_, siceX_, siceY_) {
        let bIzq  = prota.x;
		let bDer  = prota.x + PROTAWIDTH;
		let bDown = prota.y;
		let bUp   = prota.y + PROTAHEIGHT;

        let nIzq  = x_;
		let nDer  = x_ + siceX_;
		let nDown   = y_;
		let nUp = y_ + siceY_;
			
		if (( bDer  > nIzq ) &
			( bIzq  < nDer ) &
			( bUp   > nDown) &
			( bDown < nUp) ) {
		
                return true;
		} else {
            return false;
        }
        /*
        if (prota.x <= (x_ + siceX_) && prota.y <= (y_ + siceY_)) {
            prota.y = prota.direccion==38?(y_ + siceY_):prota.y;
            prota.x = prota.direccion==37?(x_ + siceX_):prota.x;
            return true;
        } else {
            return false;
        }*/
    }


    let canvas = document.getElementById("miCanvas");
    canvas.setAttribute("width", CANVASWIDTH);
    canvas.setAttribute("height", CANVASHEIGHT);
    ctx = canvas.getContext("2d");

    ctx.drawImage(barra, 10, 10, 90, 480);

    let conj = new Mesa(300, 100);
    conj.dibujar();

    prota = new Protagonista();
    dibujarProta();




    document.addEventListener("keydown", activaMovimiento, false);
    document.addEventListener("keyup", desactivaMovimiento, false);



}