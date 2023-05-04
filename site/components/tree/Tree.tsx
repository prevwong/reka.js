import * as t from '@rekajs/types';
import { safeObjKey } from '@rekajs/utils';
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
      className={cn('entry', {
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

type ElementValueProps = {
  name?: string;
  parent?: t.Type | Array<any> | Record<string, any>;
  isCollapsed?: boolean;
  onToggleClick?: () => void;
  value: t.Type | Record<string, any> | Array<any>;
  shouldCollapseOnInitial?: (type: t.Type, key: string) => boolean;
  renderAs?: (type: t.Type, key: string) => React.ReactNode;
};

const ElementValue = observer((props: ElementValueProps) => {
  let valueOutput: React.ReactElement | null = null;
  let content: React.ReactElement | null = null;
  let prefix: string | null = null;
  let suffix: string | null = null;

  function renderChild(key: string, value: any, parent: any) {
    if (typeof value === 'function') {
      return <PrimitiveElement key={key} name={key} value={'Function()'} />;
    }

    if (value === undefined) {
      return <PrimitiveElement key={key} name={key} value={'undefined'} />;
    }

    if (value === null) {
      return <PrimitiveElement key={key} name={key} value={'null'} />;
    }

    if (value === true || value === false) {
      return (
        <PrimitiveElement
          key={key}
          name={key}
          value={value ? 'true' : 'false'}
        />
      );
    }

    if (Array.isArray(value) || typeof value === 'object') {
      return (
        <Element
          key={key}
          name={key}
          value={value}
          parent={parent}
          showName={Array.isArray(parent) === false}
          renderAs={props.renderAs}
          shouldCollapseOnInitial={props.shouldCollapseOnInitial}
        />
      );
    }

    return <PrimitiveElement key={key} name={key} value={value} />;
  }

  if (props.value && typeof props.value === 'object') {
    // Render a useful name for object like nodes
    if (props.value instanceof t.Type) {
      const nodeName = props.value.type;

      valueOutput = (
        <span className="tokenName font-medium" onClick={props.onToggleClick}>
          {nodeName} <span style={{ fontSize: '12px' }}>{' = $node'}</span>
        </span>
      );
    }

    if (Array.isArray(props.value)) {
      if (props.value.length > 0 && !props.isCollapsed) {
        prefix = '[';
        suffix = ']';
        const node = props.value;
        const elements = props.value
          .filter(({ key }) => key !== 'length')
          .map((value, key) => renderChild(key.toString(), value, node));

        content = <ul className="value-body">{elements}</ul>;
      } else {
        valueOutput = (
          <span>
            {valueOutput}
            <span className="value-container">
              {'['}
              {props.value.length > 0 ? '...' : ''}
              {']'}
            </span>
          </span>
        );
      }
    } else {
      const node = props.value;

      let keys: string[] = [];

      if (node instanceof t.Type) {
        const schema = t.Schema.get(node.type);
        keys = ['id', ...schema.fields.map((field) => field.name)];
      } else {
        keys = Object.keys(node);
      }

      if (!props.isCollapsed) {
        prefix = '{';
        suffix = '}';

        const elements: any[] = keys.map((key) =>
          renderChild(key, node[key as keyof typeof node], node)
        );

        content = <ul className="value-body">{elements}</ul>;
      } else {
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
      }
    }
  }

  return (
    <React.Fragment>
      <span className="value">{valueOutput}</span>
      {prefix ? (
        <span className="prefix value-container">&nbsp;{prefix}</span>
      ) : null}
      {content}
      {suffix ? <div className="suffix value-container">{suffix}</div> : null}
    </React.Fragment>
  );
});

type ElementProps = {
  name?: string;
  showName?: boolean;
  value: any;
  parent?: t.Type | Array<any> | Record<string, any>;
  renderAs?: (node: t.Type, key: string) => React.ReactNode;
  shouldCollapseOnInitial?: (node: t.Type, key: string) => boolean;
};

const Element = observer(
  ({
    name,
    showName = true,
    value,
    shouldCollapseOnInitial,
    renderAs,
    parent,
  }: ElementProps) => {
    const domRef = React.useRef<HTMLLIElement | null>(null);

    const initialCollapsed =
      name &&
      parent instanceof t.Type &&
      shouldCollapseOnInitial &&
      shouldCollapseOnInitial(parent, name);

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

    const onToggleClick = React.useCallback(() => {
      setIsCollapsed(!isCollapsed);
    }, [isCollapsed, setIsCollapsed]);

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

    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
      const { current: dom } = domRef;

      if (!dom) {
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        const [entry] = entries;

        if (entry.intersectionRatio >= 0) {
          setIsVisible(true);
          observer.unobserve(dom);
          observer.disconnect();
        }
      });

      observer.observe(dom);

      return () => {
        observer.unobserve(dom);
        observer.disconnect();
      };
    }, [setIsVisible]);

    let renderedValue: React.ReactNode = null;

    if (renderAs && value instanceof t.Type) {
      renderedValue = renderAs(value, name || '') || null;
    }

    if (!renderedValue) {
      renderedValue = (
        <ElementValue
          name={name}
          parent={parent}
          onToggleClick={onToggleClick}
          value={value}
          shouldCollapseOnInitial={shouldCollapseOnInitial}
          renderAs={renderAs}
          isCollapsed={isCollapsed}
        />
      );
    }

    return (
      <li
        ref={domRef}
        className={cn({
          entry: true,
          toggable: true,
          open: !isCollapsed,
          ...(name
            ? { [`property-${createSafeObjKey(name)}`]: name !== undefined }
            : {}),
        })}
      >
        <span>
          {name !== undefined && showName && (
            <PropertyName name={name} onClick={onToggleClick} />
          )}
          {isVisible && renderedValue}
        </span>
      </li>
    );
  }
);

type TreeProps = {
  root: t.Type | undefined;
  shouldCollapseOnInitial?: (node: t.Type, key: string) => boolean;
  renderAs?: (node: t.Type, key: string) => React.ReactNode;
  className?: string;
};

export const Tree = observer(
  ({ root, shouldCollapseOnInitial, className, renderAs }: TreeProps) => {
    if (!root) {
      return null;
    }

    return (
      <div className={cn('tree-viewer', className)}>
        <ul>
          <Element
            value={root}
            shouldCollapseOnInitial={shouldCollapseOnInitial}
            renderAs={renderAs}
          />
        </ul>
      </div>
    );
  }
);
