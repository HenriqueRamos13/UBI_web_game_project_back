import { Player, Profile, Role, Room, Team, Turn } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { SocketEmitEvents } from ".";

export type PlayerWithRoleAndProfile = Player & {
  role: Role;
  profile: Profile;
};

const ROLES_SKILLS = {
  "Combat Medic": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Combat Medic" &&
      room.turn === Turn.NIGHT &&
      sender.abilitiesEnabled === true &&
      sender.alive === true &&
      target.alive === true
    ) {
      await fastify.prisma.player.update({
        data: {
          isProtected: true,
        },
        where: {
          id: target.id,
        },
      });

      if (target.attacked === true) {
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: `You protected ${target.index} ${target.profile.name}.`,
        };
      }

      return {};
    } else if (
      target.role.name === "Combat Medic" &&
      room.turn === Turn.NIGHT &&
      sender.abilitiesEnabled === true &&
      sender.alive === true &&
      target.alive === true
    ) {
      return {
        event: SocketEmitEvents.CHAT_TO,
        message: "You can't protect yourself.",
      };
    }

    return {};
  },

  Detective: async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Detective" &&
      room.turn === Turn.NIGHT &&
      target.checkedByDetective === false &&
      sender.abilitiesEnabled === true &&
      sender.alive === true &&
      target.alive === true
    ) {
      await fastify.prisma.$transaction([
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
        event: SocketEmitEvents.CHAT_TO,
        message: `You checked ${target.index} ${target.profile.name}: ${target.role.name}`,
      };
    } else if (
      target.role.name !== "Detective" &&
      room.turn === Turn.NIGHT &&
      target.checkedByDetective === true &&
      sender.abilitiesEnabled === true &&
      sender.alive === true &&
      target.alive === true
    ) {
      return {
        event: SocketEmitEvents.CHAT_TO,
        message: "You already checked that player.",
      };
    }

    return {};
  },

  "Tech Contrabandist": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Tech Contrabandist" &&
      target.online === true &&
      target.alive === false &&
      room.turn === Turn.NIGHT &&
      sender.abilitiesEnabled === true &&
      sender.abilityConsumed === false &&
      sender.alive === true
    ) {
      if (target.role.team !== Team.REBEL) {
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: `You can't revive a non Rebel player.`,
        };
      }

      await fastify.prisma.$transaction([
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
        event: SocketEmitEvents.CHAT_NIGHT,
        message: ` Player ${target.index} ${target.profile.name} was revived by the Tech Contrabandist.`,
      };
    }

    return {};
  },

  "Rebel Leader": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      (room.turn === Turn.DAY || room.turn === Turn.VOTE) &&
      sender.alive === true &&
      sender.abilitiesEnabled === true &&
      sender.abilityConsumed === false
    ) {
      await fastify.prisma.player.update({
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
        event: SocketEmitEvents.CHAT,
        message: `Player ${sender.index} ${sender.profile.name} is the Rebel Leader!`,
      };
    }

    return {};
  },

  "Chief of Intelligence": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Chief of Intelligence" &&
      room.turn === Turn.NIGHT &&
      sender.alive === true &&
      target.alive === true
    ) {
      if (target.role.team === Team.GOVERNMENT) {
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: `You can't check a Government player.`,
        };
      }

      await fastify.prisma.player.update({
        data: {
          abilitiesEnabled: false,
        },
        where: {
          id: sender.id,
        },
      });

      return {
        event: SocketEmitEvents.CHAT_NIGHT,
        message: `The Chief of Intelligence checked ${target.index} ${target.profile.name}. They are a ${target.role.name}.`,
      };
    }

    return {};
  },

  "Government Leader": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      (room.turn === Turn.DAY || room.turn === Turn.VOTE) &&
      sender.alive === true &&
      sender.abilitiesEnabled === true &&
      sender.abilityConsumed === false
    ) {
      await fastify.prisma.player.update({
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
        event: SocketEmitEvents.CHAT,
        message: `Player ${sender.index} ${sender.profile.name} is the Government Leader!`,
      };
    }

    return {};
  },
  // EXPLICAR \/
  "Tactical Soldier": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      sender.alive === true &&
      sender.shield > 0 &&
      sender.abilitiesEnabled === true
    ) {
      if (sender.attacked === true) {
        await fastify.prisma.player.update({
          data: {
            shield: sender.shield - 1,
          },
          where: {
            id: sender.id,
          },
        });

        return {
          event: SocketEmitEvents.CHAT,
          message:
            "The Tactical Soldier was injured and will die next time they are attacked!",
        };
      }
      return {};
    } else if (
      (sender.alive === true && sender.abilitiesEnabled === true,
      sender.shield === 0)
    ) {
      if (sender.attacked === true) {
        await fastify.prisma.player.update({
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
  },

  Instigator: async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Instigator" &&
      (room.turn === Turn.DAY || room.turn === Turn.VOTE) &&
      sender.alive === true &&
      target.alive === true &&
      sender.abilitiesEnabled === true
    ) {
      if (target.role.team === Team.GOVERNMENT) {
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: `You can't reveal a Government player.`,
        };
      }

      await fastify.prisma.$transaction([
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
        event: SocketEmitEvents.CHAT,
        message: `The Instigator revealed player's ${target.index} ${target.profile.name} role. They are a ${target.role.name}. There will be no voting today.`,
      };
    }

    return {};
  },

  "Serial Killer": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Serial Killer" &&
      room.turn === Turn.NIGHT &&
      target.alive === true &&
      sender.alive === true &&
      sender.abilitiesEnabled === true
    ) {
      if (target.isProtected) {
        return {
          event: SocketEmitEvents.CHAT_NIGHT,
          message: `The Serial Killer tried to kill ${target.index} but he was protected.`,
        };
      }

      await fastify.prisma.$transaction([
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
        event: SocketEmitEvents.CHAT_NIGHT,
        message: `The Serial Killer killed ${target.index} ${target.profile.name}.`,
      };
    } else {
      return {};
    }
  },
};

async function skillController(
  fastify: FastifyInstance,
  sender: PlayerWithRoleAndProfile,
  target: PlayerWithRoleAndProfile,
  room: Room
): Promise<{ event?: SocketEmitEvents; message?: string }> {
  return await ROLES_SKILLS[sender.role.name as keyof typeof ROLES_SKILLS](
    fastify,
    target,
    room,
    sender
  );
}

export default skillController;
