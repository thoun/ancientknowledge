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
                    engine.data.discardCards = [];
                    const cards = this.game.getCurrentPlayerTable().hand.getCards().filter(card => possibleCards.includes(card.id));
                    this.game.getCurrentPlayerTable().setHandSelectable('multiple', cards, 'archive-discard', true);
                    this.addConfirmDiscardSelection();
                },
                () => {
                    this.removeConfirmDiscardSelection();
                    this.game.getCurrentPlayerTable().setHandSelectable('none');
                }
            )
        ]);

        this.enterState('discard');
    }
    
    public cardSelectionChange(selection: BuilderCard[]) {
        if (this.currentState == 'discard') {
            this.data.discardCards = selection;
            this.setConfirmDiscardSelectionState();
        }
    }

    private addConfirmDiscardSelection() {
        this.game.addPrimaryActionButton('confirmDiscardSelection_btn', _('Confirm discarded cards'), () =>  this.game.onArchiveCardConfirm(this.data));
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