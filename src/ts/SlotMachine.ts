import * as PIXI from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";

import { SlotItem } from './SlotItem';
import { ADDITIONAL_TURNS_DURATION, ANIMATION_DURATION, ASSET_COUNT, ASSET_PATH, ASSET_SUFFIX, ITEM_PADDING, ITEM_SIZE, NUMBER_OF_ITEMS, VISIBLE_ITEMS_COUNT } from './constants';

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
            width: window.innerWidth, height: window.innerHeight, backgroundColor: 0xFFD8CC
        });
        
        document.body.appendChild(this.application.view);
                
        window.onload = async (): Promise<void> => {
            document.body.appendChild(this.application.view);
        };
    }

    private generateItems() {
        this.items = [];
        // I have renamed the assets to start with 0.png, so we can start with i = 0 here

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

        // Transform the array of items into a Set to filter out duplicates since the loader only needs any asset just once
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
        this.column.y = Math.round((this.application.screen.height - ITEM_SIZE) / 8);

        // this.column.beginFill(0xffbd9b);
        // this.column.drawRect(0, 0, this.columnWidth, this.application.screen.height);
        // this.column.endFill();

        for (let i = 0; i < this.availableTextures.length; i++) {
            const symbol = new PIXI.Sprite(this.availableTextures[i]);

            // symbol.y =  i * (ITEM_SIZE + (this.application.screen.height - ITEM_SIZE * VISIBLE_ITEMS_COUNT) / VISIBLE_ITEMS_COUNT);
            symbol.y = i * (ITEM_SIZE + ITEM_PADDING);
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
        footer.y = this.application.screen.height - 100;

        footer.beginFill(0x0a1d37);
        footer.drawRect(0, 0, this.application.screen.width, 100);
        footer.endFill();

        const playTextStyle = new PIXI.TextStyle({
            fontSize: 24,
            fontWeight: 'bold',
            fill: 0xFFFFFF
        });

        const playText = new PIXI.Text('START A SPIN', playTextStyle);
        playText.x = Math.round((footer.width - playText.width) / 2);
        playText.y = Math.round((footer.height - playText.height) / 2);
        playText.interactive = true;
        playText.buttonMode = true;
        playText.addListener('click', () => {
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

                spriteForItem.y = ((this.columnPosition + i) % this.items.length) * (ITEM_SIZE + ITEM_PADDING) - (ITEM_SIZE + ITEM_PADDING);

                if (spriteForItem.y < 0 && previousPosition > ITEM_SIZE) {
                    console.log('swap');

                    spriteForItem.texture = this.availableTextures[Math.floor(Math.random() * this.availableTextures.length)];
                }
            }
        });
    }

    private returnLinearInterpolation(start: number, end: number, alpha: number): number {
        return start * (1 - alpha) + end * alpha;
    }

    /* taken from https://github.com/tweenjs/tween.js/blob/master/src/Easing.ts and modified s to fit my needs */
    private bounce (amount: number): number {
        const s = 0.50158
        return amount === 0 ? 0 : --amount * amount * ((s + 1) * amount + s) + 1
    }
}