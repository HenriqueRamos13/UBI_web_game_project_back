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

const PLAYERS_TO_START_GAME = 7;

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

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

async function startGame(
  fastify: FastifyInstance,
  Socket: Socket,
  room: Room,
  players: Player[]
) {
  const soloRoles = await fastify.prisma.role.findMany({
    where: {
      team: Team.SOLO,
    },
  });

  const governmentRoles = await fastify.prisma.role.findMany({
    where: {
      team: Team.GOVERNMENT,
    },
  });

  const rebelRoles = await fastify.prisma.role.findMany({
    where: {
      team: Team.REBEL,
    },
  });

  // sempre vai ter 2 solos
  // sempre vai ter um governo a mais do que rebeldes

  const selectedSoloRoles: Role[] = [];
  const selectedGovernmentRoles: Role[] = [];
  const selectedRebelRoles: Role[] = [];

  for (let i = 0; i < PLAYERS_TO_START_GAME; i++) {
    if (i < 2) {
      const randomSolo = soloRoles[getRandomInt(soloRoles.length)];
      selectedSoloRoles.push(randomSolo);
    }
    if (i >= 2) {
      if (selectedGovernmentRoles.length < selectedRebelRoles.length) {
        const randomGovernment =
          governmentRoles[getRandomInt(governmentRoles.length)];
        selectedGovernmentRoles.push(randomGovernment);
      } else {
        const randomRebel = rebelRoles[getRandomInt(rebelRoles.length)];
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
    return {
      ...player,
      roleId: shuffledRoles[index],
    };
  });

  const updatedPlayers = await fastify.prisma.player.updateMany({
    where: {
      id: {
        in: playersWithRoles.map((player) => player.id),
      },
    },
    data: playersWithRoles.map((player) => ({
      roleId: player.roleId.id,
    })),
  });

  return await nextTurn(fastify, room.id);
}

async function nextTurn(fastify: FastifyInstance, roomId: string) {
  // verify the acctual turn then increment it
  // if is LOBBY go to NIGHT and set startedAt to now
  // if is NIGHT go to DAY
  // if is DAY go to VOTE

  const room = await fastify.prisma.room.findUnique({
    where: {
      id: roomId,
    },
  });

  if (!room) {
    return;
  }

  if (room.turn === Turn.LOBBY) {
    await fastify.prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        actualTurnStartedAt: new Date(),
        turnNumber: room.turnNumber + 1,
        turn: Turn.NIGHT,
        startedAt: new Date(),
      },
    });
  }

  if (room.turn === Turn.NIGHT) {
    await fastify.prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        actualTurnStartedAt: new Date(),
        turnNumber: room.turnNumber + 1,
        turn: Turn.DAY,
      },
    });
  }

  if (room.turn === Turn.DAY) {
    await fastify.prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        actualTurnStartedAt: new Date(),
        turnNumber: room.turnNumber + 1,
        turn: Turn.VOTE,
      },
    });
  }

  if (room.turn === Turn.VOTE) {
    await fastify.prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        actualTurnStartedAt: new Date(),
        turnNumber: room.turnNumber + 1,
        turn: Turn.NIGHT,
      },
    });
  }

  const updatedRoom = await fastify.prisma.room.findUnique({
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
}

export default function (fastify: FastifyInstance, opts: any, done: any) {
  fastify.ready((err) => {
    if (err) throw err;

    fastify.io.on(SocketOnEvents.CONNECTION, async (Socket: Socket) => {
      if (!Socket.handshake.auth || !Socket.handshake.auth.token) {
        Socket.disconnect();
        return;
      }
      const decoded = (await jwt.verify(
        Socket.handshake.auth.token as string,
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
      let player;

      const playerRoom = await findPlayerRoom(fastify, profile!.id);

      console.log(1111111, playerRoom);

      if (playerRoom) {
        room = playerRoom;
      } else {
        room = await getARoom(fastify);
        player = await createNewPlayer(fastify, room.id, profile!.id);
      }

      Socket.join(room.id);
      Socket.emit(SocketEmitEvents.ROOM, room.id);

      const players = await getRoomPlayers(fastify, room.id);

      fastify.io.to(room.id).emit(SocketEmitEvents.PLAYERS, players);

      if (players.length === PLAYERS_TO_START_GAME) {
        const roomUpdated = await startGame(fastify, Socket, room, players);
        fastify.io.to(room.id).emit(SocketEmitEvents.ROOM, roomUpdated);
        fastify.io.to(room.id).emit(SocketEmitEvents.PLAYERS, players);
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
