import {
  InternalDocSearchHit,
  StoredDocSearchHit,
} from '@docsearch/react/dist/esm/types';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

const DocSearch = dynamic(() =>
  import('@docsearch/react').then((mod) => mod.DocSearch)
);

const HitComponent = (props: {
  hit: InternalDocSearchHit | StoredDocSearchHit;
  children: React.ReactNode;
}) => {
  return <Link href={props.hit.url}>{props.children}</Link>;
};

export const ToolbarDoc = () => {
  const router = useRouter();

  return (
    <React.Fragment>
      <DocSearch
        appId="ELH5DZYDRA"
        apiKey="b76ae5f30294a66c17ff98f4a47713ff"
        indexName="reka-js"
        hitComponent={HitComponent}
        navigator={{
          navigate: (params) => {
            router.push(params.itemUrl);
          },
        }}
      />
    </React.Fragment>
  );
};
