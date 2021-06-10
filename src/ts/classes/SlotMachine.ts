import * as PIXI from 'pixi.js';

import { SlotItem } from './SlotItem';
import {
  NUMBER_OF_TURNS,
  ANIMATION_DURATION,
  APPLICATION_FILL_COLOR,
  ASSET_COUNT,
  ASSET_PATH,
  ASSET_SUFFIX,
  BUTTON_FILL_COLOR,
  BUTTON_FONT_SIZE,
  BUTTON_FONT_WEIGHT,
  COLUMN_TOP_PADDING,
  FOOTER_FILL_COLOR,
  FOOTER_SIZE,
  ITEM_SIZE,
  NUMBER_OF_ITEMS,
} from '../constants';
import {
  bounce,
  getVerticalCoord,
  getVerticalCoordForNthElement,
  linearInterpolation,
} from '../helpers/helpers';

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
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: APPLICATION_FILL_COLOR,
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
        new SlotItem(ASSET_PATH + (assetId % ASSET_COUNT) + ASSET_SUFFIX)
      );
    }

    /*
     * Transform the array of items into a Set to filter out duplicates
     * since the loader needs any asset just once
     */
    const assetUrlSet = new Set(this.items.map((item) => item.getAssetUrl()));

    this.application.loader
      .add(Array.from(assetUrlSet))
      .load(this.onLoadingFinished.bind(this));
  }

  private onLoadingFinished() {
    this.createItemsAndColumn();
    this.createPlayButton();
  }

  private createItemsAndColumn() {
    this.availableTextures = this.items.map((item) =>
      PIXI.Texture.from(item.getAssetUrl())
    );

    this.column = new PIXI.Graphics();

    this.column.x = Math.round(
      (this.application.screen.width - this.columnWidth) / 2
    );
    this.column.y = COLUMN_TOP_PADDING;

    for (let i = 0; i < this.availableTextures.length; i++) {
      const symbol = new PIXI.Sprite(this.availableTextures[i]);

      symbol.y = getVerticalCoordForNthElement(i, this.application.screen.height);
      symbol.scale.x = symbol.scale.y = Math.min(
        ITEM_SIZE / symbol.width,
        ITEM_SIZE / symbol.height
      );
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
      fill: BUTTON_FILL_COLOR,
    });

    const playText = new PIXI.Text('START A SPIN', playTextStyle);
    playText.x = Math.round((footer.width - playText.width) / 2);
    playText.y = Math.round((footer.height - playText.height) / 2);
    playText.interactive = true;
    playText.buttonMode = true;

    // Click does not work on mobile, so I chose pointer events
    playText.addListener('pointerdown', () => {
      this.animateColumn();
    });

    footer.addChild(playText);

    this.application.stage.addChild(footer);
  }

  private animateColumn(): void {
    const start = Date.now();

    this.application.ticker.add((delta) => {
      if (Date.now() - start >= ANIMATION_DURATION) {
        return;
      }

      const timeLeft = Math.min(1, (Date.now() - start) / ANIMATION_DURATION);

      this.columnPosition = linearInterpolation(
        0,
        NUMBER_OF_TURNS,
        bounce(timeLeft)
      );

      for (let i = 0; i < this.items.length; i++) {
        const spriteForItem = this.items[i].getSprite();
        const previousPosition = spriteForItem.y;

        spriteForItem.y =
          ((this.columnPosition + i) % this.items.length) *
            getVerticalCoord(this.application.screen.height) -
          getVerticalCoord(this.application.screen.height);

        if (spriteForItem.y < 0 && previousPosition > ITEM_SIZE) {
          spriteForItem.texture =
            this.availableTextures[
              Math.floor(Math.random() * this.availableTextures.length)
            ];
        }
      }
    });
  }
}
