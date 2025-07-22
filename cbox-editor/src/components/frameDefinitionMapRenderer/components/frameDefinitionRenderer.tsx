import { AnimationFrameConfig, FrameDefinition } from 'src/utilities/frame.util';
import * as React from 'react';
import * as _ from 'lodash';
import { FrameRenderer } from 'src/components';
import cx from 'classnames';
import { useAppSelector } from 'src/redux';
import { FrameDataState, getSpriteConfig } from 'src/redux/frameData';
import { useMemo } from 'react';

interface Props {
  definition: FrameDefinition;
  frameKey: string;
  className?: string;
}

export default function FrameDefinitionRenderer({ definition, frameKey, className }: Props): JSX.Element {
  const { frames } = definition.animDef;
  const frameData: FrameDataState = useAppSelector(state => state.frameData);
  const uniqueFrames: number = useMemo(
    () =>
      _.isNumber(frames)
        ? frames
        : _.reduce(
            frames,
            (acc: number, value: number | AnimationFrameConfig) => {
              if (_.isNumber(value)) {
                return acc + 1;
              } else {
                const { index: start, endIndex: end = start } = value;
                return acc + end - start + 1;
              }
            },
            0
          ),
    [frames]
  );
  const width = useMemo(() => {
    let width = 0;
    for (let i = 0; i < uniqueFrames; ++i) {
      const config = getSpriteConfig(frameData, frameKey, i);
      if (config) {
        width = Math.max(width, config.spriteSourceSize.w);
      }
    }
    return width;
  }, [frameData, frameKey, uniqueFrames]);
  return (
    <div
      className={cx('cn--frame-definition-renderer', className)}
      style={{ gridTemplateColumns: `repeat(auto-fill, ${width + 30}px)` }}
    >
      {_.times(uniqueFrames, (i: number) => {
        return <FrameRenderer key={i} frameKey={frameKey} frameIndex={i} />;
      })}
    </div>
  );
}
