import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";

enum AttributeToHit {
  aura = 'aura',
  life = 'life',
  shield = 'shield',
  resurrected = 'resurrected'
}

interface Skill {
  value: number;
  attributeToHit: AttributeToHit;
}

enum Aura {
  good = 'good',
  evil = 'evil',
  neutral = 'neutral'
}

enum HabilityUse {
  night = 'night',
  day = 'day',
  both = 'both'
}

interface User {
  sockId: string;
  index: number;
  aura: Aura;
  life: number;
  shield: number;
  class: string;
  alive: number;
  online: number;
  resurrected: number;
  habilitiesToUse: number;
  habilitiesPerTurn: number;
  habilityUse: HabilityUse;
  hability: Skill;
  habilityTarget: string;
}

interface Room {
  users: User[];
  id: string;
  turn: number;
}

let games: Room[] = [];

function createNewUser(sockId: string, index: number) {
  return {
    sockId,
    index,
    aura: "good" as Aura,
    life: 1,
    shield: 0,
    class: "villager",
    alive: 1,
    online: 1,
    resurrected: 0,
    habilitiesToUse: 0,
    habilitiesPerTurn: 0,
    habilityUse: "both" as HabilityUse,
    hability: {
      value: 0,
      attributeToHit: "aura" as AttributeToHit,
    },
    habilityTarget: "",
  }
}

export default function (fastify: FastifyInstance, opts: any, done: any) {
  fastify.ready((err) => {
    if (err) throw err;

    fastify.io.on("connection", (Socket: Socket) => {
      console.info("Socket connected!", Socket);

      if (Socket.recovered) {
        // recovery was successful: socket.id, socket.rooms and socket.data were restored
        // if the user is already in a room, change the online status to 1
        const room = games.find(room => room.users.find(user => user.sockId === Socket.id));

        if (room) {
          room.users = room.users.map(user => {
            if (user.sockId === Socket.id) {
              user.online = 1;
            }
            return user;
          });

          fastify.io.emit("users", room.users);
        }
      } else {
        // new or unrecoverable session
      }

      // if (Socket.handshake.auth.token !== "1234") {
      //   Socket.disconnect(true);
      // }

      let room: Room | null = null

      const roomsWithLessThan16Players = games.filter(
        (room) => room.users.length < 16
      );

      if (roomsWithLessThan16Players.length === 0) {
         room = {
          users: [],
          id: Socket.id,
          turn: 0,
        };

        games.push(room);

      } else {
        room = roomsWithLessThan16Players[0];
      }

      const user = createNewUser(Socket.id, room.users.length);

      room.users.push(user);

      Socket.on("disconnect", (data: any) => {
        console.info("Socket disconnected!", Socket.id);
        
        const room = games.find(room => room.users.find(user => user.sockId === Socket.id));

        // change the user online status
        if (room) {
          room.users = room.users.map(user => {
            if (user.sockId === Socket.id) {
              user.online = 0;
            }
            return user;
          });

          // if all users are offline, delete the room
          if (room.users.filter(user => user.online === 1).length === 0) {
            games = games.filter(game => game.id !== room.id);
          }

          // send the new room status to all users
          fastify.io.emit("users", room.users);
        }
      });

      // send to users from the same room the new user
      fastify.io.emit("users", room.users);

      Socket.on("click-on-user", (data: {
        target: string;
      }) => {
        const room = games.find(room => room.users.find(user => user.sockId === Socket.id));

        if (room) {
          // find the user that was clicked and set his habilityTarget to the user that clicked and his habilityToUse to -1
          room.users = room.users.map(user => {
            if (user.sockId === data.target) {
              user.habilityTarget = Socket.id;
              user.habilitiesToUse -= 1;
            }
            return user;
          });

          fastify.io.emit("users", room.users);
        }
        
      });
    });
  });

  done();
}
