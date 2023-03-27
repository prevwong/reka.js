type CachedProperties = {
  scrollY: number;
  width: number;
  domX: number;
  domY: number;
  domWidth: number;
  domHeight: number;
};

export class CachedAnimationFrameCallback {
  id = Math.random();

  properties: CachedProperties;

  private isDisposed: boolean;
  private lastAnimationId?: number;

  constructor(
    private readonly iframe: HTMLIFrameElement,
    private readonly dom: HTMLElement,
    private readonly cb: () => void
  ) {
    this.properties = {
      scrollY: -1,
      width: -1,
      domX: -1,
      domY: -1,
      domWidth: -1,
      domHeight: -1,
    };

    this.isDisposed = false;
    this.animate();
  }

  listener() {
    if (!this.hasChanged()) {
      return;
    }

    this.cb();
  }

  animate() {
    if (this.isDisposed) {
      return;
    }

    this.listener();

    this.lastAnimationId = window.requestAnimationFrame(() => {
      this.animate();
    });
  }

  private hasChanged() {
    const domRect = this.dom.getBoundingClientRect();

    const propertiesMap: CachedProperties = {
      scrollY: this.iframe.contentWindow?.scrollY ?? 0,
      width: this.iframe.offsetWidth,
      domX: domRect.x,
      domY: domRect.y,
      domWidth: domRect.width,
      domHeight: domRect.height,
    };

    let hasChanged: boolean = false;

    for (const _key in propertiesMap) {
      const key = _key as keyof CachedProperties;

      if (this.properties[key] === propertiesMap[key]) {
        continue;
      }

      this.properties[key] = propertiesMap[key];
      hasChanged = true;
    }

    return hasChanged;
  }

  dispose() {
    if (this.lastAnimationId !== undefined) {
      window.cancelAnimationFrame(this.lastAnimationId);
    }

    this.isDisposed = true;
  }

  static requestAnimationFrame(
    iframe: HTMLIFrameElement,
    dom: HTMLElement,
    cb: () => void
  ) {
    return new CachedAnimationFrameCallback(iframe, dom, cb);
  }
}
