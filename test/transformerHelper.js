// noinspection DuplicatedCode,JSCheckFunctionSignatures

import Konva from '../src/index.ts';

import { textTransformer, shapeTransformer, multipleTransformer } from '../controller/transformer.js';

const latestXY = {};
const latestXYPriority = [];
const allNodeType = ['Group', 'Image', 'Text', 'Star'];
const selectionRectangle = new Konva.Rect({ fill: 'rgb(218,147,243)', visible: false });
let transformerTypeSingle = '';
let transformerTypeFunc = {
    'Group': multipleTransformer,
    'Image': shapeTransformer,
    'Text': textTransformer,
    'Star': shapeTransformer
};

let schedulerFunction = null;


export class TransformerHelper {
    constructor(options) {
        this._stage = options.stage;
        this._container = options.container;
        this.isMultipleSelection = undefined;
        this.initAddContainer(options.container);
        this.initStageOfTransformerEvent(options.stage);
        console.log('UITransformer', this._stage, this._container);
    }


    set isMultipleSelector(isMultiple) {
        this.isMultipleSelection = !!isMultiple;
    }

    initAddContainer(container) {
        console.log(this._container);
        container.add(selectionRectangle);
    }

    initStageOfTransformerEvent(stage) {
        const _this = this;
        stage.on('tap click', function (event) {
            clearTimeout(schedulerFunction);
            schedulerFunction = setTimeout(() => {
                _this.mouseHandlerGlobalTap.bind(_this, event)();
            }, 200);
        });
        stage.on('dbltap dblclick', function (event) {
            clearTimeout(schedulerFunction);
            _this.touchHandlerGlobalDoubleTap.bind(_this, event)();
        });
    }

    touchHandlerGlobalDoubleTap(event) {
        event.evt.preventDefault();
        event.evt.stopPropagation();

        if (event.target === this._stage) return;

        let currentNode = event.target;
        let nodeParent = currentNode.getParent();
        let nodeType = nodeParent.getType() === 'Group' ? nodeParent.getType() : currentNode.getClassName();

        if (nodeType === 'Text') {
            // this._stage.toDispatchEvent('doubleTapText', { target: currentNode });
        } else if (nodeType === 'Image') {
            // this._stage.toDispatchEvent('doubleTapImage', { target: currentNode });
        }
    }

    mouseHandlerGlobalTap(event) {

        // if click on empty area - remove all selections
        if (event.target === this._stage) {
            this.clearTransformer();
            return;
        }

        // do nothing if clicked NOT on our rectangles
        if (!allNodeType.includes(event.target.getClassName())) {
            return;
        }

        const isSelected = [textTransformer, shapeTransformer, multipleTransformer].some(item => {
            return item.nodes().length >= 1;
        });

        // console.log('isSelected', isSelected);
        let currentNode = event.target;
        let nodeParent = currentNode.getParent();
        let nodeType = nodeParent.getType() === 'Group' ? 'Group' : currentNode.getClassName();

        if (nodeType === 'Group') {
            nodeParent.draggable(true);
            this._container.children.filter(item => item.id() !== nodeParent.id()).forEach(node => {
                node.draggable(false);
            });
        } else {
            currentNode.draggable(true);
            this._container.children.filter(item => item.id() !== currentNode.id()).forEach(node => {
                node.draggable(false);
            });
        }

        if (!isSelected) {
            if (this.isMultipleSelection) return this.multipleSelector(currentNode, { 'touch': true });
            this.regenerationTransformer(currentNode);
        } else if (isSelected) {
            if (this.isMultipleSelection) {
                this.clearTransformer();
                return this.multipleSelector(currentNode, { 'touch': true });
            }

            this.switchTransformer(currentNode);
        }
    }

    multipleSelector(node, event) {
        let checkbox;
        let nodeElement = typeof node !== 'string' ? node : this._container.find('#' + node).filter(item => item.getAttr('name') !== 'checkbox')[0];
        let nodeParent = nodeElement.getParent();
        let nodeTarget = nodeParent.getType() === 'Group' ? nodeElement.getParent() : nodeElement;
        let { x, y, width, height } = nodeTarget.getClientRect();

        nodeTarget.draggable(false);
        if (!nodeTarget.getAttr('selected')) {
            checkbox = new Konva.Rect({
                x: x,
                y: y,
                width: width,
                height: height,
                stroke: '#EB0C0C',
                strokeWidth: 2,
                name: 'checkbox'
            });

            checkbox.id(nodeTarget.id());
            checkbox.on('tap click', function () {
                nodeTarget.setAttr('selected', false);
                this.destroy();
            });

            nodeTarget.setAttr('selected', true);
            this._container.add(checkbox);

            // if (event) this._stage.toDispatchEvent('selectedNode', { nodes: [nodeTarget] });
            if (event) this._stage.toDispatchEvent('selectedNode', { target: nodeTarget });
        }

        if (!event && nodeTarget.getAttr('selected')) {
            const checkbox = this._container.find('#' + nodeTarget.id()).filter(item => item.getAttr('name') === 'checkbox');
            nodeTarget.setAttr('selected', false);
            checkbox.length && checkbox[0].destroy();
            // this._stage.toDispatchEvent('cancelSelectedNode', { nodes: [nodeTarget] });
            this._stage.toDispatchEvent('cancelSelectedNode', { target: nodeTarget });
            console.log(checkbox);
        }
    }

    regenerationTransformer(node) {
        let nodeParent = node.getParent();
        let nodeType = nodeParent.getType() === 'Group' ? 'Group' : node.getClassName();

        // console.log(nodeParent, nodeType);
        if (nodeType === 'Group') {
            if (!nodeParent.draggable()) nodeParent.draggable(true);
            transformerTypeFunc['Group'].nodes(nodeParent.children);
            this._stage.toDispatchEvent('selectedNode', { target: nodeParent });
        } else {
            if (!node.draggable()) node.draggable(true);
            transformerTypeSingle = nodeType;
            transformerTypeFunc[nodeType].nodes([node]);
            this._stage.toDispatchEvent('selectedNode', { target: node });
        }

    }

    switchTransformer(node) {
        let nodeParent = node.getParent();
        let nodeType = nodeParent.getType() === 'Group' ? 'Group' : node.getClassName();

        // console.log(nodeParent, nodeType);
        if (nodeType === 'Group') {
            let nodeGroupLength = transformerTypeFunc['Group'].nodes().length;

            if (['Image', 'Text', 'Star'].some(item => item === node.getClassName()) && nodeGroupLength > 1) {
                console.log(node);
                transformerTypeSingle = nodeType;
                transformerTypeFunc['Group'].nodes([]);
                transformerTypeFunc['Group'].nodes([node]);
                this._stage.toDispatchEvent('selectedNode', { target: node });
                return;
            }

            if (!nodeParent.draggable()) nodeParent.draggable(true);
            transformerTypeSingle && transformerTypeFunc[transformerTypeSingle].nodes([]);
            transformerTypeFunc['Group'].nodes(nodeParent.children);
            this._stage.toDispatchEvent('selectedNode', { target: nodeParent });
        } else {
            if (!node.draggable()) node.draggable(true);
            transformerTypeSingle && transformerTypeFunc[transformerTypeSingle].nodes([]);
            transformerTypeSingle = nodeType;
            transformerTypeFunc['Group'].nodes([]);
            transformerTypeFunc[nodeType].nodes([node]);
            this._stage.toDispatchEvent('selectedNode', { target: node });
        }
    }

    clearTransformer() {
        transformerTypeSingle && transformerTypeFunc[transformerTypeSingle].nodes([]);
        transformerTypeSingle || [textTransformer, shapeTransformer, multipleTransformer].forEach(item => item.nodes([]));
        transformerTypeFunc['Group'].nodes([]);
    }

    // currentTransformer(target) {
    //     let group = [textTransformer, shapeTransformer, multipleTransformer];
    //     return group.filter(item => item.nodes()['indexOf'](target) <= 0)[0];
    // }
    //
    // mouseHandlerGlobalDown(event) {
    //     // console.log('mouseHandlerGlobalDown', event, this);
    //     // do nothing if we mousedown on any shape
    //     if (event.target !== this._stage) {
    //         return;
    //     }
    //
    //     event.evt.preventDefault();
    //     // eslint-disable-next-line no-prototype-builtins
    //     if (!latestXY.hasOwnProperty(event.pointerId)) {
    //         const o = {
    //             x1: this._stage.getPointerPosition().x,
    //             y1: this._stage.getPointerPosition().y,
    //             x2: this._stage.getPointerPosition().x,
    //             y2: this._stage.getPointerPosition().y
    //         };
    //         latestXY[event.pointerId] = o;
    //         latestXYPriority.unshift(o);
    //     }
    //
    //     selectionRectangle.visible(true);
    //     selectionRectangle.width(0);
    //     selectionRectangle.height(0);
    // };
    //
    // mouseHandlerGlobalMove(event) {
    //     // console.log('mouseHandlerGlobalMove', event);
    //     // do nothing if we didn't start selection
    //     if (!selectionRectangle.visible()) {
    //         return;
    //     }
    //     event.evt.preventDefault();
    //
    //     const tmpX = this._stage.getPointerPosition().x;
    //     const tmpY = this._stage.getPointerPosition().y;
    //     const o = latestXY[event.pointerId];
    //
    //     selectionRectangle.setAttrs({
    //         x: Math.min(o.x1, tmpX),
    //         y: Math.min(o.y1, tmpY),
    //         width: Math.abs(tmpX - o.x1),
    //         height: Math.abs(tmpY - o.y1)
    //     });
    // };
    //
    // mouseHandlerGlobalUp(event) {
    //     // console.log('mouseHandlerGlobalUp', event);
    //
    //     // do nothing if we didn't start selection
    //     if (!selectionRectangle.visible()) {
    //         return;
    //     }
    //
    //     event.evt.preventDefault();
    //     // update visibility in timeout, so we can check it in click event
    //     setTimeout(() => {
    //         selectionRectangle.visible(false);
    //     });
    //
    //
    //     const Nodes = this._container.find(node => {
    //         return allNodeType.some(name => node.getClassName() === name);
    //     });
    //
    //     const box = selectionRectangle.getClientRect();
    //     const selected = Nodes.filter((shape) => Konva.Util.haveIntersection(box, shape.getClientRect()));
    //
    // };

}
