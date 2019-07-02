
export type SelPath = (string|number)[];

export type AppSel<S extends {} = {}, R = any> = {
  (appState: S): R,
  _path: SelPath,
};
