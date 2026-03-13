// TypeScript type test for event delegation
// This file tests that the new event delegation overload works correctly

import Konva from '../../src/index';

// Create a stage and layer for testing
const stage = new Konva.Stage({
  container: 'container',
  width: 500,
  height: 500,
});

const layer = new Konva.Layer();
stage.add(layer);

// Test 1: Basic event listener (2 parameters) - should compile without errors
layer.on('click', function (evt) {
  console.log(evt.target);
  console.log(evt.currentTarget);
});

// Test 2: Event delegation (3 parameters) - this is the fix for the issue
// This should now compile without TypeScript errors
layer.on('click', 'Group', function (evt) {
  // evt.target should be Shape | Stage
  const shape = evt.target;
  // evt.currentTarget should be Node
  const group = evt.currentTarget;
  console.log(shape, group);
});

// Test 3: Multiple events with handler
layer.on('click touchstart', function (evt) {
  console.log('Event type:', evt.type);
});

// Test 4: Namespaced events
layer.on('click.foo', function (evt) {
  console.log('Namespaced event');
});

// Test 5: Event delegation with namespace
layer.on('click.bar', 'Circle', function (evt) {
  console.log('Delegated namespaced event');
});

export {};
