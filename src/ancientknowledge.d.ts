/**
 * Your game interfaces
 */

interface AncientKnowledgePlayer extends Player {
    playerNo: number;
    lostKnowledge: number;

    hand?: BuilderCard[]; // only set for currentPlayer
    handCount: number;
    timeline: BuilderCard[]; // locationArg is slot id. 10 * row + col, or 1 to 12
    //artifacts: BuilderCard[]; // locationArg is slot id. 1 to 5
    past: BuilderCard[];
    techs: TechnologyTile[];
}

interface AncientKnowledgeGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: AncientKnowledgePlayer };
    tablespeed: string;

    techs: TechnologyTile[];
    // Add here variables you set up in getAllDatas
    /*tableTiles: { [type: number]: TechnologyTile[] }; // row 1..3
    firstPlayerId: number;
    // TODO deck counters ? discard counters ?*/
}

interface AncientKnowledgeGame extends Game {
    animationManager: AnimationManager;
    builderCardsManager: BuilderCardsManager;
    technologyTilesManager: TechnologyTilesManager;

    getPlayerId(): number;
    getPlayer(playerId: number): AncientKnowledgePlayer;
    getTooltipActivation(activation: string): string;
    getGameStateName(): string;
    getCurrentPlayerTable(): PlayerTable | null;

    setTooltip(id: string, html: string): void;
    highlightPlayerTokens(playerId: number | null): void;
    onTableTechnologyTileClick(destination: TechnologyTile): void;
    onHandCardClick(card: BuilderCard): void;
    onHandCardSelectionChange(selection: BuilderCard[]): void;
    onTableCardClick(card: BuilderCard): void;
    onPlayedCardClick(card: BuilderCard): void;
}

interface EnteringInitialSelectionArgs {
    _private?: {
        cards: string[];
    }
}

interface EnteringCreateArgs {
    _private?: {
        cards: { [id: string]: { [possiblePosition: string /*timeline-6-0 or artefact-0*/]: number } }[];
    }
}

interface EnteringLearnArgs {
    techs: any[]; // TODO
}

interface EnteringChooseNewCardArgs {
    centerCards: BuilderCard[];
    freeColor: number;
    recruits: number;
    allFree: boolean;
}

interface EnteringPayDestinationArgs {
    selectedDestination: TechnologyTile;
    recruits: number;
}

interface EnteringTradeArgs {
    bracelets: number;
    gainsByBracelets: { [bracelets: number]: number };
}

// pDrawCards
interface NotifPDrawCardsArgs {
    player_id: number;
    cards: BuilderCard[];
}

// pDiscardCards
interface NotifPDiscardCardsArgs {
    n: number;
    player_id: number;
    cards: BuilderCard[];
}

// createCard
interface NotifCreateCardsArgs {
    player_id: number;
    card: BuilderCard | TechnologyTile;
}

// fillPool
interface NotifFillPoolArgs {
    cards: TechnologyTile[];
}

// discardLostKnowledge
interface NotifDiscardLostKnowledgeArgs {
    player_id: number;
    n: number | string; // discarded lost knowledge
    m: number | string; // remaining lost knowledge
}

// learnTech
interface NotifLearnTechArgs {
    player_id: number;
    card: TechnologyTile;
}

// learnTech
interface NotifLearnTechArgs {
    player_id: number;
    card: TechnologyTile;
}

// clearTurn
interface NotifClearTurnArgs {
    notifIds: string[];
}

// refreshUI
interface NotifRefreshUIArgs {
    datas: {
        cards;
        players: { [playerId: number]: AncientKnowledgePlayer };
        techs: TechnologyTile[];
    };
}

// refreshHand
interface NotifRefreshHandArgs {
    player_id: number;
    hand: BuilderCard[];
}
