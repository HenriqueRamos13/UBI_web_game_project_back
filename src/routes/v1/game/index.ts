import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";

const USERS_TO_START_GAME = 2

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
  skillUsed: Skill | null;
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
    skillUsed: null,
  }
}

export default function (fastify: FastifyInstance, opts: any, done: any) {
  fastify.ready((err) => {
    if (err) throw err;

    fastify.io.on("connection", (Socket: Socket) => {
      console.info("Socket connected!", Socket);

      if (Socket.recovered) {
        // recovery was successful: socket.id, socket.rooms and socket.data were restored
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
        (room) => room.users.length < USERS_TO_START_GAME
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

        if (room) {
          room.users = room.users.map(user => {
            if (user.sockId === Socket.id) {
              user.online = 0;
            }
            return user;
          });

          if (room.users.filter(user => user.online === 1).length === 0) {
            games = games.filter(game => game.id !== room.id);
          }

          fastify.io.emit("users", room.users);
        }
      });

      fastify.io.emit("users", room.users);

      Socket.on("click-on-user", (data: {
        target: string;
      }) => {
        const room = games.find(room => room.users.find(user => user.sockId === Socket.id));

        if (room) {
          console.log('click-on-user', data.target);

          fastify.io.emit("users", room.users);
        }
        
      });
    });
  });

  done();
}
