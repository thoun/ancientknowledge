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
                        this.game.builderCardsManager.getCardElement(engine.data.selectedCard)?.classList.add('created-card');
                        this.nextState('slot');
                        return;
                    }
                    const selectableCards = this.cardsIds.map(id => this.game.builderCardsManager.getFullCardById(id));
                    this.game.getCurrentPlayerTable().timeline.setSelectionMode('single', selectableCards);
                },
                () => {
                    this.game.getCurrentPlayerTable().setHandSelectable('none');
                }
            ),
            new FrontState<MoveBuildingEngineData>(
                'slot',
                engine => {
                    //this.game.changePageTitle(`SelectSlot`, true);
                    if (!this.forcedCardId) {
                        this.addCancel();
                    }
                    
                    const locations = {};
                    this.slotsIds.forEach(slotId => locations[slotId] = 0);
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