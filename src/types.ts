import { Message } from "discord.js";
import { Types, Document } from "mongoose";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}

declare module "winston" {
  interface Transport {
    name: string,
  }
}

export interface StaticCommand {
  name: string,
  description?: string,
  handleReaction?: Function,
};

export interface Command {
  name: string,
  description: string,
  aliases?: string[],
  args?: boolean,
  usage?: string,
  execute: Function,
};

export interface CommandParams {
  message: Message,
  args: string[],
  isOwner: boolean,
  isRanking: boolean,
};

// Mongoose Models
export interface IConfig {
  prefix: string,
  leaders?: number,
  officers?: number,
  giveawayChannel?: number,
  missionsChannel?: number,
  starboardChannel?: number,
  giveawayRole?: number
}

export interface IUser {
  userId: string,
  userTag: string,
}

export interface IAchievement {
  id: number;
  name: string;
  description: string;
}

// TODO: endTime is used as Date or Moment but the union type fails
export interface IGiveaway {
  id: string,
  _id: string,
  userId: string,
  userTag: string,
  creationTime: Date,
  endTime: any,
  item: string,
  duration: string,
  entries: IUser[]
}

export interface IGuild {
  _id: string,
  config: IConfig,
  giveaways: Types.DocumentArray<IGiveaway & Document>,
  giveawayWinners: object[],
}

export interface IBoss {
  name: string,
  alias: string,
  wiki: string,
  video: string,
  raidIndex: string
}

export interface IBuild {
  build: string
}

export interface IKey {
  discordId: string,
  keyName: string,
  accountName: string,
  permissions: string,
  key: string
}

export interface ISpecialization {
  id: number,
  name: string,
  profession: string,
  elite: boolean,
  icon: string,
  professionIcon: string
}

export interface ITitle {
  id: number,
  name: string
}

export interface IWinner {
  userId: string,
  userTag: string,
  item: string
}

export interface IWorld {
  id: number,
  name: string,
  population?: string
}
