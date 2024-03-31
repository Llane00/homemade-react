import React from "../core/react";

const ToDoList = () => {
  const [list, setList] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const [filter, setFilter] = React.useState('All');

  React.useEffect(() => {
    loadTasks();

    return () => {
      saveTasks();
    }
  }, []);

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
    const newListData = [...list, newTask];
    setList((list) => newListData);
    setInputValue('');
    saveTasks(newListData);
  }

  const saveTasks = (listData) => {
    let result = listData;
    if (!Array.isArray(listData)) {
      result = list;
    }

    localStorage.setItem('taskList', JSON.stringify(result));
  }

  const resetTasks = () => {
    setList([]);
    localStorage.removeItem('taskList');
  }

  const loadTasks = () => {
    const taskList = localStorage.getItem('taskList');
    if (taskList) {
      setList(JSON.parse(taskList));
    }
  }

  function toggleTaskState(id) {
    const newList = list.map((task) => {
      if (id === task.id) {
        task.isCompleted = !task.isCompleted;
      }
      return task;
    });
    setList(newList);
    saveTasks(newList);
  }

  function deleteTask(id) {
    const newList = list.filter((task) => id !== task.id);
    setList(newList);
    saveTasks(newList);
  }

  const TaskItem = ({ task, indexNumber }) => {
    return (
      <li className={`task-item ${task.isCompleted ? 'done-state' : 'undone-state'}`}>
        <div className="task-content">
          <span className="task-index">{Number(indexNumber) + 1}.</span>
          <span className="task-name">{task.name}</span>
        </div>
        <div className="task-actions">
          <button className="task-action-button mr-10" onClick={() => toggleTaskState(task.id)}>{task.isCompleted ? 'Cancel' : 'Done'}</button>
          <button className="task-action-button" onClick={() => deleteTask(task.id)}>Delete</button>
        </div>
      </li>
    )
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
        {hasData && (<ul className="task-list">
          {
            ...filterList.map((task, index) => {
              return (
                <TaskItem key={task.id} task={task} indexNumber={index} />
              )
            })
          }
        </ul>)
        }
        {
          !hasData && (
            <div>No Item</div>
          )
        }
      </div >
    )
  }

  const Filter = () => {
    return (
      <div className="filter-container">
        <button className={`filter-item ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>All</button>
        <button className={`filter-item ${filter === 'Completed' ? 'active' : ''}`} onClick={() => setFilter('Completed')}>Completed</button>
        <button className={`filter-item ${filter === 'Uncompleted' ? 'active' : ''}`} onClick={() => setFilter('Uncompleted')}>Uncompleted</button>
      </div>
    )
  }

  const handleAddInputChange = (e) => {
    const { value } = e.target;
    !!value && setInputValue(value);
  }

  const Options = () => {
    return (
      <div className="options-container">
        <input
          className="mr-10 options-input"
          type="text"
          placeholder="Please input task name"
          value={inputValue}
          onChange={handleAddInputChange}
        />
        <button className="options-button" onClick={addTask}>Add</button>
        <button className="options-button" onClick={saveTasks}>Save</button>
        <button className="options-button" onClick={resetTasks}>Reset</button>
      </div>
    )
  }

  return (
    <div className="todos-container">
      <h1>Work Work</h1>
      <Options />
      <Filter />
      <TaskList />
    </div>
  )
}

export default ToDoList;
