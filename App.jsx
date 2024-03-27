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

function Count() {
  function handleClick(e) {
    console.log('handle click', e)
  }

  return (
    <button onClick={handleClick}>
      Click Me
    </button>
  )
}

const App = <div>
  Hi React!
  <div>
    <Count />
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
