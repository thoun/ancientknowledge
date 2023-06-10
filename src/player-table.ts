const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;
    public hand?: LineStock<BuilderCard>;
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
            <div id="player-table-${this.playerId}-board" class="player-board" data-color="${player.color}"></div>
            <div id="player-table-${this.playerId}-past" class="past"></div>
            <div id="player-table-${this.playerId}-timeline" class="timeline"></div>
            <div id="player-table-${this.playerId}-artifacts" class="artifacts"></div>
            <div class="technology-tiles-decks">`;            
            for (let i = 1; i <= 3; i++) {
                html += `
                <div id="player-table-${this.playerId}-technology-tiles-deck-${i}" class="technology-tiles-deck"></div>
                `;
            }
            html += `
            </div>
        </div>
        `;

        dojo.place(html, document.getElementById('tables'));

        if (this.currentPlayer) {
            const handDiv = document.getElementById(`player-table-${this.playerId}-hand`);
            this.hand = new LineStock<BuilderCard>(this.game.builderCardsManager, handDiv, {
                // TODO sort: (a: BuilderCard, b: BuilderCard) => a.type == b.type ? a.number - b.number : a.type - b.type,
            });
            this.hand.onCardClick = (card: BuilderCard) => this.game.onHandCardClick(card);            
            this.hand.addCards(player.hand);
        }
        
        const timelineDiv = document.getElementById(`player-table-${this.playerId}-timeline`);
        this.timeline = new SlotStock<BuilderCard>(this.game.builderCardsManager, timelineDiv, {
            slotsIds: [1,2,3,4,5,6, 7,8,9,10,11,12],
        });
        // TODO this.timeline.addCards(player.timeline);
        
        const artifactsDiv = document.getElementById(`player-table-${this.playerId}-artifacts`);
        this.artifacts = new SlotStock<BuilderCard>(this.game.builderCardsManager, artifactsDiv, {
            slotsIds: [1,2,3,4,5]
        });
        // TODO this.artifacts.addCards(player.artifacts);

        const pastDiv = document.getElementById(`player-table-${this.playerId}-past`);
        this.past = new AllVisibleDeck<BuilderCard>(this.game.builderCardsManager, pastDiv, {
        });
        // TODO this.past.addCards(player.past);
        
        for (let i = 1; i <= 3; i++) {
            const technologyTilesDeckDiv = document.getElementById(`player-table-${this.playerId}-technology-tiles-deck-${i}`);
            this.technologyTilesDecks[i] = new AllVisibleDeck<TechnologyTile>(this.game.technologyTilesManager, technologyTilesDeckDiv, {
            });
            // TODO this.technologyTilesDecks[i].addCards(player.technologyTiles[i]);
        }
    }

    public setHandSelectable(selectable: boolean) {
        this.hand.setSelectionMode(selectable ? 'single' : 'none');
    }
}