import { Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { DiReducer } from '../diReducer/types'; // eslint-disable-line no-unused-vars

export const
  isStr = (val: any): val is string => typeof val === 'string',
  isObj = (val: any): boolean => typeof val === 'object' && !Array.isArray(val) && val !== null,
  isArr = (val: any): boolean => Array.isArray(val),
  // isInt = (val: any): val is number => Number.isInteger(val),
  isFn = (val: any): val is Function => typeof val === 'function',
  isPlainReducer = (val: any): val is Reducer => isFn(val) && !val._rdi, // eslint-disable-line no-underscore-dangle
  isDiReducer = (val: any): val is DiReducer => isFn(val) && isObj(val._rdi); // eslint-disable-line no-underscore-dangle
