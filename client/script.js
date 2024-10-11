var name = "andy"; //placeholder, use: prompt("Pick a name: ").substring(0, 8);

const socket = io();

let game = {};

socket.emit("name", name);

socket.on("playerName", (data) => {
	if (game.players[data.id]) {
		game.players[data.id].name = data.name;
	}
});
socket.on("currentGame", (data) => {
	game = data;
});
socket.on("newPlayer", (data) => {
	game.players[data.id] = data.obj;
});
socket.on("playerDisconnect", (data) => {
	delete game.players[data];
});
socket.on("playerMoved", (data) => {
	game.players[data.id].x = data.x;
	game.players[data.id].y = data.y;
});
socket.on("disconnectMe", (data) => {
	window.location.assign("/client/disconnect.html");
});

const cnv = document.querySelector("canvas");
const ctx = cnv.getContext("2d");

cnv.width = 1000;
cnv.height = 800;

let keys = {};

function loop() {
	ctx.clearRect(0, 0, cnv.width, cnv.height);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, cnv.width, cnv.height);

	if (keys["w"] || keys["a"] || keys["s"] || keys["d"]) {
		if (
			keys["w"] &&
			game.players[socket.id].y - game.players[socket.id].speed > 0
		) {
			game.players[socket.id].y -= game.players[socket.id].speed;
		}
		if (
			keys["a"] &&
			game.players[socket.id].x - game.players[socket.id].speed > 0
		) {
			game.players[socket.id].x -= game.players[socket.id].speed;
		}
		if (
			keys["s"] &&
			game.players[socket.id].y + 25 + game.players[socket.id].speed <
				cnv.height
		) {
			game.players[socket.id].y += game.players[socket.id].speed;
		}
		if (
			keys["d"] &&
			game.players[socket.id].x + 25 + game.players[socket.id].speed < cnv.width
		) {
			game.players[socket.id].x += game.players[socket.id].speed;
		}
		socket.emit("move", {
			x: game.players[socket.id].x,
			y: game.players[socket.id].y,
		});
	}

	// display game.players
	ctx.fillStyle = "white";
	ctx.font = "16px Arial";
	for (var id in game.players) {
		var p = game.players[id];
		ctx.fillRect(p.x, p.y, 25, 25);
		ctx.fillText(
			p.name,
			p.x + 12.5 - ctx.measureText(p.name).width / 2,
			p.y - 12
		);
	}

	requestAnimationFrame(loop);
}

loop();

document.onkeydown = (e) => {
	keys[e.key] = true;
};
document.onkeyup = (e) => {
	keys[e.key] = false;
};
