const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;
    public hand?: LineStock<BuilderCard>;
    public handTech?: LineStock<TechnologyTile>;
    public timeline: SlotStock<BuilderCard>;
    public past: AllVisibleDeck<BuilderCard>;
    public artifacts: SlotStock<BuilderCard>;
    public technologyTilesDecks: AllVisibleDeck<TechnologyTile>[] = [];

    private currentPlayer: boolean;

    constructor(private game: AncientKnowledgeGame, player: AncientKnowledgePlayer) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();

        let html = `
        <div id="player-table-${this.playerId}" class="player-table" style="--player-color: #${player.color};">
            <div id="player-table-${this.playerId}-name" class="name-wrapper">${player.name}</div>
        `;
        if (this.currentPlayer) {
            html += `
            <div class="block-with-text hand-wrapper">
                <div class="block-label">${_('Your hand')}</div>
                <div id="player-table-${this.playerId}-hand" class="hand cards"></div>
            </div>`;
        }
        html += `
            <div id="player-table-${this.playerId}-timeline" class="timeline"></div>
            <div id="player-table-${this.playerId}-board" class="player-board" data-color="${player.color}">
                <div id="player-table-${this.playerId}-artifacts" class="artifacts"></div>
                <div class="technology-tiles-decks">`;            
                ['ancient', 'writing', 'secret'].forEach(type => {
                    html += `
                    <div id="player-table-${this.playerId}-technology-tiles-deck-${type}" class="technology-tiles-deck" data-type="${type}"></div>
                    `;
                });
            html += `
            </div>
            </div>
            <div id="player-table-${this.playerId}-past" class="past"></div>
            
        </div>
        `;

        dojo.place(html, document.getElementById('tables'));

        if (this.currentPlayer) {
            this.hand = new LineStock<BuilderCard>(this.game.builderCardsManager, document.getElementById(`player-table-${this.playerId}-hand`), {
                sort: (a: BuilderCard, b: BuilderCard) => a.id[0] == b.id[0] ? a.number - b.number : a.id.charCodeAt(0) - b.id.charCodeAt(0),
            });
            this.hand.onCardClick = (card: BuilderCard) => this.game.onHandCardClick(card);   
            this.hand.onSelectionChange = (selection: BuilderCard[]) => this.game.onHandCardSelectionChange(selection);     
            this.refreshHand(player.hand);
        }
        
        const timelineSlotsIds = [];
        [1, 0].forEach(line => [1,2,3,4,5,6].forEach(space => timelineSlotsIds.push(`timeline-${space}-${line}`)));
        const timelineDiv = document.getElementById(`player-table-${this.playerId}-timeline`);
        this.timeline = new SlotStock<BuilderCard>(this.game.builderCardsManager, timelineDiv, {
            slotsIds: timelineSlotsIds,
            mapCardToSlot: card => card.location,
        });
        player.timeline.forEach(card => this.createTimelineCard(this.game.builderCardsManager.getFullCard(card)));
        
        const artifactsSlotsIds = [];
        [0,1,2,3,4].forEach(space => artifactsSlotsIds.push(`artefact-${space}`)); // TODO artifact ?
        const artifactsDiv = document.getElementById(`player-table-${this.playerId}-artifacts`);
        this.artifacts = new SlotStock<BuilderCard>(this.game.builderCardsManager, artifactsDiv, {
            slotsIds: artifactsSlotsIds,
            mapCardToSlot: card => card.location,
            gap: '36px',
        });
        // TODO this.artifacts.addCards(player.artifacts);

        const pastDiv = document.getElementById(`player-table-${this.playerId}-past`);
        this.past = new AllVisibleDeck<BuilderCard>(this.game.builderCardsManager, pastDiv, {
        });
        this.past.addCards(player.past);
        
        ['ancient', 'writing', 'secret'].forEach(type => {
            const technologyTilesDeckDiv = document.getElementById(`player-table-${this.playerId}-technology-tiles-deck-${type}`);
            this.technologyTilesDecks[type] = new AllVisibleDeck<TechnologyTile>(this.game.technologyTilesManager, technologyTilesDeckDiv, {
            });
            const tiles = this.game.technologyTilesManager.getFullCards(player.techs).filter(tile => tile.type == type);
            this.technologyTilesDecks[type].addCards(tiles);
        });
    }

    public setHandSelectable(selectable: boolean) {
        this.hand.setSelectionMode(selectable ? 'single' : 'none');
    }
    
    public setInitialSelection(cards: BuilderCard[]) {
        this.hand.addCards(cards);
        this.hand.setSelectionMode('multiple');
        document.getElementById(`player-table-${this.playerId}-hand`).classList.add('initial-selection');
    }
    
    public endInitialSelection() {
        this.hand.setSelectionMode('none');
        document.getElementById(`player-table-${this.playerId}-hand`).classList.remove('initial-selection');
    }
    
    public createCard(card: BuilderCard) {
        if (card.id[0] == 'A') {
            this.artifacts.addCard(card);
        } else {
            this.createTimelineCard(card);
        }
    }
    
    private createTimelineCard(card: BuilderCard) {
        this.timeline.addCard(card);
        this.setCardKnowledge(card.id, card.knowledge);
    }
    
    public addTechnologyTile(card: TechnologyTile) {
        this.technologyTilesDecks[card.type].addCard(card);
    }
    
    public refreshHand(hand: BuilderCard[]): Promise<any> {
        this.hand.removeAll();
        return this.hand.addCards(this.game.builderCardsManager.getFullCards(hand));
    }    

    public setCardKnowledge(cardId: string, knowledge: number) {
        const golden = Math.floor(knowledge / 5);
        const basic = knowledge % 5;

        const stockDiv = document.getElementById(`${cardId}-tokens`);

        while (stockDiv.childElementCount > (golden + basic)) {
            stockDiv.removeChild(stockDiv.lastChild);
        }
        while (stockDiv.childElementCount < (golden + basic)) {
            stockDiv.insertAdjacentHTML('beforeend', `<div class="knowledge-token"></div>`);
        }

        for (let i = 0; i < (golden + basic); i++) {
            stockDiv.children[i].classList.toggle('golden', i < golden);
        }
    }
}