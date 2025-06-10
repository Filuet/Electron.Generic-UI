import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './localization';
import ThemeCustomization from './theme';
import store from './redux/rootStore';
import './main.css';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <ThemeCustomization>
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeCustomization>
  );
}
