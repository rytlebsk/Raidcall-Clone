const logger = require('../js/core/logger');
const StoreModule = require('../js/store');

class Login {
  constructor() {
    this.box = document.querySelectorAll('.remember-box, .sign-in-box');

    this.createAccountBtn = document.querySelector('.create-account');

    this.loginBtn = document.querySelector('.login-btn');
    this.cancelBtn = document.querySelector('.cancel-btn');
    this.loginForm = document.querySelector('.login-form');
    this.loginLoading = document.querySelector('.login-loading');
    this.usernameInput = document.querySelector('#username');
    this.passwordInput = document.querySelector('#password');
    this.usernameWarningMessage = document.querySelector('[data-key="20112"]');
    this.passwordWarningMessage = document.querySelector('[data-key="20113"]');
    this.minimizeBtn = document.querySelector('.minimize');
    this.closeBtn = document.querySelector('.close');
    this.loadingUsername = document.querySelector('.login-loading-username');
    this.loggingIn = false;
    this.initEvents();
    StoreModule.initLanguage();
  }

  // 初始化
  initEvents() {
    this.box.forEach((element) => this.toggleCheckbox(element));

    this.createAccountBtn.addEventListener('click', () => this.createAccount());

    this.usernameInput.addEventListener('keydown', (event) => this.Enter(event));
    this.passwordInput.addEventListener('keydown', (event) => this.Enter(event));

    this.loginBtn.addEventListener('click', () => this.login());
    this.cancelBtn.addEventListener('click', () => this.cancelLogin());
    this.minimizeBtn.addEventListener('click', () => this.minimizeWindow());
    this.closeBtn.addEventListener('click', () => this.closeWindow());
  }

  // 最小化視窗
  minimizeWindow() {
    ipcRenderer.send('minimize');
  }

  // 關閉視窗
  closeWindow() {
    ipcRenderer.send('hide');
  }

  // 勾選框
  toggleCheckbox(element) {
    element.addEventListener('click', () => {
      const targetDiv = element.querySelector('div');
      if (targetDiv) {
        targetDiv.classList.toggle('checked');
      }
    });
  }

  // Enter
  Enter(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.login();
    }
  }

  // 登入
  async login() {
    try {
      this.usernameWarningMessage.style.display = 'none';
      this.passwordWarningMessage.style.display = 'none';
      const username = this.usernameInput.value.trim().toLowerCase();
      const password = this.passwordInput.value.trim();
      if (!username) {
        this.usernameWarningMessage.style.display = 'block';
        return;
      }
      if (!password) {
        this.passwordWarningMessage.style.display = 'block';
        return;
      }
      this.loginForm.classList.add('hidden');
      this.loginLoading.classList.remove('hidden');
      this.loadingUsername.textContent = `${username}@raidcall.com.tw`;
      this.loggingIn = true;
      ipcRenderer.send('login', { username, password });
      ipcRenderer.once('login-reply', (event, { success, code, titleCode, textCode, icon }) => {
        if (success) {
          setTimeout(() => {
            if (this.loggingIn) {
              logger.info('Login Success');
              ipcRenderer.send('open-lobby-window');
            }
          }, 3000);
        }
        else {
          logger.info(`Login Failed with error code: ${code}`);
          ipcRenderer.send('open-pop-window', { code, titleCode, textCode: textCode, icon }, 207, 412, 'dialog', false);
          this.loginForm.classList.remove('hidden');
          this.loginLoading.classList.add('hidden');
        }
      });
      ipcRenderer.removeAllListeners('stop-loading');
      ipcRenderer.on('stop-loading', () => {
        logger.info('Login Stopped');
        this.loginForm.classList.remove('hidden');
        this.loginLoading.classList.add('hidden');
      });
    }
    catch (error) {
      logger.error('A login error occurred:', error);
      ipcRenderer.send('open-pop-window', { code: 1005, titleCode: 30051, textCode: null, icon: 'warning' }, 207, 412, 'dialog', false);
      this.loginForm.classList.remove('hidden');
      this.loginLoading.classList.add('hidden');
    }
  }

  // 創建帳號
  createAccount() {
    ipcRenderer.send('open-pop-window', null, 450, 600, 'create_account', false);
  }

  // 取消登入
  cancelLogin() {
    this.loggingIn = false;
    this.loginForm.classList.remove('hidden');
    this.loginLoading.classList.add('hidden');
  }
}
new Login();
