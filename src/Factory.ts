import { Node } from './Node';
import { GetSet } from './types';
import { Util } from './Util';
import { getComponentValidator } from './Validators';

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
type ValidatorFunc<T> = (val: ExtractGetSet<T>, attr: string) => T;

/**
 * Extracts the "components" (keys) of a GetSet value. The value must be an object.
 */
type ExtractComponents<T extends Constructor, U extends Attr<T>> = Value<
  T,
  U
> extends Record<string, any>
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

    constructor.prototype[method] =
      constructor.prototype[method] ||
      function (this: Node) {
        const val = this.attrs[attr];
        return val === undefined ? def : val;
      };
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
      setter = SET + capitalize(attr);

    // getter
    constructor.prototype[getter] = function () {
      const ret: Record<string, any> = {};

      for (let n = 0; n < len; n++) {
        const component = components[n];
        ret[component] = this.getAttr(attr + capitalize(component));
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

    constructor.prototype[attr] = function () {
      // setting
      if (arguments.length) {
        this[setter](arguments[0]);
        return this;
      }
      // getting
      return this[getter]();
    };
  },
  addDeprecatedGetterSetter<T extends Constructor, U extends Attr<T>>(
    constructor: T,
    attr: U,
    def: Value<T, U>,
    validator: ValidatorFunc<Value<T, U>>
  ) {
    Util.error('Adding deprecated ' + attr);

    const method = GET + Util._capitalize(attr);

    const message =
      attr +
      ' property is deprecated and will be removed soon. Look at Konva change log for more information.';
    constructor.prototype[method] = function () {
      Util.error(message);
      const val = this.attrs[attr];
      return val === undefined ? def : val;
    };
    Factory.addSetter(constructor, attr, validator, function () {
      Util.error(message);
    });
    Factory.addOverloadedGetterSetter(constructor, attr);
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
        method.apply(this, arguments);
        Util.error(
          '"' +
            oldMethodName +
            '" method is deprecated and will be removed soon. Use ""' +
            newMethodName +
            '" instead.'
        );
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
