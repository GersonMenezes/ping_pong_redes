const canvasEl = document.getElementById("myCanvas");
const canvasCtx = canvasEl.getContext("2d");
const gapX = 10;
let mouse = {x: 0, y: 0 }
let ballPostionX;
let ballPostionY;
let width_global = 1300;
let height_global = 700;
let data = {ball_x: 0, ball_y: 0, paddle_y: 0, score_p1: 0, score_p2: 0};

// ------------------ WebSocket ------------------//
// Abre conexão com o servidor websocket, mudar o IP.
var socket = new WebSocket('ws://10.15.114.82:8080/ws');

socket.onopen = function(event) {
    console.log('Player 2 está Conectado ao servidor WebSocket');
};

socket.onmessage = function(event) {
    var data_p1 = JSON.parse(event.data);
    data['ball_x'] = parseInt(data_p1['ball_x'])
    data['ball_y'] = parseInt(data_p1['ball_y'])
    data['paddle_y'] = parseInt(data_p1['paddle_y'])
    data['score_p1'] = parseInt(data_p1['score_p1'])
    data['score_p2'] = parseInt(data_p1['score_p2'])
  
};

socket.onclose = function(event) {
    console.log('Conexão fechada');
};
// ------------------ End WebSocket ------------------//

// Cria uma nova instância de imagem
var imagem = new Image();
imagem.src = "images/image.png";

// Define as coordenadas x e y da imagem
const image = {
    x: 0,
    y: 0,
    _move: function(){
        this.x =  data['ball_x'] - 40;
        this.y =  data['ball_y'] - 40;
    },
    draw: function(){
        // Desenha a imagem nas coordenadas x e y
        canvasCtx.drawImage(imagem, image.x, image.y)
        this._move()
    }
}

const field = {
    x: 0,
    y: 0,
    w: window.innerWidth,
    h: window.innerHeight,
    draw: function(){
        this.w = width_global
        this.h = height_global
        //Campo
        canvasCtx.fillStyle = "#286047"
        canvasCtx.fillRect(this.x, this.y, this.w, this.h)
    }
}

const line = {
    w: 15,
    x: (field.w/2) - (15/2),
    y: field.y,
    h: field.h,
    draw: function(){
        this.x = (width_global/2) - (15/2)
        //Linha do meio
        canvasCtx.fillStyle = "#ffffff"
        canvasCtx.fillRect(this.x, this.y, this.w, this.h)
    }
}
const score = {

    draw: function () {
        canvasCtx.font = "bold 72px Arial"
        canvasCtx.textAlign = "center"
        canvasCtx.textBaseline = "top"
        canvasCtx.fillStyle = "#01341D"
        canvasCtx.fillText(data['score_p1'], width_global / 4, 50)
        canvasCtx.fillText(data['score_p2'], width_global / 2 + width_global / 4, 50)
    }
}

const leftPaddle = {
    x: gapX,
    y: 240,
    w: line.w,
    h: 200,
    speed: 10,
    draw: function(){
        //Raquete 1
        canvasCtx.fillStyle = "#ffffff"
        canvasCtx.fillRect(this.x, data['paddle_y'], this.w, this.h)
    }
}

const rightPaddle = {
    x: width_global - line.w - gapX,
    y: 240,
    w: line.w,
    h: 200,
    speed: 10,
    _moveUp: function(){
        if (rightPaddle.y > field.y){
            this.y -= this.speed
            var data = {paddle_y: this.y}
            var json_data = JSON.stringify(data);
            if (socket.readyState === WebSocket.OPEN) socket.send(json_data);
        }
    },
    _moveDown: function(){
        if (rightPaddle.y + rightPaddle.h < field.h){
            this.y += this.speed
            var data = {paddle_y: this.y}
            var json_data = JSON.stringify(data);
            if (socket.readyState === WebSocket.OPEN) socket.send(json_data);
        }
    },
    draw: function(){
        this.x = width_global - line.w - gapX
        canvasCtx.fillStyle = "#ffffff"
        canvasCtx.fillRect(this.x, this.y, this.w, this.h)
    }
}

const ball = {
    x: field.w/2,
    y: field.h/2,
    directionX: 1,
    directionY: 1,
    r: 20,
    speed: 5,
    draw: function(){
            //Bola
        canvasCtx.fillStyle = "#ffffff"
        canvasCtx.beginPath()
        canvasCtx.arc(data['ball_x'], data['ball_y'], this.r, 2 * Math.PI, false) // False é sentido anti-horário
        canvasCtx.fill() 
    }
}

  // Carrega a imagem e inicia a animação quando estiver pronta
  imagem.onload = function() {
    image.draw();
  };

function setup() {
    canvasEl.width = canvasCtx.width = window.innerWidth
    canvasEl.height = canvasCtx.height = window.innerHeight
}

function draw() {
    field.draw()
    leftPaddle.draw()
    rightPaddle.draw()
    score.draw()
    line.draw()
    ball.draw()
    image.draw()
}

window.animateFrame = (function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
        return window.setTimeout(callback, 1000 / 60)
        }
    )
})()

function main() {
    animateFrame(main)
    draw()
}

setup()
main()

// Variáveis para controlar o estado das teclas
  const keysState = {};

// Função para tratar o evento de pressionar uma tecla
function handleKeyPress(event) {
    if (event.key === "o") {
        rightPaddle._moveUp()
    } else if (event.key === "l") {
        rightPaddle._moveDown()
     }
  }

  function handleKeyPress2(event) {
    if (event.key === "w") {     
        leftPaddle._moveUp()
    } else if (event.key === "s") {
        leftPaddle._moveDown()
    }
  }

  // Adicionar ouvintes de eventos aos eventos de pressionar e soltar teclas

    document.addEventListener("keypress", handleKeyPress);
    window.addEventListener('resize', () => {
        width_global = window.innerWidth;
        height_global = window.innerHeight;
        console.log(`Nova largura: ${field.w}, Nova altura: ${field.h}`);
});

