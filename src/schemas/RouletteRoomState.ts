import { ArraySchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") sessionId: string = "";
  @type("string") name: string = "";
  @type("string") image: string = "";
}

export class Rouletteoption extends Schema {
  @type("string") name: string = "";
  @type("string") textColor: string = "";
  @type("string") backgroundColor: string = "";
}

export class RouletteRoomState extends Schema {
  @type([Player]) players = new ArraySchema<Player>();
  @type("string") currentPlayer: string = "";
  @type("string") result: string = "";
  @type([Rouletteoption]) options = new ArraySchema<Rouletteoption>();
}
