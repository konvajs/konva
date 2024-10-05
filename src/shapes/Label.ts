import { Factory } from '../Factory';
import { Shape, ShapeConfig } from '../Shape';
import { Group } from '../Group';
import { Context } from '../Context';
import { ContainerConfig } from '../Container';
import {
  getNumberOrArrayOfNumbersValidator,
  getNumberValidator,
} from '../Validators';
import { _registerNode } from '../Global';

import { GetSet } from '../types';
import { Text } from './Text';

export interface LabelConfig extends ContainerConfig {}

// constants
const ATTR_CHANGE_LIST = [
    'fontFamily',
    'fontSize',
    'fontStyle',
    'padding',
    'lineHeight',
    'text',
    'width',
    'height',
    'pointerDirection',
    'pointerWidth',
    'pointerHeight',
  ],
  CHANGE_KONVA = 'Change.konva',
  NONE = 'none',
  UP = 'up',
  RIGHT = 'right',
  DOWN = 'down',
  LEFT = 'left',
  // cached variables
  attrChangeListLen = ATTR_CHANGE_LIST.length;

/**
 * Label constructor.&nbsp; Labels are groups that contain a Text and Tag shape
 * @constructor
 * @memberof Konva
 * @param {Object} config
 * @@nodeParams
 * @example
 * // create label
 * var label = new Konva.Label({
 *   x: 100,
 *   y: 100,
 *   draggable: true
 * });
 *
 * // add a tag to the label
 * label.add(new Konva.Tag({
 *   fill: '#bbb',
 *   stroke: '#333',
 *   shadowColor: 'black',
 *   shadowBlur: 10,
 *   shadowOffset: [10, 10],
 *   shadowOpacity: 0.2,
 *   lineJoin: 'round',
 *   pointerDirection: 'up',
 *   pointerWidth: 20,
 *   pointerHeight: 20,
 *   cornerRadius: 5
 * }));
 *
 * // add text to the label
 * label.add(new Konva.Text({
 *   text: 'Hello World!',
 *   fontSize: 50,
 *   lineHeight: 1.2,
 *   padding: 10,
 *   fill: 'green'
 *  }));
 */
export class Label extends Group {
  constructor(config?: LabelConfig) {
    super(config);
    this.on('add.konva', function (evt) {
      this._addListeners(evt.child);
      this._sync();
    });
  }

  /**
   * get Text shape for the label.  You need to access the Text shape in order to update
   * the text properties
   * @name Konva.Label#getText
   * @method
   * @example
   * label.getText().fill('red')
   */
  getText() {
    return this.find<Text>('Text')[0];
  }
  /**
   * get Tag shape for the label.  You need to access the Tag shape in order to update
   * the pointer properties and the corner radius
   * @name Konva.Label#getTag
   * @method
   */
  getTag() {
    return this.find('Tag')[0] as Tag;
  }
  _addListeners(text) {
    let that = this,
      n;
    const func = function () {
      that._sync();
    };

    // update text data for certain attr changes
    for (n = 0; n < attrChangeListLen; n++) {
      text.on(ATTR_CHANGE_LIST[n] + CHANGE_KONVA, func);
    }
  }
  getWidth() {
    return this.getText().width();
  }
  getHeight() {
    return this.getText().height();
  }
  _sync() {
    let text = this.getText(),
      tag = this.getTag(),
      width,
      height,
      pointerDirection,
      pointerWidth,
      x,
      y,
      pointerHeight;

    if (text && tag) {
      width = text.width();
      height = text.height();
      pointerDirection = tag.pointerDirection();
      pointerWidth = tag.pointerWidth();
      pointerHeight = tag.pointerHeight();
      x = 0;
      y = 0;

      switch (pointerDirection) {
        case UP:
          x = width / 2;
          y = -1 * pointerHeight;
          break;
        case RIGHT:
          x = width + pointerWidth;
          y = height / 2;
          break;
        case DOWN:
          x = width / 2;
          y = height + pointerHeight;
          break;
        case LEFT:
          x = -1 * pointerWidth;
          y = height / 2;
          break;
      }

      tag.setAttrs({
        x: -1 * x,
        y: -1 * y,
        width: width,
        height: height,
      });

      text.setAttrs({
        x: -1 * x,
        y: -1 * y,
      });
    }
  }
}

Label.prototype.className = 'Label';
_registerNode(Label);

export interface TagConfig extends ShapeConfig {
  pointerDirection?: string;
  pointerWidth?: number;
  pointerHeight?: number;
  cornerRadius?: number | Array<number>;
}

/**
 * Tag constructor.&nbsp; A Tag can be configured
 *  to have a pointer element that points up, right, down, or left
 * @constructor
 * @memberof Konva
 * @param {Object} config
 * @param {String} [config.pointerDirection] can be up, right, down, left, or none; the default
 *  is none.  When a pointer is present, the positioning of the label is relative to the tip of the pointer.
 * @param {Number} [config.pointerWidth]
 * @param {Number} [config.pointerHeight]
 * @param {Number} [config.cornerRadius]
 */
export class Tag extends Shape<TagConfig> {
  _sceneFunc(context: Context) {
    const width = this.width(),
      height = this.height(),
      pointerDirection = this.pointerDirection(),
      pointerWidth = this.pointerWidth(),
      pointerHeight = this.pointerHeight(),
      cornerRadius = this.cornerRadius();

    let topLeft = 0;
    let topRight = 0;
    let bottomLeft = 0;
    let bottomRight = 0;

    if (typeof cornerRadius === 'number') {
      topLeft =
        topRight =
        bottomLeft =
        bottomRight =
          Math.min(cornerRadius, width / 2, height / 2);
    } else {
      topLeft = Math.min(cornerRadius[0] || 0, width / 2, height / 2);
      topRight = Math.min(cornerRadius[1] || 0, width / 2, height / 2);
      bottomRight = Math.min(cornerRadius[2] || 0, width / 2, height / 2);
      bottomLeft = Math.min(cornerRadius[3] || 0, width / 2, height / 2);
    }

    context.beginPath();
    context.moveTo(topLeft, 0);

    if (pointerDirection === UP) {
      context.lineTo((width - pointerWidth) / 2, 0);
      context.lineTo(width / 2, -1 * pointerHeight);
      context.lineTo((width + pointerWidth) / 2, 0);
    }

    context.lineTo(width - topRight, 0);
    context.arc(
      width - topRight,
      topRight,
      topRight,
      (Math.PI * 3) / 2,
      0,
      false
    );

    if (pointerDirection === RIGHT) {
      context.lineTo(width, (height - pointerHeight) / 2);
      context.lineTo(width + pointerWidth, height / 2);
      context.lineTo(width, (height + pointerHeight) / 2);
    }

    context.lineTo(width, height - bottomRight);
    context.arc(
      width - bottomRight,
      height - bottomRight,
      bottomRight,
      0,
      Math.PI / 2,
      false
    );

    if (pointerDirection === DOWN) {
      context.lineTo((width + pointerWidth) / 2, height);
      context.lineTo(width / 2, height + pointerHeight);
      context.lineTo((width - pointerWidth) / 2, height);
    }

    context.lineTo(bottomLeft, height);
    context.arc(
      bottomLeft,
      height - bottomLeft,
      bottomLeft,
      Math.PI / 2,
      Math.PI,
      false
    );

    if (pointerDirection === LEFT) {
      context.lineTo(0, (height + pointerHeight) / 2);
      context.lineTo(-1 * pointerWidth, height / 2);
      context.lineTo(0, (height - pointerHeight) / 2);
    }

    context.lineTo(0, topLeft);
    context.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);

    context.closePath();
    context.fillStrokeShape(this);
  }
  getSelfRect() {
    let x = 0,
      y = 0,
      pointerWidth = this.pointerWidth(),
      pointerHeight = this.pointerHeight(),
      direction = this.pointerDirection(),
      width = this.width(),
      height = this.height();

    if (direction === UP) {
      y -= pointerHeight;
      height += pointerHeight;
    } else if (direction === DOWN) {
      height += pointerHeight;
    } else if (direction === LEFT) {
      // ARGH!!! I have no idea why should I used magic 1.5!!!!!!!!!
      x -= pointerWidth * 1.5;
      width += pointerWidth;
    } else if (direction === RIGHT) {
      width += pointerWidth * 1.5;
    }
    return {
      x: x,
      y: y,
      width: width,
      height: height,
    };
  }

  pointerDirection: GetSet<'left' | 'top' | 'right' | 'bottom' | 'up' | 'down', this>;
  pointerWidth: GetSet<number, this>;
  pointerHeight: GetSet<number, this>;
  cornerRadius: GetSet<number, this>;
}

Tag.prototype.className = 'Tag';
_registerNode(Tag);

/**
 * get/set pointer direction
 * @name Konva.Tag#pointerDirection
 * @method
 * @param {String} pointerDirection can be up, right, down, left, or none.  The default is none.
 * @returns {String}
 * @example
 * tag.pointerDirection('right');
 */
Factory.addGetterSetter(Tag, 'pointerDirection', NONE);

/**
 * get/set pointer width
 * @name Konva.Tag#pointerWidth
 * @method
 * @param {Number} pointerWidth
 * @returns {Number}
 * @example
 * tag.pointerWidth(20);
 */
Factory.addGetterSetter(Tag, 'pointerWidth', 0, getNumberValidator());

/**
 * get/set pointer height
 * @method
 * @name Konva.Tag#pointerHeight
 * @param {Number} pointerHeight
 * @returns {Number}
 * @example
 * tag.pointerHeight(20);
 */

Factory.addGetterSetter(Tag, 'pointerHeight', 0, getNumberValidator());

/**
 * get/set cornerRadius
 * @name Konva.Tag#cornerRadius
 * @method
 * @param {Number} cornerRadius
 * @returns {Number}
 * @example
 * tag.cornerRadius(20);
 *
 * // set different corner radius values
 * // top-left, top-right, bottom-right, bottom-left
 * tag.cornerRadius([0, 10, 20, 30]);
 */

Factory.addGetterSetter(
  Tag,
  'cornerRadius',
  0,
  getNumberOrArrayOfNumbersValidator(4)
);
