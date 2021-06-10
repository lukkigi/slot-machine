import * as PIXI from 'pixi.js';
import { FOOTER_FILL_COLOR, FOOTER_SIZE } from '../constants';

export class Footer {
    private readonly graphicsObject: PIXI.Graphics = new PIXI.Graphics();

    public constructor(screen: PIXI.Rectangle) {
        this.graphicsObject.x = 0;
        this.graphicsObject.y = screen.height - FOOTER_SIZE;
    
        this.graphicsObject.beginFill(FOOTER_FILL_COLOR);
        this.graphicsObject.drawRect(0, 0, screen.width, FOOTER_SIZE);
        this.graphicsObject.endFill();
    }

    public addText(text: PIXI.Text): void {
        this.graphicsObject.addChild(text);
    }

    public getGraphicsObject(): PIXI.Graphics {
        return this.graphicsObject;
    }
}