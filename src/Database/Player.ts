import { bedrockServer } from "bdsx/launcher";
import * as fs from "fs";
import * as path from "path";

class PlayerManager {
    private configPath: string
    private playersPath: string;
    private config: any;

    constructor() {
        this.playersPath = path.join(__dirname, "../../resources/players.json");
        this.configPath = path.join(__dirname, "../../resources/config.json");
        this.loadConfig();
    }

    private loadConfig() {
        try {
            const configData = fs.readFileSync(this.configPath, "utf8");
            this.config = JSON.parse(configData);
        } catch (error) {
            console.error("Error loading configuration file:", error);
        }
    }

    public createPlayer(xuid: string) {
        const player = bedrockServer.level.getPlayerByXuid(xuid);
        if (!player) return console.log("Player Unknown");

        const playerName = player.getName();
        const playerData: PlayerData = {
          name: playerName,
          xuid,
          rank: [
              {
                name: this.config.RankDefault.name,
                display: this.config.RankDefault.display,
              },
          ],
        };

      const playersData = this.loadPlayersData();
      const existingPlayer = playersData.find((p: PlayerData) => p.xuid === xuid);

      if (existingPlayer) {
          console.log(`Player '${playerName}' already exists.`);
      } else {
          playersData.push(playerData);
          this.savePlayersData(playersData);
          console.log(`Player '${playerName}' created.`);
      }
    }

    public loadPlayersData(): PlayerData[] {
        try {
            const playersData = fs.readFileSync(this.playersPath, "utf8");
            return JSON.parse(playersData);
        } catch (error) {
            fs.writeFileSync(this.playersPath, "[]", "utf8");
            return [];
        }
    }

    public savePlayersData(playersData: PlayerData[]) {
        fs.writeFileSync(this.playersPath, JSON.stringify(playersData, null, 2));
    }

    public getRanks(): string[] {
        const playersData = this.loadPlayersData();
        const rankNames: string[] = [];

        playersData.forEach((playerData) => {
            const playerRankNames = playerData.rank.map((rank) => rank.name);
            rankNames.push(...playerRankNames);
        });

        return rankNames;
    }

    public getName(xuid: string): string {
        const playersData = this.loadPlayersData();
        const playerData = playersData.find((player) => player.xuid === xuid);

        return playerData ? playerData.name : "";
    }

    public getRanksDisplay(xuid: string): string {
        const playersData = this.loadPlayersData();
        const playerData = playersData.find((player) => player.xuid === xuid);

        if (playerData) {
            const configData = fs.readFileSync(this.configPath, "utf8");
            const config = JSON.parse(configData);
            const rankDisplayFormat = config.rankDisplayFormat;

            const rankNames = playerData.rank.map((rank) =>
                rankDisplayFormat.replace("{rankDisplay}", rank.display)
            );

            return rankNames.join(" ");
        }

        return "";
    }

    public checkPlayerPermission(xuid: string): boolean {
        const playersData = this.loadPlayersData();
        const playerData = playersData.find((player) => player.xuid === xuid);

        if (playerData) {
          const playerRankNames = playerData.rank.map((rank) => rank.name);
          const permissionRankNames = Array.isArray(this.config.RankPerms) ? this.config.RankPerms : [this.config.RankPerms];

          const hasPermission = permissionRankNames.some((permRankName: string) => playerRankNames.includes(permRankName));
          return hasPermission;
        } else {
          console.error("Player data not found for XUID:", xuid);
        }

        return false;
      }
}

interface PlayerData {
    name: string;
    xuid: string;
    rank: { name: string; display: string }[];
}

export const playerManager = new PlayerManager();