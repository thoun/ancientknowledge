interface BuilderCard {
    id: number;
    location: string;
    locationArg: number;
    type: number;
    number: number; // TODO discuss name
    startingSpace: number;
    initialKnowledge: number;
    victoryPoints: number;
    name: string;
    country: string;
    activation: string;
    effect: string;
}

class BuilderCardsManager extends CardManager<BuilderCard> {
    constructor (public game: AncientKnowledgeGame) {
        super(game, {
            getId: (card) => `builder-card-${card.id}`,
            setupDiv: (card: BuilderCard, div: HTMLElement) => {
                div.classList.add('builder-card');
                div.dataset.cardId = ''+card.id;
            },
            setupFrontDiv: (card: BuilderCard, div: HTMLElement) => this.setupFrontDiv(card, div),
            isCardVisible: card => Boolean(card.type),
            cardWidth: 120,
            cardHeight: 221,
            animationManager: game.animationManager,
        });
    }

    private setupFrontDiv(card: BuilderCard, div: HTMLElement, ignoreTooltip: boolean = false) { 
        div.dataset.type = ''+card.type;
        div.dataset.number = ''+card.number;
        if (!ignoreTooltip) {            
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    }

    private getTooltip(card: BuilderCard): string {
        let message = `
        <strong>${_("Type:")}</strong> ${card.type}
        <br>
        <strong>${_("TODO number:")}</strong> ${card.number}
        `;
 
        return message;
    }
}