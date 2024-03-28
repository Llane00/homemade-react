let workInProcessRootFiber = null;
let currentRootFiber = null;
let nextWorkOfUnit = null;
let fibersNeedDelete = [];

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

function updateProps(domElement, nextProps, prevProps = {}) {
  // 旧fiber有props ，新fiber没有props 需删除
  for (const key in prevProps) {
    if (key === "children") continue;
    if (!(key in nextProps)) {
      domElement.removeAttribute(key);
    }
  }

  // 新fiber有props ，需新增和更新
  for (const key in nextProps) {
    if (key === "children") continue;
    if (prevProps[key] === nextProps[key]) continue;

    if (key.startsWith("on")) {
      const eventName = key.slice(2).toLowerCase();
      domElement.removeEventListener(eventName, prevProps[key]);
      domElement.addEventListener(eventName, nextProps[key]);
    } else {
      domElement[key] = nextProps[key];
    }
  }
}

function reconcileChildrenFibers(parentFiber, children) {
  const oldParentFiber = parentFiber.alternate;
  let currentOldFiberChild = oldParentFiber?.child;
  let prevChild = null;
  children?.forEach((child, index) => {
    const isTheSameType = currentOldFiberChild && (child?.type === currentOldFiberChild?.type);

    const newFiber = {
      type: child.type,
      props: child.props,
      dom: isTheSameType ? currentOldFiberChild.dom : null,
      alternate: isTheSameType ? currentOldFiberChild : null,
      parent: parentFiber,
      child: null,
      sibling: null,
      effectTag: isTheSameType ? 'update' : 'placement',
    }

    if (!isTheSameType && currentOldFiberChild) {
      fibersNeedDelete.push(currentOldFiberChild);
    }

    if (currentOldFiberChild) {
      currentOldFiberChild = currentOldFiberChild?.sibling;
    }

    if (index === 0) {
      parentFiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
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
  reconcileChildrenFibers(fiber, children);
}

function updateNormalComponent(fiber) {
  if (!fiber.dom) {
    const domElement = fiber.dom = createDom(fiber.type);
    updateProps(domElement, fiber?.props);
  }
  const children = fiber?.props?.children;
  reconcileChildrenFibers(fiber, children);
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

function deleteFiber(fiber) {
  if (fiber?.dom) {
    const fiberParent = getFiberParentWithDom(fiber);
    fiberParent?.dom?.removeChild(fiber?.dom);
  } else {
    deleteFiber(fiber.child);
  }
};

function handleFibersNeedDelete() {
  fibersNeedDelete.map((fiber) => deleteFiber(fiber));
  fibersNeedDelete = [];
}

function commitRoot() {
  handleFibersNeedDelete();

  commitWork(workInProcessRootFiber.child)
  currentRootFiber = workInProcessRootFiber;
  workInProcessRootFiber = null;
}

function getFiberParentWithDom(fiber) {
  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent?.parent;
  }
  return fiberParent;
}

function commitWork(fiber) {
  if (!fiber) return;

  // placement 新增节点时
  if (fiber.effectTag === 'placement' && fiber.dom) {

    const fiberParent = getFiberParentWithDom(fiber);
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
  }

  // update 更新节点时
  if (fiber.effectTag === 'update' && fiber.dom) {
    updateProps(fiber.dom, fiber.props, fiber.alternate.props);
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
  if (!nextWorkOfUnit && workInProcessRootFiber) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

function render(element, container) {
  if (typeof element === 'function') {
    element = element();
  };

  workInProcessRootFiber = {
    props: {
      children: [element]
    },
    dom: container,
  }
  nextWorkOfUnit = workInProcessRootFiber;

  requestIdleCallback(workLoop);
}

function update() {
  workInProcessRootFiber = {
    props: currentRootFiber.props,
    dom: currentRootFiber.dom,
    alternate: currentRootFiber,
  }
  nextWorkOfUnit = workInProcessRootFiber;
}

const React = {
  createElement,
  render,
  update,
}

export default React;
