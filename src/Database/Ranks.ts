import { bedrockServer } from "bdsx/launcher";
import * as fs from "fs";
import * as path from "path";
import { playerManager } from "./Player";

interface RankData {
    name: string;
    display: string;
}

class RankManager {
    private ranks: RankData[];
    private ranksPath: string;

    constructor() {
        this.ranksPath = path.join(__dirname, "../../resources/ranks.json");
        this.ranks = this.loadRanks();
    }

    public loadRanks(): RankData[] {
        const defaultRanks: RankData[] = [];
        const ranksPath = path.join(__dirname, "../../resources/ranks.json");

        try {
            if (!fs.existsSync(ranksPath)) {
                const configPath = path.join(__dirname, "../../resources/config.json");
                const configData = fs.readFileSync(configPath, "utf8");
                const config = JSON.parse(configData);

                const defaultRank = {
                    name: config.RankDefault.name,
                    display: config.RankDefault.display,
                };

                const adminRank = {
                    name: "admin",
                    display: "§cAdmin",
                };

                this.createRank(defaultRank.name, defaultRank.display);
                this.createRank(adminRank.name, adminRank.display);

                defaultRanks.push(defaultRank, adminRank);
            } else {
                const ranksData = fs.readFileSync(ranksPath, "utf8");
                defaultRanks.push(...JSON.parse(ranksData));
            }
        } catch (error) {
            console.error("Error loading ranks:", error);
        }

        return defaultRanks;
    }

    private saveRanks(): void {
        fs.writeFileSync(this.ranksPath, JSON.stringify(this.ranks, null, 2));
    }

    public createRank(name: string, display: string, xuid?: string): void {
        const existingRank = this.ranks.find((rank) => rank.name === name);

        const rank: RankData = {
            name,
            display,
        };

        if (xuid) {
            const player = bedrockServer.level.getPlayerByXuid(xuid);
            if (!player) {
                console.log("Player Unknown");
                return;
            }

            if (existingRank) return player.sendMessage(`The rank "${name}" already exists.`);
            player.sendMessage('You created a new rank: ' + rank.display);
            this.ranks.push(rank);
        } else {
            if (existingRank) return console.log(`The rank "${name}" already exists.`);
            console.log('You created a new rank: ' + rank.display);
            this.ranks.push(rank);
        }

        this.saveRanks();
    }

      public deleteRank(name: string, xuid?: string): void {
        const index = this.ranks.findIndex((rank) => rank.name === name);

        if (xuid) {
            const player = bedrockServer.level.getPlayerByXuid(xuid);
            if (!player) {
                console.log("Player Unknown");
                return;
            }
            if (index !== -1) {
                this.ranks.splice(index, 1);
                player.sendMessage(`The rank "${name}" has been deleted.`);
            } else {
                player.sendMessage(`The rank "${name}" does not exist.`);
            }
        } else {
            if (index !== -1) {
                this.ranks.splice(index, 1);
                console.log(`The rank "${name}" has been deleted.`);
            } else {
                console.log(`The rank "${name}" does not exist.`);
            }
        }

        this.saveRanks();
    }

    public addRank(rankName: string, xuid: string, targetxuid: string): void {
        const player = bedrockServer.level.getPlayerByXuid(xuid);
        const targetPlayer = bedrockServer.level.getPlayerByXuid(targetxuid);

        if (!player || !targetPlayer) {
            console.log("Player Unknown");
            return;
        }

        const targetPlayerData = playerManager.loadPlayersData().find((player) => player.xuid === targetxuid);

        if (!targetPlayerData) {
            player.sendMessage(`Player with XUID "${targetxuid}" not found.`);
            return;
        }

        const targetPlayerRanks = targetPlayerData.rank.map((r) => r.name);

        if (targetPlayerRanks.includes(rankName)) {
            player.sendMessage(`The player already has the rank "${rankName}".`);
            return;
        }

        const rank = this.ranks.find((r) => r.name === rankName);

        if (!rank) {
            player.sendMessage(`The rank "${rankName}" does not exist.`);
            return;
        }

        targetPlayerData.rank.push(rank);

        const playersData = playerManager.loadPlayersData();
        const updatedPlayersData = playersData.map((playerData) => {
            if (playerData.xuid === targetxuid) {
                return targetPlayerData;
            } else {
                return playerData;
            }
        });

        playerManager.savePlayersData(updatedPlayersData);
        player.sendMessage(`The rank "${rank.name}" has been added to player ${playerManager.getName(targetxuid)}.`);
        targetPlayer.sendMessage(`You have been given a new rank: ${rank.name}.`);
        targetPlayer.setNameTag(playerManager.getRanksDisplay(targetxuid) + ' ' + playerManager.getName(targetxuid));

        this.saveRanks();
    }

    public removeRank(rankName: string, xuid: string, targetxuid: string): void {
        const player = bedrockServer.level.getPlayerByXuid(xuid);
        const targetPlayer = bedrockServer.level.getPlayerByXuid(targetxuid);

        if (!player || !targetPlayer) {
          console.log("Player Unknown");
          return;
        }

        const playersData = playerManager.loadPlayersData();
        const targetPlayerData = playersData.find((player) => player.xuid === targetxuid);

        if (!targetPlayerData) {
            player.sendMessage(`Player with XUID "${targetxuid}" not found.`);
            return;
        }

        const targetPlayerRanks = targetPlayerData.rank.map((r) => r.name);

        if (!targetPlayerRanks.includes(rankName)) {
            player.sendMessage(`The player does not have the rank "${rankName}".`);
            return;
        }

        const rankIndex = targetPlayerData.rank.findIndex((r) => r.name === rankName);

        if (rankIndex !== -1) {
            targetPlayerData.rank.splice(rankIndex, 1);
            playerManager.savePlayersData(playersData);
            player.sendMessage(`The rank "${rankName}" has been removed from player ${playerManager.getName(targetxuid)}.`);
            targetPlayer.sendMessage(`Your rank "${rankName}" has been removed.`);
            targetPlayer.setNameTag(playerManager.getRanksDisplay(targetxuid) + ' ' + playerManager.getName(targetxuid));

            this.saveRanks();
        } else {
            player.sendMessage(`The rank "${rankName}" was not found in the player.`);
        }
    }

    public listRanks(): string {
        return this.ranks.map((rank) => `${rank.name}: ${rank.display}`).join("§r\n");
    }

    public getRankNames(): string[] {
        return this.ranks.map((rank) => rank.name);
    }
}

export const rankManager = new RankManager();
