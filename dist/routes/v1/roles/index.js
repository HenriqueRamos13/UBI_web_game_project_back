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
// signup route
function default_1(fastify, opts, done) {
    fastify.post("/roles", (request, reply) => __awaiter(this, void 0, void 0, function* () {
        // const { roles } = request.body;
        const rolesCreated = yield fastify.prisma.role.createMany({
            data: [
                {
                    name: "Combat Medic",
                    aura: client_1.Aura.GOOD,
                    team: client_1.Team.REBEL,
                    description: "The Combat Medic acquired their knowledge while serving in the government's army for years, until they managed to escape and seek shelter with the rebels. As a Combat Medic, you can choose a player to protect during the night, making that player immune to attacks. However, you cannot protect yourself.",
                    canTalkNight: false,
                    image: "https://i.imgur.com/BOqnBkH.png",
                },
                {
                    name: "Detective",
                    aura: client_1.Aura.GOOD,
                    team: client_1.Team.REBEL,
                    description: "A former government detective, who, after facing termination, chose to dedicate their skills to the rebel cause. Leveraging their acquired knowledge and technologies from years of serving the totalitarian government, the Detective specializes in uncovering the true identity of a player by hacking into their cyber data. Each night, the Detective can select a player to reveal their role.",
                    canTalkNight: false,
                    image: "https://i.imgur.com/jzCEs7Q.png",
                },
                {
                    name: "Tech Contrabandist",
                    aura: client_1.Aura.UNKNOWN,
                    team: client_1.Team.REBEL,
                    description: "An expert in technology smuggling, the Tech Contrabandist possesses the knowledge and skills to access and manipulate technology for anonymous communication with deceased rebel agents. Once per game, the Tech Contrabandist can choose a deceased rebel agent to be resurrected in the game, allowing them to rejoin the living players on the next day.",
                    canTalkNight: false,
                    image: "https://i.imgur.com/2ZNF2fj.png",
                },
                {
                    name: "Rebel Leader",
                    aura: client_1.Aura.GOOD,
                    team: client_1.Team.REBEL,
                    description: "The Rebel Leader is the most prominent figure within the rebellion. They have the choice to disclose their role to all other players, effectively doubling the weight of their vote in day voting for the rest of the game.",
                    canTalkNight: false,
                    image: "https://i.imgur.com/bpOLmZ9.png",
                },
                {
                    name: "Chief of Intelligence",
                    aura: client_1.Aura.EVIL,
                    team: client_1.Team.GOVERNMENT,
                    description: "The Chief of Intelligence is the leader of the infiltrated government agents. Due to their knowledge and experience in the field of technology, they can infiltrate a player's cyber systems, revealing the player's role to their fellow government agents during the night. If they become the last surviving government agent, they resign their position and adopt the role of a regular government agent, without any special abilities.",
                    canTalkNight: true,
                    image: "https://i.imgur.com/CULkB31.png",
                },
                {
                    name: "Government Leader",
                    aura: client_1.Aura.UNKNOWN,
                    team: client_1.Team.GOVERNMENT,
                    description: "The Government Leader is a high-ranking government agent, skilled in remaining hidden and manipulating information. During the night, their vote counts as double. During the day, they have the ability to send private messages to their fellow government agents, visible only to them, but cannot receive responses.",
                    canTalkNight: true,
                    image: "https://i.imgur.com/kkFwTF1.png",
                },
                {
                    name: "Tactical Soldier",
                    aura: client_1.Aura.UNKNOWN,
                    team: client_1.Team.GOVERNMENT,
                    description: "The Tactical Soldier is a highly skilled agent with extensive combat training and experience, making them exceptionally resourceful. When attacked, whether by night actions or daytime voting, they can escape and survive, avoiding death. However, the next attack, regardless of its nature, will be fatal.",
                    canTalkNight: true,
                    image: "https://i.imgur.com/H9i06RW.png",
                },
                {
                    name: "Instigator",
                    aura: client_1.Aura.EVIL,
                    team: client_1.Team.GOVERNMENT,
                    description: "The Instigator Agent has the ability to reveal another player's role to all the other players once per game. On the day the Instigator reveals a player, there will be no voting.",
                    canTalkNight: true,
                    image: "https://i.imgur.com/dmjnpGe.png",
                },
                {
                    name: "Anarchist",
                    aura: client_1.Aura.UNKNOWN,
                    team: client_1.Team.SOLO,
                    description: "Embracing chaos and rejecting all forms of authority, the anarchist's primary goal is to incite disorder within the group. They achieve victory if the other players vote and eliminate them during the day, ending the game",
                    canTalkNight: false,
                    image: "https://i.imgur.com/fTWmiwb.png",
                },
                {
                    name: "Serial Killer",
                    aura: client_1.Aura.UNKNOWN,
                    team: client_1.Team.SOLO,
                    description: "The Serial Killer is a disturbed and psychotic figure infiltrated into the group with the goal of eliminating all players. Every night, they can choose a player to stab.",
                    canTalkNight: false,
                    image: "https://i.imgur.com/QwE0MKU.png",
                },
            ],
        });
        return rolesCreated;
    }));
    done();
}
exports.default = default_1;
