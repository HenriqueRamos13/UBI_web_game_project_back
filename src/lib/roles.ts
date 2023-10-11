import { Aura, Team, Role } from "@prisma/client";

const ROLES: Record<string, Partial<Role>> = {
  //rebel roles
  combatMedic: {
    name: "Combat Medic",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description:
      "The Combat Medic acquired their knowledge while serving in the government's army for years, until they managed to escape and seek shelter with the rebels. As a Combat Medic, you can choose a player to protect during the night, making that player immune to attacks. However, you cannot protect yourself.",
    canTalkNight: false,
  },

  cyberBrute: {
    name: "Cyber Brute",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description:
      "The Cyber Brute is a formidable rebel agent known for their exceptional strength and resilience. As a Cyber Brute, you have the ability to protect a fellow player each night. Thanks to your unmatched strength, the Cyber Brute can withstand the first attack directed at them, but they are unable to defend against subsequent attacks. Additionally, the Cyber Brute automatically protects themselves every night.",
    canTalkNight: false,
  },

  detective: {
    name: "Detective",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description:
      "A former government detective, who, after facing termination, chose to dedicate their skills to the rebel cause. Leveraging their acquired knowledge and technologies from years of serving the totalitarian government, the Detective specializes in uncovering the true identity of a player by hacking into their cyber data. Each night, the Detective can select a player to reveal their role.",
    canTalkNight: false,
  },

  techContrabandist: {
    name: "Tech Contrabandist",
    aura: Aura.UNKNOWN,
    team: Team.REBEL,
    description:
      "An expert in technology smuggling, he has access to and is able to manipulate technology that allows anonymous communication with deceased rebel agents and, once per game, he can choose a deceased rebel agent to be resurrected the next day.",
    canTalkNight: false,
  },

  cyberAnalyst: {
    name: "Cyber Analyst",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  interrogator: {
    name: "Interrogator",
    aura: Aura.UNKNOWN,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  malwareDeveloper: {
    name: "Malware Developer",
    aura: Aura.UNKNOWN,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  rebelLeader: {
    name: "Rebel Leader",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  dataCollector: {
    name: "Data Collector",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  streetThief: {
    name: "Street Thief",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  drugDealer: {
    name: "Drug Dealer",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  neurohacker: {
    name: "Neurohacker",
    aura: Aura.UNKNOWN,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  vigilanteRobot: {
    name: "Vigilante Robot",
    aura: Aura.UNKNOWN,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  dataSmuggler: {
    name: "Data Smuggler",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  hardwareSpecialist: {
    name: "Hardware Specialist",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  ethicalHacker: {
    name: "Ethical Hacker",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  droneOperator: {
    name: "Drone Operator",
    aura: Aura.GOOD,
    team: Team.REBEL,
    description: "",
    canTalkNight: false,
  },

  //government roles
  nanotechEngineer: {
    name: "Nanotech Engineer",
    aura: Aura.EVIL,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  intelligenceChief: {
    name: "Chief of Intelligence",
    aura: Aura.EVIL,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  governmentLeader: {
    name: "Government Leader",
    aura: Aura.UNKNOWN,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  tacticalSoldier: {
    name: "Tactical Soldier",
    aura: Aura.UNKNOWN,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  disguiseSpecialist: {
    name: "Disguise Specialist",
    aura: Aura.EVIL,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  /*roles de converter outro jogador, confirmar se vai ter no jogo ou n depois
  recruiter: {
    name: "Recruiter",
    aura: Aura.EVIL,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  governmentFan: {
    name: "Government Fan",
    aura: Aura.GOOD,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: false,
 }
*/

  governmentAgent: {
    name: "Government Agent",
    aura: Aura.EVIL,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  instigator: {
    name: "Instigator",
    aura: Aura.EVIL,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  cybersecuritySpecialist: {
    name: "Cybersecurity Specialist",
    aura: Aura.EVIL,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  blackhatHacker: {
    name: "Blackhat Hacker",
    aura: Aura.EVIL,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  dataManipulator: {
    name: "Data Manipulator",
    aura: Aura.UNKNOWN,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  corruptor: {
    name: "Corruptor",
    aura: Aura.UNKNOWN,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  disruptor: {
    name: "Disruptor",
    aura: Aura.EVIL,
    team: Team.GOVERNMENT,
    description: "",
    canTalkNight: true,
  },

  //solo vote roles
  anarchist: {
    name: "Anarchist",
    aura: Aura.UNKNOWN,
    team: Team.SOLO,
    description: "",
    canTalkNight: false,
  },

  bountyHunter: {
    name: "Bounty Hunter",
    aura: Aura.UNKNOWN,
    team: Team.SOLO,
    description: "",
    canTalkNight: false,
  },

  //solo kill roles
  serialKiller: {
    name: "Serial Killer",
    aura: Aura.UNKNOWN,
    team: Team.SOLO,
    description: "",
    canTalkNight: false,
  },

  illegalTrader: {
    name: "Illegal Trader",
    aura: Aura.UNKNOWN,
    team: Team.SOLO,
    description: "",
    canTalkNight: false,
  },

  /*solo kill roles de converter, confirmar se vai ter no jogo ou n depois
  lonelyHacker: {
    name: "Lonely Hacker",
    aura: Aura.UNKNOWN,
    team: Team.SOLO,
    description: "",
    canTalkNight: false,
  },

  accomplice: {
    name: "Accomplice",
    aura: Aura.UNKNOWN,
    team: Team.SOLO,
    description: "",
    canTalkNight: false,
  },

  biohacker: {
    name: "Biohacker",
    aura: Aura.UNKNOWN,
    team: Team.SOLO,
    description: "",
    canTalkNight: false,
  },

  biomodified: {
    name: "Biomodified",
    aura: Aura.UNKNOWN,
    team: Team.SOLO,
    description: "",
    canTalkNight: false,
  }

*/
};

export default ROLES;
