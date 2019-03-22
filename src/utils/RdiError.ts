
export class RdiError extends Error {
  constructor(message) {
    super(`RDI: ${message}`);
    this.name = this.constructor.name;
    // @ts-ignore
    if (typeof Error.captureStackTrace === 'function') {
      // @ts-ignore
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export class RdiCircularDependencyError extends RdiError {
  constructor(dependenciesCircle: string[]) {
    let circleMsg = dependenciesCircle.join(' -> ');
    if (circleMsg.length > 100) circleMsg = `\n${dependenciesCircle.join(' -> \n')}`;

    super(`Circular dependency detected: ${circleMsg}`);
  }
}
