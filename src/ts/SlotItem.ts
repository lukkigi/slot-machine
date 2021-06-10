import * as PIXI from "pixi.js";

export class SlotItem {
    private assetUrl: string;
    private sprite: PIXI.Sprite;

    constructor(assetUrl: string) {
        this.assetUrl = assetUrl;
    }

    public getAssetUrl(): string {
        return this.assetUrl;
    }

    public getSprite(): PIXI.Sprite {
        return this.sprite;
    }

    public setSprite(sprite: PIXI.Sprite): void {
        this.sprite = sprite;
    }
}