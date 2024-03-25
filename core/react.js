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

const initChildrenFibers = (fiber) => {
  const children = fiber.props.children;
  let prevChild = null;
  if (children) {
    children.forEach((child, index) => {
      const newFiber = {
        type: child.type,
        props: child.props,
        dom: null,
        parent: fiber,
        child: null,
        sibling: null,
      }

      if (index === 0) {
        fiber.child = newFiber;
      } else {
        prevChild.sibling = newFiber;
      }
      prevChild = newFiber;
    });
  }
}

const getNextWorkOfUnit = (fiber) => {
  if (fiber.child) {
    return fiber.child;
  }

  if (fiber.sibling) {
    return fiber.sibling;
  }

  let parent = fiber.parent;
  while (true) {
    if (!parent) {
      return null;
    }
    if (parent?.sibling) {
      return parent.sibling;
    } else {
      parent = parent?.parent;
    }
  }
}

const handleWorkOfUnit = (fiber) => {
  if (!fiber.dom) {
    const domElement = fiber.dom = createDom(fiber.type);
    updateProps(domElement, fiber);
  }

  initChildrenFibers(fiber);

  return getNextWorkOfUnit(fiber);
}

let rootFiber = null;
let nextWorkOfUnit = null;
const workLoop = (IdleDeadline) => {
  let shouldYield = false;
  while (nextWorkOfUnit && !shouldYield) {
    nextWorkOfUnit = handleWorkOfUnit(nextWorkOfUnit);
    shouldYield = IdleDeadline.timeRemaining() < 1;
  }

  // fiber节点树处理完成, 统一渲染到dom树
  if (!nextWorkOfUnit && rootFiber) {
    commitRoot(rootFiber);
    rootFiber = null;
  }

  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

function render(element, container) {
  rootFiber = nextWorkOfUnit = {
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

const commitRoot = (rootFiber) => {
  commitWork(rootFiber.child)
}

const commitWork = (fiber) => {
  if (!fiber) {
    return;
  }

  fiber?.parent?.dom.append(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

const React = {
  createElement,
  render
}

export default React;
