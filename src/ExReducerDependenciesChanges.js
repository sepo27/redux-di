/* @flow */

import type { ExReducerDependencies, Map } from './types';
import { makeError } from './utils';

export class ExReducerDependenciesChanges {
  /*::#*/changes: Map<boolean> = {};
  /*::#*/yesValue: boolean = false;

  constructor(prevDeps: ExReducerDependencies, nextDeps: ExReducerDependencies) {
    Object.keys(prevDeps).forEach(prop => {
      const changed = prevDeps[prop] !== nextDeps[prop];
      this./*::#*/changes[prop] = changed;
      if (changed) this./*::#*/yesValue = this./*::#*/yesValue || true;
    });
  }

  yes(): boolean { return this./*::#*/yesValue; }

  no(): boolean { return !this.yes(); }

  for(key: string): boolean {
    if (this./*::#*/changes[key] === undefined) {
      throw makeError(`Change for '${key}' is undefined.`);
    }
    return this./*::#*/changes[key];
  }
}
