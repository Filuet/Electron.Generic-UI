import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import ThemeCustomization from './theme';
import store from './redux/rootStore';
import App from './App';
import './main.css';
import './localization';

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
