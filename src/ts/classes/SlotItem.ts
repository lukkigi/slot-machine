import * as PIXI from 'pixi.js';
export class ColumnItem {
  private assetUrl: string;
  private sprite: PIXI.Sprite;

  constructor(texture: PIXI.Texture) {
    this.sprite = new PIXI.Sprite(texture);
  }

  public getSprite(): PIXI.Sprite {
    return this.sprite;
  }

  public setSprite(sprite: PIXI.Sprite): void {
    this.sprite = sprite;
  }
}
