"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const _1 = require(".");
const ROLES_SKILLS = {
    "Combat Medic": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Combat Medic" &&
            room.turn === client_1.Turn.NIGHT &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            yield fastify.prisma.player.update({
                data: {
                    isProtected: true,
                },
                where: {
                    id: target.id,
                },
            });
            if (target.attacked === true) {
                return {
                    event: _1.SocketEmitEvents.CHAT_TO,
                    message: `You protected ${target.index} ${target.profile.name}.`,
                };
            }
            return {};
        }
        else if (target.role.name === "Combat Medic" &&
            room.turn === client_1.Turn.NIGHT &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            return {
                event: _1.SocketEmitEvents.CHAT_TO,
                message: "You can't protect yourself.",
            };
        }
        return {};
    }),
    Detective: (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Detective" &&
            room.turn === client_1.Turn.NIGHT &&
            target.checkedByDetective === false &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        abilitiesEnabled: false,
                    },
                    where: {
                        id: sender.id,
                    },
                }),
                fastify.prisma.player.update({
                    data: {
                        checkedByDetective: true,
                    },
                    where: {
                        id: target.id,
                    },
                }),
            ]);
            return {
                event: _1.SocketEmitEvents.CHAT_TO,
                message: `You checked ${target.index} ${target.profile.name}: ${target.role.name}`,
            };
        }
        else if (target.role.name !== "Detective" &&
            room.turn === client_1.Turn.NIGHT &&
            target.checkedByDetective === true &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            return {
                event: _1.SocketEmitEvents.CHAT_TO,
                message: "You already checked that player.",
            };
        }
        return {};
    }),
    "Tech Contrabandist": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Tech Contrabandist" &&
            target.online === true &&
            target.alive === false &&
            room.turn === client_1.Turn.NIGHT &&
            sender.abilitiesEnabled === true &&
            sender.abilityConsumed === false &&
            sender.alive === true) {
            if (target.role.team !== client_1.Team.REBEL) {
                return {
                    event: _1.SocketEmitEvents.CHAT_TO,
                    message: `You can't revive a non Rebel player.`,
                };
            }
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        alive: true,
                        roleVisibility: false,
                        canTalk: true,
                        canVote: true,
                        revived: true,
                        abilitiesEnabled: true,
                    },
                    where: {
                        id: target.id,
                    },
                }),
                fastify.prisma.player.update({
                    data: {
                        abilitiesEnabled: false,
                        abilityConsumed: true,
                    },
                    where: {
                        id: sender.id,
                    },
                }),
            ]);
            return {
                event: _1.SocketEmitEvents.CHAT_NIGHT,
                message: ` Player ${target.index} ${target.profile.name} was revived by the Tech Contrabandist.`,
            };
        }
        return {};
    }),
    "Rebel Leader": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if ((room.turn === client_1.Turn.DAY || room.turn === client_1.Turn.VOTE) &&
            sender.alive === true &&
            sender.abilitiesEnabled === true &&
            sender.abilityConsumed === false) {
            yield fastify.prisma.player.update({
                data: {
                    roleVisibility: true,
                    voteWeight: 2,
                    abilitiesEnabled: false,
                    abilityConsumed: true,
                },
                where: {
                    id: sender.id,
                },
            });
            return {
                event: _1.SocketEmitEvents.CHAT,
                message: `Player ${sender.index} ${sender.profile.name} is the Rebel Leader!`,
            };
        }
        return {};
    }),
    "Chief of Intelligence": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Chief of Intelligence" &&
            room.turn === client_1.Turn.NIGHT &&
            sender.alive === true &&
            target.alive === true) {
            if (target.role.team === client_1.Team.GOVERNMENT) {
                return {
                    event: _1.SocketEmitEvents.CHAT_TO,
                    message: `You can't check a Government player.`,
                };
            }
            yield fastify.prisma.player.update({
                data: {
                    abilitiesEnabled: false,
                },
                where: {
                    id: sender.id,
                },
            });
            return {
                event: _1.SocketEmitEvents.CHAT_NIGHT,
                message: `The Chief of Intelligence checked ${target.index} ${target.profile.name}. They are a ${target.role.name}.`,
            };
        }
        return {};
    }),
    "Government Leader": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if ((room.turn === client_1.Turn.DAY || room.turn === client_1.Turn.VOTE) &&
            sender.alive === true &&
            sender.abilitiesEnabled === true &&
            sender.abilityConsumed === false) {
            yield fastify.prisma.player.update({
                data: {
                    roleVisibility: true,
                    voteWeight: 2,
                    abilitiesEnabled: false,
                    abilityConsumed: true,
                },
                where: {
                    id: sender.id,
                },
            });
            return {
                event: _1.SocketEmitEvents.CHAT,
                message: `Player ${sender.index} ${sender.profile.name} is the Government Leader!`,
            };
        }
        return {};
    }),
    // EXPLICAR \/
    "Tactical Soldier": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (sender.alive === true &&
            sender.shield > 0 &&
            sender.abilitiesEnabled === true) {
            if (sender.attacked === true) {
                yield fastify.prisma.player.update({
                    data: {
                        shield: sender.shield - 1,
                    },
                    where: {
                        id: sender.id,
                    },
                });
                return {
                    event: _1.SocketEmitEvents.CHAT,
                    message: "The Tactical Soldier was injured and will die next time they are attacked!",
                };
            }
            return {};
        }
        else if ((sender.alive === true && sender.abilitiesEnabled === true,
            sender.shield === 0)) {
            if (sender.attacked === true) {
                yield fastify.prisma.player.update({
                    data: {
                        alive: false,
                        canTalk: false,
                        canVote: false,
                        abilitiesEnabled: false,
                        roleVisibility: true,
                    },
                    where: {
                        id: sender.id,
                    },
                });
                return {};
            }
            return {};
        }
        return {};
    }),
    Instigator: (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Instigator" &&
            (room.turn === client_1.Turn.DAY || room.turn === client_1.Turn.VOTE) &&
            sender.alive === true &&
            target.alive === true &&
            sender.abilitiesEnabled === true) {
            if (target.role.team === client_1.Team.GOVERNMENT) {
                return {
                    event: _1.SocketEmitEvents.CHAT_TO,
                    message: `You can't reveal a Government player.`,
                };
            }
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        roleVisibility: true,
                    },
                    where: {
                        id: target.id,
                    },
                }),
                fastify.prisma.player.update({
                    data: {
                        abilitiesEnabled: false,
                        abilityConsumed: true,
                    },
                    where: {
                        id: sender.id,
                    },
                }),
                fastify.prisma.room.update({
                    data: {
                        hasVote: false,
                    },
                    where: {
                        id: room.id,
                    },
                }),
            ]);
            return {
                event: _1.SocketEmitEvents.CHAT,
                message: `The Instigator revealed player's ${target.index} ${target.profile.name} role. They are a ${target.role.name}. There will be no voting today.`,
            };
        }
        return {};
    }),
    "Serial Killer": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Serial Killer" &&
            room.turn === client_1.Turn.NIGHT &&
            target.alive === true &&
            sender.alive === true &&
            sender.abilitiesEnabled === true) {
            if (target.isProtected) {
                return {
                    event: _1.SocketEmitEvents.CHAT_NIGHT,
                    message: `The Serial Killer tried to kill ${target.index} but he was protected.`,
                };
            }
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        attacked: true,
                        alive: false,
                        canTalk: false,
                        canVote: false,
                        abilitiesEnabled: false,
                        roleVisibility: true,
                    },
                    where: {
                        id: target.id,
                    },
                }),
                fastify.prisma.player.update({
                    data: {
                        abilitiesEnabled: false,
                    },
                    where: {
                        id: sender.id,
                    },
                }),
            ]);
            return {
                event: _1.SocketEmitEvents.CHAT_NIGHT,
                message: `The Serial Killer killed ${target.index} ${target.profile.name}.`,
            };
        }
        else {
            return {};
        }
    }),
};
function skillController(fastify, sender, target, room) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ROLES_SKILLS[sender.role.name](fastify, target, room, sender);
    });
}
exports.default = skillController;
