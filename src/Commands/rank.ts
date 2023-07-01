import { events } from "bdsx/event";
import { command } from "bdsx/command";
import { CxxString } from "bdsx/nativetype";
import { rankManager } from "../Database/Ranks";
import { playerManager } from "../Database/Player";
import { PlayerCommandSelector } from "bdsx/bds/command";
import { ServerPlayer } from "bdsx/bds/player";

events.serverOpen.on(() => {
  command
    .register("rank", "ChatRanks commands.")
    .overload(
      (param, origin, output) => {
        const player = origin.getEntity();

        if (player?.isPlayer()) {
            const xuid = player.getXuid();
            const hasPermission = playerManager.checkPlayerPermission(xuid);
            if (hasPermission || player.getPermissionLevel() === 2) {
                rankManager.createRank(param.name, param.display, xuid);
            } else {
                player.sendMessage("You don't have permission to perform this action.");
            }
        }
      },
      {
        option: command.enum("option.create", "create"),
        name: CxxString,
        display: CxxString,
      }
    )
    .overload(
      (param, origin, output) => {
        const player = origin.getEntity();

        if (player?.isPlayer()) {
            const xuid = player.getXuid();
            const hasPermission = playerManager.checkPlayerPermission(xuid);
            if (hasPermission || player.getPermissionLevel() === 2) {
                rankManager.deleteRank(param.name, xuid);
            } else {
                player.sendMessage("You don't have permission to perform this action.");
            }
        }
      },
      {
        option: command.enum("option.delete", "delete"),
        name: CxxString,
      }
    )
    .overload(
      (param, origin, output) => {
        const player = origin.getEntity();

        if (player?.isPlayer()) {
            player.sendMessage('Ranks list:\n' + rankManager.listRanks());
        }
      },
      {
        option: command.enum("option.list", "list"),
      }
    )
    .overload(
      (param, origin, output) => {
        const player = origin.getEntity();

        if (player?.isPlayer()) {
            const xuid = player.getXuid();
            const hasPermission = playerManager.checkPlayerPermission(xuid);
            if (hasPermission || player.getPermissionLevel() === 2) {
                const target: ServerPlayer[] = param.target.newResults(origin, ServerPlayer);
                const targetPlayer: ServerPlayer = target[0];
                rankManager.addRank(param.rank, xuid, targetPlayer.getXuid());
            } else {
                player.sendMessage("You don't have permission to perform this action.");
            }
        }
      },
      {
        option: command.enum("option.add", "add"),
        target: PlayerCommandSelector,
        rank: command.softEnum("option.rank", rankManager.getRankNames()),
      }
    )
    .overload(
      (param, origin, output) => {
        const player = origin.getEntity();

        if (player?.isPlayer()) {
            const xuid = player.getXuid();
            const hasPermission = playerManager.checkPlayerPermission(xuid);
            if (hasPermission || player.getPermissionLevel() === 2) {
                const target: ServerPlayer[] = param.target.newResults(origin, ServerPlayer);
                const targetPlayer: ServerPlayer = target[0];
                rankManager.removeRank(param.rank, xuid, targetPlayer.getXuid());
            } else {
                player.sendMessage("You don't have permission to perform this action.");
            }
        }
      },
      {
        option: command.enum("option.remove", "remove"),
        target: PlayerCommandSelector,
        rank: command.softEnum("option.rank", playerManager.getRanks()),
      }
    );
});
