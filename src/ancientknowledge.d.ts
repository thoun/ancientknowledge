/**
 * Your game interfaces
 */

interface PlayerIcons {
    artefact: number;
    city: number;
    //city-timeline: number;
    megalith: number;
    //megalith-timeline: number;
    pyramid: number;
    //pyramid-timeline: number;
}

interface AncientKnowledgePlayer extends Player {
    no: number;
    lostKnowledge: number;
    icons: PlayerIcons;

    hand?: BuilderCard[]; // only set for currentPlayer
    handCount: number;
    timeline: BuilderCard[];
    artefacts: BuilderCard[];
    past: BuilderCard[];
    techs: TechnologyTile[];
}

interface Score {
    entries: any[]; // TODO
    total: number;
}

interface PlayerScore {
    effects: Score;
    knowledge: Score;
    past: Score;
    techs: Score;
    timeline: Score;
    total: number;
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
    techs: TechnologyTile[];
    firstHalf: boolean;
    secondLvl2TechTile: number;
    endOfGameTriggered: boolean;
    scores?: { [playerId: number]: PlayerScore };
    techsDeckLvl1: number;
    techsDeckLvl2: number;
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
    onTableTechnologyTileClick(destination: TechnologyTile): void;
    onTableTechnologyTileStockClick(number: number): void;
    onHandCardSelectionChange(selection: BuilderCard[]): void;
    onTimelineCardSelectionChange(selection: BuilderCard[], playerId: number): void;
    onPastCardSelectionChange(selection: BuilderCard[]): void;
    onTimelineKnowledgeClick(id: string, selectionLength: number): void;
    onArtifactCardClick(card: BuilderCard): void;
    onTableCardClick(card: BuilderCard): void;
    onPlayedCardClick(card: BuilderCard): void;
    changePageTitle(suffix?: string, save?: boolean): void;
    addPrimaryActionButton(id, text, callback, zone?): void;
    addSecondaryActionButton(id, text, callback, zone?): void
    onCreateCardConfirm(data: CreateEngineData): void;
    onArchiveCardConfirm(data: ArchiveEngineData): void;
    onRemoveKnowledgeConfirm(discardTokens: { [cardId: string]: number; }): void;
    onTimelineSlotClick(slotId: string): void;
}

interface EnteringInitialSelectionArgs {
    _private?: {
        cards: string[];
    }
}

type PossibleCardLocations = {[slotId: string]: number};

interface EnteringCreateArgs {
    _private?: {
        cards: {[id: string]: PossibleCardLocations};
    }
}

interface EnteringArchiveArgs {
    _private?: {
        cardIds: string[];
    }
}

interface EnteringLearnArgs {
    techs: string[];
    irreversibleIds: string[];
}

interface EnteringAddKnowledgeArgs {
    cardIds: {[playerId: string]: string[]};
}

interface EnteringRemoveKnowledgeArgs {
    n: number;
    m: number;
    cardIds: string[];
    type: 'or' | 'xor';
}

interface EnteringSwapArgs {
    cardIds: string[];
    card_id: string | null;
}

interface ResolveChoice {
    automaticAction: boolean;
    description: string;
    id: number;
    independentAction: boolean;
    irreversibleAction: boolean;
    optionalAction: boolean;
    source?: string;
    sourceId?: string;
    args: {
        cardId: string;
    };
}

interface EnteringResolveChoiceArgs {
    allChoices: ResolveChoice[];
    choices: ResolveChoice[];
}

interface EnteringDrawAndKeepArgs {
    n: number; // number of cards to pick from
    m: number; // number of cards to keep
    _private: { cardIds: string[] };
}

interface EnteringMoveBuildingArgs {
    cardIds: string[];
    slots: string[];
    card_id: string | null;
}

interface EnteringSpecialEffectArgs {
    automaticAction: boolean;
    descSuffix: string;
    description: string;
    descriptionmyturn: string;
    source: string;
    sourceId: string;
    _private: {
        cardIds?: string[];
        validCardIds?: string[];
        canCreate?: boolean;
        techIds?: string[];
    };
    cardIds?: string[]; // T3_HermesTrismegistus
}

// pDrawCards
interface NotifPDrawCardsArgs {
    n: number;
    player_id: number;
    cards: BuilderCard[];
}

// keep
interface NotifKeepArgs {
    player_id: number;
    card: BuilderCard;
}

// pDiscardCards
interface NotifPDiscardCardsArgs {
    n: number;
    player_id: number;
    cards: BuilderCard[];
}

// destroyCard
interface NotifDestroyCardArgs {
    player_id: number;
    card: BuilderCard;
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
        players: { [playerId: number]: AncientKnowledgePlayer };
        techs: TechnologyTile[];
        endOfGameTriggered: boolean;
    };
}

// refreshHand
interface NotifRefreshHandArgs {
    player_id: number;
    hand: BuilderCard[];
}

// declineCard
interface NotifDeclineCardArgs {
    player_id: number;
    card: BuilderCard;
}

// declineCard
interface NotifDeclineCardArgs {
    player_id: number;
    card: BuilderCard;
    n: number;
}

// addKnowledge
interface NotifAddKnowledgeArgs {
    n: number;
    cards: { [cardId: string]: BuilderCard };
}

// addKnowledgeFromBoard
interface NotifAddKnowledgeFromBoardArgs {
    n: number;
    player_id: number;
    card: BuilderCard;
}

// removeKnowledge
interface NotifRemoveKnowledgeArgs {
    player_id: number;
    cards: { [cardId: string]: BuilderCard };
}

// clearTechBoard, fillUpTechBoard
interface NotifTechBoardArgs {
    board: number;
    cards: { [cardId: string]: TechnologyTile };
    techsDeckLvl1: number;
    techsDeckLvl2: number;
}

// midGameReached
interface NotifMidGameReachedArgs extends NotifTechBoardArgs {
    board: number;
}

// swapCards
interface NotifSwapCardsArgs {
    player_id: number;
    card: BuilderCard;
    card2: BuilderCard;
}

// rotateCards
interface NotifRotateCardsArgs {
    player_id: number;
    cards: BuilderCard[];
}

// keepAndDiscard
interface NotifKeepAndDiscardArgs {
    player_id: number;
    card?: BuilderCard;
}

// moveCard
interface NotifMoveCardArgs {
    player_id: number;
    card: BuilderCard;
}

// placeAtDeckBottom
interface NotifPlaceAtDeckBottomArgs {
    player_id: number;
    card: TechnologyTile;
    card_id: string;
    deck: number;
}

// scoringEntry
interface NotifScoringEntryArgs {
    player_id: number;
    n: number;
    category: string;
}

