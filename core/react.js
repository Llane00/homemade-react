let workInProcessRootFiber = null;
let workInProcessFiber = null;
let nextWorkOfUnit = null;
let fibersNeedDelete = [];
let stateHooks;
let stateHookIndex;
let effectHooks

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

    let newFiber;
    if (!!child) {
      newFiber = {
        type: child.type,
        props: child.props,
        dom: isTheSameType ? currentOldFiberChild.dom : null,
        alternate: isTheSameType ? currentOldFiberChild : null,
        parent: parentFiber,
        child: null,
        sibling: null,
        effectTag: isTheSameType ? 'update' : 'placement',
      }
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

    if (newFiber) {
      prevChild = newFiber;
    }
  });

  // 如果oldFiber有多余的sibling节点，需要删除
  while (currentOldFiberChild) {
    fibersNeedDelete.push(currentOldFiberChild);
    currentOldFiberChild = currentOldFiberChild?.sibling;
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
  stateHooks = [];
  stateHookIndex = 0;
  effectHooks = [];
  workInProcessFiber = fiber;

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

function commitDeletions() {
  fibersNeedDelete.map((fiber) => deleteFiber(fiber));
  fibersNeedDelete = [];
}

function commitRoot() {
  commitDeletions();
  commitWork(workInProcessRootFiber.child);
  commitEffectHooks();
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

    // 如果下一个work的fiber节点是 当前update的节点的兄弟节点，说明当前update的节点已经处理完成
    if (!!nextWorkOfUnit?.type
      && workInProcessRootFiber?.sibling?.type === nextWorkOfUnit?.type
      && workInProcessRootFiber?.sibling.dom === nextWorkOfUnit?.dom
    ) {
      nextWorkOfUnit = undefined;
    }

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
  let currentFiber = workInProcessFiber;
  // 这里使用闭包不让后续的FunctionComponent更新覆盖workInProcessRootFiber
  // 保存下update的workInProcessRootFiber
  return () => {
    console.log('update fiber', currentFiber);
    workInProcessRootFiber = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = workInProcessRootFiber;
  }
}

function useState(initValue) {
  let currentFiber = workInProcessFiber;
  const oldHook = currentFiber?.alternate?.stateHooks[stateHookIndex];
  const stateHook = {
    state: oldHook ? oldHook.state : initValue,
    actionQueue: oldHook ? oldHook.actionQueue : []
  }

  stateHook.actionQueue.forEach((action) => {
    stateHook.state = action(stateHook.state);
  })
  stateHook.actionQueue = [];

  stateHooks.push(stateHook);
  stateHookIndex++;

  currentFiber.stateHooks = stateHooks;

  let setState = (action) => {
    // 先收集action，等到下次调用useState时再统一处理
    stateHook.actionQueue.push(typeof action === 'function' ? action : () => action);

    // 提前去监测一下action的值,如果和当前state一样则不更新
    const eagerState = typeof action === 'function' ? action(stateHook.state) : action;
    if (eagerState === stateHook.state) return;

    workInProcessRootFiber = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = workInProcessRootFiber;
  };

  return [stateHook.state, setState];
}

function commitEffectHooks() {
  function run(fiber) {
    if (!fiber) return;

    const oldFiber = fiber?.alternate;

    // init
    if (!fiber?.alternate) {
      // console.log('init', fiber);

      fiber?.effectHooks?.forEach((hook) => {
        hook.cleanup = hook.callback();
      });
    } else {
      // console.log('update', fiber);
      // update
      fiber?.effectHooks?.forEach((newHook, index) => {
        if (newHook.deps?.length > 0) {
          const oldEffectHook = oldFiber?.effectHooks[index];

          const isDepsChanged = oldEffectHook?.deps.some((oldDep, oldDepIndex) => oldDep !== newHook?.deps[oldDepIndex]);

          isDepsChanged && (newHook.cleanup = newHook.callback());
        }
      })
    }

    run(fiber.child);
    run(fiber.sibling);
  }

  function runCleanup(fiber) {
    if (!fiber) return;

    fiber?.alternate?.effectHooks?.forEach((hook) => {
      if (hook?.deps?.length > 0) {
        hook?.cleanup && hook?.cleanup();
      }
    })

    runCleanup(fiber.child);
    runCleanup(fiber.sibling);
  }

  runCleanup(workInProcessRootFiber);
  run(workInProcessRootFiber);
}

function useEffect(callback, deps) {
  const effectHook = {
    callback,
    deps,
    cleanup: null,
  }
  effectHooks.push(effectHook);
  workInProcessFiber.effectHooks = effectHooks;
}

const React = {
  createElement,
  render,
  update,
  useState,
  useEffect,
}

export default React;
