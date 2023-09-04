class RemoveKnowledgeEngineData {
    constructor(
        public discardTokens: {[cardId: string]: number} = {},
    ) {}
}

class RemoveKnowledgeEngine extends FrontEngine<RemoveKnowledgeEngineData> {
    public data: RemoveKnowledgeEngineData = new RemoveKnowledgeEngineData();

/*pour REMOVE_KNOWLEDGE, il faudra gérer plusieurs comportements en fonction du champs 'type'
je t'envoie une liste d'ids de carte, un entier n, et type qui est soit OR/XOR
XOR ça veut dire qu'il faut enlever $n knowledge d'exactement une carte parmis celles des args
OR c'est le cas "normal" où tu répartis les $n comme tu veux parmis les cartes des args
et pour actRemoveKnowleldge j'attends un tableau associatif : ['cardId' => n1, 'cardId2' => n2, ...]*/

    constructor (public game: AncientKnowledgeGame, private cardIds: string[], private n: number, private m: number, private type: 'or' | 'xor') {
        super(game, [
            new FrontState<RemoveKnowledgeEngineData>(
                'discardTokens',
                engine => {
                    engine.data.discardTokens = {};
                    cardIds.forEach(cardId => this.game.getCurrentPlayerTable().setCardSelectedKnowledge(cardId, 0, true));
                    this.game.getCurrentPlayerTable().setTimelineTokensSelectable('multiple', 'remove', this.cardIds);
                    this.addConfirmDiscardTokenSelection();
                    this.setConfirmDiscardTokenSelectionState();
                },
                () => {
                    this.removeConfirmDiscardTokenSelection();
                    this.game.getCurrentPlayerTable().setTimelineTokensSelectable('none');
                }
            ),
        ]);

        this.enterState('discardTokens');
    }
    
    public cardTokenSelectionChange(cardId: string, knowledge: number) {
        if (this.currentState == 'discardTokens') {
            this.data.discardTokens[cardId] = knowledge;

            if (this.type === 'xor') {
                const selectableCardsIds = knowledge > 0 ? [cardId] : this.cardIds;
                this.game.getCurrentPlayerTable().setTimelineTokensSelectable('multiple', 'remove', selectableCardsIds);
            }

            this.setConfirmDiscardTokenSelectionState();
        }
    }

    private addConfirmDiscardTokenSelection() {    
        this.game.addPrimaryActionButton('confirmDiscardTokenSelection_btn', _('Confirm discarded tokens'), () => this.game.onRemoveKnowledgeConfirm(this.data.discardTokens));
        this.setConfirmDiscardTokenSelectionState();
    }

    private removeConfirmDiscardTokenSelection() {    
        document.getElementById('confirmDiscardTokenSelection_btn')?.remove();
    }

    private setConfirmDiscardTokenSelectionState() { 
        const discardCount = Object.values(this.data.discardTokens).reduce((a, b) => a + b, 0);
        //console.log(this.m, Object.values(this.data.discardTokens).filter(val => val > 0), discardCount, this.n * this.m);
        document.getElementById('confirmDiscardTokenSelection_btn')?.classList.toggle('disabled', 
            discardCount > this.n * this.m || 
            (this.type === 'xor' && Object.values(this.data.discardTokens).filter(val => val > 0).length > this.m) ||
            Object.keys(this.data.discardTokens).some(cardId => !this.cardIds.includes(cardId))
        );
    }
    
}
