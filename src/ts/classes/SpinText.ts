import * as PIXI from 'pixi.js';
import {
  BUTTON_FILL_COLOR,
  BUTTON_FONT_SIZE,
  BUTTON_FONT_WEIGHT,
} from '../constants';

export class SpinText {
  private textObject: PIXI.Text;

  constructor(footer: PIXI.Graphics) {
    this.textObject = new PIXI.Text('START A SPIN', this.createTextStyle());

    this.textObject.x = Math.round((footer.width - this.textObject.width) / 2);
    this.textObject.y = Math.round((footer.height - this.textObject.height) / 2);
    this.textObject.interactive = true;
    this.textObject.buttonMode = true;
  }

  private createTextStyle(): PIXI.TextStyle {
      return new PIXI.TextStyle({
        fontSize: BUTTON_FONT_SIZE,
        fontWeight: BUTTON_FONT_WEIGHT,
        fill: BUTTON_FILL_COLOR,
      });
  }

  public getTextObject(): PIXI.Text {
    return this.textObject;
  }
}
