import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";

const USERS_TO_START_GAME = 2

enum AttributeToHit {
  aura = 'aura',
  life = 'life',
  shield = 'shield',
  blocked = 'blocked',
  talk = 'talk',
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

enum Turn {
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
  skillUsed: Skill | null;
  skillCount: number;
  skillTurn: Turn;
  blocked: boolean;
  talk: boolean;
  name: string;
}

interface Room {
  users: User[];
  id: string;
  turn: number;
  startedAt: Date | null;
  lastTurn: number;
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
    skillCount: 0,
    skillTurn: "night" as Turn,
    blocked: false,
    talk: true,
    name: `Player ${index + 1}`,
  }
}

function getARoom() {
  const roomsNotFull = games.filter(
    (room) => room.users.length < USERS_TO_START_GAME
  );

  if (roomsNotFull.length === 0) {
    const room = {
      users: [],
      id: Math.random().toString(36).substring(7),
      turn: 0,
      startedAt: null,
      lastTurn: 0,
    };

    games.push(room);

    return room;
  } else {
    return roomsNotFull[0];
  }
}

function findUserRoom(sockId: string) {
  return games.find(room => room.users.find(user => user.sockId === sockId));
}

function filterUsersByAura(users: User[], aura: Aura) {
  return users.filter(user => user.aura === aura);
}

function filterUsersData(users: User[], aura: Aura) {
  if (aura === Aura.good || aura === Aura.neutral) {
    return users.map(user => {
      return {
        alive: user.alive,
        online: user.online,
        name: user.name,
        index: user.index,
        sockId: user.sockId,
      } as User | any
    })
  } else {
    return users.map(user => {
      return {
        aura: user.aura === Aura.good ? null : Aura.evil,
        class: user.aura === Aura.good ? null : user.class,
        alive: user.alive,
        online: user.online,
        name: user.name,
        index: user.index,
        sockId: user.sockId,
      } as User | any
    })
  }
}

function startGame(Socket: Socket, room: Room) {
  Socket.to(room.id).emit("start-game", room.users.map(user => ({
      name: user.name, index: user.index, sockId: user.sockId
    })
  ));

  room.users.map(user => {
    Socket.emit("users-data", filterUsersData(room.users, user.aura));
  })

  room.startedAt = new Date();
}

export default function (fastify: FastifyInstance, opts: any, done: any) {
  fastify.ready((err) => {
    if (err) throw err;

    fastify.io.on("connection", (Socket: Socket) => {
      console.info("Socket connected!", Socket);

      if (Socket.recovered) {
        // recovery was successful: socket.id, socket.rooms and socket.data were restored
        const room = findUserRoom(Socket.id);

        if (!room ) {
          return Socket.disconnect(true);
        }

        room.users = room.users.map(user => {
          if (user.sockId === Socket.id) {
            user.online = 1;
          }
          return user;
        });

        room.users.map(user => {
          Socket.emit("users-data", filterUsersData(room.users, user.aura));
        })
      } else {
        // new or unrecoverable session
      }

      // if (Socket.handshake.auth.token !== "1234") {
      //   Socket.disconnect(true);
      // }

      let room = getARoom();

      const user = createNewUser(Socket.id, room.users.length);

      room.users.push(user);

      Socket.join(room.id);

      // enviando dados para o cliente
      Socket.emit("user", user);
      
      Socket.to(room.id).emit("lobby", room.users.map(user => ({
          name: user.name, index: user.index, sockId: user.sockId
        })
      ));
      // fastify.io.emit("users", room.users);

      if (room.users.length === USERS_TO_START_GAME) {
        startGame(Socket, room);
      }

      Socket.on("handle-skill", (data: {
        target: string;
      }) => {
        const room = games.find(room => room.users.find(user => user.sockId === Socket.id));

        if (room) {
          console.log('handle-skill', data.target);
          room.users.map(user => {
            Socket.emit("users-data", filterUsersData(room.users, user.aura));
          })
          // fastify.io.emit("users", room.users);
        }
      });

      Socket.on("ping", () => {
        Socket.emit("pong");
      });

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

          room.users.map(user => {
            Socket.emit("users-data", filterUsersData(room.users, user.aura));
          })
          // fastify.io.emit("users", room.users);
        }
      });

    });
  });

  done();
}
