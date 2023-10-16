import { Player, Profile, Role, Room } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { SocketEmitEvents } from ".";
import { Socket } from "socket.io";

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
    if(target.role.name !== "Combat Medic" && room.turn == "NIGHT"){
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
      message: "You protected " + target.index + " " + target.profile.name + ".",
    };
  } else if(target.role.name === "Combat Medic" && room.turn === "NIGHT"){
    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "You can't protect yourself."
    }
  } else {
    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "You can't do that right now."
    }
  }
  },

   "Cyber Brute": async (
   fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name !== "Cyber Brute" && room.turn === "NIGHT"){
    await fastify.prisma.player.update({
      data: {
        shield: target.shield + 1,
      },
      where: {
        id: target.id,
     }
    });

    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "You protected " + target.index + " " + target.profile.name,
    }
  } else if(target.role.name === "Cyber Brute" && room.turn === "NIGHT"){
    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "You chose to protect only yourself."
    }
  } else{
    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "You can't do that right now."
    }
  }
  },

   Detective: async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
     ): Promise<{ event: SocketEmitEvents; message: string }> =>{
      if(target.role.name !== "Detective" && room.turn === "NIGHT" && checkedByDetective === false){
        await fastify.prisma.$transaction{[
          fastify.prisma.player.findFirst({
            where: {
              id: target.id,
            },
            include: {
              role: true,
            },
          })
        ]}
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: "You checked " + target.index + " " + target.profile.name + ": " + target.role.name, 
        }
      } else if(target.role.name !== "Detective" && room.turn === "NIGHT" && checkedByDetective === true){
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: "You already checked that player."
        }
      } else {
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: "You can't do that."
        }
      }
     },

   "Tech Contrabandist": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name !== "Tech Contrabandist" && target.role.team === "REBEL" && target.online === true && target.alive === false && room.turn === "NIGHT") {
      await fastify.prisma.player.update({
        data: {
          alive: true,
          roleVisibility: true,
        }, 
        where: {
          id: target.id,
        }
      })

      return {
        event: SocketEmitEvents.CHAT,
        message: target.index + " " + target.profile.name + " was revived by the Tech Contrabandist."
      }
    } else{
      return {
        event: SocketEmitEvents.CHAT_TO,
        message: "You can't do that."
      }
    }

   },
  
   "Cyber Analyst": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name !== "Cyber Analyst" && room.turn === "NIGHT" && target.checkedByAnalyst === false){
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
            checkedByAnalyst: true,
          },
          where: {
            id: target.id,
          }
        })
      ])

         return {
           event: SocketEmitEvents.CHAT_TO,
           message: "You checked " + target.index + " " + target.profile.name + ": " + target.role.aura, 
         };
      } else if(target.role.name !== "Cyber Analyst" && room.turn === "NIGHT" && target.checkedByAnalyst === true){
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: "You already checked that player.", 
        };
      } else {
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: "You can't do that.", 
        };
      } 
   },

   Interrogator: async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name !== "Interrogator" && room.turn === "DAY"){
    await fastify.prisma.player.update({
      data: {
        isJailed: true,
      },
      where: {
        id: target.id,
     }
    });

    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "You jailed " + target.index + " " + target.profile.name,
    }
  } else {
    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "You can't do that.",
    }
  }
   },

   "Malware Developer": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(room.turn === "NIGHT"){
    await fastify.prisma.player.update({
      data: {
        isTrapped: true,
      },
      where: {
        id: target.id,
     }
    });

    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "You put your trap on " + target.index + " " + target.profile.name,
    }
  } else {
    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "You can't do that",
    }
  }
   },
  
   "Rebel Leader": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name === "Rebel Leader" && room.turn == "DAY"){
      await fastify.prisma.player.update({
        data: {
          roleVisibility: true,
          voteWeight: 2,
        },
        where: {
          id: target.id,
        }
      })

      return{
        event: SocketEmitEvents.CHAT_ALERT,
        message: "Player " + target.index + " " + target.profile.name + " is the Rebel Leader!"
      }
    } else {
      return{
        event: SocketEmitEvents.CHAT_TO,
        message: "You can't do that."
      }
    }
   },

  // "Data Collector": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  
   "Drug Dealer": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name !== "Drug Dealer" && room.turn === "NIGHT"){
    await fastify.prisma.player.update({
      data: {
        isDrugged: true,
      },
      where: {
        id: target.id,
     }
    });

    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "You drugged " + target.index + " " + target.profile.name,
    }
  } else {
    return {
      event: SocketEmitEvents.CHAT_TO,
      message: "You can't do that.",
    }
  }
   },

  // "Vigilante Robot": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},
  
   "Hardware Specialist": async (
   fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name !== "Hardware Specialist" && room.turn === "NIGHT"){
      
    }
   },

  // "Ethical Hacker": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},

   "Nanotech Engineer": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name !== "Nanotech Engineer" && target.role.team !== "GOVERNMENT"){
      await fastify.prisma.player.update({
        data: {
          abilitiesEnabled: false,
        },
        where: {
          id: target.id,
        }
      })

      return {
        event: SocketEmitEvents.CHAT_TO,
        message: "You disabled " + target.index + " " + target.profile.name + "'s abilities for the night."
      }
    } else{
      return{
        event: SocketEmitEvents.CHAT_TO,
        message: "You must choose a player from an opposing team."
      }
    }
   },

   "Chief of Intelligence": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name !== "Chief of Intelligence" && target.role.team !== "GOVERNMENT"){
      await fastify.prisma.player
       .findFirst({
         where: {
           id: target.id,
         },
         include: {
           role: true,
         },
       })
         return {
           event: SocketEmitEvents.CHAT,
           message: "The Chief of Intelligence checked " + target.index + " " + target.profile.name + ". They are a " + target.role.name + ".", 
         };
    } else{
      return{
        event: SocketEmitEvents.CHAT_TO,
        message: "You can't check that player."
      }
    }
   },

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

  
   Instigator: async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name !== "Instigator" && target.role.team !== "GOVERNMENT"){
      await fastify.prisma.player.update({
        data: {
          roleVisibility: true,
        }, 
        where: {
          id: target.id,
        },
        include:{
          role: true,
        }
      })

      return {
        event: SocketEmitEvents.CHAT,
        message: "The Instigator revealed player's " + target.index + " " + target.profile.name + " role. They are a " + target.role.name + ".",
      }
    } else{
      return{
        event: SocketEmitEvents.CHAT_TO,
        message: "You can only reveal player's from opposite teams."
      }
    }
   },


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
  //  fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},

  // "Bounty Hunter": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},

   "Serial Killer": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name !== "Serial Killer"){
      await fastify.prisma.player.update({
        data: {
          alive: false,
        }, 
        where: {
          id: target.id,
        }
      })

      return {
        event: SocketEmitEvents.CHAT,
        message: "The Serial Killer killed " + target.index + " " + target.profile.name + "."
      }
    } else{
      return{
        event: SocketEmitEvents.CHAT_TO,
        message: "You can't kill that player."
      }
    }
   },


   Corruptor: async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room
   ): Promise<{ event: SocketEmitEvents; message: string }> => {
    if(target.role.name !== "Corruptor"){
      await fastify.prisma.player.update({
        data: {
          canTalk: false,
          canVote: false,
        }, 
        where: {
          id: target.id,
        }
      })

      return {
        event: SocketEmitEvents.CHAT_TO,
        message: "You glitched " + target.index + " " + target.profile.name + "."
      }
    }else{
      return {
        event: SocketEmitEvents.CHAT_TO,
        message: "You can't glitch that player."
      }
    }
   },
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
