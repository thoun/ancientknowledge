interface TechnologyTile {
    id: number;
    location: string;
    locationArg: number;
    level: number;
    type: number;
    number: number; // TODO discuss name
    name: string;
    requirement: string;
    activation: string;
    effect: string;
}

class TechnologyTilesManager extends CardManager<TechnologyTile> {
    constructor (public game: AncientKnowledgeGame) {
        super(game, {
            getId: (card) => `technology-tile-${card.id}`,
            setupDiv: (card: TechnologyTile, div: HTMLElement) => {
                div.classList.add('technology-tile');
                div.dataset.level = ''+card.level;
            },
            setupFrontDiv: (card: TechnologyTile, div: HTMLElement) => this.setupFrontDiv(card, div),
            isCardVisible: card => Boolean(card.type),
            cardWidth: 221,
            cardHeight: 120,
            animationManager: game.animationManager,
        });
    }

    private setupFrontDiv(card: TechnologyTile, div: HTMLElement, ignoreTooltip: boolean = false) { 
        div.dataset.type = ''+card.type;
        div.dataset.number = ''+card.number;
        if (!ignoreTooltip) {            
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    }

    public getTooltip(card: TechnologyTile): string {
        let message = `
        <strong>${_("Level:")}</strong> ${card.level}
        <br>
        <strong>${_("Type:")}</strong> ${card.type}
        <br>
        <strong>${_("TODO number:")}</strong> ${card.number}
        `;
 
        return message;
    }
    
    public setForHelp(card: TechnologyTile, divId: string): void {
        const div = document.getElementById(divId);
        div.classList.add('card', 'technology-tile');
        div.dataset.side = 'front';
        div.innerHTML = `
        <div class="card-sides">
            <div class="card-side front">
            </div>
            <div class="card-side back">
            </div>
        </div>`
        this.setupFrontDiv(card, div.querySelector('.front'), true);
    }
}