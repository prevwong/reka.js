import { Html, Head, Main, NextScript } from 'next/document';
import * as React from 'react';

import { getCssText } from '@app/styles';

export default function Document() {
  return (
    <Html>
      <Head>
        <style
          id="stitches"
          dangerouslySetInnerHTML={{ __html: getCssText() }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
