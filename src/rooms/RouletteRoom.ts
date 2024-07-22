import { ArraySchema } from "@colyseus/schema";
import type { Client } from "colyseus";
import { logger, Room } from "colyseus";

import { Player, RouletteOption, RouletteRoomState } from "@/schemas/RouletteRoomState";

type PlayerOptions = { name: string; image: string };
type RouletteOptions = {
  name: string;
  options: {
    name: string;
    textColor: string | null;
    backgroundColor: string | null;
  }[];
};

export class RouletteRoom extends Room<RouletteRoomState> {
  maxClients: number = 10;

  onCreate(options: { roulette: RouletteOptions }) {
    const state = new RouletteRoomState();

    if (options.roulette.options.length === 0) {
      this.disconnect();
    }

    state.options = new ArraySchema(
      ...options.roulette.options.map(
        (option) =>
          new RouletteOption(option.name, option.textColor, option.backgroundColor)
      )
    );
    state.name = options.roulette.name;

    this.setState(state);
    this.setPrivate(true);

    this.onMessage("spinned", (client, message: { result: string }) => {
      const player = this.state.players.find(
        (player) => player.sessionId === client.sessionId
      );
      this.broadcast("spinned", { result: message.result, player: player.name });
      this.state.nextPlayer();
    });
  }

  onJoin(client: Client, options: { player: PlayerOptions }) {
    const player = new Player(
      client.sessionId,
      options.player.name,
      options.player.image
    );
    this.state.players.push(player);

    if (this.state.players.length === 1) {
      this.state.currentPlayer = client.sessionId;
    }

    logger.info(`Client ${player.name} joined.`);
  }

  onLeave(client: Client) {
    this.state.nextPlayer();

    const players = this.state.players.filter(
      (player) => player.sessionId !== client.sessionId
    );
    this.state.players = new ArraySchema(...players);
    this.allowReconnection(client, 30);
    logger.info(`Client ${client.sessionId} left.`);
  }

  onDispose() {
    logger.info("room", this.roomId, "disposing...");
  }
}
