import { DisposableComputation } from './computation';
import { Environment } from './environment';
import { computeExpression } from './expression';
import { Reka } from './reka';
import { Resolver } from './resolver';

/**
 * Responsible for initialising the root Resolver and Environment
 * and keeping them in sync with the AST
 */
export class Head {
  resolver: Resolver;
  env: Environment;

  private rootHeadComputation: DisposableComputation<void>;
  private globalsEnvComputation: DisposableComputation<void>;
  private componentsEnvComputation: DisposableComputation<void>;
  private cleanupEnvComputation: DisposableComputation<void>;

  constructor(private readonly reka: Reka) {
    this.resolver = new Resolver(reka);
    this.env = new Environment(reka);

    this.globalsEnvComputation = new DisposableComputation(() => {
      this.reka.program.globals.forEach((global) => {
        computeExpression(global, this.reka, this.env);
      });
    });

    this.componentsEnvComputation = new DisposableComputation(() => {
      this.reka.program.components.forEach((component) => {
        this.reka.head.env.set(component.name, {
          value: component,
          readonly: true,
        });
      });
    });

    this.cleanupEnvComputation = new DisposableComputation(() => {
      const globalVarNames = this.reka.program.globals.map(
        (global) => global.name
      );

      const componentNames = this.reka.program.components.map(
        (component) => component.name
      );

      const envBindingNames = [...globalVarNames, ...componentNames];

      for (const key of this.reka.head.env.bindings.keys()) {
        if (typeof key !== 'string') {
          continue;
        }

        if (envBindingNames.indexOf(key) > -1) {
          continue;
        }

        this.reka.head.env.delete(key);
      }
    });

    this.rootHeadComputation = new DisposableComputation(
      () => {
        this.globalsEnvComputation.get();
        this.componentsEnvComputation.get();
        this.cleanupEnvComputation.get();
      },
      {
        keepAlive: true,
      }
    );
  }

  sync() {
    this.resolver.resolve();
    this.rootHeadComputation.get();
  }

  dispose() {
    this.resolver.dispose();
    this.rootHeadComputation.dispose();
  }
}
