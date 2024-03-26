import pollify from '../lib/utils.js';

const { rIC } = pollify;

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
        const isTextNode = typeof child === 'string' || typeof child === 'number';
        return isTextNode ? createTextNode(child) : child;
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

const initChildrenFibers = (fiber, children) => {
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

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }

  return null;
}

const updateFunctionComponent = (fiber) => {
  const children = [fiber.type(fiber.props)];
  initChildrenFibers(fiber, children);
}

const updateNormalComponent = (fiber) => {
  if (!fiber.dom) {
    const domElement = fiber.dom = createDom(fiber.type);
    updateProps(domElement, fiber);
  }

  const children = fiber.props.children;
  initChildrenFibers(fiber, children);
}

const handleWorkOfUnit = (fiber) => {
  const isFunctionComponent = typeof fiber.type === 'function';

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateNormalComponent(fiber);
  }

  return getNextWorkOfUnit(fiber);
}

const commitRoot = (rootFiber) => {
  commitWork(rootFiber.child)
}

const commitWork = (fiber) => {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent?.parent;
  }

  if (fiber.dom) {
    fiberParent.dom.appendChild(fiber.dom);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
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

  rIC(workLoop);
}
rIC(workLoop);

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

const React = {
  createElement,
  render
}

export default React;
