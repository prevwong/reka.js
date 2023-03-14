import * as t from '@rekajs/types';
import { safeObjKey } from '@rekajs/utils';
import cx from 'classnames';
import { IObservable, IObservableArray, isObservable, observe } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { cn } from '@app/utils';

const PropertyName = ({ name, onClick }: any) => {
  return (
    <span className="key">
      <span className="property-name" onClick={onClick}>
        {name}
      </span>
      <span className="property-colon">:&nbsp;</span>
    </span>
  );
};

type PrimitiveElementProps = {
  name: string;
  value: any;
};

const PrimitiveElement = observer(({ name, value }: PrimitiveElementProps) => {
  return (
    <li
      className={cx('entry', {
        [`property-${name}`]: name !== undefined,
      })}
    >
      {name ? <PropertyName name={name} /> : null}
      <span className="value">
        <span className="primitive-value">
          {value === undefined ? '-' : value}
        </span>
      </span>
    </li>
  );
});

const COLLAPSIBLE_STATE = new WeakMap();

const createSafeObjKey = (str: string) => {
  return safeObjKey(str).replaceAll(/\/|\*/g, '--');
};

const Element = observer(
  ({
    name,
    showName = true,
    value,
    initialCollapsed,
    shouldCollapseOnInitial,
  }: any) => {
    const domRef = React.useRef<HTMLLIElement | null>(null);

    const [isCollapsed, _setIsCollapsed] = React.useState(
      COLLAPSIBLE_STATE.get(value) !== undefined
        ? COLLAPSIBLE_STATE.get(value)
        : initialCollapsed
    );

    const setIsCollapsed = React.useCallback(
      (bool: boolean) => {
        _setIsCollapsed(bool);
        COLLAPSIBLE_STATE.set(value, bool);
      },
      [_setIsCollapsed, value]
    );

    const isOpen = React.useMemo(() => !isCollapsed, [isCollapsed]);

    let valueOutput: React.ReactElement | null = null;
    let content: React.ReactElement | null = null;
    let prefix: string | null = null;
    let suffix: string | null = null;

    let showToggler = false;

    const onToggleClick = React.useCallback(() => {
      setIsCollapsed(!isCollapsed);
    }, [isCollapsed, setIsCollapsed]);

    function renderChild(key: string, value: any, parent: any, name: string) {
      if (typeof value === 'function') {
        return <PrimitiveElement key={key} name={name} value={'Function()'} />;
      }

      if (value === true || value === false) {
        return (
          <PrimitiveElement
            key={key}
            name={name}
            value={value ? 'true' : 'false'}
          />
        );
      }

      if (Array.isArray(value) || typeof value === 'object') {
        return (
          <Element
            key={key}
            name={name}
            value={value}
            showName={Array.isArray(parent) === false}
            shouldCollapseOnInitial={shouldCollapseOnInitial}
            initialCollapsed={
              parent instanceof t.Type &&
              shouldCollapseOnInitial &&
              shouldCollapseOnInitial(parent, key)
            }
          />
        );
      }

      return <PrimitiveElement key={key} name={name} value={value} />;
    }

    const selected = true;

    if (value && typeof value === 'object') {
      // Render a useful name for object like nodes
      if (value instanceof t.Type) {
        const nodeName = value.type;

        valueOutput = (
          <span className="tokenName font-medium" onClick={onToggleClick}>
            {nodeName}{' '}
            {selected ? (
              <span style={{ fontSize: '12px' }}>{' = $node'}</span>
            ) : null}
          </span>
        );
      }

      if (Array.isArray(value)) {
        if (value.length > 0 && isOpen) {
          prefix = '[';
          suffix = ']';
          const node = value;
          const elements = value
            .filter(({ key }) => key !== 'length')
            .map((value, key) =>
              renderChild(key.toString(), value, node, key.toString())
            );

          content = <ul className="value-body">{elements}</ul>;
        } else {
          valueOutput = (
            <span>
              {valueOutput}
              <span className="value-container">
                {'['}
                {value.length > 0 ? '...' : ''}
                {']'}
              </span>
            </span>
          );
        }
        showToggler = value.length > 0;
      } else {
        const node = value;

        let keys: string[] = [];

        if (node instanceof t.Type) {
          const schema = t.Schema.get(node.type);
          keys = ['id', ...schema.fields.map((field) => field.name)];
        } else {
          keys = Object.keys(node);
        }

        if (isOpen) {
          prefix = '{';
          suffix = '}';

          const elements: any[] = keys.map((key) =>
            renderChild(key, node[key], node, key)
          );

          content = <ul className="value-body">{elements}</ul>;
          showToggler = true;
        } else {
          // let keys = Array.from(treeAdapter.walkNode(value), ({ key }) => key);
          valueOutput = (
            <span>
              {valueOutput}
              <span className="value-container">
                {' {'}
                {keys.length > 0 ? '...' : ''}
                {'}'}
              </span>
            </span>
          );
          showToggler = true;
        }
      }
    }

    React.useEffect(() => {
      const { current: dom } = domRef;

      if (!dom) {
        return;
      }

      if (!isObservable(value)) {
        return;
      }

      const change = (key: string) => {
        const child =
          key === 'self'
            ? dom
            : dom.querySelector(`.property-${createSafeObjKey(key)}`);

        if (!child) {
          return;
        }

        child.classList.add('change');

        window.requestAnimationFrame(() => {
          setTimeout(() => {
            child.classList.remove('change');
          }, 100);
        });
      };

      if (Array.isArray(value)) {
        return observe(value as IObservableArray, () => {
          change('self');
        });
      }

      return observe(value as IObservable, (e) => {
        change(e.name.toString());
      });
    }, [value]);

    return (
      <li
        ref={domRef}
        className={cx({
          entry: true,
          toggable: showToggler,
          open: isOpen,
          ...(name
            ? { [`property-${createSafeObjKey(name)}`]: name !== undefined }
            : {}),
        })}
      >
        <span>
          {name !== undefined && showName && (
            <PropertyName name={name} onClick={onToggleClick} />
          )}
          <span className="value">{valueOutput}</span>
          {prefix ? (
            <span className="prefix value-container">&nbsp;{prefix}</span>
          ) : null}
          {content}
          {suffix ? (
            <div className="suffix value-container">{suffix}</div>
          ) : null}
        </span>
      </li>
    );
  }
);

type TreeProps = {
  root: t.Type | undefined;
  shouldCollapseOnInitial?: boolean;
  className?: string;
};

export const Tree = observer(
  ({ root, shouldCollapseOnInitial, className }: TreeProps) => {
    if (!root) {
      return null;
    }

    return (
      <div className={cn('tree-viewer', className)}>
        <ul>
          <Element
            value={root}
            shouldCollapseOnInitial={shouldCollapseOnInitial}
          />
        </ul>
      </div>
    );
  }
);
