/* @flow */

import type { Dependencies, Map } from './types';
import { makeError } from './utils';

export class DiChanges {
  /*::#*/changes: Map<boolean> = {};
  /*::#*/yesValue: boolean = false;

  constructor(prevDeps: Dependencies, nextDeps: Dependencies) {
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
