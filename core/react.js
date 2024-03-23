import * as ReactDom from './reactDom.js';

const React = {
  createRoot(container) {
    return {
      render(element) {
        ReactDom.render(element, container);
      }
    }
  }
}

export default React;
