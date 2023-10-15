import { Player, Profile, Role, Room } from "@prisma/client";
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
    room: Room
  ): Promise<{ event: SocketEmitEvents; message: string }> => {
    await fastify.prisma.player.update({
      data: {
        shield: target.shield + 1,
      },
      where: {
        id: target.id,
      },
    });

    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "Voce protegeu o jogador " + target.profile.name,
    };
  },
  // "Cyber Brute": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // Detective: (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ) => {},
  // "Tech Contrabandist": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Cyber Analyst": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {
  //   await fastify.prisma.player
  //     .findFirst({
  //       where: {
  //         id: target.id,
  //       },
  //       include: {
  //         role: true,
  //       },
  //     })
  //     .then((player) => {
  //       return (
  //         "Voce analisou o jogador " +
  //         target.profile.name +
  //         " e ele é " +
  //         player!.role!.name
  //       );
  //     });
  // },
  // Interrogator: async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Malware Developer": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Rebel Leader": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Data Collector": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Drug Dealer": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Vigilante Robot": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Hardware Specialist": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Ethical Hacker": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Nanotech Engineer": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Chief of Intelligence": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Government Leader": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Tactical Soldier": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Government Agent": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // Instigator: async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Cybersecurity Specialist": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Blackhat Hacker": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // Disruptor: async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // Anarchist: async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Bounty Hunter": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // "Serial Killer": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  // Corruptor: async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
};

async function skillController(
  fastify: FastifyInstance,
  sender: PlayerWithRoleAndProfile,
  target: PlayerWithRoleAndProfile,
  room: Room
): Promise<{ event: SocketEmitEvents; message: string }> {
  return await ROLES_SKILLS[sender.role.name as keyof typeof ROLES_SKILLS](
    fastify,
    target,
    room
  );
}

export default skillController;
