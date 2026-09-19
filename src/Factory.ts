import type { Node } from './Node.ts';
import type { GetSet } from './types.ts';
import { Util } from './Util.ts';
import { getComponentValidator } from './Validators.ts';

const GET = 'get';
const SET = 'set';

/**
 * Enforces that a type is a string.
 */
type EnforceString<T> = T extends string ? T : never;

/**
 * Represents a class.
 */
type Constructor = abstract new (...args: any) => any;

/**
 * An attribute of an instance of the provided class. Attributes names be strings.
 */
type Attr<T extends Constructor> = EnforceString<keyof InstanceType<T>>;

/**
 * A function that is called after a setter is called.
 */
type AfterFunc<T extends Constructor> = (this: InstanceType<T>) => void;

/**
 * Extracts the type of a GetSet.
 */
type ExtractGetSet<T> = T extends GetSet<infer U, any> ? U : never;

/**
 * Extracts the type of a GetSet class attribute.
 */
type Value<T extends Constructor, U extends Attr<T>> = ExtractGetSet<
  InstanceType<T>[U]
>;

/**
 * A function that validates a value.
 */
type ValidatorFunc<T> = (val: T, attr: string) => T;

/**
 * Extracts the "components" (keys) of a GetSet value. The value must be an object.
 */
type ExtractComponents<T extends Constructor, U extends Attr<T>> =
  Value<T, U> extends Record<string, any>
    ? EnforceString<keyof Value<T, U>>[]
    : never;

export const Factory = {
  addGetterSetter<T extends Constructor, U extends Attr<T>>(
    constructor: T,
    attr: U,
    def?: Value<T, U>,
    validator?: ValidatorFunc<Value<T, U>>,
    after?: AfterFunc<T>
  ): void {
    Factory.addGetter(constructor, attr, def);
    Factory.addSetter(constructor, attr, validator, after);
    Factory.addOverloadedGetterSetter(constructor, attr);
  },
  addGetter<T extends Constructor, U extends Attr<T>>(
    constructor: T,
    attr: U,
    def?: Value<T, U>
  ) {
    const method = GET + Util._capitalize(attr);

    const getter: any = function (this: Node) {
      const val = this.attrs[attr];
      return val === undefined ? def : val;
    };
    // toObject() compares an attr with the default of the generated getter
    getter._def = def;

    constructor.prototype[method] = constructor.prototype[method] || getter;
  },

  addSetter<T extends Constructor, U extends Attr<T>>(
    constructor: T,
    attr: U,
    validator?: ValidatorFunc<Value<T, U>>,
    after?: AfterFunc<T>
  ) {
    const method = SET + Util._capitalize(attr);

    if (!constructor.prototype[method]) {
      Factory.overWriteSetter(constructor, attr, validator, after);
    }
  },

  overWriteSetter<T extends Constructor, U extends Attr<T>>(
    constructor: T,
    attr: U,
    validator?: ValidatorFunc<Value<T, U>>,
    after?: AfterFunc<T>
  ) {
    const method = SET + Util._capitalize(attr);
    constructor.prototype[method] = function (val) {
      if (validator && val !== undefined && val !== null) {
        val = validator.call(this, val, attr);
      }

      this._setAttr(attr, val);

      if (after) {
        after.call(this);
      }

      return this;
    };
  },

  addComponentsGetterSetter<T extends Constructor, U extends Attr<T>>(
    constructor: T,
    attr: U,
    components: ExtractComponents<T, U>,
    validator?: ValidatorFunc<Value<T, U>>,
    after?: AfterFunc<T>
  ) {
    const len = components.length,
      capitalize = Util._capitalize,
      getter = GET + capitalize(attr),
      setter = SET + capitalize(attr),
      keys = components.map((c) => attr + capitalize(c)),
      // built-in components have their own getters, e.g. getOffsetX
      getters = keys.map((key) => GET + capitalize(key));

    // getter
    constructor.prototype[getter] = function () {
      const ret: Record<string, any> = {};

      for (let n = 0; n < len; n++) {
        const get = this[getters[n]];
        ret[components[n]] = get ? get.call(this) : this.attrs[keys[n]];
      }

      return ret;
    };

    const basicValidator = getComponentValidator(components);

    // setter
    constructor.prototype[setter] = function (val) {
      const oldVal = this.attrs[attr];

      if (validator) {
        val = validator.call(this, val, attr);
      }

      if (basicValidator) {
        basicValidator.call(this, val, attr);
      }

      for (const key in val) {
        if (!val.hasOwnProperty(key)) {
          continue;
        }
        this._setAttr(attr + capitalize(key), val[key]);
      }
      if (!val) {
        components.forEach((component) => {
          this._setAttr(attr + capitalize(component), undefined);
        });
      }

      this._fireChangeEvent(attr, oldVal, val);

      if (after) {
        after.call(this);
      }

      return this;
    };

    Factory.addOverloadedGetterSetter(constructor, attr);
  },
  addOverloadedGetterSetter<T extends Constructor, U extends Attr<T>>(
    constructor: T,
    attr: U
  ) {
    const capitalizedAttr = Util._capitalize(attr),
      setter = SET + capitalizedAttr,
      getter = GET + capitalizedAttr;

    const accessor = function () {
      // setting
      if (arguments.length) {
        this[setter](arguments[0]);
        return this;
      }
      // getting
      return this[getter]();
    };
    constructor.prototype[attr] = accessor;
  },
  backCompat<T extends Constructor>(
    constructor: T,
    methods: Record<string, string>
  ) {
    Util.each(methods, function (oldMethodName, newMethodName) {
      const method = constructor.prototype[newMethodName];
      const oldGetter = GET + Util._capitalize(oldMethodName);
      const oldSetter = SET + Util._capitalize(oldMethodName);

      function deprecated(this: Node) {
        Util.error(
          '"' +
            oldMethodName +
            '" method is deprecated and will be removed soon. Use ""' +
            newMethodName +
            '" instead.'
        );
        return method.apply(this, arguments);
      }

      constructor.prototype[oldMethodName] = deprecated;
      constructor.prototype[oldGetter] = deprecated;
      constructor.prototype[oldSetter] = deprecated;
    });
  },
  afterSetFilter(this: Node): void {
    this._filterUpToDate = false;
  },
};
