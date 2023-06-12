interface TechnologyTile {
    id: string;
    activation: string;
    effect: string[];
    level: number; // 0..1
    location: string;
    name: string;
    number: number;
    pId: number;
    requirement: string[];
    state: number;
    type: string;
}

const TILE_COLORS = {
  'ancient': '#3c857f',
  'secret': '#b8a222',
  'writing': '#633c37',
};


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
        const type = card.type;
        const requirement = card.requirement?.length > 0;
        div.dataset.requirement = requirement.toString();
        div.style.setProperty('--card-color', TILE_COLORS[type]);
        /*
        div.dataset.type = ''+card.type;
        div.dataset.number = ''+card.number;*/
        const backgroundPositionX = ((card.number - 1) % 9) * 100 / 8;
        const backgroundPositionY = Math.floor((card.number - 1) / 9) * 100 / 4;
        let html = `
        <div class="background" data-type="${type}" style="background-position: ${backgroundPositionX}% ${backgroundPositionY}%"></div>
        <div class="type-box" data-type="${type}">
            <div class="type" data-type="${type}">
                <div class="type-icon"></div>
            </div>
        </div>
        <div class="level-box">
            <div class="level-icon" data-level="${card.level}"></div>
        </div>`;
        
        if (requirement) {
            html += `<div class="requirement">${card.requirement.map(text => formatTextIcons(text)).join(`<br>`) ?? ''}</div>`;
        }
        html += `<div class="name-box">
            <div class="name">
                ${card.name ?? ''}
            </div>
        </div>
        <div class="center-box">
            <div class="activation-box"></div>
            <div class="line left"></div>
            <div class="line right"></div>
            <div class="line middle"></div>
            <div class="activation" data-type="${card.activation}"></div>
        </div>`;
        html += `<div class="effect">${card.effect?.map(text => formatTextIcons(text)).join(`<br>`) ?? ''}</div>
        `;

        div.innerHTML = html;

        if (!ignoreTooltip) {            
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    }

    public getTooltip(card: TechnologyTile): string {
        let message = `<pre>${JSON.stringify(card, null, 2)}</pre>`; // TODO TEMP
        /*let message = `
        <strong>${_("Level:")}</strong> ${card.level}
        <br>
        <strong>${_("Type:")}</strong> ${card.type}
        <br>
        <strong>${_("TODO number:")}</strong> ${card.number}
        `;
 */
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