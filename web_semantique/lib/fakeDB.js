export const initFakeDB = () => {
  if (!localStorage.getItem('users')) {
    const defaultUsers = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'user', password: 'user123', role: 'user' },
      { username: 'psychologist', password: 'psych123', role: 'psychologist' },
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
};

export const getUsers = () => {
  return JSON.parse(localStorage.getItem('users')) || [];
};

export const addUser = (newUser) => {
  const users = getUsers();
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
};

export const findUser = (username, password) => {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password);
};