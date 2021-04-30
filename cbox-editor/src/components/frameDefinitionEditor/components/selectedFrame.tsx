import * as React from 'react';
import { BoxConfig, BoxType, PushboxConfig } from 'src/utilities/frame.util';
import { Vector2 } from '@lawsumisu/common-utilities';
import { FrameDataState, getAnchorPosition, getSpriteConfig, getSpriteSource } from 'src/redux/frameData';
import { HboxPreview, PushboxPreview, SpriteRenderer } from 'src/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TypedBoxDefinition } from 'src/redux/frameData/frameDefinitionEdit';
import { HBoxMode } from 'src/components/frameDefinitionEditor';
import { round } from 'src/utilities/math.util';

interface SelectedFrameProps {
  frameKey: string;
  frameIndex: number;
  frameData: FrameDataState;
  mode: HBoxMode;
  newBoxType: BoxType;
  hitboxes: BoxConfig[];
  hurtboxes: BoxConfig[];
  pushbox: PushboxConfig | null;
  onAddBox<T extends BoxType>(type: T, box: T extends BoxType.PUSH ? PushboxConfig : BoxConfig): void;
  onEdit<T extends BoxType>(type: T, definition: Partial<TypedBoxDefinition<T>>): void;
  onCommit<T extends BoxType>(type: T): void;
  onDeleteBox<T extends BoxType>(type: T, boxes: T extends BoxType.PUSH ? null : BoxConfig[]): void;
}

interface State {
  newBoxOrigin: Vector2 | null;
  scale: number;
}

export class SelectedFrame extends React.PureComponent<SelectedFrameProps, State> {
  public state: State = {
    newBoxOrigin: null,
    scale: 5
  };

  private ref: HTMLDivElement | null;
  private containerRef: HTMLDivElement | null;

  public componentDidMount(): void {
    this.containerRef && this.containerRef.addEventListener('wheel', this.onWheel);
  }

  public componentWillUnmount(): void {
    this.containerRef && this.containerRef.removeEventListener('wheel', this.onWheel);
  }

  public render(): React.ReactNode {
    const { frameKey, frameIndex } = this.props;
    const source = getSpriteSource(this.props.frameData, frameKey);
    const config = source && getSpriteConfig(this.props.frameData, frameKey, frameIndex);
    const origin = this.origin;
    return (
      <div
        className="cn--frame"
        ref={this.setContainerRef}
        tabIndex={0}
        onMouseUp={this.onMouseUp}
        onMouseDown={this.onMouseDown}
      >
        <div ref={this.setRef}>
          {config && source && <SpriteRenderer source={source} config={config} scale={this.state.scale} />}
          {this.HBoxesPreview({ origin, type: BoxType.HURT, boxes: this.props.hurtboxes })}
          {this.HBoxesPreview({ origin, type: BoxType.HIT, boxes: this.props.hitboxes })}
          {this.props.pushbox && (
            <PushboxPreview
              origin={origin}
              config={this.props.pushbox}
              scale={this.state.scale}
              onChange={this.onPushboxChange}
              onDelete={this.getOnDeleteFn(BoxType.PUSH)}
              initialDragOrigin={(this.props.newBoxType === BoxType.PUSH && this.state.newBoxOrigin) || undefined}
              onFinishEdit={this.getFinishEditFn(BoxType.PUSH)}
            />
          )}
          <FontAwesomeIcon
            style={{ left: origin.x * this.state.scale, top: origin.y * this.state.scale }}
            className="origin"
            icon="crosshairs"
          />
        </div>
      </div>
    );
  }

  private setRef = (ref: HTMLDivElement | null): void => {
    this.ref = ref;
  };

  private setContainerRef = (ref: HTMLDivElement | null): void => {
    this.containerRef = ref;
  };

  private onMouseDown = (e: React.MouseEvent): void => {
    if (this.ref) {
      const o = new Vector2(e.clientX, e.clientY)
        .subtract(new Vector2(this.ref.offsetLeft, this.ref.offsetTop))
        .scale(1 / this.state.scale)
        .subtract(this.origin);
      const ox = round(o.x);
      const oy = round(o.y);
      const newBoxOrigin = new Vector2(e.clientX, e.clientY);
      this.setState({ newBoxOrigin });
      switch (this.props.newBoxType) {
        case BoxType.HURT:
        case BoxType.HIT: {
          let box: BoxConfig;
          if (this.props.mode === HBoxMode.CIRCLE) {
            box = { x: ox, y: oy, r: 10 };
          } else {
            box = { x1: ox, y1: oy, x2: ox, y2: oy, r: 10 };
          }
          console.log(this.props.newBoxType);
          this.props.onAddBox(this.props.newBoxType, box);
          break;
        }
        case BoxType.PUSH: {
          const pushbox = { x: ox, y: oy, width: 0, height: 0 };
          this.props.onAddBox(this.props.newBoxType, pushbox);
          break;
        }
      }
    }
  };

  private onMouseUp = (): void => {
    this.setState({
      newBoxOrigin: null
    });
  };

  private onWheel = (e: WheelEvent): void => {
    const { deltaY } = e;
    e.preventDefault();
    this.setState(state => ({
      scale: state.scale - deltaY / 100
    }));
  };

  private getOnHboxChangeFn(type: BoxType, index: number) {
    return (config: BoxConfig) => {
      if (type === BoxType.HURT) {
        const boxes = [...this.props.hurtboxes];
        boxes[index] = config;
        this.props.onEdit(BoxType.HURT, { boxes });
      } else if (type === BoxType.HIT) {
        const boxes = [...this.props.hitboxes];
        boxes[index] = config;
        this.props.onEdit(BoxType.HIT, { boxes });
      }
    };
  }

  private getFinishEditFn(type: BoxType) {
    return () => {
      this.props.onCommit(type);
    };
  }

  private onPushboxChange = (pushbox: PushboxConfig) => {
    this.props.onEdit(BoxType.PUSH, { box: pushbox });
  };

  private getOnDeleteFn(type: BoxType, index = 0) {
    return () => {
      if (type === BoxType.HURT) {
        this.props.onDeleteBox(
          BoxType.HURT,
          this.props.hurtboxes.filter((__, i: number) => i !== index)
        );
      } else if (type === BoxType.HIT) {
        this.props.onDeleteBox(
          BoxType.HIT,
          this.props.hitboxes.filter((__, i: number) => i !== index)
        );
      } else {
        this.props.onDeleteBox(BoxType.PUSH, null);
      }
    };
  }

  private HBoxesPreview = ({ boxes, type, origin }: { boxes: BoxConfig[]; type: BoxType; origin: Vector2 }) => (
    <div>
      {boxes.map((box: BoxConfig, i: number) => (
        <HboxPreview
          key={i}
          config={box}
          type={type}
          origin={origin}
          scale={this.state.scale}
          className="editor-box"
          onChange={this.getOnHboxChangeFn(type, i)}
          onDelete={this.getOnDeleteFn(type, i)}
          initialDragOrigin={(i === boxes.length - 1 && this.state.newBoxOrigin) || undefined}
          onFinishEdit={this.getFinishEditFn(type)}
        />
      ))}
    </div>
  );

  private get origin(): Vector2 {
    const { frameKey, frameIndex, frameData } = this.props;
    const config = getSpriteConfig(frameData, frameKey, frameIndex);
    return config ? getAnchorPosition(config) : Vector2.ZERO;
  }
}
