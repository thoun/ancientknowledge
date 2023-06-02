class TableCenter {
    public technologyTilesDecks: Deck<TechnologyTile>[] = [];
    public technologyTilesStocks: SlotStock<TechnologyTile>[] = [];
    public cardDeck: Deck<BuilderCard>;
        
    constructor(private game: AncientKnowledgeGame, gamedatas: AncientKnowledgeGamedatas) {
        [1, 2].forEach(level => {
            this.technologyTilesDecks[level] = new Deck<TechnologyTile>(game.technologyTilesManager, document.getElementById(`technology-deck-${level}`), {
                // TODO cardNumber: gamedatas.centerDestinationsDeckCount[level],
                // TODO topCard: gamedatas.centerDestinationsDeckTop[level],
                // TODO counter: {},
            });
        });

        [1, 2, 3].forEach(number => {
            this.technologyTilesStocks[number] = new SlotStock<TechnologyTile>(game.technologyTilesManager, document.getElementById(`table-technology-tiles-${number}`), {
                slotsIds: [1, 2, 3],
            });
            // TODO this.technologyTilesStocks[number].addCards(gamedatas.tableTiles[number]);
        });

        const cardDeckDiv = document.getElementById(`builder-deck`);
        this.cardDeck = new Deck<BuilderCard>(game.builderCardsManager, cardDeckDiv, {
            // TODO cardNumber: gamedatas.cardDeckCount,
            // TODO topCard: gamedatas.cardDeckTop,
            // TODO counter: { counterId: 'deck-counter', },
        });
    }
    
    public setTechonologyTilesSelectable(selectable: boolean, selectableCards: TechnologyTile[] | null = null) {
        [1, 2, 3].forEach(number => {
            this.technologyTilesDecks[number].setSelectionMode(selectable ? 'single' : 'none');
            this.technologyTilesDecks[number].setSelectableCards(selectableCards);
        });
    }

}