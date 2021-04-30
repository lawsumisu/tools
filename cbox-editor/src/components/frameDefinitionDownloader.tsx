import * as React from 'react';
import * as _ from 'lodash';
import { Icon } from 'src/components/index';
import { FrameDataState } from 'src/redux/frameData';
import { connect } from 'react-redux';
import { AppState } from 'src/redux';
import { saveAs } from 'file-saver';

interface StateMappedProps {
  frameData: FrameDataState;
}

class FrameDefinitionDownloader extends React.PureComponent<StateMappedProps> {
  public static mapStateToProps(state: AppState): StateMappedProps {
    return { frameData: state.frameData };
  }
  public render(): React.ReactNode {
    return (
      <Icon
        className="icon"
        icon="file-download"
        size="lg"
        onClick={this.onClick}
        hint="Download Config"
        disabled={!this.enabled}
      />
    );
  }

  private onClick = (): void => {
    const { definitionMap, filename, frameDefinitionEdits} = this.props.frameData;
    const data = _.cloneDeep(definitionMap);
    _.forEach(frameDefinitionEdits, (value, key) => {
      _.set(data, key, {..._.get(data, key), ...value.data});
    });

    // Create a blob of the data
    var fileToSave = new Blob([JSON.stringify(data, undefined, 2)], {
      type: 'application/json'
    });

    // Save the file
    saveAs(fileToSave, filename);
  };

  private get enabled(): boolean {
    return !!this.props.frameData.filename;
  }
}

export const ReduxConnectedFrameDefinitionDownloader = connect(
  FrameDefinitionDownloader.mapStateToProps,
  null
)(FrameDefinitionDownloader);
