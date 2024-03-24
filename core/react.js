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

const createDom = (type) => {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type);
}

const updateProps = (domElement, vdom) => {
  Object.keys(vdom.props).forEach((key) => {
    if (key !== "children") {
      domElement[key] = vdom.props[key];
    }
  })
}

const handleWorkOfUnit = (work) => {
  if (!work.dom) {
    const domElement = work.dom = createDom(work.type);
    updateProps(domElement, work);
    if (work.parent) {
      work.parent?.dom.append(domElement);
    }
  }

  const children = work.props.children;
  let prevChild = null;
  if (children) {
    children.forEach((child, index) => {
      const newWork = {
        type: child.type,
        props: child.props,
        dom: null,
        parent: work,
        child: null,
        sibling: null,
      }

      if (index === 0) {
        work.child = newWork;
      } else {
        prevChild.sibling = newWork;
      }
      prevChild = newWork;
    });
  }

  if (work.child) {
    return work.child;
  }

  if (work.sibling) {
    return work.sibling;
  }

  let parent = work.parent;
  return parent?.sibling;

  // while (true) {
  //   if (!parent) {
  //     return null;
  //   }
  //   if (parent?.sibling) {
  //     return parent?.sibling;
  //   } else {
  //     parent = parent?.parent;
  //   }
  // }
}

let nextWorkOfUnit = null;
const workLoop = (IdleDeadline) => {
  let shouldYield = false;
  while (nextWorkOfUnit && !shouldYield) {
    nextWorkOfUnit = handleWorkOfUnit(nextWorkOfUnit);
    shouldYield = IdleDeadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

function render(element, container) {
  nextWorkOfUnit = {
    type: 'div',
    props: {
      children: [element]
    },
    dom: container,
    parent: null,
    child: null,
    sibling: null,
  }
}

const React = {
  createElement,
  render
}

export default React;
