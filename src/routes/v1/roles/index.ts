import { FastifyInstance, FastifyRequest } from "fastify";
import { Aura, Role, Team } from "@prisma/client";

type Request = FastifyRequest<{
  Body: {
    // roles: Role[];
  };
}>;
// signup route
export default function (fastify: FastifyInstance, opts: any, done: any) {
  fastify.post("/roles", async (request: Request, reply) => {
    // const { roles } = request.body;

    const rolesCreated = await fastify.prisma.role.createMany({
      data: [
        {
          name: "Combat Medic",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "The Combat Medic acquired their knowledge while serving in the government's army for years, until they managed to escape and seek shelter with the rebels. As a Combat Medic, you can choose a player to protect during the night, making that player immune to attacks. However, you cannot protect yourself.",
          canTalkNight: false,
          image: "https://i.imgur.com/BOqnBkH.png",
        },
        {
          name: "Cyber Brute",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "The Cyber Brute is a formidable rebel agent known for their exceptional strength and resilience. As a Cyber Brute, you have the ability to protect a fellow player each night. Thanks to your unmatched strength, the Cyber Brute can withstand the first attack directed at them, but they are unable to defend against subsequent attacks. Additionally, the Cyber Brute automatically protects themselves every night.",
          canTalkNight: false,
          image: "https://i.imgur.com/S7tGjnq.png",
        },
        {
          name: "Detective",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "A former government detective, who, after facing termination, chose to dedicate their skills to the rebel cause. Leveraging their acquired knowledge and technologies from years of serving the totalitarian government, the Detective specializes in uncovering the true identity of a player by hacking into their cyber data. Each night, the Detective can select a player to reveal their role.",
          canTalkNight: false,
          image: "https://i.imgur.com/jzCEs7Q.png",
        },
        {
          name: "Tech Contrabandist",
          aura: Aura.UNKNOWN,
          team: Team.REBEL,
          description:
            "An expert in technology smuggling, the Tech Contrabandist possesses the knowledge and skills to access and manipulate technology for anonymous communication with deceased rebel agents. Once per game, the Tech Contrabandist can choose a deceased rebel agent to be resurrected in the game, allowing them to rejoin the living players on the next day.",
          canTalkNight: false,
          image: "https://i.imgur.com/2ZNF2fj.png",
        },
        {
          name: "Cyber Analyst",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "The Cyber Analyst is a specialist in reading digital auras and neural signatures of individuals. Each night, they can select a player to reveal that player's aura.",
          canTalkNight: false,
          image: "https://i.imgur.com/Sa07SAA.png",
        },
        {
          name: "Interrogator",
          aura: Aura.UNKNOWN,
          team: Team.REBEL,
          description:
            "The Interrogator is a rebel agent with expertise in forensic psychology and criminology. They have the ability to select a player during the day to be imprisoned during the night. While in prison, both the Interrogator and the imprisoned player can communicate anonymously. Additionally, the Interrogator possesses a single bullet that can be used to eliminate a player who is imprisoned during the night.",
          canTalkNight: false,
          image: "https://i.imgur.com/O2WFyu4.png",
        },
        {
          name: "Malware Developer",
          aura: Aura.UNKNOWN,
          team: Team.REBEL,
          description:
            "The Malware Developer is a specialist in crafting digital viruses. During the night, they have the ability to set a digital trap on a player, including themselves. If a government agent attempts to attack the player with the trap, a random player from the government team will become infected with malware and be eliminated from the game. Solo assassins can trigger the trap but won't be infected by the virus.",
          canTalkNight: false,
          image: "https://i.imgur.com/kzJ93X0.png",
        },
        {
          name: "Rebel Leader",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "The Rebel Leader is the most prominent figure within the rebellion. They have the choice to disclose their role to all other players, effectively doubling the weight of their vote in day voting for the rest of the game.",
          canTalkNight: false,
          image: "https://i.imgur.com/bpOLmZ9.png",
        },
        {
          name: "Data Collector",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "The Data Collector possesses the ability to observe two players during the night to identify potential suspects in case one of them is eliminated. One of the suspects will belong to the team responsible for the elimination, while the other could be from any team.",
          canTalkNight: false,
          image: "https://i.imgur.com/Z6QBr4K.png",
        },
        {
          name: "Street Thief",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "The Street Thief used to roam the streets of Neonova, pickpocketing wallets to survive. One day, she pilfered from a rebel agent who was impressed by her skills and recruited her into the rebellion. The Street Thief has the ability to select a deceased player and assume their identity. However, if she steals the identity of a player from an opposing team, she loses this ability.",
          canTalkNight: false,
          image: "https://i.imgur.com/2iRm1Hi.png",
        },
        {
          name: "Drug Dealer",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "The Drug Dealer has the ability to drug another player during the night, preventing them from speaking or voting the next day. The drugged player has a 50% chance of dying.",
          canTalkNight: false,
          image: "https://i.imgur.com/D2cr8nx.png",
        },
        {
          name: "Neurohacker",
          aura: Aura.UNKNOWN,
          team: Team.REBEL,
          description:
            "The Neurohacker is a skilled individual who can manipulate neural and cybernetic systems. They possess two neural injections, each usable only once during the night. One injection destabilizes a player's cybernetic system, leading to their demise, while the other reinforces a player's neural defenses, protecting them from attacks. The protective injection is only consumed if the player becomes a target of an attack.",
          canTalkNight: false,
          image: "https://i.imgur.com/bXnli6k.png",
        },
        {
          name: "Vigilante Robot",
          aura: Aura.UNKNOWN,
          team: Team.REBEL,
          description:
            "The AI-controlled Vigilante Robot was created by the rebel agents to protect the rebellion. The robot is equipped with tools that can erase a player's digital presence, leading to their demise. It can also reveal a player's role to all other players. Each of these abilities can only be used once, during different days.",
          canTalkNight: false,
          image: "https://i.imgur.com/mTXOe3X.png",
        },
        {
          name: "Data Smuggler",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "The Data Smuggler is a rebel agent who has infiltrated the government and gained access to confidential government data. Starting from the second night, they possess two data cards that can be secretly distributed to other players during the night. These data cards allow the recipients to voluntarily reveal their roles. If the recipients do not reveal their roles after a certain amount of time, the Data Smuggler has the option to reveal them.",
          canTalkNight: false,
          image: "https://i.imgur.com/7ePSdkK.png",
        },
        {
          name: "Hardware Specialist",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "The Hardware Specialist is a highly knowledgeable figure in hardware technology, allowing them to visit and infiltrate a player's cyber systems every night. If the player they visit happens to be a government agent or a solo assassin, the Hardware Specialist meets their demise. However, if the visited player is a rebel agent, the Hardware Specialist becomes immune to attacks for that night.",
          canTalkNight: false,
          image: "https://i.imgur.com/UDLCYPa.png",
        },
        {
          name: "Ethical Hacker",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "The Ethical Hacker is a skilled individual who uses their talents to assist the rebellion. They have the ability to select a player and, upon their own demise, reveal the player's role to all participants.",
          canTalkNight: false,
          image: "https://i.imgur.com/S38pLne.png",
        },
        {
          name: "Drone Operator",
          aura: Aura.GOOD,
          team: Team.REBEL,
          description:
            "The Drone Operator is an expert in drone technology, commanding a drone equipped with two lethal projectiles. Each night, the operator can select a target. The following day, they have the option to launch one of the projectiles to eliminate the chosen target or switch targets. However, this lethal technology is not without risks. If the operator attempts to eliminate a player belonging to the rebel team, the projectile's direction is reversed, resulting in the operator's own demise.",
          canTalkNight: false,
          image: "https://i.imgur.com/6nQV5N6.png",
        },
        {
          name: "Nanotech Engineer",
          aura: Aura.EVIL,
          team: Team.GOVERNMENT,
          description:
            "The Nanotech Engineer possesses the ability to temporarily disrupt the abilities of other players using their nanorobots. Twice during the game, they can select a non-teammate player during the day to send their nanorobots. This interference confuses the target, rendering them unable to use their abilities for that night.",
          canTalkNight: true,
          image: "https://i.imgur.com/5DbQbTa.png",
        },
        {
          name: "Chief of Intelligence",
          aura: Aura.EVIL,
          team: Team.GOVERNMENT,
          description:
            "The Chief of Intelligence is the leader of the infiltrated government agents. Due to their knowledge and experience in the field of technology, they can infiltrate a player's cyber systems, revealing the player's role to their fellow government agents during the night. If they become the last surviving government agent, they resign their position and adopt the role of a regular government agent, without any special abilities.",
          canTalkNight: true,
          image: "https://i.imgur.com/CULkB31.png",
        },
        {
          name: "Government Leader",
          aura: Aura.UNKNOWN,
          team: Team.GOVERNMENT,
          description:
            "The Government Leader is a high-ranking government agent, skilled in remaining hidden and manipulating information. During the night, their vote counts as double. During the day, they have the ability to send private messages to their fellow government agents, visible only to them, but cannot receive responses.",
          canTalkNight: true,
          image: "https://i.imgur.com/kkFwTF1.png",
        },
        {
          name: "Tactical Soldier",
          aura: Aura.UNKNOWN,
          team: Team.GOVERNMENT,
          description:
            "The Tactical Soldier is a highly skilled agent with extensive combat training and experience, making them exceptionally resourceful. When attacked, whether by night actions or daytime voting, they can escape and survive, avoiding death. However, the next attack, regardless of its nature, will be fatal.",
          canTalkNight: true,
          image: "https://i.imgur.com/H9i06RW.png",
        },
        {
          name: "Disguise Specialist",
          aura: Aura.EVIL,
          team: Team.GOVERNMENT,
          description:
            "The Disguise Specialist has the ability to disguise another player during the day. This disguise will make the selected player appear as if they belong to the government team when their role is checked by any investigative role.",
          canTalkNight: true,
          image: "https://i.imgur.com/kqsCZo3.png",
        },
        {
          name: "Government Agent",
          aura: Aura.EVIL,
          team: Team.GOVERNMENT,
          description:
            "The Government Agent is an ordinary government operative with no special abilities.",
          canTalkNight: true,
          image: "https://i.imgur.com/T6PxxAZ.png",
        },
        {
          name: "Instigator",
          aura: Aura.EVIL,
          team: Team.GOVERNMENT,
          description:
            "The Instigator Agent has the ability to reveal another player's role to all the other players once per game. On the day the Instigator reveals a player, there will be no voting.",
          canTalkNight: true,
          image: "https://i.imgur.com/dmjnpGe.png",
        },
        {
          name: "Cybersecurity Specialist",
          aura: Aura.EVIL,
          team: Team.GOVERNMENT,
          description:
            "The Cybersecurity Specialist has the ability to infiltrate any system. Once per game, the specialist can use their ability to infiltrate the voting system, making the day's vote secret and doubling the value of all their team's votes.",
          canTalkNight: true,
          image: "https://i.imgur.com/8WRSolV.png",
        },
        {
          name: "Blackhat Hacker",
          aura: Aura.EVIL,
          team: Team.GOVERNMENT,
          description:
            "A morally ambiguous hacker. Once per game, during the voting phase, the hacker can hack into the voting system and prevent a player from being eliminated by the other players.",
          canTalkNight: true,
          image: "https://i.imgur.com/DHwCiuP.png",
        },
        {
          name: "Data Manipulator",
          aura: Aura.UNKNOWN,
          team: Team.GOVERNMENT,
          description:
            "This agent is a specialist altering and manipulating data. Twice per game, they can activate their ability during the day, making the roles of all players who die on the following night visible only to the government agents' team. For the other players, the roles remain hidden.",
          canTalkNight: true,
          image: "https://i.imgur.com/0YqIkuO.png",
        },
        {
          name: "Corruptor",
          aura: Aura.UNKNOWN,
          team: Team.GOVERNMENT,
          description:
            "This government agent specializes in causing havoc by corrupting one player from opposing teams each night. Each night they can select a player to corrupt, causing their systems to glitch and preventing them from talking and voting the next day. The glitched player will die at the end of the day.",
          canTalkNight: true,
          image: "https://i.imgur.com/isSBwWF.png",
        },
        {
          name: "Disruptor",
          aura: Aura.EVIL,
          team: Team.GOVERNMENT,
          description:
            "This agent possesses the unique ability to manipulate the game dynamics. Twice per game, they can trigger an ability during the day, swapping the positions of all players in the match. This action not only makes the day's voting secret but also wipes all messages from the chat.",
          canTalkNight: true,
          image: "https://i.imgur.com/t2t3spd.png",
        },
        {
          name: "Anarchist",
          aura: Aura.UNKNOWN,
          team: Team.SOLO,
          description:
            "Embracing chaos and rejecting all forms of authority, the anarchist's primary goal is to incite disorder within the group. They achieve victory if the other players vote and eliminate them during the day, ending the game",
          canTalkNight: false,
          image: "https://i.imgur.com/fTWmiwb.png",
        },
        {
          name: "Bounty Hunter",
          aura: Aura.UNKNOWN,
          team: Team.SOLO,
          description:
            "The bounty hunter has infiltrated the rebellion with a specific mission: to capture a designated player assigned at the start of the game. Their objective is to persuade the other players to vote and eliminate their target. If successful, the game ends, and the bounty hunter wins.",
          canTalkNight: false,
          image: "https://i.imgur.com/cv9UhSn.png",
        },
        {
          name: "Serial Killer",
          aura: Aura.UNKNOWN,
          team: Team.SOLO,
          description:
            "The Serial Killer is a disturbed and psychotic figure infiltrated into the group with the goal of eliminating all players. Every night, they can choose a player to stab.",
          canTalkNight: false,
          image: "https://i.imgur.com/QwE0MKU.png",
        },
        {
          name: "Illegal Trader",
          aura: Aura.UNKNOWN,
          team: Team.SOLO,
          description:
            "The Illegal Trader is a specialist in illicit chemicals and poisons. They possess two dangerous mixtures, one red and one black, and every night they can give one of each to two players. Both players are warned that they may die at the end of the day, but only the player who received the black substance will die. The red substance becomes fatal on the second consumption. Players do not know which substance they received. The game ends if the Illegal Trader is the last player alive.",
          canTalkNight: false,
          image: "https://i.imgur.com/dOAtQlM.png",
        },
      ],
    });

    return rolesCreated;
  });

  done();
}
