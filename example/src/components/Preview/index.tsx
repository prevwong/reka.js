import { observer, useCollector } from '@composite/react';
import * as t from '@composite/types';
import * as React from 'react';

import { Renderer, RenderFrame } from '../Renderer';

const FRAMES = [
  {
    id: 'Main App',
    component: {
      name: 'App',
      props: {},
    },
  },
  {
    id: 'Primary Button',
    component: {
      name: 'Button',
      props: {
        text: t.literal({ value: 'A Primary Button!' }),
      },
    },
  },
];
export const Preview = observer(() => {
  const { composite } = useCollector();

  const [selectedFrameId, setSelectedFrameId] = React.useState<string | null>(
    FRAMES[0].id
  );

  const selectedFrame = React.useMemo(() => {
    return FRAMES.find((frame) => frame.id === selectedFrameId);
  }, [selectedFrameId]);

  const selectedCompositeFrame = React.useMemo(() => {
    if (!selectedFrame) {
      return;
    }

    let compositeFrame = composite.frames.find(
      (frame) => frame.id === selectedFrame.id
    );

    if (!compositeFrame) {
      compositeFrame = composite.createFrame(selectedFrame);
    }

    return compositeFrame;
  }, [selectedFrame]);

  return (
    <div className="w-full h-full flex flex-col text-xs">
      <div className="px-2 py-2 border-b-2">
        <select
          onChange={(e) => {
            setSelectedFrameId(e.target.value);
          }}
        >
          {FRAMES.map((frame) => (
            <option key={frame.id} value={frame.id}>
              {frame.id}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 px-2 py-2">
        {selectedCompositeFrame ? (
          <RenderFrame frame={selectedCompositeFrame} />
        ) : (
          <div className="px-3 py-4">No frame selected</div>
        )}
      </div>
    </div>
  );
});
