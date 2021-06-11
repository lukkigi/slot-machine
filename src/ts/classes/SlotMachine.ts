import * as PIXI from 'pixi.js';

import { ColumnItem } from './SlotItem';
import { Footer } from './Footer';
import { SpinText } from './SpinText';
import { NUMBER_OF_TURNS, ANIMATION_DURATION, APPLICATION_FILL_COLOR, COLUMN_TOP_PADDING, ITEM_SIZE, ASSET_COUNT } from '../constants';
import { bounce, buildAssetPath, getVerticalCoord, getVerticalCoordForNthElement, linearInterpolation } from '../helpers/helpers';

export class SlotMachine {
  private application: PIXI.Application;
  private animationStart: number = undefined;

  private readonly columnWidth: number = window.innerWidth / 5;
  private readonly availableTextures: PIXI.Texture[] = [];
  private readonly items: ColumnItem[] = [];

  constructor() {
    this.initialise();
    this.loadAssets();
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

  private loadAssets() {
    const assetUrls = [];

    for (let i = 0; i < ASSET_COUNT; i++) {
      const assetUrl = buildAssetPath(i);

      if (assetUrl) {
        assetUrls.push(assetUrl);
      }
    }

    this.application.loader.add(assetUrls).load(this.onLoadingFinished.bind(this));
  }

  private onLoadingFinished() {
    this.createTextures();
    this.createColumn();
    this.createPlayButton();
    this.createAnimationTickerFunction();
  }

  private createTextures() {
    const resources = this.application.loader.resources;
    const resourcesKeys = Object.keys(resources);

    for (let i = 0; i < resourcesKeys.length; i++) {
      this.availableTextures.push(PIXI.Texture.from(resources[resourcesKeys[i]].name));
    }
  }

  private createColumn() {
    const column = new PIXI.Graphics();

    column.x = Math.round((this.application.screen.width - this.columnWidth) / 2);
    column.y = -getVerticalCoordForNthElement(1, this.application.screen.height) + COLUMN_TOP_PADDING;

    for (let i = 0; i < this.availableTextures.length; i++) {
      const columnItem = this.createItem(i);

      column.addChild(columnItem.getSprite());

      this.items.push(columnItem);
    }

    this.application.stage.addChild(column);
  }

  private createItem(itemPosition: number): ColumnItem {
    const assetNumber = Math.floor(Math.random() * 100) % ASSET_COUNT;

    const columnItem = new ColumnItem(this.availableTextures[assetNumber]);
    const columnItemSprite = columnItem.getSprite();

    columnItemSprite.y = getVerticalCoordForNthElement(itemPosition, this.application.screen.height);
    columnItemSprite.x = Math.round((this.columnWidth - ITEM_SIZE) / 2);
    columnItemSprite.scale.x = columnItemSprite.scale.y = Math.min(ITEM_SIZE / columnItemSprite.width, ITEM_SIZE / columnItemSprite.height);

    return columnItem;
  }

  private createPlayButton() {
    const footer = new Footer(this.application.screen);
    const spinText = new SpinText(footer.getGraphicsObject());

    // Click does not work on mobile, so I chose pointer events
    spinText.getTextObject().addListener('pointerdown', () => {
      this.animateColumn();
    });

    footer.addText(spinText.getTextObject());

    this.application.stage.addChild(footer.getGraphicsObject());
  }

  /**
   * Sets animationStart to the current time to trigger the animation loop
   */
  private animateColumn(): void {
    this.animationStart = Date.now();
  }

  /**
   * If animationStart is undefined, do not trigger any animation
   *
   * If animation is currently set, that means we have to animate the elements:
   *
   */
  private createAnimationTickerFunction(): void {
    this.application.ticker.add(() => {
      if (!this.animationStart) {
        return;
      }

      // check if the animation duration has been reached and reset animationStart to stop the animation loop
      if (Date.now() - this.animationStart >= ANIMATION_DURATION) {
        this.animationStart = undefined;

        return;
      }

      // calculate the remaining turns to make based on the animation that's left
      const turnsLeft = Math.min(1, (Date.now() - this.animationStart) / ANIMATION_DURATION);

      /**
       * Leveraging our linearInterpolation function, we get interpolated points between the start and end position
       * of our elements based on our calculated turnsLeft before
       */
      const columnPosition = linearInterpolation(0, NUMBER_OF_TURNS, bounce(turnsLeft));

      for (let i = 0; i < this.items.length; i++) {
        const spriteForItem = this.items[i].getSprite();
        const previousPosition = spriteForItem.y;

        /**
         * For each interpolated point we re-position our element, modulo is used so the position does not overflow our max items number
         */
        spriteForItem.y = getVerticalCoordForNthElement((columnPosition + i) % this.items.length, this.application.screen.height);

        /**
         * We have to check if the element goes "over the end" and then swap the texture to a new randomised texture
         * as to avoid having the same pattern of textures every single turn
         */
        if (spriteForItem.y < COLUMN_TOP_PADDING && previousPosition > getVerticalCoord(this.application.screen.height)) {
          spriteForItem.texture = this.availableTextures[Math.floor(Math.random() * this.availableTextures.length)];
        }
      }
    });
  }
}
