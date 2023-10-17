import { Player, Profile, Role, Room, Turn } from "@prisma/client";
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
      room.turn == "NIGHT" &&
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
          message:
            "You protected " + target.index + " " + target.profile.name + ".",
        };
      } else {
        return {};
      }
    } else if (
      target.role.name === "Combat Medic" &&
      room.turn === "NIGHT" &&
      sender.abilitiesEnabled === true &&
      sender.alive === true &&
      target.alive === true
    ) {
      return {
        event: SocketEmitEvents.CHAT_TO,
        message: "You can't protect yourself.",
      };
    } else {
      return {};
    }
  },

  Detective: async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Detective" &&
      room.turn === "NIGHT" &&
      target.checkedByDetective === false &&
      sender.abilitiesEnabled === true &&
      sender.alive === true &&
      target.alive === true
    ) {
      await fastify.prisma.$transaction([
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
        event: SocketEmitEvents.CHAT_TO,
        message:
          "You checked " +
          target.index +
          " " +
          target.profile.name +
          ": " +
          target.role.name,
      };
    } else if (
      target.role.name !== "Detective" &&
      room.turn === "NIGHT" &&
      target.checkedByDetective === true &&
      sender.abilitiesEnabled === true &&
      sender.alive === true &&
      target.alive === true
    ) {
      return {
        event: SocketEmitEvents.CHAT_TO,
        message: "You already checked that player.",
      };
    } else {
      return {};
    }
  },

  "Tech Contrabandist": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Tech Contrabandist" &&
      target.role.team === "REBEL" &&
      target.online === true &&
      target.alive === false &&
      room.turn === "NIGHT" &&
      sender.abilitiesEnabled === true &&
      sender.abilityConsumed === false &&
      sender.alive === true
    ) {
      await fastify.prisma.$transaction([
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
        event: SocketEmitEvents.CHAT,
        message:
          target.index +
          " " +
          target.profile.name +
          " was revived by the Tech Contrabandist.",
      };
    } else {
      return {};
    }
  },

  "Rebel Leader": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      room.turn === "DAY" &&
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
        message:
          "Player " +
          sender.index +
          sender.profile.name +
          " is the Rebel Leader!",
      };
    } else {
      return {};
    }
  },

  "Chief of Intelligence": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Chief of Intelligence" &&
      target.role.team !== "GOVERNMENT" &&
      room.turn === "NIGHT" &&
      sender.alive === true &&
      target.alive === true
    ) {
      await fastify.prisma.$transaction([
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
        event: SocketEmitEvents.CHAT,
        message:
          "The Chief of Intelligence checked " +
          target.index +
          " " +
          target.profile.name +
          ". They are a " +
          target.role.name +
          ".",
      };
    } else {
      return {};
    }
  },

  // "Government Leader": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room,
  // sender: PlayerWithRoleAndProfile
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},

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
      } else {
        return {};
      }
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
      } else {
        return {};
      }
    } else {
      return {};
    }
  },

  Instigator: async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Instigator" &&
      target.role.team !== "GOVERNMENT" &&
      room.turn === "DAY" &&
      sender.alive === true &&
      target.alive === true &&
      sender.abilitiesEnabled === true
    ) {
      await fastify.prisma.$transaction([
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
        event: SocketEmitEvents.CHAT,
        message:
          "The Instigator revealed player's " +
          target.index +
          " " +
          target.profile.name +
          " role. They are a " +
          target.role.name +
          ". There will be no voting today.",
      };
    } else {
      return {};
    }
  },

  // Anarchist: async (
  //  fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room,
  // sender: PlayerWithRoleAndProfile
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},

  "Serial Killer": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Serial Killer" &&
      target.alive === true &&
      sender.alive === true &&
      sender.abilitiesEnabled === true &&
      target.isProtected === false
    ) {
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
        event: SocketEmitEvents.CHAT,
        message:
          "The Serial Killer killed " +
          target.index +
          " " +
          target.profile.name +
          ".",
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
