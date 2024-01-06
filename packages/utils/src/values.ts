export const isObjectLiteral = (t: any) => {
  return !!t && 'object' === typeof t && t.constructor === Object;
};
