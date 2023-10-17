import { Player, Profile, Role, Room, Turn } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { SocketEmitEvents } from ".";
import { Socket } from "socket.io";
import { createWebSocketStream } from "ws";

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
      
      if(target.attacked === true) {
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: 
            "You protected " + 
            target.index + 
            " " + 
            target.profile.name + 
            ".",
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

  "Cyber Brute": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {

    if (
      room.turn === "NIGHT" && 
      sender.shield > 0 &&
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
      
      //checks if either the target or the cyber brute were attacked and removes a value of the cyber brute's shield  
      if(target.attacked === true || sender.attacked === true){
        await fastify.prisma.player.update({
          data: {
            shield: sender.shield - 1,
          },
          where: {
            id: sender.id,
          }
        })
        
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: "You protected " + target.index + " " + target.profile.name,
        };
        } else {
            return {};
        }
    } else if (
      room.turn === "NIGHT" &&
      sender.shield === 0 &&
      sender.alive === true &&
      target.alive === true
    ){
      await fastify.prisma.player.update({
        data: {
          alive: false,
          canTalk: false,
          canVote: false,
          abilitiesEnabled: false,
          roleVisibility: true
        },
        where: {
          id: sender.id,
        }
      })
        return {}
    } else{
      return{}
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
      sender.abilityConsumed === false &&
      sender.abilitiesEnabled === true &&
      sender.alive === true
    ) {
      await fastify.prisma.player.update({
        data: {
          alive: true,
          roleVisibility: true,
          abilityConsumed: true,
          
        },
        where: {
          id: target.id,
        },
      });

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

  "Cyber Analyst": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Cyber Analyst" &&
      room.turn === "NIGHT" &&
      target.checkedByAnalyst === false &&
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
            checkedByAnalyst: true,
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
          target.role.aura,
      };
    } else if (
      target.role.name !== "Cyber Analyst" &&
      room.turn === "NIGHT" &&
      target.checkedByAnalyst === true &&
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

  Interrogator: async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Interrogator" && 
      room.turn === "DAY" &&
      sender.alive === true &&
      target.alive === true
      ) {
      await fastify.prisma.player.update({
        data: {
          isJailed: true,
        },
        where: {
          id: target.id,
        },
      });

      return {};
    } else {
      return {};
    }
  },

  "Malware Developer": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      room.turn === "NIGHT" && 
      target.isTrapped === false && 
      sender.trapActive === false &&
      sender.abilitiesEnabled === true &&
      sender.alive === true &&
      target.alive === true
    ) {
      await fastify.prisma.player.update({
        data: {
          isTrapped: true,
        },
        where: {
          id: target.id,
        },
      });
  
      await fastify.prisma.player.update({
        data: {
          trapActive: true,
          playerTrapped: target.profile.name,
        },
        where: {
          id: sender.id,
        },
      });
  
      if(sender.profile.name === target.profile.name) {
        return {
          event: SocketEmitEvents.CHAT_TO,
          message: "You have your trap active on yourself.",
        };
      } else {
        return {
          event: SocketEmitEvents.CHAT_TO,
          message:
            "You have your trap active on player" + 
            target.index + 
            " " + 
            target.profile.name + ".",
        };
      }
    } else if (
      room.turn === "NIGHT" && 
      target.isTrapped === false && 
      sender.trapActive === true &&
      sender.abilitiesEnabled === true &&
      sender.alive === true &&
      target.alive === true
    ) { 
      await fastify.prisma.player.update({
        data: {
          playerTrapped: target.id,
        },
        where: {
          id: sender.id,
        },
      });
  
      await fastify.prisma.player.update({
        data: {
          isTrapped: true,
        },
        where: {
          id: target.id,
        },
      });
  
      return {
        event: SocketEmitEvents.CHAT_TO,
        message: 
          "Your trap was moved to player " + 
          target.index + 
          " " + 
          target.profile.name +
          "."
      };
    } else if (
      room.turn === "NIGHT" && 
      target.isTrapped === true && 
      sender.trapActive === true &&
      sender.abilitiesEnabled === true &&
      sender.alive === true &&
      target.alive === true
    ) {
      await fastify.prisma.player.update({
        data: {
          isTrapped: false,
        }, 
        where: {
          id: target.id,
        }
      });
  
      await fastify.prisma.player.update({
        data: {
          trapActive: false,
          playerTrapped: " ",
        },
        where: {
          id: sender.id,
        }
      });
  
      return {
        event: SocketEmitEvents.CHAT_TO,
        message: "Your trap was removed."
      };
    } else {
      return {};
    }
  },

  "Rebel Leader": async (
    fastify: FastifyInstance,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if(
      room.turn === "DAY" &&
      sender.alive === true 
    ){
      await fastify.prisma.player.update({
        data: {
          roleVisibility: true,
          voteWeight: 2,
        },
        where: {
          id: sender.id,
        }
      })

      return {
        event: SocketEmitEvents.CHAT,
        message:
          "Player " +
          sender.index +
          sender.profile.name +
          " is the Rebel Leader!"
      }
    }  else {
      return{}
    }
  },

  // "Data Collector": async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room,
  // sender: PlayerWithRoleAndProfile
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},

  "Drug Dealer": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Drug Dealer" && 
      room.turn === "NIGHT" &&
      sender.abilitiesEnabled === true &&
      sender.alive === true &&
      target.alive === true
      ) {
      await fastify.prisma.player.update({
        data: {
          isDrugged: true,
          canTalk: false,
          canVote: false,
        },
        where: {
          id: target.id,
        },
      });

      return {
        event: SocketEmitEvents.CHAT_TO,
        message: "You drugged " + target.index + " " + target.profile.name,
        //adicionar mensagem avisando o jogador que foi drogado que poderá morrer 
      };
    } else {
      return {};
    }
  },

   "Vigilante Robot": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room,
     sender: PlayerWithRoleAndProfile
   ): Promise<{ event?: SocketEmitEvents; message?: string; }> => {
    if(
      target.role.name !== "Vigilante Robot" && 
      room.turn === "DAY" && 
      sender.vigiKill == false && 
      sender.vigiReveal === false &&
      sender.alive === true &&
      target.alive === true
      ) {
        await fastify.prisma.player.update({})
    }
   },

  "Hardware Specialist": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents;message?: string; }> => {
      if (
        target.role.name !== "Hardware Specialist" && 
        target.role.team === "GOVERNMENT" && 
        room.turn === "NIGHT" &&
        sender.alive === true &&
        target.alive === true
        ) {
          await fastify.prisma.player.update({
            data: {
              alive: false,
              roleVisibility: true,
              canTalk: false,
              canVote: false,
              abilitiesEnabled: false,
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
              " " +
              sender.profile.name +
              " ("+
              sender.role.name +
              ") paid a visit to an infiltrated government agent and was assassinated.",
          }
      } else if(
        target.role.name !== "Hardware Specialist" && 
        target.role.team === "REBEL" && 
        room.turn === "NIGHT" &&
        sender.alive === true &&
        target.alive === true
        ){
          await fastify.prisma.player.update({
            data: {
              isProtected: true,
            },
            where: {
              id: sender.id,
            },
          });
          return {
            event: SocketEmitEvents.CHAT_TO,
            message: 
              "You visited a fellow rebel agent and was protected this night.",
          }
    } else {
      return{};
  }
},

   "Ethical Hacker": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room,
    sender: PlayerWithRoleAndProfile
   ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if(
      target.role.name !== "Ethical Hacker" &&
      sender.alive === true &&
      target.alive === true
    ) {
      await fastify.prisma.player.update({
        data: {
          roleVisibility: true,
        },
        where: {
          id: target.id,
        }
      });

      await fastify.prisma.player.update({
        data: {
          alive: false,
          canTalk: false,
          canVote: false,
          roleVisibility: true,
          abilitiesEnabled: false,
        },
        where: {
          id: sender.id,
        }
      })

      return {
        event: SocketEmitEvents.CHAT,
        message: 
          "The Ethical Hacker revelead player " +
          target.index +
          " " +
          target.profile.name +
          "'s role: " +
          target.role.name +
          "."
      }
    } else{
      return{}
    }
   },

  "Nanotech Engineer": async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Nanotech Engineer" &&
      target.role.team !== "GOVERNMENT" &&
      room.turn === "DAY" &&
      sender.alive === true &&
      target.alive === true
    ) {
      await fastify.prisma.player.update({
        data: {
          abilitiesEnabled: false,
        },
        where: {
          id: target.id,
        },
      });

      return {
        event: SocketEmitEvents.CHAT_TO,
        message:
          "You disabled " +
          target.index +
          " " +
          target.profile.name +
          "'s abilities for the night.",
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
      await fastify.prisma.player.findFirst({
        where: {
          id: target.id,
        },
        include: {
          role: true,
        },
      });
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
      if(
        sender.alive === true && 
        sender.shield > 0 &&
        sender.abilitiesEnabled === true
        ) {
          if(sender.attacked === true){
            await fastify.prisma.player.update({
              data: {
                shield: sender.shield - 1,
              },
              where: {
                id: sender.id,
              }
            })

            return {
              event: SocketEmitEvents.CHAT,
              message:
                "The Tactical Soldier was injured and will die next time they are attacked!"
            }
          } else {
              return {}
          } 
      } else if (
        sender.alive === true &&
        sender.abilitiesEnabled === true,
        sender.shield === 0
      ) {
        if(sender.attacked === true) {
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
            }
          })

          return {}
        } else {
          return{}
        }
      } else {
        return{}
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
      await fastify.prisma.player.update({
        data: {
          roleVisibility: true,
        },
        where: {
          id: target.id,
        },
        include: {
          role: true,
        },
      });

      await fastify.prisma.player.update({
        data: {
          abilitiesEnabled: false,
        },
        where: {
          id: sender.id,
        }
      })
      
      await fastify.prisma.room.update({
        data:{
          hasVote: false,
        },
        where:{
          id: room.id,
        }
      })

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

   "Cybersecurity Specialist": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room,
     sender: PlayerWithRoleAndProfile
   ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if(
      room.turn === "DAY" &&
      sender.alive === true &&
      sender.abilitiesEnabled === true
    ) {
      await fastify.prisma.room.update({
        data: {
          voteAnon: true,
        }, 
        where: {
          id: room.id,
        }
      })

      const govPlayers = await fastify.prisma.player.findMany({
        where: {
          AND: [
            { room: { id: room.id } },
            { role: { team: "GOVERNMENT" } },
          ]
        }
      });

      for(const govPlayer of govPlayers) {
        await fastify.prisma.player.update({
          data: {
            voteWeight: 2,
          }, 
          where: {
            id: govPlayer.id,
          }
        });
      }

      await fastify.prisma.player.update({
        data:{
          abilitiesEnabled: false,
        },
        where: {
          id: sender.id,
        }
      })

      return {
        event: SocketEmitEvents.CHAT,
        message:
        "The Cybersecurity Analist has infiltrated the system and doubled the infiltrated agents votes. The voting is also anonymous today."
      }
    }else{
      return{}
    }
   },

   "Blackhat Hacker": async (
     fastify: FastifyInstance,
     target: PlayerWithRoleAndProfile,
     room: Room,
   sender: PlayerWithRoleAndProfile
   ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if(
      room.turn === "DAY" &&
      sender.alive === true &&
      target.alive === true 
    ) {
      await fastify.prisma.player.update({
        data:{
          voteProtection: true,
        },
        where: {
          id: target.id,
        }
      })

      //if target is voted during the day and protected, return message to chat letting other players know the target was protected and could not be eliminated.
      return {}
    } else {
      return{}
    }
   },

  // Disruptor: async (
  //   fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room,
  // sender: PlayerWithRoleAndProfile
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},

  // Anarchist: async (
  //  fastify: FastifyInstance,
  //   target: PlayerWithRoleAndProfile,
  //   room: Room,
  // sender: PlayerWithRoleAndProfile
  // ): Promise<{ event: SocketEmitEvents; message: string }> => {},

  // "Bounty Hunter": async (
  //   fastify: FastifyInstance,
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
      await fastify.prisma.player.update({
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
      });

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

  Corruptor: async (
    fastify: FastifyInstance,
    target: PlayerWithRoleAndProfile,
    room: Room,
    sender: PlayerWithRoleAndProfile
  ): Promise<{ event?: SocketEmitEvents; message?: string }> => {
    if (
      target.role.name !== "Corruptor" &&
      target.alive === true &&
      sender.alive === true &&
      sender.abilitiesEnabled === true &&
      target.isProtected === false
      ) {
      await fastify.prisma.player.update({
        data: {
          canTalk: false,
          canVote: false,
        },
        where: {
          id: target.id,
        },
      });

      return {
        event: SocketEmitEvents.CHAT_TO,
        message:
          "You glitched " + target.index + " " + target.profile.name + ".",
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
