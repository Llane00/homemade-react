import ToDos from "./src/ToDos";
import React from "./core/react";

const FunctionComponent1 = ({ num }) => {
  console.log('render FunctionComponent', num);

  return (<p id="FunctionComponent1">
    FunctionComponent {num}
  </p>);
}

function FunctionComponent2({ num }) {
  console.log('render FunctionComponent', num);

  return (
    <div id="FunctionComponent2">
      FunctionComponent <span>{num}</span>
    </div>
  )
}

function Counter() {
  console.log('render Counter');

  const [count, setCount] = React.useState(1);
  const [countProps, setCountProps] = React.useState({ id: 'Counter', className: 'red' });


  React.useEffect(() => {
    console.log('useEffect init')
    return () => {
      console.log('useEffect cleanup 0');
    };
  }, [])

  React.useEffect(() => {
    console.log('useEffect update')
    return () => {
      console.log('useEffect cleanup 1');
    };
  }, [count])

  React.useEffect(() => {
    console.log('useEffect update')
    return () => {
      console.log('useEffect cleanup 2');
    };
  }, [count, countProps])

  function handleClick(e) {
    setCount((count) => count + 1);
    setCountProps((countProps) => countProps.className === 'red' ? { id: 'Counter', className: 'blue' } : { id: 'Counter', className: 'red' });
    console.log('handle Counter click', count, e)
  }

  return (
    <div>
      <div>{count}</div>
      <div>{countProps.className}</div>
      <button {...countProps} onClick={handleClick}>
        Click Me
      </button>
    </div>
  )
}

function ToggleComponent() {
  console.log('render ToggleComponent');
  const [displayBar, setDisplayBar] = React.useState(false);

  const foo = (
    <div>
      foo
      <p>foo 's child1</p>
      <p>foo 's child2</p>
      <p>foo 's child3</p>
    </div>
  );

  const bar = <div>bar</div>

  function handleShowBar() {
    setDisplayBar((displayBar) => !displayBar);
    console.log('handleShowBar', displayBar);
  }

  return (
    <div id="ToggleComponent">
      <div>{displayBar ? bar : foo}</div>
      {displayBar && bar}
      <button onClick={handleShowBar}>showBar</button>
    </div>
  )
}

const App = () => {
  console.log('render App');

  return (
    <div>
      <ToDos />
      {/* <div>Hi React!</div>
      <ToggleComponent />
      <div>
        <div>
          <FunctionComponent1 num={1} />
        </div>
      </div>
      <div>
        <Counter />
      </div>
      <div>
        <div>
          <div>
            <FunctionComponent2 num={3} />
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default App;
