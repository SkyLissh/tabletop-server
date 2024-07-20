import { ArraySchema } from "@colyseus/schema";
import type { Client } from "colyseus";
import { logger, Room } from "colyseus";

import type { Rouletteoption } from "@/schemas/RouletteRoomState";
import { Player, RouletteRoomState } from "@/schemas/RouletteRoomState";

export class RouletteRoom extends Room<RouletteRoomState> {
  maxClients: number = 10;

  onCreate(options: { options: Rouletteoption[] }) {
    const state = new RouletteRoomState();

    if (options.options.length === 0) {
      this.disconnect();
    }

    state.options = new ArraySchema(...options.options);
    this.setState(new RouletteRoomState());

    this.onMessage("spinned", (client, message: { result: string }) => {
      this.state.result = message.result;

      const index = this.state.players.findIndex(
        (player) => player.sessionId === client.sessionId
      );

      if (index === this.state.players.length - 1) {
        this.state.currentPlayer = this.state.players[0].sessionId;
        return;
      }
      this.state.currentPlayer = this.state.players[index + 1].sessionId;
    });
  }

  onJoin(client: Client, options: { name: string; image: string }) {
    const player = new Player();
    player.name = options.name;
    player.image = options.image;
    player.sessionId = client.sessionId;
    this.state.players.push(player);

    if (this.state.players.length === 1) {
      this.state.currentPlayer = client.sessionId;
    }

    logger.info(`Client ${player.name} joined.`);
  }

  onLeave(client: Client) {
    const players = this.state.players.filter(
      (player) => player.sessionId !== client.sessionId
    );
    this.state.players = new ArraySchema(...players);
    logger.info(`Client ${client.sessionId} left.`);
  }

  onDispose() {
    logger.info("room", this.roomId, "disposing...");
  }
}
