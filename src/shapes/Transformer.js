(function(Konva) {
  'use strict';
  Konva.Transformer = function(config) {
    this.____init(config);
  };

  Konva.Transformer.prototype = {
    _centroid: false,
    ____init: function(config) {
      // call super constructor
      Konva.Group.call(this, config);
      this.className = 'Transformer';
      this._createElements();
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this._update = this._update.bind(this);
    },

    attachTo: function(node) {
      this._el = node;
      this._update();
      this._el.on('dragmove.resizer', this._update);
      //     this._set();
    },

    _createElements: function() {
      this._createBack();

      this._createAnchor('top-left');
      this._createAnchor('top-center');
      this._createAnchor('top-right');

      this._createAnchor('middle-right');
      this._createAnchor('middle-left');

      this._createAnchor('bottom-left');
      this._createAnchor('bottom-center');
      this._createAnchor('bottom-right');

      this._createAnchor('rotater');
    },

    _createAnchor: function(name) {
      var anchor = new Konva.Rect({
        stroke: 'rgb(0, 161, 255)',
        fill: 'white',
        strokeWidth: 1,
        name: name,
        width: 10,
        height: 10,
        offsetX: 5,
        offsetY: 5,
        draggable: true,
        dragDistance: 0
      });
      var self = this;
      anchor.on('mousedown touchstart', function(e) {
        self.handleResizerMouseDown(e);
      });

      // add hover styling
      anchor.on('mouseover', function() {
        var layer = this.getLayer();
        anchor.getStage().getContainer().style.cursor = 'pointer';
        this.setStrokeWidth(4);
        layer.draw();
      });
      anchor.on('mouseout', function() {
        var layer = this.getLayer();
        if (!layer) {
          return;
        }
        anchor.getStage().getContainer().style.cursor = '';
        this.setStrokeWidth(1);
        layer.draw();
      });
      this.add(anchor);
    },

    _createBack: function() {
      var back = new Konva.Shape({
        stroke: 'rgb(0, 161, 255)',
        name: 'back',
        width: 0,
        height: 0,
        listening: false,
        sceneFunc: function(ctx) {
          ctx.beginPath();
          ctx.rect(0, 0, this.width(), this.height());
          ctx.moveTo(this.width() / 2, 0);
          ctx.lineTo(this.width() / 2, -this.rotateHandlerOffset());
          ctx.fillStrokeShape(this);
        }
      });
      this.add(back);
    },

    handleResizerMouseDown: function(e) {
      this.movingResizer = e.target.name();

      var width = this._el.width() * this._el.scaleX();
      var height = this._el.height() * this._el.scaleY();
      var hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
      this.sin = height / hypotenuse;
      this.cos = width / hypotenuse;

      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('touchmove', this.handleMouseMove);
      window.addEventListener('mouseup', this.handleMouseUp);
      window.addEventListener('touchend', this.handleMouseUp);
    },

    handleMouseMove: function(e) {
      var x, y, newHypotenuse;
      var resizerNode = this.findOne('.' + this.movingResizer);
      var stage = resizerNode.getStage();

      var box = stage.getContent().getBoundingClientRect();
      var zeroPoint = {
        x: box.left,
        y: box.top
      };
      var pointerPos = {
        left: e.clientX !== undefined ? e.clientX : e.touches[0].clientX,
        top: e.clientX !== undefined ? e.clientY : e.touches[0].clientY
      };
      var newAbsPos = {
        x: pointerPos.left - zeroPoint.x,
        y: pointerPos.top - zeroPoint.y
      };

      resizerNode.setAbsolutePosition(newAbsPos);

      if (this.movingResizer === 'top-left') {
        newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.bottom-right').x() - resizerNode.x(), 2) +
            Math.pow(this.findOne('.bottom-right').y() - resizerNode.y(), 2)
        );

        x = newHypotenuse * this.cos;
        y = newHypotenuse * this.sin;

        this.findOne('.top-left').x(this.findOne('.bottom-right').x() - x);
        this.findOne('.top-left').y(this.findOne('.bottom-right').y() - y);
      } else if (this.movingResizer === 'top-center') {
        this.findOne('.top-left').y(resizerNode.y());
      } else if (this.movingResizer === 'top-right') {
        newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.bottom-left').x() - resizerNode.x(), 2) +
            Math.pow(this.findOne('.bottom-left').y() - resizerNode.y(), 2)
        );

        x = newHypotenuse * this.cos;
        y = newHypotenuse * this.sin;

        this.findOne('.top-right').x(x);
        this.findOne('.top-right').y(this.findOne('.bottom-left').y() - y);
        var pos = resizerNode.position();

        this.findOne('.top-left').y(pos.y);
        this.findOne('.bottom-right').x(pos.x);
      } else if (this.movingResizer === 'middle-left') {
        this.findOne('.top-left').x(resizerNode.x());
      } else if (this.movingResizer === 'middle-right') {
        this.findOne('.bottom-right').x(resizerNode.x());
      } else if (this.movingResizer === 'bottom-left') {
        newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.top-right').x() - resizerNode.x(), 2) +
            Math.pow(this.findOne('.top-right').y() - resizerNode.y(), 2)
        );

        x = newHypotenuse * this.cos;
        y = newHypotenuse * this.sin;

        this.findOne('.bottom-left').x(this.findOne('.top-right').x() - x);
        this.findOne('.bottom-left').y(y);

        pos = resizerNode.position();

        this.findOne('.top-left').x(pos.x);
        this.findOne('.bottom-right').y(pos.y);
      } else if (this.movingResizer === 'bottom-center') {
        this.findOne('.bottom-right').y(resizerNode.y());
      } else if (this.movingResizer === 'bottom-right') {
        newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.bottom-right').x(), 2) +
            Math.pow(this.findOne('.bottom-right').y(), 2)
        );

        x = newHypotenuse * this.cos;
        y = newHypotenuse * this.sin;

        this.findOne('.bottom-right').x(x);
        this.findOne('.bottom-right').y(y);
      } else if (this.movingResizer === 'rotater') {
        x = resizerNode.x() - this._el.width() * this._el.scaleX() / 2;
        y = -resizerNode.y() + this._el.height() * this._el.scaleY() / 2;

        var dAlpha = Math.atan2(-y, x) + Math.PI / 2;
        var attrs = this._getAttrs();

        var rot = Konva.getAngle(this.rotation());

        var newRotation =
          Konva.Util._radToDeg(rot) + Konva.Util._radToDeg(dAlpha);

        var alpha = Konva.getAngle(this._el.rotation());
        var newAlpha = Konva.Util._degToRad(newRotation);

        var snaps = this.rotationSnaps();
        var offset = 0.1;
        for (var i = 0; i < snaps.length; i++) {
          var angle = Konva.getAngle(snaps[i]);

          var dif =
            Math.abs(angle - Konva.Util._degToRad(newRotation)) % (Math.PI * 2);

          if (dif < offset) {
            newRotation = Konva.Util._radToDeg(angle);
            newAlpha = Konva.Util._degToRad(newRotation);
          }
        }

        this._setElementAttrs(
          Object.assign(attrs, {
            rotation: Konva.angleDeg
              ? newRotation
              : Konva.Util._degToRad(newRotation),
            x:
              attrs.x +
              attrs.width / 2 * (Math.cos(alpha) - Math.cos(newAlpha)) +
              attrs.height / 2 * (Math.sin(-alpha) - Math.sin(-newAlpha)),
            y:
              attrs.y +
              attrs.height / 2 * (Math.cos(alpha) - Math.cos(newAlpha)) +
              attrs.width / 2 * (Math.sin(alpha) - Math.sin(newAlpha))
          })
        );
      } else {
        console.error(
          new Error(
            'Wrong position argument of selection resizer: ',
            this.movingResizer
          )
        );
      }

      if (this.movingResizer === 'rotater') {
        return;
      }

      var absPos = this.findOne('.top-left').getAbsolutePosition();

      x = absPos.x;
      y = absPos.y;
      var width =
        this.findOne('.bottom-right').x() - this.findOne('.top-left').x();

      var height =
        this.findOne('.bottom-right').y() - this.findOne('.top-left').y();

      this._setElementAttrs({
        absX: this._el._centroid ? x + width / 2 : x,
        absY: this._el._centroid ? y + height / 2 : y,
        width: width,
        height: height
      });
    },

    handleMouseUp: function() {
      this.fire('transformend');
      this._el.fire('transformend');
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('touchmove', this.handleMouseMove);
      window.removeEventListener('mouseup', this.handleMouseUp);
      window.removeEventListener('touchend', this.handleMouseUp);
    },

    _getAttrs: function() {
      if (this._el._centroid) {
        var topLeftResizer = this.findOne('.top-left');
        var absPos = topLeftResizer.getAbsolutePosition();

        return {
          x: absPos.x,
          y: absPos.y,
          width: this._el.width() * this._el.scaleX(),
          height: this._el.height() * this._el.scaleY()
        };
      }
      return {
        x: this._el.x(),
        y: this._el.y(),
        width: this._el.width() * this._el.scaleX(),
        height: this._el.height() * this._el.scaleY()
      };
    },

    _setElementAttrs: function(attrs) {
      if (attrs.rotation !== undefined) {
        this._el.setAttrs({
          rotation: attrs.rotation,
          x: attrs.x,
          y: attrs.y
        });
      } else {
        var scaleX = attrs.width / this._el.width();
        var scaleY = attrs.height / this._el.height();

        this._el.setAttrs({
          scaleX: scaleX,
          scaleY: scaleY
        });

        this._el.setAbsolutePosition({
          x: attrs.absX,
          y: attrs.absY
        });
      }
      this._update();
      this.getLayer().batchDraw();
    },
    _update: function() {
      var x = this._el.x();
      var y = this._el.y();
      var width = this._el.width() * this._el.scaleX();
      var height = this._el.height() * this._el.scaleY();
      this.x(x);
      this.y(y);
      this.rotation(this._el.rotation());

      if (this._el._centroid) {
        this.offset({
          x: width / 2,
          y: height / 2
        });
      }

      var keepRatio = this.keepRatio();
      var resizeEnabled = this.resizeEnabled();

      this.findOne('.top-left').setAttrs({
        x: 0,
        y: 0,
        visible: resizeEnabled
      });
      this.findOne('.top-center').setAttrs({
        x: width / 2,
        y: 0,
        visible: resizeEnabled && !keepRatio
      });
      this.findOne('.top-right').setAttrs({
        x: width,
        y: 0,
        visible: resizeEnabled
      });
      this.findOne('.middle-left').setAttrs({
        x: 0,
        y: height / 2,
        visible: resizeEnabled && !keepRatio
      });
      this.findOne('.middle-right').setAttrs({
        x: width,
        y: height / 2,
        visible: resizeEnabled && !keepRatio
      });
      this.findOne('.bottom-left').setAttrs({
        x: 0,
        y: height,
        visible: resizeEnabled
      });
      this.findOne('.bottom-center').setAttrs({
        x: width / 2,
        y: height,
        visible: resizeEnabled && !keepRatio
      });
      this.findOne('.bottom-right').setAttrs({
        x: width,
        y: height,
        visible: resizeEnabled
      });

      this.findOne('.rotater').setAttrs({
        x: width / 2,
        y: -this.rotateHandlerOffset()
      });

      this.findOne('.back').setAttrs({
        width: width,
        height: height
      });
    },
    destroy: function() {
      Konva.Group.prototype.destroy.call(this);
      this._el.off('.resizer');
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('touchmove', this.handleMouseMove);
      window.removeEventListener('mouseup', this.handleMouseUp);
      window.removeEventListener('touchend', this.handleMouseUp);
    }
  };
  Konva.Util.extend(Konva.Transformer, Konva.Group);

  Konva.Factory.addGetterSetter(Konva.Transformer, 'keepRatio', false);
  Konva.Factory.addGetterSetter(Konva.Transformer, 'resizeEnabled', true);
  Konva.Factory.addGetterSetter(Konva.Transformer, 'rotationSnaps', []);
  Konva.Factory.addGetterSetter(Konva.Transformer, 'rotateHandlerOffset', 50);

  Konva.Collection.mapMethods(Konva.Transformer);
})(Konva);
