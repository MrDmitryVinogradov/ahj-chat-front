/* eslint-disable eqeqeq */
export default class Chat {
  constructor() {
    this.URL = 'https://dmitryvinogradov-chat.herokuapp.com/';
  }

  init() {
    this.renderStartWindow();
  }

  renderStartWindow() {
    this.startWindow = document.createElement('form');
    this.startWindow.classList.add('start-window');
    this.startWindow.innerHTML = '<div class = \'header-wrapper\'> <h3 class = \'header\'> Выберите псевдоним </h3></div>';
    this.startWindow.innerHTML += '<div class = \'input-wrapper\'> <input class = \'name-input\' placeholder = \'Например: Destroyer 2000\'>  </div>';
    this.startWindow.innerHTML += '<button class = \'btn name-button\'> Продолжить </button>';
    document.querySelector('body').appendChild(this.startWindow);
    this.startWindow.addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.name = document.querySelector('.name-input').value;
      this.enterChat(this.name);
    });
  }

  async enterChat(name) {
    if (name) {
      const response = await fetch(`${this.URL}/users`, { method: 'POST', body: name });
      const { status } = response;
      const alertMessage = await response.json();
      if (status == 230) {
        // eslint-disable-next-line no-alert
        alert(alertMessage.message);
      }
      if (status == 200) {
        // eslint-disable-next-line no-alert
        alert(alertMessage.message);
        this.startWindow.remove();
        this.renderChat();
      }
    } else {
      return false;
    }
    return false;
  }

  async getUsersList() {
    const usersList = await fetch(`${this.URL}/users`);
    const list = await usersList.json();
    list.forEach((element) => {
      const user = document.createElement('li');
      user.classList.add('user');
      user.innerText = element.name;
      document.querySelector('ul').appendChild(user);
    });
  }

  renderChat() {
    this.chat = document.createElement('div');
    this.chat.classList.add('chat');
    this.chat.innerHTML = '<ul class =\'user-list\'> </ul> <div class = \'close-chat\'></div><div class = \'chat-wrapper\'><div class = \'messages\'> </div> <form class = \'message-form\'> <input class = \'message-input\' placeholder = \'Введите свое сообщение\'> </form> </div>';
    document.querySelector('body').appendChild(this.chat);
    this.ws = new WebSocket('wss://dmitryvinogradov-chat.herokuapp.com/ws');
    this.ws.addEventListener('open', () => {
      this.ws.send(this.name);
    });
    // eslint-disable-next-line consistent-return
    this.chat.querySelector('.message-form').addEventListener('submit', (evt) => {
      evt.preventDefault();
      if (this.chat.querySelector('.message-input').value) {
        this.sendMessage(new Date().toLocaleDateString(), new Date().toLocaleTimeString(), this.chat.querySelector('.message-input').value);
        this.chat.querySelector('.message-input').value = null;
      } else { return false; }
    });
    this.ws.addEventListener('message', (evt) => {
      if (evt.data === 'New user') {
        this.getUsersList();
      } else {
        const data = JSON.parse(evt.data);
        this.getMessage(data.name, data.date, data.time, data.text);
      }
    });
    this.chat.querySelector('.close-chat').addEventListener('click', () => {
      this.removeUser();
    });
  }

  sendMessage(date, time, text) {
    const message = {
      name: this.name,
      text,
      time,
      date,
    };
    this.ws.send(JSON.stringify(message));
  }

  getMessage(name, date, time, text) {
    const message = document.createElement('div');
    message.classList.add('message');
    let messageName = '';
    if (name === this.name) {
      messageName = 'You';
      message.classList.add('my-message');
      message.innerHTML = `<div class = 'message-header my-message-header'> ${messageName}, ${time}, ${date} </div> <div class = 'message-body'> ${text} </div>`;
    } else {
      messageName = name;
      message.innerHTML = `<div class = 'message-header'> ${messageName}, ${time}, ${date} </div> <div class = 'message-body'> ${text} </div>`;
    }
    this.chat.querySelector('.messages').appendChild(message);
  }

  async removeUser() {
    await fetch(`${this.URL}/users${this.name}`, { method: 'DELETE' });
    alert(`Goodbye, ${this.name}`);
    this.chat.remove();
    this.init();
  }
}
