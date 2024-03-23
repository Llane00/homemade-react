function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === 'object' ? child : createTextNode(child);
      })
    }
  }
}

function render(element, container) {
  const domElement = element.type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(element.type);

  Object.keys(element.props).forEach((key) => {
    if (key !== "children") {
      domElement[key] = element.props[key];
    }
  })

  const children = element.props.children;
  if (children instanceof Array && children.length > 0) {
    children.forEach((child) => {
      render(child, domElement);
    })
  }

  container.append(domElement);
}

const ReactDom = {
  createElement,
  render
}

export default ReactDom;
