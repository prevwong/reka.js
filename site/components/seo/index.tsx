import Head from 'next/head';
import * as React from 'react';

type SEOProps = {
  title?: string;
  description?: string;
};

export const SEO = (props: SEOProps) => {
  const title = props.title ? `${props.title} | Reka.js` : `Reka.js`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="og:title" content={title} />
      {props.description && (
        <React.Fragment>
          <meta name="og:description" content={props.description} />
          <meta name="description" content={props.description} />
        </React.Fragment>
      )}
    </Head>
  );
};
