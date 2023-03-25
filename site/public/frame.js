let isTailwindLoaded = false;
let isInitialViewRended = false;

const animate = (cb, duration) => {
  const _animate = () => {
    window.requestAnimationFrame((time) => {
      if (time <= duration) {
        _animate();
        return;
      }

      cb();
    });
  };

  _animate();
};

const verify = () => {
  if (!isTailwindLoaded || !isInitialViewRended) {
    return;
  }

  const content = document.getElementById('root');
  const preloader = document.getElementById('preloader');

  animate(() => {
    if (content && preloader) {
      content.style.display = 'block';
      preloader.style.display = 'none';
    }

    window.requestAnimationFrame(() => {
      window.parent.postMessage(
        {
          REKA_CONTENT_LOADED: true,
        },
        '*'
      );
    });
  }, 1000);
};

const withVerify = (cb) => {
  cb();
  verify();
};

const setup = () => {
  const script = document.createElement('script');
  script.setAttribute('async', true);
  script.setAttribute('src', 'https://cdn.tailwindcss.com');
  document.head.appendChild(script);
  script.addEventListener('load', () => {
    withVerify(() => {
      isTailwindLoaded = true;
    });
  });

  const content = document.querySelector('#root');

  if (!content) {
    return;
  }

  const verifyHasContent = () => {
    const hasContent = content.childNodes.length > 0;

    if (!hasContent) {
      return false;
    }

    withVerify(() => {
      isInitialViewRended = true;
    });

    return true;
  };

  if (verifyHasContent()) {
    return;
  }

  if (!window.MutationObserver) {
    withVerify(() => {
      isInitialViewRended = true;
    });

    return;
  }

  const observer = new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      if (mutation.type !== 'childList') {
        continue;
      }

      if (!verifyHasContent()) {
        continue;
      }

      observer.disconnect();
      break;
    }
  });

  observer.observe(content, {
    childList: true,
  });
};

setup();
