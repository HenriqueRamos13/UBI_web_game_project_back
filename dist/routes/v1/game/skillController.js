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
const _1 = require(".");
const ROLES_SKILLS = {
    "Combat Medic": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Combat Medic" &&
            room.turn == "NIGHT" &&
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
                    message: "You protected " + target.index + " " + target.profile.name + ".",
                };
            }
            else {
                return {};
            }
        }
        else if (target.role.name === "Combat Medic" &&
            room.turn === "NIGHT" &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            return {
                event: _1.SocketEmitEvents.CHAT_TO,
                message: "You can't protect yourself.",
            };
        }
        else {
            return {};
        }
    }),
    "Cyber Brute": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (room.turn === "NIGHT" &&
            sender.shield > 0 &&
            sender.abilitiesEnabled === true &&
            sender.abilityConsumed === false &&
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
            //checks if either the target or the cyber brute were attacked and removes a value of the cyber brute's shield
            if (target.attacked === true || sender.attacked === true) {
                yield fastify.prisma.player.update({
                    data: {
                        shield: sender.shield - 1,
                    },
                    where: {
                        id: sender.id,
                    },
                });
                return {
                    event: _1.SocketEmitEvents.CHAT_TO,
                    message: "You protected " + target.index + " " + target.profile.name,
                };
            }
            else {
                return {};
            }
        }
        else if (room.turn === "NIGHT" &&
            sender.shield === 0 &&
            sender.alive === true &&
            target.alive === true &&
            sender.abilityConsumed === false &&
            sender.abilitiesEnabled === true) {
            yield fastify.prisma.player.update({
                data: {
                    alive: false,
                    canTalk: false,
                    canVote: false,
                    abilitiesEnabled: false,
                    roleVisibility: true,
                    abilityConsumed: true,
                },
                where: {
                    id: sender.id,
                },
            });
            return {};
        }
        else {
            return {};
        }
    }),
    Detective: (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Detective" &&
            room.turn === "NIGHT" &&
            target.checkedByDetective === false &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.findFirst({
                    where: {
                        id: target.id,
                    },
                    include: {
                        role: true,
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
                message: "You checked " +
                    target.index +
                    " " +
                    target.profile.name +
                    ": " +
                    target.role.name,
            };
        }
        else if (target.role.name !== "Detective" &&
            room.turn === "NIGHT" &&
            target.checkedByDetective === true &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            return {
                event: _1.SocketEmitEvents.CHAT_TO,
                message: "You already checked that player.",
            };
        }
        else {
            return {};
        }
    }),
    "Tech Contrabandist": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Tech Contrabandist" &&
            target.role.team === "REBEL" &&
            target.online === true &&
            target.alive === false &&
            room.turn === "NIGHT" &&
            sender.abilitiesEnabled === true &&
            sender.abilityConsumed === false &&
            sender.alive === true) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        alive: true,
                        roleVisibility: true,
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
                event: _1.SocketEmitEvents.CHAT,
                message: target.index +
                    " " +
                    target.profile.name +
                    " was revived by the Tech Contrabandist.",
            };
        }
        else {
            return {};
        }
    }),
    "Cyber Analyst": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Cyber Analyst" &&
            room.turn === "NIGHT" &&
            target.checkedByAnalyst === false &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.findFirst({
                    where: {
                        id: target.id,
                    },
                    include: {
                        role: true,
                    },
                }),
                fastify.prisma.player.update({
                    data: {
                        checkedByAnalyst: true,
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
                event: _1.SocketEmitEvents.CHAT_TO,
                message: "You checked " +
                    target.index +
                    " " +
                    target.profile.name +
                    ": " +
                    target.role.aura,
            };
        }
        else if (target.role.name !== "Cyber Analyst" &&
            room.turn === "NIGHT" &&
            target.checkedByAnalyst === true &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            return {
                event: _1.SocketEmitEvents.CHAT_TO,
                message: "You already checked that player.",
            };
        }
        else {
            return {};
        }
    }),
    Interrogator: (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Interrogator" &&
            room.turn === "DAY" &&
            sender.alive === true &&
            target.alive === true) {
            yield fastify.prisma.player.update({
                data: {
                    isJailed: true,
                },
                where: {
                    id: target.id,
                },
            });
            return {};
        }
        else {
            return {};
        }
    }),
    "Malware Developer": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (room.turn === "NIGHT" &&
            target.isTrapped === false &&
            sender.trapActive === false &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        isTrapped: true,
                    },
                    where: {
                        id: target.id,
                    },
                }),
                fastify.prisma.player.update({
                    data: {
                        trapActive: true,
                        playerTrapped: target.profile.name,
                    },
                    where: {
                        id: sender.id,
                    },
                }),
            ]);
            if (sender.profile.name === target.profile.name) {
                return {
                    event: _1.SocketEmitEvents.CHAT_TO,
                    message: "You have your trap active on yourself.",
                };
            }
            else {
                return {
                    event: _1.SocketEmitEvents.CHAT_TO,
                    message: "You have your trap active on player" +
                        target.index +
                        " " +
                        target.profile.name +
                        ".",
                };
            }
        }
        else if (room.turn === "NIGHT" &&
            target.isTrapped === false &&
            sender.trapActive === true &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        playerTrapped: target.id,
                    },
                    where: {
                        id: sender.id,
                    },
                }),
                fastify.prisma.player.update({
                    data: {
                        isTrapped: true,
                    },
                    where: {
                        id: target.id,
                    },
                }),
            ]);
            return {
                event: _1.SocketEmitEvents.CHAT_TO,
                message: "Your trap was moved to player " +
                    target.index +
                    " " +
                    target.profile.name +
                    ".",
            };
        }
        else if (room.turn === "NIGHT" &&
            target.isTrapped === true &&
            sender.trapActive === true &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        isTrapped: false,
                    },
                    where: {
                        id: target.id,
                    },
                }),
                fastify.prisma.player.update({
                    data: {
                        trapActive: false,
                        playerTrapped: " ",
                    },
                    where: {
                        id: sender.id,
                    },
                }),
            ]);
            return {
                event: _1.SocketEmitEvents.CHAT_TO,
                message: "Your trap was removed.",
            };
        }
        else {
            return {};
        }
    }),
    "Rebel Leader": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (room.turn === "DAY" &&
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
                message: "Player " +
                    sender.index +
                    sender.profile.name +
                    " is the Rebel Leader!",
            };
        }
        else {
            return {};
        }
    }),
    // "Data Collector": async (
    //   fastify: FastifyInstance,
    //   target: PlayerWithRoleAndProfile,
    //   room: Room,
    // sender: PlayerWithRoleAndProfile
    // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
    "Drug Dealer": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Drug Dealer" &&
            room.turn === "NIGHT" &&
            sender.abilitiesEnabled === true &&
            sender.alive === true &&
            target.alive === true) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        isDrugged: true,
                        canTalk: false,
                        canVote: false,
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
                event: _1.SocketEmitEvents.CHAT,
                message: "Player " +
                    target.index +
                    " " +
                    target.profile.name +
                    " was drugged and can't talk or vote today. They have 50% chance of dying at the end of the day.",
            };
        }
        else {
            return {};
        }
    }),
    //  "Vigilante Robot": async (
    //    fastify: FastifyInstance,
    //    target: PlayerWithRoleAndProfile,
    //    room: Room,
    //    sender: PlayerWithRoleAndProfile
    //  ): Promise<{ event?: SocketEmitEvents; message?: string; }> => {
    //   if(
    //     target.role.name !== "Vigilante Robot" &&
    //     room.turn === "DAY" &&
    //     sender.vigiKill == false &&
    //     sender.vigiReveal === false &&
    //     sender.alive === true &&
    //     target.alive === true
    //     ) {
    //       await fastify.prisma.player.update({})
    //   }
    //  },
    "Hardware Specialist": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Hardware Specialist" &&
            target.role.team === "GOVERNMENT" &&
            room.turn === "NIGHT" &&
            sender.alive === true &&
            target.alive === true &&
            sender.abilitiesEnabled === true &&
            sender.abilityConsumed === false) {
            yield fastify.prisma.player.update({
                data: {
                    alive: false,
                    roleVisibility: true,
                    canTalk: false,
                    canVote: false,
                    abilitiesEnabled: false,
                },
                where: {
                    id: sender.id,
                },
            });
            return {
                event: _1.SocketEmitEvents.CHAT,
                message: "Player " +
                    sender.index +
                    " " +
                    sender.profile.name +
                    " (" +
                    sender.role.name +
                    ") paid a visit to an infiltrated government agent and was assassinated.",
            };
        }
        else if (target.role.name !== "Hardware Specialist" &&
            target.role.team === "REBEL" &&
            room.turn === "NIGHT" &&
            sender.alive === true &&
            target.alive === true &&
            sender.abilitiesEnabled === true &&
            sender.abilityConsumed === false) {
            yield fastify.prisma.player.update({
                data: {
                    isProtected: true,
                    abilitiesEnabled: false,
                },
                where: {
                    id: sender.id,
                },
            });
            return {
                event: _1.SocketEmitEvents.CHAT_TO,
                message: "You visited a fellow rebel agent and was protected this night.",
            };
        }
        else {
            return {};
        }
    }),
    "Ethical Hacker": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Ethical Hacker" &&
            sender.alive === true &&
            target.alive === true &&
            sender.abilitiesEnabled === true &&
            sender.abilityConsumed === false) {
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
                        alive: false,
                        canTalk: false,
                        canVote: false,
                        roleVisibility: true,
                        abilitiesEnabled: false,
                        abilityConsumed: true,
                    },
                    where: {
                        id: sender.id,
                    },
                }),
            ]);
            return {
                event: _1.SocketEmitEvents.CHAT,
                message: "The Ethical Hacker revelead player " +
                    target.index +
                    " " +
                    target.profile.name +
                    "'s role: " +
                    target.role.name +
                    ".",
            };
        }
        else {
            return {};
        }
    }),
    // "Nanotech Engineer": async (
    //   fastify: FastifyInstance,
    //   target: PlayerWithRoleAndProfile,
    //   room: Room,
    //   sender: PlayerWithRoleAndProfile
    // ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    //   if (
    //     target.role.name !== "Nanotech Engineer" &&
    //     target.role.team !== "GOVERNMENT" &&
    //     room.turn === "DAY" &&
    //     sender.alive === true &&
    //     target.alive === true &&
    //     sender.abilitiesEnabled === true &&
    //     sender.abilityConsumed === false &&
    //     sender.abilitiesAvailable > 0
    //   ) {
    //     await fastify.prisma.$transaction([
    //       fastify.prisma.player.update({
    //         data: {
    //           abilitiesEnabled: false,
    //         },
    //         where: {
    //           id: target.id,
    //         },
    //       }),
    //       fastify.prisma.player.update({
    //         data: {
    //           abilitiesEnabled: false,
    //           abilityAvailable: sender.abilityAvailable - 1,
    //         },
    //         where: {
    //           id: sender.id,
    //         },
    //       }),
    //     ]);
    //     return {
    //       event: SocketEmitEvents.CHAT_TO,
    //       message:
    //         "You disabled " +
    //         target.index +
    //         " " +
    //         target.profile.name +
    //         "'s abilities for the night.",
    //     };
    //   } else if (
    //     room.turn === "DAY" &&
    //     sender.alive === true &&
    //     sender.abilitiesEnabled === true &&
    //     sender.abilityConsumed === false &&
    //     sender.abilitiesAvailable === 0
    //   ) {
    //     await fastify.prisma.player.update({
    //       data: {
    //         abilitiesEnabled: false,
    //         abilityConsumed: true,
    //       },
    //       where: {
    //         id: sender.id,
    //       },
    //     });
    //     return {};
    //   } else {
    //     return {};
    //   }
    // },
    "Chief of Intelligence": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Chief of Intelligence" &&
            target.role.team !== "GOVERNMENT" &&
            room.turn === "NIGHT" &&
            sender.alive === true &&
            target.alive === true) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.findFirst({
                    where: {
                        id: target.id,
                    },
                    include: {
                        role: true,
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
                event: _1.SocketEmitEvents.CHAT,
                message: "The Chief of Intelligence checked " +
                    target.index +
                    " " +
                    target.profile.name +
                    ". They are a " +
                    target.role.name +
                    ".",
            };
        }
        else {
            return {};
        }
    }),
    // "Government Leader": async (
    //   fastify: FastifyInstance,
    //   target: PlayerWithRoleAndProfile,
    //   room: Room,
    // sender: PlayerWithRoleAndProfile
    // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
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
            else {
                return {};
            }
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
            else {
                return {};
            }
        }
        else {
            return {};
        }
    }),
    Instigator: (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Instigator" &&
            target.role.team !== "GOVERNMENT" &&
            room.turn === "DAY" &&
            sender.alive === true &&
            target.alive === true &&
            sender.abilitiesEnabled === true) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        roleVisibility: true,
                    },
                    where: {
                        id: target.id,
                    },
                    include: {
                        role: true,
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
                message: "The Instigator revealed player's " +
                    target.index +
                    " " +
                    target.profile.name +
                    " role. They are a " +
                    target.role.name +
                    ". There will be no voting today.",
            };
        }
        else {
            return {};
        }
    }),
    "Cybersecurity Specialist": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (room.turn === "DAY" &&
            sender.alive === true &&
            sender.abilitiesEnabled === true &&
            sender.abilityConsumed === false) {
            yield fastify.prisma.room.update({
                data: {
                    voteAnon: true,
                },
                where: {
                    id: room.id,
                },
            });
            const govPlayers = yield fastify.prisma.player.findMany({
                where: {
                    AND: [{ room: { id: room.id } }, { role: { team: "GOVERNMENT" } }],
                },
            });
            for (const govPlayer of govPlayers) {
                yield fastify.prisma.player.update({
                    data: {
                        voteWeight: 2,
                    },
                    where: {
                        id: govPlayer.id,
                    },
                });
            }
            yield fastify.prisma.player.update({
                data: {
                    abilitiesEnabled: false,
                    abilityConsumed: true,
                },
                where: {
                    id: sender.id,
                },
            });
            return {
                event: _1.SocketEmitEvents.CHAT,
                message: "The Cybersecurity Analist has infiltrated the system and doubled the infiltrated agents votes. The voting is also anonymous today.",
            };
        }
        else {
            return {};
        }
    }),
    "Blackhat Hacker": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (room.turn === "DAY" &&
            sender.alive === true &&
            target.alive === true &&
            sender.abilitiesEnabled === true &&
            sender.abilityConsumed === false) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        voteProtection: true,
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
            //if target is voted during the day and protected, return message to chat letting other players know the target was protected and could not be eliminated.
            return {};
        }
        else {
            return {};
        }
    }),
    // Disruptor: async (
    //   fastify: FastifyInstance,
    //   target: PlayerWithRoleAndProfile,
    //   room: Room,
    // sender: PlayerWithRoleAndProfile
    // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
    // Anarchist: async (
    //  fastify: FastifyInstance,
    //   target: PlayerWithRoleAndProfile,
    //   room: Room,
    // sender: PlayerWithRoleAndProfile
    // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
    // "Bounty Hunter": async (
    //   fastify: FastifyInstance,
    //   target: PlayerWithRoleAndProfile,
    //   room: Room,
    // sender: PlayerWithRoleAndProfile
    // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
    "Serial Killer": (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Serial Killer" &&
            target.alive === true &&
            sender.alive === true &&
            sender.abilitiesEnabled === true &&
            target.isProtected === false) {
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
                event: _1.SocketEmitEvents.CHAT,
                message: "The Serial Killer killed " +
                    target.index +
                    " " +
                    target.profile.name +
                    ".",
            };
        }
        else {
            return {};
        }
    }),
    Corruptor: (fastify, target, room, sender) => __awaiter(void 0, void 0, void 0, function* () {
        if (target.role.name !== "Corruptor" &&
            target.alive === true &&
            sender.alive === true &&
            sender.abilitiesEnabled === true &&
            target.isProtected === false) {
            yield fastify.prisma.$transaction([
                fastify.prisma.player.update({
                    data: {
                        canTalk: false,
                        canVote: false,
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
                event: _1.SocketEmitEvents.CHAT_TO,
                message: "You glitched " + target.index + " " + target.profile.name + ".",
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
