import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from 'src/redux';
import { Root } from 'src/components';
import { initializeFontAwesome } from 'src/utilities/fontAwesome.util';

initializeFontAwesome();

class App extends React.Component {
  public render(): React.ReactNode {
    return (
      <Provider store={store}>
        <Root />
      </Provider>
    );
  }
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
