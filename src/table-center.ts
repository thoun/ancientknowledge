class TableCenter {
    public technologyTilesDecks: Deck<TechnologyTile>[] = [];
    public technologyTilesStocks: LineStock<TechnologyTile>[] = [];
        
    constructor(private game: AncientKnowledgeGame, gamedatas: AncientKnowledgeGamedatas) {
        if (!gamedatas.firstHalf) {
            this.midGameReached(gamedatas.secondLvl2TechTile);
        }

        [1, 2].forEach(level => {
            this.technologyTilesDecks[level] = new Deck<TechnologyTile>(game.technologyTilesManager, document.getElementById(`technology-deck-${level}`), {
                cardNumber: gamedatas[`techsDeckLvl${level}`],
                topCard: { id: `deck-tile-${level}`, level } as TechnologyTile,
                counter: {},
            });
        });

        [1, 2, 3].forEach(number => {
            const tileStockDiv = document.getElementById(`table-technology-tiles-${number}`);
            this.technologyTilesStocks[number] = new LineStock<TechnologyTile>(game.technologyTilesManager, tileStockDiv, {
                center: false,
            });
            this.technologyTilesStocks[number].onCardClick = tile => this.game.onTableTechnologyTileClick(tile);
            tileStockDiv.addEventListener('click', () => {
                if (tileStockDiv.classList.contains('selectable')) {
                    this.game.onTableTechnologyTileStockClick(number);
                }
            })
        });
        this.refreshTechnologyTiles(gamedatas.techs);

        document.querySelector(`.fold-button`).insertAdjacentHTML(`afterbegin`, `
        <div class="fold-message">${_('Click here to display table center')}</div>
        `);
        document.querySelector(`.fold-button`).addEventListener('click', () => {
            document.getElementById(`table-center`).classList.toggle('folded');
        });
    }
    
    public setTechnologyTilesSelectable(selectable: boolean, selectableCards: TechnologyTile[] | null = null) {
        [1, 2, 3].forEach(number => {
            this.technologyTilesStocks[number].setSelectionMode(selectable ? 'single' : 'none');
            this.technologyTilesStocks[number].setSelectableCards(selectableCards);
        });
    }
    
    public refreshTechnologyTiles(techs: TechnologyTile[]) {
        [1, 2, 3].forEach(number => {
            const tiles = this.game.technologyTilesManager.getFullCards(techs.filter(tile => tile.location == `board_${number}`));
            this.technologyTilesStocks[number].addCards(tiles);
        });
    }

    public clearTechBoard(board: number, cards: { [cardId: string]: TechnologyTile; }): Promise<any> {
        const tiles = this.game.technologyTilesManager.getFullCards(Object.values(cards));
        this.technologyTilesStocks[board].removeCards(tiles);

        return Promise.resolve(true);
    }

    public fillUpTechBoard(board: number, cards: { [cardId: string]: TechnologyTile; }, args): Promise<any> {
        const tiles = this.game.technologyTilesManager.getFullCards(Object.values(cards));
        this.technologyTilesStocks[board].addCards(tiles, { fromStock: tiles.length ? this.technologyTilesDecks[tiles[0]?.level] : undefined });
        
        [1, 2].forEach(level => {
            this.technologyTilesDecks[level].setCardNumber(args[`techsDeckLvl${level}`]);
        });
        
        return Promise.resolve(true);
    }
    
    public midGameReached(board: number): void {
        const div = document.getElementById(`table-technology-tiles-${board}`);
        if (div) {
            div.dataset.level = '2';
        }
    }

    public setTileStocksSelectable(selectable: boolean) {
        const stocks = Array.from(document.querySelectorAll(`.table-technology-tiles${selectable ? '[data-level="1"]' : ''}`));
        stocks.forEach(stock => stock.classList.toggle('selectable', selectable));
    }
    
    public async placeAtDeckBottom(card: TechnologyTile, deckNumber: number) {
        const deck = this.technologyTilesDecks[deckNumber];
        await deck.addCard({ id: card.id } as TechnologyTile);
    }

}