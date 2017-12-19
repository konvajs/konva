(function(Konva) {
  'use strict';
  Konva.Resizer = function(config) {
    this.____init(config);
  };

  Konva.Resizer.prototype = {
    _centroid: false,
    ____init: function(config) {
      // call super constructor
      Konva.Group.call(this, config);
      this.className = 'Resizer';
      this._createElements();
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this._update = this._update.bind(this);
    },

    attachTo: function(node) {
      this._el = node;
      this._update();
      this._el.on('dragmove', this._update);
      //     this._set();
    },

    _createElements: function() {
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
        offsetY: 5
      });
      var self = this;
      anchor.on('mousedown touchstart', function(e) {
        self.handleResizerMouseDown(e);
      });

      // add hover styling
      anchor.on('mouseover', function() {
        var layer = this.getLayer();
        document.body.style.cursor = 'pointer';
        this.setStrokeWidth(4);
        layer.draw();
      });
      anchor.on('mouseout', function() {
        var layer = this.getLayer();
        document.body.style.cursor = 'default';
        this.setStrokeWidth(2);
        layer.draw();
      });
      this.add(anchor);
    },

    handleResizerMouseDown: function(e) {
      this.movingResizer = e.target.name();

      var width = this._el.width() * this._el.scaleX();
      var height = this._el.height() * this._el.scaleY();
      var hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
      this.sin = height / hypotenuse;
      this.cos = width / hypotenuse;

      //     console.log(1, hypotenuse);
      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('touchmove', this.handleMouseMove);
      window.addEventListener('mouseup', this.handleMouseUp);
      window.addEventListener('touchend', this.handleMouseUp);
    },

    handleMouseMove: function(e) {
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
        var newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.bottom-right').x() - resizerNode.x(), 2) +
            Math.pow(this.findOne('.bottom-right').y() - resizerNode.y(), 2)
        );

        //       console.log(2, newHypotenuse);
        var x = newHypotenuse * this.cos;
        var y = newHypotenuse * this.sin;

        //       console.log(this.findOne('.bottom-right').x() - x);

        this.findOne('.top-left').x(this.findOne('.bottom-right').x() - x);
        this.findOne('.top-left').y(this.findOne('.bottom-right').y() - y);
      } else if (this.movingResizer === 'top-center') {
        this.findOne('.top-left').y(resizerNode.y());
      } else if (this.movingResizer === 'top-right') {
        var newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.bottom-left').x() - resizerNode.x(), 2) +
            Math.pow(this.findOne('.bottom-left').y() - resizerNode.y(), 2)
        );

        var x = newHypotenuse * this.cos;
        var y = newHypotenuse * this.sin;

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
        var newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.top-right').x() - resizerNode.x(), 2) +
            Math.pow(this.findOne('.top-right').y() - resizerNode.y(), 2)
        );

        var x = newHypotenuse * this.cos;
        var y = newHypotenuse * this.sin;

        this.findOne('.bottom-left').x(this.findOne('.top-right').x() - x);
        this.findOne('.bottom-left').y(y);

        var pos = resizerNode.position();

        this.findOne('.top-left').x(pos.x);
        this.findOne('.bottom-right').y(pos.y);
      } else if (this.movingResizer === 'bottom-center') {
        this.findOne('.bottom-right').y(resizerNode.y());
      } else if (this.movingResizer === 'bottom-right') {
        var newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.bottom-right').x(), 2) +
            Math.pow(this.findOne('.bottom-right').y(), 2)
        );

        var x = newHypotenuse * this.cos;
        var y = newHypotenuse * this.sin;

        this.findOne('.bottom-right').x(x);
        this.findOne('.bottom-right').y(y);
      } else if (this.movingResizer === 'rotater') {
        var x = resizerNode.x() - this._el.width() * this._el.scaleX() / 2;
        var y = -resizerNode.y() + this._el.height() * this._el.scaleY() / 2;

        var dAlpha = Math.atan2(-y, x) + Math.PI / 2;
        var attrs = this._getAttrs();

        var newRotation = this.rotation() + dAlpha / Math.PI * 180;
        // console.log(newRotation);

        // if (this._el._centroid) {
        //   this._setElementAttrs({
        //     rotation: newRotation
        //   });
        // }
        var alpha = Konva.Util._degToRad(this._el.rotation());
        var newAlpha = Konva.Util._degToRad(newRotation);

        this._setElementAttrs(
          Object.assign(attrs, {
            rotation: newRotation,
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

      var layer = resizerNode.getLayer();
      var absPos = this.findOne('.top-left').getAbsolutePosition();

      var x = Math.round(absPos.x);
      var y = Math.round(absPos.y);
      var width = Math.round(
        this.findOne('.bottom-right').x() - this.findOne('.top-left').x()
      );

      var height = Math.round(
        this.findOne('.bottom-right').y() - this.findOne('.top-left').y()
      );

      var pos = {
        x: this._el._centroid ? x + width / 2 : x,
        y: this._el._centroid ? y + height / 2 : y,
        width: width,
        height: height
      };

      this._setElementAttrs(pos);
    },

    handleMouseUp: function() {
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('touchmove', this.handleMouseMove);
      window.removeEventListener('mouseup', this.handleMouseUp);
      window.removeEventListener('touchend', this.handleMouseUp);
    },

    _getAttrs: function() {
      if (this._el._centroid) {
        var topLeftResizer = this.findOne('.top-left');
        var absPos = topLeftResizer.getAbsolutePosition();
        console.log(absPos);

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
      if (attrs.rotation) {
        this._el.setAttrs({
          rotation: attrs.rotation,
          x: attrs.x,
          y: attrs.y
        });
      } else {
        var scaleX = attrs.width / this._el.width();
        var scaleY = attrs.height / this._el.height();

        this._el.setAttrs({
          x: attrs.x,
          y: attrs.y,
          scaleX: scaleX,
          scaleY: scaleY
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

      this.get('.top-left')[0].position({
        x: 0,
        y: 0
      });
      this.get('.top-center')[0].position({
        x: width / 2,
        y: 0
      });
      this.get('.top-right')[0].position({
        x: width,
        y: 0
      });
      this.get('.middle-left')[0].position({
        x: 0,
        y: height / 2
      });
      this.get('.middle-right')[0].position({
        x: width,
        y: height / 2
      });
      this.get('.bottom-left')[0].position({
        x: 0,
        y: height
      });
      this.get('.bottom-center')[0].position({
        x: width / 2,
        y: height
      });
      this.get('.bottom-right')[0].position({
        x: width,
        y: height
      });

      this.get('.rotater')[0].position({
        x: width / 2,
        y: -50
      });
    }
  };
  Konva.Util.extend(Konva.Resizer, Konva.Group);

  Konva.Collection.mapMethods(Konva.Resizer);
})(Konva);
