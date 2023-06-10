/**
 * Your game interfaces
 */

interface AncientKnowledgePlayer extends Player {
    playerNo: number;
    hand?: BuilderCard[]; // only set for currentPlayer
    handCount: number;
    /*timeline: BuilderCard[]; // locationArg is slot id. 10 * row + col, or 1 to 12
    artifacts: BuilderCard[]; // locationArg is slot id. 1 to 5
    past: BuilderCard[];
    technologyTiles: { [type: number]: TechnologyTile[] }; // type 1..3*/
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

    // Add here variables you set up in getAllDatas
    cards: BuilderCard[];
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
    getTooltipGain(type: number): string;
    getTooltipColor(color: number): string;
    getBoatSide(): number;
    getVariantOption(): number;
    getGameStateName(): string;
    getCurrentPlayerTable(): PlayerTable | null;

    setTooltip(id: string, html: string): void;
    highlightPlayerTokens(playerId: number | null): void;
    onTableDestinationClick(destination: TechnologyTile): void;
    onHandCardClick(card: BuilderCard): void;
    onTableCardClick(card: BuilderCard): void;
    onPlayedCardClick(card: BuilderCard): void;
}

interface EnteringChooseActionArgs {
    canRecruit: boolean;
    canExplore: boolean;
    canTrade: boolean;
    possibleDestinations: TechnologyTile[];
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

// playCard
interface NotifPlayCardArgs {
    playerId: number;
    card: BuilderCard;
    newHandCard: BuilderCard;
    effectiveGains: { [type: number]: number };
}

// card
interface NotifNewCardArgs {
    playerId: number;
    card: BuilderCard;
    cardDeckTop?: BuilderCard;
    cardDeckCount: number;
}

// takeDestination
interface NotifTakeDestinationArgs {
    playerId: number;
    destination: TechnologyTile;
    effectiveGains: { [type: number]: number };
}

// newTableDestination
interface NotifNewTableDestinationArgs {
    destination: TechnologyTile;
    letter: string;    
    destinationDeckTop?: TechnologyTile;
    destinationDeckCount: number;
}

// trade
interface NotifTradeArgs {
    playerId: number;
    effectiveGains: { [type: number]: number };
}

// discardCards
interface NotifDiscardCardsArgs {
    playerId: number;
    cards: BuilderCard[];
    cardDiscardCount: number;
}

// discardTableCard
interface NotifDiscardTableCardArgs {
    card: BuilderCard;
}

// reserveDestination
interface NotifReserveDestinationArgs {
    playerId: number;
    destination: TechnologyTile;
}

// score
interface NotifScoreArgs {
    playerId: number;
    newScore: number;
    incScore: number;
}

// cardDeckReset
interface NotifCardDeckResetArgs {  
    cardDeckTop?: BuilderCard;
    cardDeckCount: number;
    cardDiscardCount: number;
}
