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
        return typeof child === 'string' ? createTextNode(child) : child;
      })
    }
  }
}

function render(element, container) {
  const domElement = element.type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(element.type);

  // 除了 children 之外的 props 都添加到 domElement 上
  Object.keys(element.props).forEach((key) => {
    if (key !== "children") {
      domElement[key] = element.props[key];
    }
  })

  // 使用递归实现 render
  const children = element.props.children;
  if (children instanceof Array && children.length > 0) {
    children.forEach((child) => {
      render(child, domElement);
    })
  }

  container.append(domElement);
}

const React = {
  createElement,
  render
}

export default React;
