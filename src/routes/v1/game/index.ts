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

const PLAYERS_TO_START_GAME = 2;

enum SocketEmitEvents {
  PONG = "pong",
  ROOM = "room",
  PLAYERS = "players",
  player = "player",
  CHAT_ALERT = "chat-alert",
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

async function findRoomForPlayer(fastify: FastifyInstance, profileId: string) {
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
      include: {
        role: true,
        profile: true,
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

      soloRoles.splice(
        soloRoles.findIndex((role) => role.id === randomSolo.id),
        1
      );

      selectedSoloRoles.push(randomSolo);
    }
    if (i >= 2) {
      if (selectedGovernmentRoles.length < selectedRebelRoles.length) {
        const randomGovernment =
          governmentRoles[getRandomInt(governmentRoles.length)];

        governmentRoles.splice(
          governmentRoles.findIndex((role) => role.id === randomGovernment.id),
          1
        );

        selectedGovernmentRoles.push(randomGovernment);
      } else {
        const randomRebel = rebelRoles[getRandomInt(rebelRoles.length)];

        rebelRoles.splice(
          rebelRoles.findIndex((role) => role.id === randomRebel.id),
          1
        );

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
      role: shuffledRoles[index],
    };
  });

  playersWithRoles.forEach(async (player) => {
    await fastify.prisma.player.update({
      where: {
        id: player.id,
      },
      data: {
        roleId: player.role.id,
      },
    });
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

async function verifyTurn(fastify: FastifyInstance, roomId: string) {
  const room = await fastify.prisma.room.findUnique({
    where: {
      id: roomId,
    },
  });

  if (!room) {
    return;
  }

  if (room.startedAt) {
    // pegue o tempo atual, se tiver passado 30 segundos desde o startedAt, chame nextTurn
    const now = new Date();
    const diff = now.getTime() - room.actualTurnStartedAt!.getTime();
    const seconds = diff / 1000;

    if (seconds >= 30) {
      return await nextTurn(fastify, roomId);
    } else {
      return room;
    }
  }
}

async function verifySocketId(
  fastify: FastifyInstance,
  socketId: string,
  profileId: string
) {
  const player = await fastify.prisma.player.findFirst({
    where: {
      profileId: profileId,
    },
  });

  if (!player) {
    return;
  }

  await fastify.prisma.player.update({
    where: {
      id: player.id,
    },
    data: {
      socketId: socketId,
    },
  });
}

async function getRoomBySocketId(fastify: FastifyInstance, socketId: string) {
  const player = await fastify.prisma.player.findFirst({
    where: {
      socketId: socketId,
    },
  });

  if (!player) {
    return;
  }

  const room = await fastify.prisma.room.findFirst({
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

      let room: Room | undefined;
      let player;

      const playerRoom = await findRoomForPlayer(fastify, profile!.id);

      if (playerRoom) {
        room = playerRoom;
        await verifySocketId(fastify, Socket.id, profile!.id);
      } else {
        room = await getARoom(fastify);
        player = await createNewPlayer(fastify, room.id, profile!.id);
      }

      Socket.join(room.id);

      const players = await getRoomPlayers(fastify, room.id);
      fastify.io.to(room.id).emit(SocketEmitEvents.ROOM, room);
      if (players.length === 0) {
        let playersReloaded = await getRoomPlayers(fastify, room.id);
        fastify.io.to(room!.id).emit(SocketEmitEvents.PLAYERS, playersReloaded);
      } else {
        fastify.io.to(room!.id).emit(SocketEmitEvents.PLAYERS, players);
      }

      if (players.length === PLAYERS_TO_START_GAME && !room.startedAt) {
        const roomUpdated = await startGame(fastify, Socket, room, players);
        Socket.emit(SocketEmitEvents.ROOM, roomUpdated);
        fastify.io
          .to(roomUpdated!.id)
          .emit(
            SocketEmitEvents.PLAYERS,
            await getRoomPlayers(fastify, roomUpdated!.id)
          );
      }

      Socket.on(SocketOnEvents.HANDLE_SKILL, (data: { target: string }) => {});

      Socket.on(SocketOnEvents.VOTE, (data: { target: string }) => {});

      Socket.on(SocketOnEvents.CHAT, async (data: { message: string }) => {
        const room = await getRoomBySocketId(fastify, Socket.id);
        if (room?.turn !== Turn.DAY && room?.turn !== Turn.VOTE) {
          return Socket.emit(SocketEmitEvents.CHAT_ALERT, {
            message: "You cant talk now!",
          });
        }
        if (
          room.players.find((player) => player.socketId === Socket.id)
            ?.canTalk !== true
        ) {
          return Socket.emit(SocketEmitEvents.CHAT_ALERT, {
            message: "You cant talk now!",
          });
        }

        fastify.io.to(room!.id).emit(SocketOnEvents.CHAT, {
          message: data.message,
          sender: profile!.name,
          sockId: Socket.id,
        });
      });

      Socket.on(
        SocketOnEvents.CHAT_NIGHT,
        async (data: { message: string }) => {
          const room = await getRoomBySocketId(fastify, Socket.id);
          if (room?.turn !== Turn.NIGHT) {
            return Socket.emit(SocketEmitEvents.CHAT_ALERT, {
              message: "You cant talk now!",
            });
          }
          if (
            room.players.find((player) => player.socketId === Socket.id)?.role
              ?.canTalkNight !== true
          ) {
            return Socket.emit(SocketEmitEvents.CHAT_ALERT, {
              message: "You cant talk now!",
            });
          }
          if (
            room.players.find((player) => player.socketId === Socket.id)
              ?.canTalk !== true
          ) {
            return Socket.emit(SocketEmitEvents.CHAT_ALERT, {
              message: "You cant talk now!",
            });
          }

          fastify.io.to(room!.id).emit(SocketOnEvents.CHAT, {
            message: data.message,
            sender: profile!.name,
            sockId: Socket.id,
          });
        }
      );

      Socket.on(
        SocketOnEvents.CHAT_TO,
        (data: { message: string; to: string }) => {
          fastify.io.to(data.to).emit(SocketOnEvents.CHAT, {
            message: data.message,
            sender: profile!.name,
            sockId: Socket.id,
          });
        }
      );

      Socket.on(SocketOnEvents.PING, async () => {
        Socket.emit(SocketEmitEvents.PONG);
        Socket.emit(SocketEmitEvents.ROOM, await verifyTurn(fastify, room!.id));
      });

      Socket.on(SocketOnEvents.DISCONNECT, (data: any) => {
        Socket.leave(room!.id);
      });
    });
  });

  done();
}
