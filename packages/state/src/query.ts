import * as t from '@composite/types';
import { Extension } from './extension';

import { State } from './state';

class TemplateQuery {
  query: Query;
  template: t.Template;

  constructor(query: Query, template: t.Template) {
    this.query = query;
    this.template = template;
  }

  get data() {
    return this.template;
  }

  getParent(): TemplateQuery | null {
    const parentType = this.query.state.getParentType(this.template);

    if (!parentType) {
      return null;
    }

    const grandParentType = this.query.state.getParentType(parentType.value);

    if (!grandParentType) {
      return null;
    }

    if (
      Array.isArray(parentType.value) &&
      grandParentType.value instanceof t.Template &&
      grandParentType.key === 'children'
    ) {
      return new TemplateQuery(this.query, grandParentType.value);
    }

    return null;
  }

  get index() {
    const parent = this.getParent();

    if (!parent) {
      return 0;
    }

    return parent.data.children.indexOf(this.data);
  }

  get id() {
    return this.template.id;
  }

  get type() {
    return this.template.type;
  }

  get children() {
    return this.template.children.map(
      (child) => new TemplateQuery(this.query, child)
    );
  }

  get if() {
    return this.template.if;
  }

  get each() {
    return this.template.each;
  }

  get props() {
    return this.template.props;
  }
}

abstract class ComponentQuery<C extends t.Component> {
  query: Query;
  component: C;

  constructor(query: Query, component: C) {
    this.query = query;
    this.component = component;
  }

  get id() {
    return this.component.id;
  }

  get type() {
    return this.component.type;
  }

  abstract getProps(): string[];

  abstract getStates(): Record<string, t.Expression>;

  abstract get template(): TemplateQuery | null;
}

class CompositeComponentQuery extends ComponentQuery<t.CompositeComponent> {
  getProps() {
    return this.component.props.reduce((accum, prop) => {
      return [...accum, prop.name];
    }, [] as string[]);
  }

  getStates() {
    return this.component.state.reduce(
      (accum, state) => ({
        ...accum,
        [state.name]: state.init,
      }),
      {}
    );
  }

  get template() {
    return new TemplateQuery(this.query, this.component.template);
  }
}

class PlaceholderComponentQuery extends ComponentQuery<t.Component> {
  getProps() {
    return [];
  }

  getStates() {
    return {};
  }

  get template() {
    return null;
  }
}

export class Query {
  state: State;

  constructor(state: State) {
    this.state = state;
  }

  get program() {
    return this.state.data.program;
  }

  getTemplateById(id: string) {
    const template = this.state.getTypeFromId(id);

    if (!template || !(template instanceof t.Template)) {
      return;
    }

    return new TemplateQuery(this, template);
  }

  getComponentById(id: string) {
    const component = this.state.allComponents.find(
      (component) => component.id === id
    );

    if (!component) {
      return null;
    }

    if (component instanceof t.CompositeComponent) {
      return new CompositeComponentQuery(this, component);
    }

    return new PlaceholderComponentQuery(this, component);
  }

  getExtensionState<E extends Extension<any>>(extension: E) {
    return this.state.getExtensionState(extension);
  }
}
