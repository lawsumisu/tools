import * as React from 'react';
import { AnimationRenderer } from 'src/components';
import { FrameDataState } from 'src/redux/frameData';
import FrameDefinitionRenderer from 'src/components/frameDefinitionMapRenderer/components/frameDefinitionRenderer';

interface Props {
  frameKey: string;
  frameData: FrameDataState;
}

export function FrameDefinitionItem({ frameData, frameKey }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="cn--frame-definition-item">
      <div className="frame-definition-item--tab">
        <div onClick={() => setIsOpen(!isOpen)} className="tab--name">
          {frameKey}
        </div>
        <AnimationRenderer frameData={frameData} frameKey={frameKey} />
      </div>
      {isOpen && <FrameDefinitionRenderer definition={frameData.definitionMap[frameKey]} frameKey={frameKey} />}
    </div>
  );
}
