import { Message } from "discord.js";

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
