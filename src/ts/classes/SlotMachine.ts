import * as PIXI from 'pixi.js';

import { ColumnItem } from './SlotItem';
import { Footer } from './Footer';
import { SpinText } from './SpinText';
import {
  NUMBER_OF_TURNS,
  ANIMATION_DURATION,
  APPLICATION_FILL_COLOR,
  COLUMN_TOP_PADDING,
  ITEM_SIZE,
  ASSET_COUNT,
} from '../constants';
import {
  bounce,
  buildAssetPath,
  getVerticalCoord,
  getVerticalCoordForNthElement,
  linearInterpolation,
} from '../helpers/helpers';

export class SlotMachine {
  private application: PIXI.Application;

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
      assetUrls.push(buildAssetPath(i));
    }

    this.application.loader
      .add(assetUrls)
      .load(this.onLoadingFinished.bind(this));
  }

  private onLoadingFinished() {
    this.createTextures();
    this.createColumn();
    this.createPlayButton();
  }

  private createTextures() {
    const resources = this.application.loader.resources;
    const resourcesKeys = Object.keys(resources);

    for (let i = 0; i < resourcesKeys.length; i++) {
      this.availableTextures.push(
        PIXI.Texture.from(resources[resourcesKeys[i]].name)
      );
    }
  }

  private createColumn() {
    const column = new PIXI.Graphics();

    column.x = Math.round(
      (this.application.screen.width - this.columnWidth) / 2
    );
    column.y = COLUMN_TOP_PADDING;

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

    columnItemSprite.y = getVerticalCoordForNthElement(
      itemPosition,
      this.application.screen.height
    );
    columnItemSprite.x = Math.round((this.columnWidth - ITEM_SIZE) / 2);
    columnItemSprite.scale.x = columnItemSprite.scale.y = Math.min(
      ITEM_SIZE / columnItemSprite.width,
      ITEM_SIZE / columnItemSprite.height
    );

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

  private animateColumn(): void {
    const start = Date.now();

    // TODO: do not duplicate this every single animation
    this.application.ticker.add(() => {
      if (Date.now() - start >= ANIMATION_DURATION) {
        return;
      }

      const timeLeft = Math.min(1, (Date.now() - start) / ANIMATION_DURATION);

      const columnPosition = linearInterpolation(
        0,
        NUMBER_OF_TURNS,
        bounce(timeLeft)
      );

      for (let i = 0; i < this.items.length; i++) {
        const spriteForItem = this.items[i].getSprite();
        const previousPosition = spriteForItem.y;

        spriteForItem.y =
          ((columnPosition + i) % this.items.length) *
            getVerticalCoord(this.application.screen.height) -
          getVerticalCoord(this.application.screen.height);

        if (
          spriteForItem.y < 0 &&
          previousPosition > getVerticalCoord(this.application.screen.height)
        ) {
          spriteForItem.texture =
            this.availableTextures[
              Math.floor(Math.random() * this.availableTextures.length)
            ];
        }
      }
    });
  }
}
