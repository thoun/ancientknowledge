class MoveBuildingEngineData {
    constructor(
        public selectedCard: BuilderCard = null,
    ) {}
}

class MoveBuildingEngine extends FrontEngine<MoveBuildingEngineData> {
    public data: MoveBuildingEngineData = new MoveBuildingEngineData();

    constructor (public game: AncientKnowledgeGame, public cardsIds: string[], public forcedCardId: string | null, public slotsIds: string[]) {
        super(game, [
            new FrontState<MoveBuildingEngineData>(
                'init',
                engine => {
                    this.game.changePageTitle(null);
                    if (engine.data.selectedCard && !forcedCardId) {
                        this.game.builderCardsManager.getCardElement(engine.data.selectedCard)?.classList.remove('created-card');
                    }
                    engine.data.selectedCard = forcedCardId ? this.game.builderCardsManager.getFullCardById(forcedCardId) : null;
                    if (engine.data.selectedCard) {
                        engine.data.selectedCard.location = this.game.getCurrentPlayerTable().timeline.getCards().find(card => card.id == engine.data.selectedCard.id).location;
                        this.game.builderCardsManager.getCardElement(engine.data.selectedCard)?.classList.add('created-card');
                        this.nextState('slot');
                        return;
                    }
                    const selectableCards = this.cardsIds.map(id => this.game.builderCardsManager.getFullCardById(id));
                    this.game.getCurrentPlayerTable().timeline.setSelectionMode('single', selectableCards);
                },
                () => {
                    this.game.getCurrentPlayerTable().timeline.setSelectionMode('none');
                }
            ),
            new FrontState<MoveBuildingEngineData>(
                'slot',
                engine => {
                    if (!this.forcedCardId) {
                        this.addCancel();
                    }
                    console.log('engine.data.selectedCard', engine.data.selectedCard, forcedCardId);
                    // we ignore location over the selected card
                    const ignoreLocation = engine.data.selectedCard.location.substring(0, engine.data.selectedCard.location.length - 1) + '1';
                    const locations = {};
                    this.slotsIds.filter(slotId => slotId != ignoreLocation).forEach(slotId => locations[slotId] = 0);
                    this.game.getCurrentPlayerTable().setTimelineSelectable(true, locations);
                },
                engine => {
                    this.game.builderCardsManager.getCardElement(engine.data.selectedCard)?.classList.remove('created-card');
                    this.game.getCurrentPlayerTable().setTimelineSelectable(false);
                    this.removeCancel();
                }
            ),
        ]);

        this.enterState('init');
    }
    
    public cardSelectionChange(selection: BuilderCard[]) {
        if (this.currentState == 'init') {
            if (selection.length == 1) {
                this.selectCard(selection[0]);
            }
        }
    }

    public selectCard(card: BuilderCard) {
        this.data.selectedCard = card;
        this.game.builderCardsManager.getCardElement(card)?.classList.add('created-card');
        this.game.getCurrentPlayerTable().hand.unselectCard(card);
        this.nextState('slot');
    }

    private addCancel() {    
        this.game.addSecondaryActionButton('restartMoveBuilding_btn', _('Restart card selection'), () => this.nextState('init'));
    }

    private removeCancel() {    
        document.getElementById('restartMoveBuilding_btn')?.remove();
    }
    
}