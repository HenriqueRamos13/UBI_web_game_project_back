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

const PLAYERS_TO_START_GAME = 3;

async function createNewPlayer(
  fastify: FastifyInstance,
  roomId: string,
  profileId: string
) {
  return await fastify.prisma.player
    .create({
      data: {
        roomId: roomId,
        profileId: profileId,
        index: 0,
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
      if (rooms.length === 0) {
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

function startGame(Socket: Socket, room: Room) {
  // TODO: set roles for all players then emit to all players
  // ok
}

export default function (fastify: FastifyInstance, opts: any, done: any) {
  fastify.ready((err) => {
    if (err) throw err;

    fastify.io.on("connection", async (Socket: Socket) => {
      const profile = await fastify.prisma.profile.findUnique({
        where: {
          id: Socket.request.headers["x-user-id"] as string,
        },
      });
      // TODO verify if user is already in a game
      const playerRoom = await findPlayerRoom(fastify, profile!.id);
      let room;

      if (playerRoom) {
        room = playerRoom;
      } else {
        room = await getARoom(fastify);
      }

      const player = await createNewPlayer(fastify, room.id, profile!.id);
      Socket.join(room.id);
      Socket.emit("room", room.id);
      if (room.players.length === PLAYERS_TO_START_GAME) {
        startGame(Socket, room);
      }

      Socket.on("handle-skill", (data: { target: string }) => {});

      Socket.on("vote", (data: { target: string }) => {});

      Socket.on("chat", (data: { message: string }) => {});

      Socket.on("chat-night", (data: { message: string }) => {});

      Socket.on("chat-to", (data: { message: string; to: string }) => {});

      Socket.on("ping", () => {
        Socket.emit("pong");
      });

      Socket.on("disconnect", (data: any) => {});
    });
  });

  done();
}
