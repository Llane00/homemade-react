import React from "./core/react";

const FunctionComponent1 = ({ num }) => (
  <p>
    FunctionComponent {num}
  </p>
)

function FunctionComponent2({ num }) {
  return (
    <div>
      FunctionComponent <span>{num}</span>
    </div>
  )
}

let countNum = 0;
let countProps = { className: 'red' };
function Counter() {
  function handleClick(e) {
    React.update();
    countNum++;
    countProps.className = countNum % 2 === 0 ? 'red' : 'blue';
    console.log('handle click', e)
  }

  return (
    <button {...countProps} onClick={handleClick}>
      Click Me {countNum}
    </button>
  )
}

const App = <div>
  Hi React!
  <div>
    <Counter />
  </div>
  <div>
    <div>
      <FunctionComponent1 num={1} />
    </div>
  </div>
  <div>
    <div>
      <div>
        <FunctionComponent2 num={2} />
      </div>
    </div>
  </div>
</div>

export default App;
