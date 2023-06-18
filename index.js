// Import stylesheets
import './style.css';

// Write Javascript code!

class DomHelper {
  static clearEvenetListner(element) {
    const cloneElement = element.cloneNode(true);
    element.replaceWith(cloneElement);
    return cloneElement;
  }
  static moveElement(elementId, newDestinationSelector) {
    const element = document.getElementById(elementId);
    const destinationSelector = document.querySelector(newDestinationSelector);
    destinationSelector.append(element); //if it is already present then it will not create copy it will move that element
  }
}

class TaskCardItem {
  constructor(id, updatedSwitchTaskListFunction, type) {
    this.id = id;
    this.updateSwitchTaskList = updatedSwitchTaskListFunction;
    this.connectSwtichBtn(type);
    this.connectDrag();
  }
  connectDrag() {
    const item = document.getElementById(this.id);
    item.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', this.id);
      event.dataTransfer.effectAllowed = 'move'; //effectAllowed is the type that u want when u drag eg-copy,move etc
    });
    item.addEventListener('dragend', (event) => {
      console.log(event);
    });
  }
  connectSwtichBtn(type) {
    const taskItem = document.getElementById(this.id);
    let ActionBtn = taskItem.querySelector('button:last-of-type');
    ActionBtn = DomHelper.clearEvenetListner(ActionBtn); //clear the previous event listner to the button
    ActionBtn.textContent = type === 'open' ? 'Active' : 'On Hold'; // update the text of the button
    ActionBtn.addEventListener(
      'click',
      this.updateSwitchTaskList.bind(null, this.id)
    );
  }
  update(updateTaskListFn, type) {
    this.updateSwitchTaskList = updateTaskListFn;
    this.connectSwtichBtn(type); // to make again button clickable
  }
}

class TaskList {
  tasks = [];
  constructor(type) {
    this.type = type;
    const listCardItem = document.querySelectorAll(`#${this.type}_task li`);
    console.log(listCardItem);
    for (const cardItem of listCardItem) {
      this.tasks.push(
        new TaskCardItem(cardItem.id, this.switchTask.bind(this), this.type)
      );
    }
    console.log(this.tasks);
    this.connectDroppable();
  }
  connectDroppable() {
    const list = document.querySelector(`#${this.type}_task ul`);
    list.addEventListener('dragenter', (event) => {
      if (event.dataTransfer.types[0] === 'text/plain') {
        list.parentElement.classList.add('droppable');
        event.preventDefault();
      }
    });
    list.addEventListener('dragover', (event) => {
      if (event.dataTransfer.types[0] === 'text/plain') {
        event.preventDefault();
      }
    });
    list.addEventListener('dragleave', (event) => {
      if (event.relatedTarget.closest(`#${this.type}_task ul`) !== list) {
        list.parentElement.classList.remove('droppable');
      }
    });
    list.addEventListener('drop', (event) => {
      const cardId = event.dataTransfer.getData('text/plain');
      if (this.tasks.find((c) => c.id === cardId)) {
        return;
      }
      document
        .getElementById(cardId)
        .querySelector('button:last-of-type')
        .click();
      list.parentElement.classList.remove('droppable');
      event.preventDefault();
    });
  }
  setActionHandlerFunction(actionHandlerFunction) {
    this.actionHandler = actionHandlerFunction;
  }
  addTask(task) {
    this.tasks.push(task);
    DomHelper.moveElement(task.id, `#${this.type}_task ul`);
    task.update(this.switchTask.bind(this), this.type); // it help in update ul
  }
  switchTask(cardId) {
    // const cardItemIndex = this.tasks.findIndex( c => c.id === cardId);
    // this.tasks.splice(cardItemIndex,1);

    this.actionHandler(this.tasks.find((c) => c.id === cardId)); // find that id which you want to move
    this.tasks = this.tasks.filter((c) => c.id !== cardId); // remove the match id and rest make new array and store it into tasks
  }
}
class App {
  static init() {
    const openTask = new TaskList('open');
    const activeTask = new TaskList('active');
    openTask.setActionHandlerFunction(activeTask.addTask.bind(activeTask)); //setActionHandlerFunction will return that id card that we want to move and addTask will accept that id card
    activeTask.setActionHandlerFunction(openTask.addTask.bind(openTask));
  }
}

App.init();
