````markdown
# ChatRanks Plugin for BDSx

This is a plugin called "ChatRanks" that adds the functionality of ranks to your Minecraft Bedrock server. Players can be assigned ranks, and their ranks will be displayed next to their names in the chat.

## Commands

-   `/rank create <name> <displayedName>`: Creates a new rank with the specified name and displayed name in the chat. Only players with the appropriate permissions can use this command.

-   `/rank add <rank> <player>`: Assigns the specified rank to the specified player. Only players with the appropriate permissions can use this command.

-   `/rank remove <rank> <player>`: Removes the specified rank from the specified player. Only players with the appropriate permissions can use this command.

-   `/rank list`: Displays a list of all ranks and their displayed names in the chat.

## config.json

Here is an example of how the `config.json` file for the ChatRanks plugin could look like:

```json
{
    "RankDefault": {
        "name": "user",
        "display": "§7User§r"
    },
    "RankPerms": ["admin"],
    "messageFormat": "{playerDisplayName}: {message}",
    "rankDisplayFormat": "§e[{rankDisplay}] {playerDisplayName}: {message}"
}
```
````

-   **RankDefault**: Defines the default rank that will be assigned to players when they join the server. You can specify the name and the displayed name in the chat for this rank.

-   **RankPerms**: It's a list of permissions required to use the rank commands. Only players with these permissions will be able to create or modify ranks.

-   **messageFormat**: Defines the format of messages in the chat. You can use variables like `{playerDisplayName}` to represent the player's name and `{message}` to represent the sent message.

-   **rankDisplayFormat**: Defines the format of the rank displayed in the chat next to the player's name. You can use variables like `{rankDisplay}` to represent the displayed name of the rank, `{playerDisplayName}` to represent the player's name, and `{message}` to represent the sent message.

Feel free to adjust these settings according to your needs to customize the functionality and appearance of ranks on your Minecraft Bedrock server.

---

For any questions or further assistance, you can contact me on Discord at `kyel0`.

```

```
