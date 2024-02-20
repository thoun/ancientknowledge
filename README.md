# What is this project ?

This project is an adaptation for BoardGameArena of game Ancient Knowledge edited by Iello.
You can play here : https://boardgamearena.com

# How to install the auto-build stack

## Install builders

Intall node/npm then `npm i` on the root folder to get builders.

## Auto build JS and CSS files

In VS Code, add extension https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave and then add to config.json extension part :

```json
        "commands": [
            {
                "match": ".*\\.ts$",
                "isAsync": true,
                "cmd": "npm run build:ts"
            },
            {
                "match": ".*\\.scss$",
                "isAsync": true,
                "cmd": "npm run build:scss"
            }
        ]
    }
```

If you use it for another game, replace `ancientknowledge` mentions on package.json `build:scss` script and on tsconfig.json `files` property.

## Auto-upload builded files

Also add one auto-FTP upload extension (for example https://marketplace.visualstudio.com/items?itemName=lukasz-wronski.ftp-sync) and configure it. The extension will detected modified files in the workspace, including builded ones, and upload them to remote server.

## Hint

Make sure ftp-sync.json and node_modules are in .gitignore

# Rules

Is the discard pile visible ?
Only he last one can be made visible

Are a card decline effects applied before the card is moved to the past (so it is still considered as a timeline card) ?
Yes, and you can remove knowledge of this card f the effect allows you too, before moving it to the past

If I play a card with immediate effect, and playing this card trigger another card effect, can I choose resolution order ?
Yes, if possible

POULNABRONE DOLMEN : does its effect apply to other cards bonuses? Like if we DOLMEN OF MENGA with already 11 cards, can we play a 2nd building + 2 more?
Yes

Are all the effect mandatory if nothing is specified ?
Yes

Are the tech tiles deck/discard/counters visible ? Are the building cards deck/discard/counters visible ?
At least show the number of remaining cards in the tech tile deck. A button to show the discarded tiles would be nice.
Not really useful for building cards

Pyramids Of Plaine Magnien with already 10 cards in hand, allowed to look at card or not ?
=> ???

https://boardgamearena.com/bug?id=112580
Allowed to use a decline effect of a card and then switch it with another monument ?
=> ???

Pyramid of Coba: is it a real up to ??
=> ???

Xixia Wanling: what if I have one adjacent building with 3 knowledge and another one with 2 knowledge ? Can I choose or not ?
=> ???
