class CreateEngineData {
    constructor(
        public selectedCard: BuilderCard = null,
        public selectedSlot: string = null,
        public discardCards: BuilderCard[] = [],
    ) {}
}

class CreateEngine extends FrontEngine<CreateEngineData> {
    public data: CreateEngineData = new CreateEngineData();

    constructor (public game: AncientKnowledgeGame, public possibleCardsLocations: {[id: string]: PossibleCardLocations}) {
        super(game, [
            new FrontState<CreateEngineData>(
                'init',
                engine => {
                    this.game.changePageTitle(null);
                    if (engine.data.selectedCard) {
                        this.game.builderCardsManager.getCardElement(engine.data.selectedCard)?.classList.remove('created-card');
                        this.game.getCurrentPlayerTable().addCardsToHand([engine.data.selectedCard], false);
                    }
                    engine.data.selectedCard = null;
                    engine.data.selectedSlot = null;
                    engine.data.discardCards = [];
                    const selectableCards = Object.keys(this.possibleCardsLocations).map(id => this.game.builderCardsManager.getFullCardById(id));
                    this.game.getCurrentPlayerTable().setHandSelectable('single', selectableCards, 'create-init', true);
                },
                () => {
                }
            ),
            new FrontState<CreateEngineData>(
                'slot',
                engine => {
                    const card = engine.data.selectedCard;

                    if (card.id[0] == 'A' || card.lockedSpace) {
                        this.data.selectedSlot = Object.keys(this.possibleCardsLocations[card.id])[0];

                        const stock = card.id[0] == 'A' ?
                            this.game.getCurrentPlayerTable().artifacts :
                            this.game.getCurrentPlayerTable().timeline;

                        stock.addCard(this.data.selectedCard, undefined, {
                            slot: this.data.selectedSlot,
                        });

                        engine.nextState('discard');
                        return;
                    }

                    this.game.changePageTitle(`SelectSlot`, true);
                    engine.data.selectedSlot = null;
                    engine.data.discardCards = [];
                    this.addCancel();
                    this.game.getCurrentPlayerTable().setTimelineSlotsSelectable(true, this.possibleCardsLocations[card.id]);
                },
                () => {
                    this.game.getCurrentPlayerTable().setTimelineSlotsSelectable(false);
                    this.removeCancel();
                    this.game.getCurrentPlayerTable().setHandSelectable('none');
                }
            ),
            new FrontState<CreateEngineData>(
                'discard',
                engine => {
                    const discardCount = this.getDiscardCount();
                    if (!discardCount) {
                        this.game.onCreateCardConfirm(this.data);
                        return;
                    } 

                    (this.game as any).gamedatas.gamestate.args.discard_number = discardCount;
                    this.game.changePageTitle(`SelectDiscard`, true);
                    engine.data.discardCards = [];
                    this.game.getCurrentPlayerTable().setHandSelectable('multiple', null, 'create-discard', true);
                    this.addConfirmDiscardSelection();
                    this.addCancel();
                },
                engine => {
                    this.removeConfirmDiscardSelection();
                    this.game.getCurrentPlayerTable().setHandSelectable('none');
                    this.removeCancel();
                    engine.data.discardCards.forEach(card => this.game.builderCardsManager.getCardElement(card)?.classList.remove('discarded-card'));
                    this.game.builderCardsManager.getCardElement(engine.data.selectedCard)?.classList.remove('created-card');
                }
            ),
        ]);

        this.enterState('init');
    }
    
    public cardSelectionChange(selection: BuilderCard[]) {
        if (this.currentState == 'init' || this.currentState == 'slot') {
            if (selection.length == 1) {
                this.selectCard(selection[0]);
            }
        } else if (this.currentState == 'discard') {
            this.data.discardCards = selection;
            this.setConfirmDiscardSelectionState();
        }
    }

    public selectCard(card: BuilderCard) {
        if (this.data.selectedCard) {
            this.nextState('init');
        }

        this.data.selectedCard = card;
        this.game.builderCardsManager.getCardElement(card)?.classList.add('created-card');
        this.game.getCurrentPlayerTable().unselectHandCard(card);
        this.nextState('slot');
    }

    public selectSlot(slotId: string) {
        this.data.selectedSlot = slotId;

        this.game.getCurrentPlayerTable().timeline.addCard(this.data.selectedCard, undefined, {
            slot: slotId,
        });
        this.nextState('discard');
    }

    private addCancel() {    
        this.game.addSecondaryActionButton('restartCardCreation_btn', _('Restart card creation'), () => this.nextState('init'));
    }

    private removeCancel() {    
        document.getElementById('restartCardCreation_btn')?.remove();
    }

    private addConfirmDiscardSelection() {    
        this.game.addPrimaryActionButton('confirmDiscardSelection_btn', _('Confirm discarded cards'), () => this.game.onCreateCardConfirm(this.data));
        this.setConfirmDiscardSelectionState();
    }

    private removeConfirmDiscardSelection() {    
        document.getElementById('confirmDiscardSelection_btn')?.remove();
    }

    private setConfirmDiscardSelectionState() { 
        const discardCount = this.getDiscardCount();
        document.getElementById('confirmDiscardSelection_btn')?.classList.toggle('disabled', discardCount != this.data.discardCards.length)
    }

    private getDiscardCount(): number {
        const card = this.data.selectedCard;
        if (!card) {
            return null;
        }

        const slot = card.id[0] == 'A' || card.lockedSpace ?
            Object.keys(this.possibleCardsLocations[card.id])[0] :
            this.data.selectedSlot;

        return this.possibleCardsLocations[card.id][slot];
    }
    
}