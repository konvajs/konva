import { Util } from './Util';
import { Container, ContainerConfig } from './Container';
import { _registerNode } from './Global';
import { Node } from './Node';
import { Shape } from './Shape';
import { Group, GroupConfig } from './Group';
import { HitCanvas, SceneCanvas } from './Canvas';

export interface AbsoluteRenderOrderGroupConfig extends GroupConfig { }

/**
 * AbsoluteRenderOrderGroup constructor.  AbsoluteRenderOrderGroup is a special kind of Group that renders all of its
 * children and subchildren recursively, in the order of the z-order parameter.
 * 
 * In order to maintain masking behavior, cached groups are respected and treated as a single object at the group's 
 * designated z-order.
 * @constructor
 * @memberof Konva
 * @augments Konva.Container
 * @param {Object} config
 * @@nodeParams
 * @@containerParams
 * @example
 * var group = new Konva.Group();
 */
export class AbsoluteRenderOrderGroup extends Group {
	_validateAdd(child: Node) {
		var type = child.getType();
		if (type !== 'Group' && type !== 'Shape') {
			Util.throw('You may only add groups and shapes to groups.');
		}
	}

	_drawChildren(drawMethod, canvas, top) {
		var context = canvas && canvas.getContext(),
			clipWidth = this.clipWidth(),
			clipHeight = this.clipHeight(),
			clipFunc = this.clipFunc(),
			hasClip = (clipWidth && clipHeight) || clipFunc;

		const selfCache = top === this;

		if (hasClip) {
			context.save();
			var transform = this.getAbsoluteTransform(top);
			var m = transform.getMatrix();
			context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
			context.beginPath();
			if (clipFunc) {
				clipFunc.call(this, context, this);
			} else {
				var clipX = this.clipX();
				var clipY = this.clipY();
				context.rect(clipX, clipY, clipWidth, clipHeight);
			}
			context.clip();
			m = transform.copy().invert().getMatrix();
			context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
		}

		var hasComposition =
			!selfCache &&
			this.globalCompositeOperation() !== 'source-over' &&
			drawMethod === 'drawScene';

		if (hasComposition) {
			context.save();
			context._applyGlobalCompositeOperation(this);
		}

		// AbsoluteRenderOrderGroup differs from the standard container by ordering its children itself, instead of
		// letting children call each.

		let unorderedChildren = new Map<number, Node[]>();

		// Add all children recursively to orderedChildren
		this.addChildrenRecursivelyToMap(this, unorderedChildren);

		// Sort children by zOrder
		// ( https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object )
		let orderedChildren = new Map<number, Node[]>([...unorderedChildren].sort(
			(a, b) => 
			{ 
				if (a[0] > b[0])
					return 1;
				else if (a[0] == b[0])
					return 0;
				else
					return -1;
			})); 

		// Draw children in zOrder
		for (const [zOrder, nodeArray] of orderedChildren) 
		{
			//console.log("Drawing " + zOrder);
			for (const node of nodeArray) 
			{
				//console.log(node)
				node[drawMethod](canvas, top);
				//console.log(node.toString())
			}
		}


		if (hasComposition) {
			context.restore();
		}

		if (hasClip) {
			context.restore();
		}
	}

	private addChildrenRecursivelyToMap(node:Node, orderedChildren:Map<number, Array<Node>>):void
	{
		let rootNode:AbsoluteRenderOrderGroup = this;

		if (node == rootNode || // the AbsoluteRenderOrderGroup itself will always render using z-order logic, even if cached
			(node instanceof Group && !node.isCached())) { // However, cached subgroups are considered to be just a regular object (this protects masking)
			(node as Group).children?.forEach(function (child) {
				rootNode.addChildrenRecursivelyToMap(child, orderedChildren);
			});
		} else {
			// Is a leaf / don't descend farther -- this can be added to children map
			// Determine zOrder
			let zOrder:number = node.evaluateZOrderRecursively();

			// Add zOrder if needed
			if (!orderedChildren.has(zOrder))
			{
				orderedChildren.set(zOrder, new Array<Node>());
			}

			// Add to the correct bucket of zOrders
			orderedChildren.get(zOrder).push(node); // I'd much prefer the [] syntax for clarity, but seems TS/JS doesn't seem to support it, ugh.
		}
	}
}

//AbsoluteRenderOrderGroup.prototype.nodeType = 'AbsoluteRenderOrderGroup';
// Node type appears to be either Shape or Group, so it doesn't seem like this should be set if we mirror how Shapes work?

AbsoluteRenderOrderGroup.prototype.className = 'AbsoluteRenderOrderGroup';
_registerNode(AbsoluteRenderOrderGroup);
