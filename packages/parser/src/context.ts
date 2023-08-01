export class TokContext {
  constructor(readonly contextName: string) {}
}

export const tc_val_prop = new TokContext('val-prop');
export const tc_kind = new TokContext('kind');
export const tc_component = new TokContext('component');
export const tc_component_prop_start = new TokContext('component-prop-start');
export const tc_component_prop_end = new TokContext('component-prop-end');
export const tc_component_tmpl = new TokContext('component-template');
export const tc_element_open_tag = new TokContext('<el');
export const tc_element_close_tag = new TokContext('</el');
export const tc_element_expr = new TokContext('<el>{}</el>');
