export const VALID_CREDENTIALS = {
  username: 'Admin',
  password: 'admin123',
};

export const INVALID_CREDENTIALS = {
  wrongPassword: {
    username: 'Admin',
    password: 'wrongpassword',
  },
  wrongUsername: {
    username: 'InvalidUser',
    password: 'admin123',
  },
  emptyUsername: {
    username: '',
    password: 'admin123',
  },
  emptyPassword: {
    username: 'Admin',
    password: '',
  },
  bothEmpty: {
    username: '',
    password: '',
  },
};

export const JOB_TITLES = [
  'Software Engineer',
  'QA Engineer',
  'Project Manager',
  'HR Manager',
];

export const EMPLOYEE_PERSONAL_DETAILS = {
  nationality: 'American',
  maritalStatus: 'Single',
  dateOfBirth: '1990-01-15',
  gender: 'Male',
  bloodType: 'A+',
};

export const ERROR_MESSAGES = {
  required: 'Required',
  invalidCredentials: 'Invalid credentials',
  usernamePlaceholder: 'Username',
  passwordPlaceholder: 'Password',
};

export const SUCCESS_MESSAGES = {
  saveSuccess: 'Successfully Saved',
  updateSuccess: 'Successfully Updated',
  deleteSuccess: 'Successfully Deleted',
};
