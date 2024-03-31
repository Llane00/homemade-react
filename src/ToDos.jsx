import React from "../core/react";

const ToDoList = () => {
  const [list, setList] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const [filter, setFilter] = React.useState('All');

  const addTask = () => {
    const taskName = inputValue;
    if (taskName === '') {
      alert('Please input task name!')
      return;
    }
    const newTask = {
      id: crypto.randomUUID(),
      name: taskName,
      isCompleted: false,
    }
    setList((list) => [...list, newTask]);
    setInputValue('');
  }

  function toggleTaskState(id) {
    const newList = list.map((task) => {
      if (id === task.id) {
        task.isCompleted = !task.isCompleted;
      }
      return task;
    });
    setList(newList);
  }

  function deleteTask(id) {
    const newList = list.filter((task) => id !== task.id);
    setList(newList);
  }

  const TaskList = () => {
    const completedList = list.filter(task => task.isCompleted);
    const uncompletedList = list.filter(task => !task.isCompleted);

    let filterList = list;
    if (filter === 'Completed') {
      filterList = completedList;
    } else if (filter === 'Uncompleted') {
      filterList = uncompletedList;
    } else {
      filterList = list;
    }
    const hasData = filterList.length > 0;

    return (
      <div>
        <h2>task list:</h2>
        {hasData && (<ul>
          {
            ...filterList.map((task) => {
              return (
                <li key={task.id} className={task.isCompleted ? 'done-state' : 'undone-state'}>
                  <span className="mr-10">{task.name}</span>
                  <button className="mr-10" onClick={() => toggleTaskState(task.id)}>{task.isCompleted ? 'UnDone' : 'Done'}</button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </li>
              )
            })
          }
        </ul>)}
        {!hasData && (
          <div>No Item</div>
        )}
      </div>
    )
  }

  const TaskFilter = () => {
    return (
      <div>
        <div>Filter: {filter}</div>
        <div>
          <button className="mr-10" onClick={() => setFilter('All')}>All</button>
          <button className="mr-10" onClick={() => setFilter('Completed')}>Completed</button>
          <button className="mr-10" onClick={() => setFilter('Uncompleted')}>Uncompleted</button>
        </div>
      </div>
    )
  }

  const handleInputChange = (e) => {
    const { value } = e.target;
    !!value && setInputValue(value);
  }

  const TaskOption = () => {
    return (
      <div>
        <input className="mr-10" type="text" placeholder="Please input task name" value={inputValue} onChange={handleInputChange} />
        <button onClick={addTask}>Add</button>
      </div>
    )
  }

  return (<div>
    <h1>My To Do List</h1>
    <TaskOption />
    <TaskFilter />
    <TaskList />
  </div>)
}

export default ToDoList;
