const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };
        
const timelineSlotsIds = [];
[1, 0].forEach(line => [1,2,3,4,5,6].forEach(space => timelineSlotsIds.push(`timeline-${space}-${line}`)));

class PastDeck extends AllVisibleDeck<BuilderCard> {
    constructor(protected manager: CardManager<BuilderCard>, protected element: HTMLElement) {
        super(manager, element, {
            verticalShift: '0px',
            horizontalShift: '5px',
            direction: 'horizontal',
            counter: {
                hideWhenEmpty: true,
            },
            sort: (a: BuilderCard, b: BuilderCard) => a.rotated == b.rotated ? a.id.charCodeAt(0) - b.id.charCodeAt(0) : a.rotated - b.rotated,
        });
    }
}

class PlayerTable {
    public playerId: number;
    public hand?: LineStock<BuilderCard>;
    public handTech?: LineStock<TechnologyTile>;
    public timeline: SlotStock<BuilderCard>;
    public past: PastDeck;
    public artifacts: SlotStock<BuilderCard>;
    public technologyTilesDecks: AllVisibleDeck<TechnologyTile>[] = [];

    private lostKnowledge: number;

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
                <div id="player-table-${this.playerId}-lost-knowledge" class="lost-knowledge-space"></div>
                <div id="player-table-${this.playerId}-lost-knowledge-counter" class="lost-knowledge-counter bga-cards_deck-counter round">${player.lostKnowledge}</div>
                <div id="player-table-${this.playerId}-past" class="past"></div>
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
        </div>
        `;

        dojo.place(html, document.getElementById('tables'));

        if (this.currentPlayer) {
            this.hand = new LineStock<BuilderCard>(this.game.builderCardsManager, document.getElementById(`player-table-${this.playerId}-hand`), {
                sort: (a: BuilderCard, b: BuilderCard) => a.id[0] == b.id[0] ? a.number - b.number : a.id.charCodeAt(0) - b.id.charCodeAt(0),
            });
            this.hand.onCardClick = (card: BuilderCard) => this.game.onHandCardClick(card);   
            this.hand.onSelectionChange = (selection: BuilderCard[]) => this.game.onHandCardSelectionChange(selection);
        }

        const timelineDiv = document.getElementById(`player-table-${this.playerId}-timeline`);
        this.timeline = new SlotStock<BuilderCard>(this.game.builderCardsManager, timelineDiv, {
            slotsIds: timelineSlotsIds,
            mapCardToSlot: card => card.location,
        });
        this.timeline.onSelectionChange = (selection: BuilderCard[]) => this.game.onTimelineCardSelectionChange(selection, this.playerId);
        
        timelineSlotsIds.map(slotId => timelineDiv.querySelector(`[data-slot-id="${slotId}"]`)).forEach((element: HTMLDivElement) => element.addEventListener('click', () => {
            if (element.classList.contains('selectable')) {
                this.game.onTimelineSlotClick(element.dataset.slotId);
            }
        }));
        
        const artifactsSlotsIds = [];
        [0,1,2,3,4].forEach(space => artifactsSlotsIds.push(`artefact-${space}`)); // TODO artifact ?
        const artifactsDiv = document.getElementById(`player-table-${this.playerId}-artifacts`);
        this.artifacts = new SlotStock<BuilderCard>(this.game.builderCardsManager, artifactsDiv, {
            slotsIds: artifactsSlotsIds,
            mapCardToSlot: card => card.location,
            gap: '36px',
        });
        this.artifacts.onCardClick = card => this.game.onArtifactCardClick(card);

        const pastDiv = document.getElementById(`player-table-${this.playerId}-past`);
        this.past = new PastDeck(this.game.builderCardsManager, pastDiv);
        this.past.onSelectionChange = (selection: BuilderCard[]) => this.game.onPastCardSelectionChange(selection);
        
        ['ancient', 'writing', 'secret'].forEach(type => {
            const technologyTilesDeckDiv = document.getElementById(`player-table-${this.playerId}-technology-tiles-deck-${type}`);
            this.technologyTilesDecks[type] = new AllVisibleDeck<TechnologyTile>(this.game.technologyTilesManager, technologyTilesDeckDiv, {
                counter: {
                    hideWhenEmpty: true,
                },
            });
        });

        this.refreshUI(player);
        if (this.currentPlayer) {
            this.refreshHand(player.hand);
        }
    }
    
    public refreshUI(player: AncientKnowledgePlayer): void {
        this.timeline.removeAll();
        player.timeline.forEach(card => this.createTimelineCard(this.game.builderCardsManager.getFullCard(card)));

        this.artifacts.removeAll();
        this.artifacts.addCards(this.game.builderCardsManager.getFullCards(player.artefacts));

        this.past.removeAll();
        this.past.addCards(this.game.builderCardsManager.getFullCards(player.past));
        
        ['ancient', 'writing', 'secret'].forEach(type => {
            this.technologyTilesDecks[type].removeAll();
            const tiles = this.game.technologyTilesManager.getFullCards(player.techs).filter(tile => tile.type == type);
            this.technologyTilesDecks[type].addCards(tiles);
        });

        this.setLostKnowledge(player.lostKnowledge);
    }

    public setHandSelectable(selectionMode: CardSelectionMode, selectableCards: BuilderCard[] | null = null, stockState: string = '', reinitSelection: boolean = false) {
        this.hand.setSelectionMode(selectionMode);
        if (selectableCards) {
            this.hand.setSelectableCards(selectableCards);
        }
        document.getElementById(`player-table-${this.playerId}-hand`).dataset.state = stockState;
        if (reinitSelection) {
            this.hand.unselectAll();
        }
    }
    
    public setInitialSelection(cards: BuilderCard[]) {
        this.hand.addCards(cards);
        this.setHandSelectable('multiple', null, 'initial-selection');
    }
    
    public endInitialSelection() {
        this.setHandSelectable('none');
    }
    
    public createCard(card: BuilderCard): Promise<any> {
        if (card.id[0] == 'A') {
            return this.artifacts.addCard(card);
        } else {
            this.game.builderCardsManager.updateCardInformations(card); // in case card is already on timeline, to update location
            return this.createTimelineCard(card);
        }
    }
    
    private async createTimelineCard(card: BuilderCard): Promise<any> {
        const promise = await this.timeline.addCard(card);
        this.setCardKnowledge(card.id, card.knowledge);
        return promise;
    }
    
    public addTechnologyTile(card: TechnologyTile): Promise<any> {
        return this.technologyTilesDecks[card.type].addCard(card);
    }
    
    public refreshHand(hand: BuilderCard[]): Promise<any> {
        this.hand.removeAll();
        return this.hand.addCards(this.game.builderCardsManager.getFullCards(hand));
    }

    private createKnowledgeCounter(cardId: string, knowledge: number = 0) {
        document.getElementById(`builder-card-${cardId}-front`).insertAdjacentHTML('beforeend', `
            <div id="${cardId}-token-counter" class="token-counter">
                <div class="token-counter-info">
                    <div class="token-number" id="${cardId}-token-counter-number">${knowledge}</div>
                    <div class="knowledge-token"></div>
                </div>
                <div class="token-counter-actions">
                    <div class="token-action-info remove">-</div>
                    <div class="token-action-info add">+</div>
                    <div class="actions">
                        <div class="action plus" id="${cardId}-token-counter-plus">▲</div>
                        <div class="selected-group">
                            <div class="selected-number" id="${cardId}-token-counter-selected-number">0</div>
                            <div class="knowledge-token"></div>
                        </div>
                        <div class="action minus" id="${cardId}-token-counter-minus">▼</div>
                    </div>
                    <div class="token-selection">🡆</div>
                    <div class="future-number" id="${cardId}-token-counter-future-number">${knowledge}</div>
                    <div class="knowledge-token"></div>
                </div>
            </div>
        `);

        document.getElementById(`${cardId}-token-counter-minus`).addEventListener('click', () => {
            const current = this.getCardSelectedKnowledge(cardId);
            if (current > 0) {
                this.setCardSelectedKnowledge(cardId, current - 1);
            }
        });
        document.getElementById(`${cardId}-token-counter-plus`).addEventListener('click', () => {
            const current = this.getCardSelectedKnowledge(cardId);
            if (current < this.getCardKnowledge(cardId)) {
                this.setCardSelectedKnowledge(cardId, current + 1);
            }
        });
    }

    public setCardKnowledge(cardId: string, knowledge: number) {
        const counterDiv = document.getElementById(`${cardId}-token-counter-number`);
        if (counterDiv) {
            counterDiv.innerHTML = `${knowledge}`;
        } else {
            this.createKnowledgeCounter(cardId, knowledge);
        }
        this.setCardSelectedKnowledge(cardId, 0);
    }

    public getCardKnowledge(cardId: string): number {
        return Number(document.getElementById(`${cardId}-token-counter-number`)?.innerHTML);
    }

    public getCardSelectedKnowledge(cardId: string): number {
        return Number(document.getElementById(`${cardId}-token-counter-selected-number`)?.innerHTML);
    }

    public setCardSelectedKnowledge(cardId: string, selectedKnowledge: number, initial: boolean = false) {
        const counter = document.getElementById(`${cardId}-token-counter-number`);
        if (!counter) {
            this.createKnowledgeCounter(cardId);
        }

        const knowledge = this.getCardKnowledge(cardId);
        const cardDiv = document.getElementById(`builder-card-${cardId}`);
        const direction = cardDiv.dataset.knowledgeSelectionMode == 'add' ? 1 : -1;
        document.getElementById(`${cardId}-token-counter-selected-number`).innerHTML = `${selectedKnowledge}`;
        document.getElementById(`${cardId}-token-counter-minus`).classList.toggle('disabled', selectedKnowledge == 0);
        document.getElementById(`${cardId}-token-counter-plus`).classList.toggle('disabled', selectedKnowledge >= knowledge);
        document.getElementById(`${cardId}-token-counter-future-number`).innerHTML = `${knowledge + (direction * selectedKnowledge)}`;
        if (!initial) {
            this.game.onTimelineKnowledgeClick(cardId, selectedKnowledge);
        }
    }

    public incLostKnowledge(inc: number) {
        this.setLostKnowledge(this.lostKnowledge + inc);
    }

    public setLostKnowledge(knowledge: number) {
        this.lostKnowledge = knowledge;

        const golden = Math.floor(knowledge / 5);
        const basic = knowledge % 5;
        //const golden = 0;
        //const basic = knowledge;

        const stockDiv = document.getElementById(`player-table-${this.playerId}-lost-knowledge`);

        while (stockDiv.childElementCount > (golden + basic)) {
            stockDiv.removeChild(stockDiv.lastChild);
        }
        while (stockDiv.childElementCount < (golden + basic)) {
            const div = document.createElement('div');
            div.classList.add('knowledge-token');
            stockDiv.appendChild(div);
            div.addEventListener('click', () => {
                if (div.classList.contains('selectable')) {
                    div.classList.toggle('selected');
                    const card: HTMLDivElement = div.closest('.builder-card');
                    this.game.onTimelineKnowledgeClick(card.dataset.cardId, card.querySelectorAll('.knowledge-token.selected').length);
                }
            });
        }

        for (let i = 0; i < (golden + basic); i++) {
            stockDiv.children[i].classList.toggle('golden', i < golden);
        }
    }
    
    public setTimelineSlotsSelectable(selectable: boolean, possibleCardLocations: PossibleCardLocations = null) {
        const slotIds = selectable ? Object.keys(possibleCardLocations) : [];
        document.getElementById(`player-table-${this.playerId}-timeline`).querySelectorAll(`.slot`).forEach((slot: HTMLDivElement) => {
            const slotId = slot.dataset.slotId;
            const slotSelectable = selectable && slotIds.includes(slotId);
            const discardCost = slotSelectable ? possibleCardLocations[slotId] : null;

            slot.classList.toggle('selectable', slotSelectable);
            //slot.style.setProperty('--discard-cost', `${discardCost > 0 ? discardCost : ''}`);
            slot.dataset.discardCost = `${discardCost > 0 ? discardCost : ''}`;
            slot.classList.toggle('discard-cost', slotSelectable && discardCost > 0);
        });
    }
    
    public setTimelineTokensSelectable(selectionMode: CardSelectionMode, type?: 'add' | 'remove', cardsIds: string[] = []) {
        if (selectionMode == 'none') {
            document.querySelectorAll('.knowledge-selectable').forEach((cardDiv: HTMLElement) => {
                cardDiv.classList.remove('knowledge-selectable');
                cardDiv.dataset.knowledgeSelectionMode = '';
            });
        } else {
            cardsIds.forEach(cardId => {
                const cardDiv = document.getElementById(`builder-card-${cardId}`);
                cardDiv.classList.add('knowledge-selectable');
                cardDiv.dataset.knowledgeSelectionMode = type;
            });
        }
    }
    
    public declineCard(card: BuilderCard, lostKnowledge: number): Promise<any> {
        this.incLostKnowledge(lostKnowledge);
        this.setCardKnowledge(card.id, 0);
        return this.past.addCard(this.game.builderCardsManager.getFullCard(card));
    }
    
    public declineSlideLeft(): Promise<any> {
        const shiftedCards = this.timeline.getCards().map(card => ({
            ...card,
            location: card.location.replace(/(\d)/, a => `${Number(a) - 1}`)
        }));
        return this.timeline.addCards(shiftedCards, { animation: new BgaSlideAnimation({ duration: ANIMATION_MS * 3, transitionTimingFunction: 'ease-in-out', }) });
    }
    
    public enterSwap(cardIds: string[], fixedCardId: string) {
        this.timeline.setSelectionMode('multiple', this.game.builderCardsManager.getFullCardsByIds(cardIds.filter(id => id != fixedCardId)));
        if (fixedCardId) {
            const fixedCard = this.game.builderCardsManager.getFullCardById(fixedCardId);
            this.game.builderCardsManager.getCardElement(fixedCard)?.classList.add('swapped-card');
        }
    }
    
    public leaveSwap() {
        this.timeline.setSelectionMode('none');
        Array.from(document.getElementsByClassName('swapped-card')).forEach(elem => elem.classList.remove('swapped-card'));
    }
    
    public swapCards(cards: BuilderCard[]) {
        this.timeline.swapCards(cards);
        cards.forEach(card => this.setCardKnowledge(card.id, card.knowledge));
    }

    public hasKnowledgeOnTimeline() { // TODO
        return true;
        //console.log(document.getElementById(`player-table-${this.playerId}-timeline`));
        //return Array.from(document.getElementById(`player-table-${this.playerId}-timeline`).querySelectorAll('.token-number')).map(elem => Number(elem.innerHTML)).reduce((a, b) => a + b, 0) > 0;
    }
    
    public rotateCards(cards: BuilderCard[]) {
        cards.forEach(card => this.game.builderCardsManager.updateCardInformations(card, { updateMain: true }));
        this.past.sort();
    }
}