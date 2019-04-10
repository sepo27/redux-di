const sanitizeMessage = message => message
  .trim()
  .replace(/\n\s+/g, '\n');

export class ReduxDiError extends Error {
  constructor(message) {
    super(sanitizeMessage(message));
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

// export class RdiCircularDependencyError extends ReduxDiError {
//   constructor(dependenciesCircle: string[]) {
//     let circleMsg = dependenciesCircle.join(' -> ');
//     if (circleMsg.length > 100) circleMsg = `\n${dependenciesCircle.join(' -> \n')}`;
//
//     super(`Circular dependency detected: ${circleMsg}`);
//   }
// }
