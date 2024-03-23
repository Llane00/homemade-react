const textNode = {
  type: "TEXT_ELEMENT",
  props: {
    children: 'app'
  }
}

const app = {
  type: "div",
  props: {
    id: "app",
    children: [textNode]
  }
}

export default app;
