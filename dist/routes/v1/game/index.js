"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketOnEvents = exports.SocketEmitEvents = void 0;
const client_1 = require("@prisma/client");
const jwt = __importStar(require("jsonwebtoken"));
const skillController_1 = __importDefault(require("./skillController"));
const PLAYERS_TO_START_GAME = 2;
var SocketEmitEvents;
(function (SocketEmitEvents) {
    SocketEmitEvents["PONG"] = "pong";
    SocketEmitEvents["ROOM"] = "room";
    SocketEmitEvents["PLAYERS"] = "players";
    SocketEmitEvents["player"] = "player";
    SocketEmitEvents["CHAT_ALERT"] = "chat-alert";
    SocketEmitEvents["CHAT_TO"] = "chat-to";
    SocketEmitEvents["CHAT"] = "chat";
})(SocketEmitEvents || (exports.SocketEmitEvents = SocketEmitEvents = {}));
var SocketOnEvents;
(function (SocketOnEvents) {
    SocketOnEvents["CONNECTION"] = "connection";
    SocketOnEvents["PING"] = "ping";
    SocketOnEvents["HANDLE_SKILL"] = "handle-skill";
    SocketOnEvents["VOTE"] = "vote";
    SocketOnEvents["CHAT"] = "chat";
    SocketOnEvents["CHAT_NIGHT"] = "chat-night";
    SocketOnEvents["CHAT_TO"] = "chat-to";
    SocketOnEvents["DISCONNECT"] = "disconnect";
})(SocketOnEvents || (exports.SocketOnEvents = SocketOnEvents = {}));
function createNewPlayer(fastify, roomId, profileId, socketId) {
    return __awaiter(this, void 0, void 0, function* () {
        const playersInRoom = yield fastify.prisma.player.count({
            where: {
                roomId: roomId,
            },
        });
        return yield fastify.prisma.player
            .create({
            data: {
                roomId: roomId,
                profileId: profileId,
                index: playersInRoom + 1,
                socketId: socketId,
            },
        })
            .then((player) => {
            return player;
        });
    });
}
function getARoom(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fastify.prisma.room
            .findMany({
            where: {
                finished: false,
                turn: {
                    equals: client_1.Turn.LOBBY,
                },
                turnNumber: {
                    equals: 0,
                },
            },
            include: {
                players: {
                    include: {
                        role: true,
                    },
                },
            },
        })
            .then((rooms) => {
            if (rooms.length === 0 ||
                rooms[0].players.length >= PLAYERS_TO_START_GAME) {
                return fastify.prisma.room
                    .create({
                    data: {
                        finished: false,
                        hasVote: false,
                        voteAnon: false,
                    },
                    include: {
                        players: {
                            include: {
                                role: true,
                            },
                        },
                    },
                })
                    .then((room) => {
                    return room;
                });
            }
            else {
                return rooms[0];
            }
        });
    });
}
function findRoomForPlayer(fastify, profileId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fastify.prisma.room
            .findFirst({
            where: {
                finished: false,
                players: {
                    some: {
                        profileId: profileId,
                    },
                },
            },
            include: {
                players: {
                    include: {
                        role: true,
                    },
                },
            },
        })
            .then((room) => {
            return room;
        });
    });
}
function getRoomPlayers(fastify, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fastify.prisma.player
            .findMany({
            where: {
                roomId: roomId,
            },
            include: {
                role: true,
                profile: true,
            },
        })
            .then((players) => {
            return players;
        });
    });
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function startGame(fastify, Socket, room, players) {
    return __awaiter(this, void 0, void 0, function* () {
        const soloRoles = yield fastify.prisma.role.findMany({
            where: {
                team: client_1.Team.SOLO,
            },
        });
        const governmentRoles = yield fastify.prisma.role.findMany({
            where: {
                team: client_1.Team.GOVERNMENT,
            },
        });
        const rebelRoles = yield fastify.prisma.role.findMany({
            where: {
                team: client_1.Team.REBEL,
            },
        });
        const selectedSoloRoles = [];
        const selectedGovernmentRoles = [];
        const selectedRebelRoles = [];
        for (let i = 0; i < PLAYERS_TO_START_GAME; i++) {
            if (i < 2) {
                const randomSolo = soloRoles[getRandomInt(soloRoles.length)];
                soloRoles.splice(soloRoles.findIndex((role) => role.id === randomSolo.id), 1);
                selectedSoloRoles.push(randomSolo);
            }
            if (i >= 2) {
                if (selectedGovernmentRoles.length < selectedRebelRoles.length) {
                    const randomGovernment = governmentRoles[getRandomInt(governmentRoles.length)];
                    governmentRoles.splice(governmentRoles.findIndex((role) => role.id === randomGovernment.id), 1);
                    selectedGovernmentRoles.push(randomGovernment);
                }
                else {
                    const randomRebel = rebelRoles[getRandomInt(rebelRoles.length)];
                    rebelRoles.splice(rebelRoles.findIndex((role) => role.id === randomRebel.id), 1);
                    selectedRebelRoles.push(randomRebel);
                }
            }
        }
        const roles = [
            ...selectedSoloRoles,
            ...selectedGovernmentRoles,
            ...selectedRebelRoles,
        ];
        const shuffledRoles = roles.sort(() => Math.random() - 0.5);
        const playersWithRoles = players.map((player, index) => {
            return Object.assign(Object.assign({}, player), { role: shuffledRoles[index] });
        });
        playersWithRoles.forEach((player) => __awaiter(this, void 0, void 0, function* () {
            yield fastify.prisma.player.update({
                where: {
                    id: player.id,
                },
                data: {
                    roleId: player.role.id,
                },
            });
        }));
        return yield nextTurn(fastify, room.id);
    });
}
function verifyIfGameEnded(fastify, roomId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield fastify.prisma.room.findUnique({
            where: {
                id: roomId,
            },
            include: {
                players: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        if (!room) {
            return;
        }
        const alivePlayers = room.players.filter((player) => player.alive === true);
        const rebelTeam = alivePlayers.filter((player) => { var _a; return ((_a = player.role) === null || _a === void 0 ? void 0 : _a.team) === client_1.Team.REBEL; });
        const governmentTeam = alivePlayers.filter((player) => { var _a; return ((_a = player.role) === null || _a === void 0 ? void 0 : _a.team) === client_1.Team.GOVERNMENT; });
        const soloTeam = alivePlayers.filter((player) => { var _a; return ((_a = player.role) === null || _a === void 0 ? void 0 : _a.team) === client_1.Team.SOLO; });
        let winner = null;
        if (rebelTeam.length === 0 && governmentTeam.length >= 1) {
            winner = {
                finished: true,
                winner: client_1.Team.GOVERNMENT,
            };
        }
        else if (governmentTeam.length === 0 && rebelTeam.length >= 1) {
            winner = {
                finished: true,
                winner: client_1.Team.REBEL,
            };
        }
        else if (alivePlayers.length === 1 &&
            ((_a = alivePlayers[0].role) === null || _a === void 0 ? void 0 : _a.team) === client_1.Team.SOLO) {
            winner = {
                finished: true,
                winner: client_1.Team.SOLO,
                soloWinner: (_b = alivePlayers[0].role) === null || _b === void 0 ? void 0 : _b.name,
            };
        }
        if (!winner)
            return;
        const roomUpdated = yield fastify.prisma.room.update({
            where: {
                id: roomId,
            },
            data: {
                finished: true,
                winner: winner.winner,
                soloWinner: winner.soloWinner,
            },
            include: {
                players: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        fastify.io
            .to(roomUpdated.id || roomId)
            .emit(SocketEmitEvents.ROOM, roomUpdated);
    });
}
function nextTurn(fastify, roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield fastify.prisma.room.findUnique({
            where: {
                id: roomId,
            },
        });
        if (!room) {
            return;
        }
        if (room.turn === client_1.Turn.LOBBY) {
            yield fastify.prisma.room.update({
                where: {
                    id: roomId,
                },
                data: {
                    actualTurnStartedAt: new Date(),
                    turnNumber: room.turnNumber + 1,
                    turn: client_1.Turn.NIGHT,
                    startedAt: new Date(),
                },
            });
        }
        if (room.turn === client_1.Turn.NIGHT) {
            const playersReset = yield fastify.prisma.player.findMany();
            for (const player of playersReset) {
                yield resetNight(fastify, roomId, player.id);
                yield checkIfDrugged(fastify, player.id);
            }
            const players = yield fastify.prisma.player.findMany({
                where: {
                    roomId: roomId,
                },
                select: {
                    voteIn: true,
                },
            });
            const obj = {};
            players.forEach((player) => {
                if (player.voteIn) {
                    if (obj[player.voteIn]) {
                        obj[player.voteIn] += 1;
                    }
                    else {
                        obj[player.voteIn] = 1;
                    }
                }
            });
            if (Object.keys(obj).length !== 0) {
                const mostVoted = Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
                const playerMostVoted = yield fastify.prisma.player.findFirst({
                    where: {
                        index: Number(mostVoted),
                        roomId: roomId,
                    },
                });
                yield eliminatePlayer(fastify, playerMostVoted.id, {
                    voted: true,
                });
                yield verifyIfGameEnded(fastify, roomId);
            }
            yield fastify.prisma.room.update({
                where: {
                    id: roomId,
                },
                data: {
                    actualTurnStartedAt: new Date(),
                    turnNumber: room.turnNumber + 1,
                    turn: client_1.Turn.DAY,
                },
            });
        }
        if (room.turn === client_1.Turn.DAY) {
            const players = yield fastify.prisma.player.findMany();
            for (const player of players) {
                yield resetDay(fastify, player.id);
            }
            yield fastify.prisma.room.update({
                where: {
                    id: roomId,
                },
                data: {
                    actualTurnStartedAt: new Date(),
                    turnNumber: room.turnNumber + 1,
                    turn: client_1.Turn.VOTE,
                },
            });
        }
        if (room.turn === client_1.Turn.VOTE) {
            const players = yield fastify.prisma.player.findMany({
                where: {
                    roomId: roomId,
                },
                select: {
                    voteIn: true,
                },
            });
            const obj = {};
            players.forEach((player) => {
                if (player.voteIn) {
                    if (obj[player.voteIn]) {
                        obj[player.voteIn] += 1;
                    }
                    else {
                        obj[player.voteIn] = 1;
                    }
                }
            });
            if (Object.keys(obj).length !== 0) {
                const mostVoted = Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
                const playerMostVoted = yield fastify.prisma.player.findFirst({
                    where: {
                        index: Number(mostVoted),
                        roomId: roomId,
                    },
                });
                yield eliminatePlayer(fastify, playerMostVoted.id, {
                    voted: true,
                });
                yield verifyIfGameEnded(fastify, roomId);
            }
            yield yield fastify.prisma.room.update({
                where: {
                    id: roomId,
                },
                data: {
                    actualTurnStartedAt: new Date(),
                    turnNumber: room.turnNumber + 1,
                    turn: client_1.Turn.NIGHT,
                },
            });
        }
        const updatedRoom = yield fastify.prisma.room.findUnique({
            where: {
                id: roomId,
            },
            include: {
                players: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        if (!updatedRoom) {
            return;
        }
        return updatedRoom;
    });
}
function eliminatePlayer(fastify, playerId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield fastify.prisma.player.findUnique({
            where: {
                id: playerId,
            },
        });
        if ((player === null || player === void 0 ? void 0 : player.voteProtection) && data.voted) {
            yield fastify.prisma.player.update({
                where: {
                    id: playerId,
                },
                data: {
                    voteProtection: false,
                },
            });
            return;
        }
        yield fastify.prisma.player.update({
            where: {
                id: playerId,
            },
            data: Object.assign(Object.assign({ alive: false }, (data.killed
                ? {
                    attackedBy: data.killed,
                }
                : {})), { elimination: data.voted ? client_1.EliminatedBy.VOTE : client_1.EliminatedBy.ATTACK }),
        });
    });
}
function verifyTurn(fastify, roomId, Socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield fastify.prisma.room.findUnique({
            where: {
                id: roomId,
            },
        });
        if (!room) {
            return;
        }
        if (room.startedAt) {
            const now = new Date();
            const diff = now.getTime() - room.actualTurnStartedAt.getTime();
            const seconds = diff / 1000;
            if (seconds >= 30) {
                yield nextTurn(fastify, roomId);
                const newPlayers = yield getRoomPlayers(fastify, room.id);
                Socket.to(room.id).emit(SocketEmitEvents.PLAYERS, newPlayers);
                return;
            }
            else {
                return room;
            }
        }
    });
}
function resetDay(fastify, playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield fastify.prisma.player.findUnique({
            where: {
                id: playerId,
            },
            include: {
                role: true,
            },
        });
        if ((player === null || player === void 0 ? void 0 : player.alive) === true && player.abilityConsumed === false) {
            yield fastify.prisma.player.update({
                data: {
                    isProtected: false,
                    attacked: false,
                    isJailed: false,
                    abilitiesEnabled: true,
                },
                where: {
                    id: playerId,
                },
            });
        }
    });
}
function resetNight(fastify, roomId, playerId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const room = yield fastify.prisma.room.findUnique({
            where: {
                id: roomId,
            },
        });
        const player = yield fastify.prisma.player.findUnique({
            where: {
                id: playerId,
            },
            include: {
                role: true,
            },
        });
        yield fastify.prisma.room.update({
            data: {
                hasVote: true,
                voteAnon: false,
            },
            where: {
                id: room === null || room === void 0 ? void 0 : room.id,
            },
        });
        if ((player === null || player === void 0 ? void 0 : player.alive) === true &&
            ((_a = player === null || player === void 0 ? void 0 : player.role) === null || _a === void 0 ? void 0 : _a.team) === "GOVERNMENT" &&
            player.voteWeight === 2) {
            yield fastify.prisma.player.update({
                data: {
                    voteWeight: 1,
                },
                where: {
                    id: playerId,
                },
            });
        }
        else if ((player === null || player === void 0 ? void 0 : player.alive) === true && ((_b = player === null || player === void 0 ? void 0 : player.role) === null || _b === void 0 ? void 0 : _b.team) === "REBEL") {
            yield fastify.prisma.player.update({
                data: {
                    canTalk: true,
                    canVote: true,
                },
                where: {
                    id: playerId,
                },
            });
        }
    });
}
function checkIfDrugged(fastify, playerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield fastify.prisma.player.findUnique({
            where: {
                id: playerId,
            },
        });
        if ((player === null || player === void 0 ? void 0 : player.isDrugged) === true) {
            const death = Math.random();
            const probability = 0.5;
            if (death < probability) {
                yield fastify.prisma.player.update({
                    data: {
                        alive: false,
                        canTalk: false,
                        canVote: false,
                        roleVisibility: true,
                        abilitiesEnabled: false,
                    },
                    where: {
                        id: playerId,
                    },
                });
                //mensagem para o chat avisando que o jogador morreu
            }
            else {
                yield fastify.prisma.player.update({
                    data: {
                        isDrugged: false,
                    },
                    where: {
                        id: playerId,
                    },
                });
                // mensagem para o chat avisando que o jogador sobreviveu
            }
        }
    });
}
function verifySocketId(fastify, socketId, profileId) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield fastify.prisma.player.findFirst({
            where: {
                profileId: profileId,
            },
        });
        if (!player) {
            return;
        }
        yield fastify.prisma.player.update({
            where: {
                id: player.id,
            },
            data: {
                socketId: socketId,
            },
        });
    });
}
function getRoomBySocketId(fastify, socketId) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield fastify.prisma.player.findFirst({
            where: {
                socketId: socketId,
            },
        });
        if (!player) {
            return;
        }
        const room = yield fastify.prisma.room.findFirst({
            where: {
                id: player.roomId,
            },
            include: {
                players: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        if (!room) {
            return;
        }
        return room;
    });
}
function getPlayerBySocketId(fastify, socketId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fastify.prisma.player
            .findFirst({
            where: {
                socketId: socketId,
            },
            include: {
                role: true,
                profile: true,
            },
        })
            .then((player) => {
            if (!player)
                return;
            return player;
        });
    });
}
function default_1(fastify, opts, done) {
    fastify.ready((err) => {
        if (err)
            throw err;
        fastify.io.on(SocketOnEvents.CONNECTION, (Socket) => __awaiter(this, void 0, void 0, function* () {
            if (!Socket.handshake.auth || !Socket.handshake.auth.token) {
                Socket.disconnect();
                return;
            }
            const decoded = (yield jwt.verify(Socket.handshake.auth.token, process.env.JWT_SECRET));
            if (!decoded) {
                Socket.disconnect();
                return;
            }
            const profile = yield fastify.prisma.profile.findUnique({
                where: {
                    id: decoded.profileId,
                },
            });
            let room;
            let player;
            const playerRoom = yield findRoomForPlayer(fastify, profile.id);
            if (playerRoom) {
                room = playerRoom;
                yield verifySocketId(fastify, Socket.id, profile.id);
            }
            else {
                room = yield getARoom(fastify);
                player = yield createNewPlayer(fastify, room.id, profile.id, Socket.id);
            }
            Socket.join(room.id);
            const players = yield getRoomPlayers(fastify, room.id);
            fastify.io.to(room.id).emit(SocketEmitEvents.ROOM, room);
            if (players.length === 0) {
                let playersReloaded = yield getRoomPlayers(fastify, room.id);
                fastify.io.to(room.id).emit(SocketEmitEvents.PLAYERS, playersReloaded);
            }
            else {
                fastify.io.to(room.id).emit(SocketEmitEvents.PLAYERS, players);
            }
            if (players.length === PLAYERS_TO_START_GAME && !room.startedAt) {
                const roomUpdated = yield startGame(fastify, Socket, room, players);
                Socket.emit(SocketEmitEvents.ROOM, roomUpdated);
                fastify.io
                    .to(roomUpdated.id)
                    .emit(SocketEmitEvents.PLAYERS, yield getRoomPlayers(fastify, roomUpdated.id));
            }
            Socket.on(SocketOnEvents.HANDLE_SKILL, (data) => __awaiter(this, void 0, void 0, function* () {
                const sender = yield getPlayerBySocketId(fastify, Socket.id);
                const target = yield getPlayerBySocketId(fastify, data.target);
                const room = yield getRoomBySocketId(fastify, Socket.id);
                if (!sender || !target || !room) {
                    return;
                }
                const { event, message } = yield (0, skillController_1.default)(fastify, sender, target, room);
                if (event === SocketEmitEvents.CHAT_TO) {
                    Socket.emit(event, `${message}`);
                }
                else if (event === SocketEmitEvents.CHAT) {
                    fastify.io.to(room.id).emit(event, `${message}`);
                }
                else {
                }
            }));
            Socket.on(SocketOnEvents.VOTE, (data) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const room = yield getRoomBySocketId(fastify, Socket.id);
                if ((room === null || room === void 0 ? void 0 : room.turn) === client_1.Turn.DAY)
                    return;
                const sender = yield getPlayerBySocketId(fastify, Socket.id);
                if ((room === null || room === void 0 ? void 0 : room.turn) === client_1.Turn.NIGHT) {
                    if (((_a = sender === null || sender === void 0 ? void 0 : sender.role) === null || _a === void 0 ? void 0 : _a.aura) !== client_1.Aura.EVIL)
                        return;
                }
                const target = yield getPlayerBySocketId(fastify, data.target);
                yield fastify.prisma.player.update({
                    where: {
                        id: sender.id,
                    },
                    data: {
                        voteIn: target.index,
                    },
                });
            }));
            Socket.on(SocketOnEvents.CHAT, (data) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                const room = yield getRoomBySocketId(fastify, Socket.id);
                if ((room === null || room === void 0 ? void 0 : room.turn) !== client_1.Turn.DAY && (room === null || room === void 0 ? void 0 : room.turn) !== client_1.Turn.VOTE) {
                    return Socket.emit(SocketEmitEvents.CHAT_ALERT, {
                        message: "You cant talk now!",
                    });
                }
                if (((_b = room.players.find((player) => player.socketId === Socket.id)) === null || _b === void 0 ? void 0 : _b.canTalk) !== true) {
                    return Socket.emit(SocketEmitEvents.CHAT_ALERT, {
                        message: "You cant talk now!",
                    });
                }
                fastify.io.to(room.id).emit(SocketEmitEvents.CHAT, {
                    message: data.message,
                    sender: profile.name,
                    sockId: Socket.id,
                });
            }));
            Socket.on(SocketOnEvents.CHAT_NIGHT, (data) => __awaiter(this, void 0, void 0, function* () {
                var _c, _d, _e;
                const room = yield getRoomBySocketId(fastify, Socket.id);
                if ((room === null || room === void 0 ? void 0 : room.turn) !== client_1.Turn.NIGHT) {
                    return Socket.emit(SocketEmitEvents.CHAT_ALERT, {
                        message: "You cant talk now!",
                    });
                }
                if (((_d = (_c = room.players.find((player) => player.socketId === Socket.id)) === null || _c === void 0 ? void 0 : _c.role) === null || _d === void 0 ? void 0 : _d.canTalkNight) !== true) {
                    return Socket.emit(SocketEmitEvents.CHAT_ALERT, {
                        message: "You cant talk now!",
                    });
                }
                if (((_e = room.players.find((player) => player.socketId === Socket.id)) === null || _e === void 0 ? void 0 : _e.canTalk) !== true) {
                    return Socket.emit(SocketEmitEvents.CHAT_ALERT, {
                        message: "You cant talk now!",
                    });
                }
                fastify.io.to(room.id).emit(SocketOnEvents.CHAT, {
                    message: data.message,
                    sender: profile.name,
                    sockId: Socket.id,
                });
            }));
            Socket.on(SocketOnEvents.CHAT_TO, (data) => {
                fastify.io.to(data.to).emit(SocketOnEvents.CHAT, {
                    message: data.message,
                    sender: profile.name,
                    sockId: Socket.id,
                });
            });
            Socket.on(SocketOnEvents.PING, () => __awaiter(this, void 0, void 0, function* () {
                Socket.emit(SocketEmitEvents.PONG);
                Socket.emit(SocketEmitEvents.ROOM, yield verifyTurn(fastify, room.id, Socket));
            }));
            Socket.on(SocketOnEvents.DISCONNECT, (data) => {
                Socket.leave(room.id);
            });
        }));
    });
    done();
}
exports.default = default_1;
