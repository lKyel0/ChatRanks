import "./Commands/rank";
import { events } from "bdsx/event";
import * as fs from "fs";
import * as path from "path";
import { CANCEL } from "bdsx/common";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { TextPacket } from "bdsx/bds/packets";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { ServerPlayer } from "bdsx/bds/player";
import { serverInstance } from "bdsx/bds/server";
import { playerManager } from "./Database/Player";
import { rankManager } from "./Database/Ranks";

const resourcesPath = path.join(__dirname, "../resources");
const configPath = path.join(resourcesPath, "config.json");

events.serverOpen.on(() => {
    if (!fs.existsSync(resourcesPath)) {
      fs.mkdirSync(resourcesPath);
    }

    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        RankDefault: {
          name: "user",
          display: "§7User§r",
        },
        RankPerms: ["admin"],
        messageFormat: "{playerDisplayName}: {message}",
        rankDisplayFormat: "§7(§r{rankDisplay}§7)§r",
      };

      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }

    console.log("[ChatRanks] on");
    rankManager.loadRanks();
    playerManager.loadPlayersData();
});

events.serverClose.on(() => {
    console.log("[ChatRanks] off");
});

events.playerJoin.on(ev => {
    const player = ev.player;
    playerManager.createPlayer(player.getXuid());
    player.setNameTag(playerManager.getRanksDisplay(player.getXuid()) + ' ' + playerManager.getName(player.getXuid()));
});

events.packetBefore(MinecraftPacketIds.Text).on((textPacket: TextPacket, netId: NetworkIdentifier) => {
    const messagePlayer: ServerPlayer = <ServerPlayer>netId.getActor();
    const message: string = textPacket.message;
    const xuid: string = messagePlayer.getXuid();

    console.log(`${messagePlayer.getName()}: ${message}`);
    const playerDisplayName = playerManager.getRanksDisplay(xuid) + ' ' + playerManager.getName(xuid);

    const configData = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configData);
    const messageFormat = config.messageFormat;

    const formattedMessage = messageFormat
        .replace("{playerDisplayName}", playerDisplayName)
        .replace("{message}", message);

    tellAllRaw(formattedMessage);

    return CANCEL;
});

export function tellAllRaw(text: string) {
    const packet = TextPacket.create();
    packet.type = TextPacket.Types.Raw;
    packet.message = text;
    for (const player of serverInstance.minecraft.getLevel().players.toArray()) {
        player.sendPacket(packet);
    }
    packet.dispose();
}
