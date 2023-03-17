import { Frame } from '@rekajs/core';
import { observer, useReka } from '@rekajs/react';
import * as React from 'react';

import { RenderFrame } from '../Renderer';

export const Preview = observer(() => {
  const { reka } = useReka();

  const [selectedFrame, setSelectedFrame] = React.useState<Frame>(
    reka.frames[0]
  );

  return (
    <div className="w-full h-full flex flex-col text-xs">
      <div className="px-2 py-3 border-b-2">
        <select
          onChange={(e) => {
            const frameId = e.target.value;
            const frame = reka.frames.find((frame) => frame.id === frameId);

            if (!frame) {
              return;
            }

            setSelectedFrame(frame);
          }}
        >
          {reka.frames.map((frame) => (
            <option key={frame.id} value={frame.id}>
              {frame.id}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 px-2 py-2">
        {selectedFrame ? (
          <RenderFrame frame={selectedFrame} />
        ) : (
          <div className="px-3 py-4">No frame selected</div>
        )}
      </div>
    </div>
  );
});
