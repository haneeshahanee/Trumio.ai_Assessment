import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'Admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  LOGIN_PATH: '/web/index.php/auth/login',
  DASHBOARD_PATH: '/web/index.php/dashboard/index',
  PIM_PATH: '/web/index.php/pim/viewEmployeeList',
};

export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 15000,
  LONG: 30000,
  EXTRA_LONG: 60000,
};
