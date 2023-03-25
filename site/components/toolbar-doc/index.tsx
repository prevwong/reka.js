import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import * as React from 'react';

const DocSearch = dynamic(() =>
  import('@docsearch/react').then((mod) => mod.DocSearch)
);

export const ToolbarDoc = () => {
  const router = useRouter();

  return (
    <React.Fragment>
      <DocSearch
        appId="ELH5DZYDRA"
        apiKey="b76ae5f30294a66c17ff98f4a47713ff"
        indexName="reka-js"
        navigator={{
          navigate: (params) => {
            router.push(params.itemUrl);
          },
        }}
      />
    </React.Fragment>
  );
};
