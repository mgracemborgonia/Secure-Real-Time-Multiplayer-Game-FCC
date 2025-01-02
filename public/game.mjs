import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let player;
let coin;
const speed = 20;
const base_x = 30;
const base_y = 65;
const max_x = 580;
const max_y = 385;
export {base_x, base_y, max_x, max_y};

function game_background(context){
    //Base background
    context.fillStyle = "blue";
    context.fillRect(0, 0, canvas.width, canvas.height);
    //Inner background
    context.fillStyle = "dodgerblue";
    context.fillRect(10, 40, canvas.width-20, canvas.height-50);
}
function game_coin(context,x,y){
    const coin_radius = 10;
    context.beginPath();
    context.arc(x, y, coin_radius, 0, 2 * 3.14);
    context.fillStyle = "gold";
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = "orange";
    context.stroke();
}
function face_player(context,x,y){
    const face_radius = 20;
    const eye_radius = 5;
    const eyeball_radius = 2;
    //Player's face
    context.beginPath();
    context.arc(x, y, face_radius, 0, 2 * 3.14);
    context.fillStyle = 'yellow';
    context.fill();
    //Left eye
    context.beginPath();
    context.arc(x+8, y-2, eye_radius, 0, 2 * 3.14);
    context.fillStyle = 'white';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = "black";
    context.stroke();
    //Left eyeball
    context.beginPath();
    context.arc(x+8, y-2, eyeball_radius, 0, 2 * 3.14);
    context.fillStyle = 'black';
    context.fill();
    //Right eye
    context.beginPath();
    context.arc(x-8, y-2, eye_radius, 0, 2 * 3.14);
    context.fillStyle = 'white';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = "black";
    context.stroke();
    //Right eyeball
    context.beginPath();
    context.arc(x-8, y-2, eyeball_radius, 0, 2 * 3.14);
    context.fillStyle = 'black';
    context.fill();
    //Player's mouth
    context.strokeStyle = 'black';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(x - 6, y + 10);
    context.lineTo(x + 6, y + 10);
    context.stroke();
    context.closePath();
}
function game_text(context, rank, number_of_players){
    context.fillStyle = 'white';
    context.font = 'bold 25px Monospace';
    context.fillText('Controls: WASD', 15, 30);
    context.fillText('Coin Race', 270, 30);
    context.fillText(`Rank:${rank}/${number_of_players}`, 515, 30);
    context.fill();
}

socket.on('new player', function(number_of_players, player_id, callback){
    const player_x = Math.floor(Math.random() * (max_x + 1)) + base_x;
    const player_y = Math.floor(Math.random() * (max_y + 1)) + base_y;
    const coin_x = Math.floor(Math.random() * (max_x + 1)) + base_x;
    const coin_y = Math.floor(Math.random() * (max_y + 1)) + base_y;
    player = new Player({
        x: player_x,
        y: player_y,
        score: 0,
        id: player_id}
    );
    if(number_of_players === 0){
        const max_id = Math.floor(Math.random() * 1000000);
        coin = new Collectible({
            x: coin_x,
            y: coin_y,
            value: 1,
            id: max_id
        });
        callback({player,coin});
    }else{
        callback({player});
    }
});
socket.on('update state', function(currentState){
    const {players, coin} = currentState;
    const number_of_players = Object.keys(players).length;
    let scores = [];
    context.clearRect(0, 0, canvas.width, canvas.height);
    game_background(context);
    game_coin(context, coin.x, coin.y);
    for(const id in players){
        face_player(context, players[id].x, players[id].y);
        scores.push(players[id].score);
    }
    game_text(context, player.calculateRank(scores), number_of_players);
});

document.onkeydown = (event) => {
    let direction = '';
    const keys = event.which;
    if(keys === 87 || keys === 38){
        direction = 'Up';
    }else if(keys === 83 || keys === 40){
        direction = 'Down';
    }else if(keys === 65 || keys === 37){
        direction = 'Left';
    }else if(keys === 68 || keys === 39){
        direction = 'Right';
    }else{
        direction = 'Up';
    }

    if (player.movePlayer(direction, speed)) {
        if(player.collision(coin)){
            player.score += coin.value;
            const coin_x = Math.floor(Math.random() * (max_x + 1)) + base_x;
            const coin_y = Math.floor(Math.random() * (max_y + 1)) + base_y;
            const max_id = Math.floor(Math.random() * 1000000);
            coin = new Collectible({
                x: coin_x, 
                y: coin_y, 
                value: player.score,
                id: max_id
            });
            socket.emit('move player', {player: player, coin: coin});
        }else{
            socket.emit('move player', {player: player});
        }
    }
}
