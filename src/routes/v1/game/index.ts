import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
import {
  Aura,
  Team,
  Role,
  Profile,
  Player,
  Room,
  Turn,
  User,
} from "@prisma/client";
import * as jwt from "jsonwebtoken";

const PLAYERS_TO_START_GAME = 3;

enum SocketEmitEvents {
  PONG = "pong",
  ROOM = "room",
  PLAYERS = "players",
  player = "player",
}

enum SocketOnEvents {
  CONNECTION = "connection",
  PING = "ping",
  HANDLE_SKILL = "handle-skill",
  VOTE = "vote",
  CHAT = "chat",
  CHAT_NIGHT = "chat-night",
  CHAT_TO = "chat-to",
  DISCONNECT = "disconnect",
}

async function createNewPlayer(
  fastify: FastifyInstance,
  roomId: string,
  profileId: string
) {
  const playersInRoom = await fastify.prisma.player.count({
    where: {
      roomId: roomId,
    },
  });

  return await fastify.prisma.player
    .create({
      data: {
        roomId: roomId,
        profileId: profileId,
        index: playersInRoom + 1,
      },
    })
    .then((player) => {
      return player;
    });
}

async function getARoom(fastify: FastifyInstance) {
  return await fastify.prisma.room
    .findMany({
      where: {
        finished: false,
        turn: {
          equals: Turn.LOBBY,
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
      if (
        rooms.length === 0 ||
        rooms[0].players.length >= PLAYERS_TO_START_GAME
      ) {
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
      } else {
        return rooms[0];
      }
    });
}

async function findPlayerRoom(fastify: FastifyInstance, profileId: string) {
  return await fastify.prisma.room
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
}

async function getRoomPlayers(fastify: FastifyInstance, roomId: string) {
  return await fastify.prisma.player
    .findMany({
      where: {
        roomId: roomId,
      },
    })
    .then((players) => {
      return players;
    });
}

async function startGame(
  fastify: FastifyInstance,
  Socket: Socket,
  room: Room
) {}

export default function (fastify: FastifyInstance, opts: any, done: any) {
  fastify.ready((err) => {
    if (err) throw err;

    fastify.io.on(SocketOnEvents.CONNECTION, async (Socket: Socket) => {
      if (!Socket.handshake.query || !Socket.handshake.query.token) {
        Socket.disconnect();
        return;
      }
      const decoded = (await jwt.verify(
        Socket.handshake.query.token as string,
        process.env.JWT_SECRET!
      )) as {
        id: string;
        profileId: string;
      };
      if (!decoded) {
        Socket.disconnect();
        return;
      }

      const profile = await fastify.prisma.profile.findUnique({
        where: {
          id: decoded.profileId,
        },
      });

      let room;

      const playerRoom = await findPlayerRoom(fastify, profile!.id);

      if (playerRoom) {
        room = playerRoom;
      } else {
        room = await getARoom(fastify);
      }

      const player = await createNewPlayer(fastify, room.id, profile!.id);

      Socket.join(room.id);
      Socket.emit(SocketEmitEvents.ROOM, room.id);

      const players = await getRoomPlayers(fastify, room.id);

      Socket.emit(SocketEmitEvents.PLAYERS, players);

      if (players.length === PLAYERS_TO_START_GAME) {
        await startGame(fastify, Socket, room);
      }

      Socket.on(SocketOnEvents.HANDLE_SKILL, (data: { target: string }) => {});

      Socket.on(SocketOnEvents.VOTE, (data: { target: string }) => {});

      Socket.on(SocketOnEvents.CHAT, (data: { message: string }) => {});

      Socket.on(SocketOnEvents.CHAT_NIGHT, (data: { message: string }) => {});

      Socket.on(
        SocketOnEvents.CHAT_TO,
        (data: { message: string; to: string }) => {}
      );

      Socket.on(SocketOnEvents.PING, () => {
        Socket.emit(SocketEmitEvents.PONG);
      });

      Socket.on(SocketOnEvents.DISCONNECT, (data: any) => {});
    });
  });

  done();
}
