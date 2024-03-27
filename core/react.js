let rootFiber = null;
let nextWorkOfUnit = null;

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

function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(domElement, vdom) {
  for (const key in vdom.props) {
    if (key === "children") continue;
  
    if (key.startsWith("on")) {
      const eventName = key.slice(2).toLowerCase();
      domElement.addEventListener(eventName, vdom.props[key]);
    } else {
      domElement[key] = vdom.props[key];
    }
  }
}

function initChildrenFibers(fiber, children) {
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

function getNextWorkOfUnit(fiber) {
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

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  initChildrenFibers(fiber, children);
}

function updateNormalComponent(fiber) {
  if (!fiber.dom) {
    const domElement = fiber.dom = createDom(fiber.type);
    updateProps(domElement, fiber);
  }

  const children = fiber.props.children;
  initChildrenFibers(fiber, children);
}

function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function';

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateNormalComponent(fiber);
  }

  return getNextWorkOfUnit(fiber);
}

function commitRoot(rootFiber) {
  commitWork(rootFiber.child)
}

function commitWork(fiber) {
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

function workLoop(IdleDeadline) {
  let shouldYield = false;
  while (nextWorkOfUnit && !shouldYield) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    shouldYield = IdleDeadline.timeRemaining() < 1;
  }

  // fiber节点树处理完成, 统一渲染到dom树
  if (!nextWorkOfUnit && rootFiber) {
    commitRoot(rootFiber);
    rootFiber = null;
  }

  requestIdleCallback(workLoop);
}

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

  requestIdleCallback(workLoop);
}

const React = {
  createElement,
  render
}

export default React;
