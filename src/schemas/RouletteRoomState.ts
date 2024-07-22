import { ArraySchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") sessionId: string = "";
  @type("string") name: string = "";
  @type("string") image: string = "";

  constructor(sessionId: string, name: string, image: string) {
    super();
    this.sessionId = sessionId;
    this.name = name;
    this.image = image;
  }
}

export class RouletteOption extends Schema {
  @type("string") name: string = "";
  @type("string") textColor: string = "";
  @type("string") backgroundColor: string = "";

  constructor(name: string, textColor: string | null, backgroundColor: string | null) {
    super();
    this.name = name;
    this.textColor = textColor;
    this.backgroundColor = backgroundColor;
  }
}

export class RouletteRoomState extends Schema {
  @type([Player]) players = new ArraySchema<Player>();
  @type("string") currentPlayer: string = "";
  @type("string") name: string = "";
  @type([RouletteOption]) options = new ArraySchema<RouletteOption>();

  nextPlayer(): void {
    const index = this.players.findIndex(
      (player) => player.sessionId === this.currentPlayer
    );

    if (index === this.players.length - 1) {
      this.currentPlayer = this.players[0].sessionId;
      return;
    }
    this.currentPlayer = this.players[index + 1].sessionId;
  }
}
