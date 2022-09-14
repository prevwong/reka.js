import * as t from '@composite/types';

import { makeObservable, observable, action, computed } from 'mobx';

type ComponentSettingsRoute = {
  type: 'component';
  component: t.Component;
};

type TemplateSettingsRoute = {
  type: 'template';
  template: t.Template;
};

export type SettingsRoute = ComponentSettingsRoute | TemplateSettingsRoute;

export class SettingsPageStore {
  paths: SettingsRoute[];

  constructor() {
    this.paths = [];

    makeObservable(this, {
      paths: observable,
      goTo: action,
      goBack: action,
      current: computed,
    });
  }

  get current() {
    return this.paths[this.paths.length - 1];
  }

  goTo(route: SettingsRoute) {
    return this.paths.push(route);
  }

  goBack(depth?: number) {
    if (depth === undefined) {
      this.paths.pop();
      return;
    }

    while (this.paths.length > depth) {
      this.paths.pop();
    }
  }
}
