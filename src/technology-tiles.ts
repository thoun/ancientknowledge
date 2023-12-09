interface TechnologyTile {
    id: string;
    activation: string;
    effect: string[];
    level: number; // 0..1
    location: string; // board1..3
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
            cardWidth: 163,
            cardHeight: 114,
            animationManager: game.animationManager,
        });
    }    

    private setupFrontDiv(card: TechnologyTile, div: HTMLElement, ignoreTooltip: boolean = false) { 
        if (div.style.getPropertyValue('--card-color')) {
            return;
        }
        
        const type = card.type;
        const requirement = card.requirement?.length > 0;
        div.dataset.requirement = requirement.toString();
        div.style.setProperty('--card-color', TILE_COLORS[type]);

        const backgroundIndex = card.number - (card.level == 2 ? 28 : 1);
        const tilesByRow = card.level == 2 ? 6 : 9;
        div.style.backgroundPositionX = `${(backgroundIndex % tilesByRow) * 100 / (tilesByRow - 1)}%`;
        div.style.backgroundPositionY = `${Math.floor(backgroundIndex / tilesByRow) * 50}%`;
        let html = ``;
        
        if (requirement) {
            html += `<div class="requirement"><div>${card.requirement.map(text => formatTextIcons(_(text))).join(`<br>`).replace(/\n+/g, `<br>`) ?? ''}</div></div>`;
        }
        html += `<div class="name-box">
            <div class="name">
                ${_(card.name) ?? ''}
            </div>
        </div>
        <div class="effect">
            <div>${card.effect?.map(text => formatTextIcons(_(text))).join(`<br>`).replace(/\n+/g, `<br>`) ?? ''}</div>
        </div>
        `;

        div.innerHTML = html;

        if (requirement) {
            this.reduceToFit(div.querySelector('.requirement'));
            //setTimeout(() => this.reduceToFit(div.querySelector('.requirement')), 2000);
        }
        this.reduceToFit(div.querySelector('.effect'));
        //setTimeout(() => this.reduceToFit(div.querySelector('.effect')), 2000);

        if (!ignoreTooltip) {            
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    }

    private reduceToFit(outerDiv: HTMLDivElement, attemps: number = 0) {
        const innerDiv = outerDiv.getElementsByTagName('div')[0] as HTMLDivElement;
        if (!innerDiv) {
            return;
        }
        const match = window.getComputedStyle(innerDiv).fontSize.match(/\d+/);
        if (!match) {
            return;
        }
        let fontSize = Number(match[0]);
        while ((innerDiv.clientHeight > outerDiv.clientHeight) && fontSize > 5) {
            fontSize--;
            innerDiv.style.fontSize = `${fontSize}px`;
        }

        if (attemps < 5) {
            attemps++;
            setTimeout(() => this.reduceToFit(outerDiv, attemps));
        }
    }

    /*private reduceToFit(outerDiv: HTMLDivElement) {        
        //if (!outerDiv.closest('#technology-tile-T12_Mummification')) { return; }

        const innerDiv = outerDiv.getElementsByTagName('div')[0] as HTMLDivElement;
        let fontSize = Number(window.getComputedStyle(innerDiv).fontSize.match(/\d+/)[0]);
        while (innerDiv.clientHeight > outerDiv.clientHeight && fontSize > 5) {
            fontSize--;
            innerDiv.style.fontSize = `${fontSize}px`;

            //console.log(innerDiv.clientHeight, outerDiv.clientHeight);
            
            console.log('outer div',
                outerDiv.style.height, 
                window.getComputedStyle(outerDiv).height, 
                outerDiv.clientHeight, 
                outerDiv.offsetHeight, 
                outerDiv.scrollHeight, 
                outerDiv.getBoundingClientRect().height
            );
            
            console.log('inner div',
                innerDiv.style.height, 
                window.getComputedStyle(innerDiv).height, 
                innerDiv.clientHeight, 
                innerDiv.offsetHeight, 
                innerDiv.scrollHeight, 
                innerDiv.getBoundingClientRect().height
            );

            setTimeout(() => {
                console.log('outer div',
                    outerDiv.style.height, 
                    window.getComputedStyle(outerDiv).height, 
                    outerDiv.clientHeight, 
                    outerDiv.offsetHeight, 
                    outerDiv.scrollHeight, 
                    outerDiv.getBoundingClientRect().height
                );
                
                console.log('inner div',
                    innerDiv.style.height, 
                    window.getComputedStyle(innerDiv).height, 
                    innerDiv.clientHeight, 
                    innerDiv.offsetHeight, 
                    innerDiv.scrollHeight, 
                    innerDiv.getBoundingClientRect().height
                );
            }, 0);
        }
    }*/

    /*private reduceToFit(outerDiv: HTMLDivElement, fontSize: number | null = null) {        
        if (!outerDiv.closest('#technology-tile-T12_Mummification')) { return; }

        const innerDiv = outerDiv.getElementsByTagName('div')[0] as HTMLDivElement;
        fontSize = fontSize ?? Number(window.getComputedStyle(innerDiv).fontSize.match(/\d+/)[0]);
        if (innerDiv.clientHeight > outerDiv.clientHeight && fontSize > 5) {
            fontSize--;
            innerDiv.style.fontSize = `${fontSize}px`;

            //console.log(innerDiv.clientHeight, outerDiv.clientHeight);
            
            console.log('outer div',
                outerDiv.style.height, 
                window.getComputedStyle(outerDiv).height, 
                outerDiv.clientHeight, 
                outerDiv.offsetHeight, 
                outerDiv.scrollHeight, 
                outerDiv.getBoundingClientRect().height
            );
            
            console.log('inner div',
                innerDiv.style.height, 
                window.getComputedStyle(innerDiv).height, 
                innerDiv.clientHeight, 
                innerDiv.offsetHeight, 
                innerDiv.scrollHeight, 
                innerDiv.getBoundingClientRect().height
            );

            setTimeout(() => {
                /_*console.log('outer div',
                    outerDiv.style.height, 
                    window.getComputedStyle(outerDiv).height, 
                    outerDiv.clientHeight, 
                    outerDiv.offsetHeight, 
                    outerDiv.scrollHeight, 
                    outerDiv.getBoundingClientRect().height
                );
                
                console.log('inner div',
                    innerDiv.style.height, 
                    window.getComputedStyle(innerDiv).height, 
                    innerDiv.clientHeight, 
                    innerDiv.offsetHeight, 
                    innerDiv.scrollHeight, 
                    innerDiv.getBoundingClientRect().height
                );*_/
                this.reduceToFit(outerDiv, fontSize);
            }, 100);
        }
    }*/

    private getType(type: string) {
        switch (type) {
            case 'ancient': return _('Ancient');
            case 'writing': return _('Writing');
            case 'secret': return _('Secret');
        }
    }

    public getTooltip(card: TechnologyTile): string {
        let message = `
        <strong>${_(card.name)}</strong>
        <br>
        <br>
        <strong>${_("Type:")}</strong> ${this.getType(card.type)}
        <br>
        <strong>${_("Level:")}</strong> ${card.level}
        <br>
        <strong>${_("Activation:")}</strong> ${this.game.getTooltipActivation(card.activation)}
        `;
        if (card.requirement) {
            message += `
            <br><br>
            <strong>${_("Requirement:")}</strong> ${card.requirement.map(text => formatTextIcons(_(text))).join(`<br>`) ?? ''}
            `;
        }
        message += `
        <br>
        <br>
        <strong>${_("Effect:")}</strong> ${card.effect?.map(text => formatTextIcons(_(text))).join(`<br>`) ?? ''}
        <br>
        <br>
        ${this.generateCardDiv({...card, id: `${card.id}--tooltip-card`}).outerHTML}
        `;
 
        return message;
    }

    public generateCardDiv(card: TechnologyTile): HTMLDivElement {
        const tempDiv: HTMLDivElement = document.createElement('div');
        tempDiv.classList.add('card', 'technology-tile');
        tempDiv.dataset.level = ''+card.level;
        tempDiv.innerHTML = `
        <div class="card-sides">
            <div class="card-side front"></div>
        </div>
        `;

        document.body.appendChild(tempDiv);
        this.setupFrontDiv(card, tempDiv.querySelector('.front'), true);
        document.body.removeChild(tempDiv);
            
        return tempDiv;
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

    public getFullCard(tile: TechnologyTile): TechnologyTile {
        return {
            ...TECHS_DATA[tile.id],
            id: tile.id,
        };
    }

    public getFullCards(tiles: TechnologyTile[]): TechnologyTile[] {
        return tiles.map(tile => this.getFullCard(tile));
    }

    public getFullCardById(id: string): TechnologyTile {
        return {
            ...TECHS_DATA[id],
            id,
        };
    }

    public getFullCardsByIds(ids: string[]): TechnologyTile[] {
        return ids.map(id => this.getFullCardById(id));
    }
}