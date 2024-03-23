function createElement(element) {
  const { type } = element;
  return document.createElement(type);
}

function createTextElement(text) {
  return document.createTextNode(text);
}

function render(element, container) {
  const domElement = element.type === "TEXT_ELEMENT"
    ? createTextElement(element.props.children)
    : createElement(element);

  Object.keys(element.props).forEach((key) => {
    if (key !== "children") {
      domElement[key] = element.props[key];
    }
  })

  if (element.props.children instanceof Array && element.props.children.length > 0) {
    element.props.children.forEach((child) => {
      if (typeof child === 'string') {
        child = {
          type: "TEXT_ELEMENT",
          props: {
            children: child
          }
        };
      }
      render(child, domElement);
    })
  }

  container.appendChild(domElement);
}

export { render };
