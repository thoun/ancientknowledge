class ArchiveEngineData {
    constructor(
        public discardCards: BuilderCard[] = [],
    ) {}
}

class ArchiveEngine extends FrontEngine<ArchiveEngineData> {
    public data: ArchiveEngineData = new ArchiveEngineData();

    constructor (public game: AncientKnowledgeGame, public possibleCards: string[]) {
        super(game, [
            new FrontState<ArchiveEngineData>(
                'discard',
                engine => {
                    //this.game.changePageTitle(`SelectDiscard`, true);
                    engine.data.discardCards = [];
                    const cards = this.game.getCurrentPlayerTable().hand.getCards().filter(card => possibleCards.includes(card.id));
                    this.game.getCurrentPlayerTable().setHandSelectable('multiple', cards, 'archive-discard', true);
                    this.addConfirmDiscardSelection();
                    this.addCancel();
                },
                () => {
                    this.removeConfirmDiscardSelection();
                    this.game.getCurrentPlayerTable().setHandSelectable('none');
                    this.removeCancel();
                }
            ),
            new FrontState<ArchiveEngineData>(
                'discardTokens',
                engine => {
                    const discardCount = this.data.discardCards.length;
                    (this.game as any).gamedatas.gamestate.args.discard_number = discardCount;
                    this.game.changePageTitle(`SelectDiscard`, true);
                    engine.data.discardCards = [];
                    this.game.getCurrentPlayerTable().setHandSelectable('multiple', null, 'create-discard', true);
                    this.addConfirmDiscardSelection();
                    this.addCancel();
                },
                () => {
                    this.removeConfirmDiscardSelection();
                    this.game.getCurrentPlayerTable().setHandSelectable('none');
                    this.removeCancel();
                }
            ),
            new FrontState<ArchiveEngineData>(
                'confirm',
                engine => {
                    engine.data.discardCards.forEach(card => this.game.builderCardsManager.getCardElement(card)?.classList.add('discarded-card'));
                    this.game.changePageTitle(`Confirm`, true);

                    const card = engine.data.selectedCard;

                    const artifact = card.id[0] == 'A';
                    const discardedCardsCount = engine.data.discardCards.length;

                    let label = '';
                    if (artifact) {
                        label = _('Confirm creation of Artifact ${card_name}');
                    } else {
                        label = discardedCardsCount ? 
                            _('Confirm creation of Monument ${card_name} with ${number} discarded cards').replace('${number}', discardedCardsCount) : 
                            _('Confirm creation of Monument ${card_name}');
                    }
                    label = label.replace('${card_name}', card.name);

                    this.game.addPrimaryActionButton('confirmCreate_btn', label, () => this.game.onCreateCardConfirm(engine.data));
                    this.addCancel();
                },
                engine => {
                    engine.data.discardCards.forEach(card => this.game.builderCardsManager.getCardElement(card)?.classList.remove('discarded-card'));
                    this.removeCancel();
                    document.getElementById('confirmCreate_btn')?.remove();
                }
            ),
        ]);

        this.enterState('discard');
    }
    
    public cardSelectionChange(selection: BuilderCard[]) {
        if (this.currentState == 'discard') {
            this.data.discardCards = selection;
            this.setConfirmDiscardSelectionState();
        }
    }

    public selectCard(card: BuilderCard) {
        this.data.selectedCard = card;
        this.game.builderCardsManager.getCardElement(card)?.classList.add('created-card');
        this.game.getCurrentPlayerTable().hand.unselectCard(card);
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
        this.game.addPrimaryActionButton('confirmDiscardSelection_btn', _('Confirm discarded cards'), () => this.nextState('discardTokens'));
        this.setConfirmDiscardSelectionState();
    }

    private removeConfirmDiscardSelection() {    
        document.getElementById('confirmDiscardSelection_btn')?.remove();
    }

    private setConfirmDiscardSelectionState() { 
        const discardCount = this.data.discardCards.length;
        document.getElementById('confirmDiscardSelection_btn')?.classList.toggle('disabled', discardCount == 0);
    }
    
}