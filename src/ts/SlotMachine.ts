import * as PIXI from "pixi.js";

import { SlotItem } from './SlotItem';
import { ADDITIONAL_TURNS_DURATION, ANIMATION_DURATION, APPLICATION_FILL_COLOR, ASSET_COUNT, ASSET_PATH, ASSET_SUFFIX, BUTTON_FILL_COLOR, BUTTON_FONT_SIZE, BUTTON_FONT_WEIGHT, COLUMN_TOP_PADDING, FOOTER_FILL_COLOR, FOOTER_SIZE, ITEM_PADDING, ITEM_SIZE, NUMBER_OF_ITEMS, VISIBLE_ITEMS_COUNT } from './constants';

export class SlotMachine {
    private application: PIXI.Application;
    private column: PIXI.Graphics;
    private items: SlotItem[];
    private availableTextures: PIXI.Texture[];
    private columnPosition: number = 0;

    private readonly columnWidth: number = window.innerWidth / 5;

    constructor() {
        this.initialise();
        this.generateItems();
    }

    private initialise() {
        this.application = new PIXI.Application({
            width: window.innerWidth, height: window.innerHeight, backgroundColor: APPLICATION_FILL_COLOR
        });
        
        document.body.appendChild(this.application.view);
                
        window.onload = async (): Promise<void> => {
            document.body.appendChild(this.application.view);
        };
    }

    private generateItems() {
        this.items = [];

        /* 
         * I have renamed the assets to start with 0.png, so we can start with i = 0 here
         * Improvement would be to map each index to a proper filename for clarity
         */
        for (let i = 0; i < NUMBER_OF_ITEMS; i++) {
            /*
            * Generate a random number between 0 and 100
            * afterwards modulo the maximum numbers of assets to stay within the range
            */
            const assetId = Math.floor(Math.random() * 100) % ASSET_COUNT;

            this.items.push(
                new SlotItem(ASSET_PATH + assetId % ASSET_COUNT + ASSET_SUFFIX)
            );
        }

        /* 
         * Transform the array of items into a Set to filter out duplicates 
         * since the loader needs any asset just once
         */
        const assetUrlSet = new Set(this.items.map(item => item.getAssetUrl()));

        this.application.loader.add(Array.from(assetUrlSet)).load(this.onLoadingFinished.bind(this));
    }

    private onLoadingFinished() {
        this.createItemsAndColumn();
        this.createPlayButton();
    }

    private createItemsAndColumn() {
        this.availableTextures = this.items.map(item => PIXI.Texture.from(item.getAssetUrl()));

        this.column = new PIXI.Graphics();

        this.column.x = Math.round((this.application.screen.width - this.columnWidth) / 2);
        this.column.y = COLUMN_TOP_PADDING;

        for (let i = 0; i < this.availableTextures.length; i++) {
            const symbol = new PIXI.Sprite(this.availableTextures[i]);

            symbol.y = this.getVerticalCoordForNthElement(i);
            symbol.scale.x = symbol.scale.y = Math.min(ITEM_SIZE / symbol.width, ITEM_SIZE / symbol.height);
            symbol.x = Math.round((this.columnWidth - ITEM_SIZE) / 2);

            this.items[i].setSprite(symbol);

            this.column.addChild(symbol);
        }

        this.application.stage.addChild(this.column);
    }

    private createPlayButton() {
        const footer = new PIXI.Graphics();

        footer.x = 0;
        footer.y = this.application.screen.height - FOOTER_SIZE;

        footer.beginFill(FOOTER_FILL_COLOR);
        footer.drawRect(0, 0, this.application.screen.width, FOOTER_SIZE);
        footer.endFill();

        const playTextStyle = new PIXI.TextStyle({
            fontSize: BUTTON_FONT_SIZE,
            fontWeight: BUTTON_FONT_WEIGHT,
            fill: BUTTON_FILL_COLOR
        });

        const playText = new PIXI.Text('START A SPIN', playTextStyle);
        playText.x = Math.round((footer.width - playText.width) / 2);
        playText.y = Math.round((footer.height - playText.height) / 2);
        playText.interactive = true;
        playText.buttonMode = true;

        // click does not work on mobile, so I chose pointer events
        playText.addListener('pointerdown', () => {
            this.animateColumn();
        });

        footer.addChild(playText);

        this.application.stage.addChild(footer);
    }

    private animateColumn(): void {
        const start = Date.now();
        const additionalTurns = Math.floor(Math.random() * VISIBLE_ITEMS_COUNT);
        const duration = ANIMATION_DURATION + additionalTurns * ADDITIONAL_TURNS_DURATION;

        this.application.ticker.add((delta) => {
            if (Date.now() - start >= duration) {
                return;
            }

            const timeLeft = Math.min(1, (Date.now() - start) / duration);

            this.columnPosition = this.returnLinearInterpolation(0, 20 + additionalTurns, this.bounce(timeLeft));

            for (let i = 0; i < this.items.length; i++) {
                const spriteForItem = this.items[i].getSprite();
                const previousPosition = spriteForItem.y;

                spriteForItem.y = ((this.columnPosition + i) % this.items.length) * this.getVerticalCoord() - this.getVerticalCoord();

                if (spriteForItem.y < 0 && previousPosition > ITEM_SIZE) {
                    spriteForItem.texture = this.availableTextures[Math.floor(Math.random() * this.availableTextures.length)];
                }
            }
        });
    }

    private getVerticalCoord(): number {
        return Math.round((this.application.screen.height - FOOTER_SIZE - COLUMN_TOP_PADDING) / VISIBLE_ITEMS_COUNT);
    }

    private getVerticalCoordForNthElement(elementPosition: number): number {
        return Math.round(elementPosition * this.getVerticalCoord());
    }

    /* 
     * We need this to get values between our start and end point, taking the time into consideration
     * without using this function there would be just the end animation happening
     * 
     * Function used is from https://en.wikipedia.org/wiki/Linear_interpolation
     */
    private returnLinearInterpolation(start: number, end: number, alpha: number): number {
        return (1 - alpha) * start + end * alpha;
    }

    // Taken from https://github.com/tweenjs/tween.js/blob/master/src/Easing.ts and modified s to fit my needs
    private bounce (amount: number): number {
        const s = 0.50158
        return amount === 0 ? 0 : --amount * amount * ((s + 1) * amount + s) + 1
    }
}