let Packet = require("./Packet");

// test
let npcList = require("./NpcList");
//

class Server {
	constructor() {
		this._io = null;
		this._clientPackets = null;
		this._sockets = {};

		// test
		setInterval(() => {
			npcList.getList().forEach(npc => {
				if(npc.walk) {
					npc.move();
					this.broadcast(JSON.stringify({ type: "npcMove", data: { objectId: npc.objectId, x: npc.x, y: npc.y } }));
				}
			})
		}, 10000)
		//
	}

	addSocket(key, socket) {
		this._sockets[key] = socket;
	}

	getSocket(key) {
		return this._sockets[key];
	}

	setIO(io) {
		this._io = io;
		this._io.on("connection", this._onConnection.bind(this));
	}

	setClientPackets(packets) {
		this._clientPackets = packets;
	}

	broadcast(data) {
		this._io.emit("onServer", data);
	}

	send(login, data) {
		let socket = this.getSocket(login);

		socket.emit("onServer", data);
	}

	_onConnection(socket) {
		socket.on("onClient", this._onClient.bind(this, socket));
	}

	_onClient(socket, data) {
		let packet = new Packet(data).decrypt();

		switch(packet.type) {
			case "requestAuth":
				new this._clientPackets.RequestAuth(packet, socket);

				break;
			case "requestPlayerMove":
				new this._clientPackets.RequestPlayerMove(packet);

				break;
			case "requestNpcList":
				new this._clientPackets.RequestNpcList(packet);

				break;
		}

	}
}

module.exports = new Server();