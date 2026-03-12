import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

export class DashboardPage extends BasePage {
  readonly userDropdown: Locator;
  readonly logoutMenuItem: Locator;
  readonly pimMenuItem: Locator;
  readonly dashboardHeader: Locator;
  readonly userProfileName: Locator;
  readonly topNavMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutMenuItem = page.locator('a[href="/web/index.php/auth/logout"]');
    this.pimMenuItem = page.locator('.oxd-main-menu-item').filter({ hasText: 'PIM' });
    this.dashboardHeader = page.locator('.oxd-topbar-header-breadcrumb h6');
    this.userProfileName = page.locator('.oxd-userdropdown-name');
    this.topNavMenu = page.locator('.oxd-topbar-body');
  }

  async isDashboardLoaded(): Promise<boolean> {
    return await this.isElementVisible(this.userDropdown, 10000);
  }

  async logout(): Promise<void> {
    logger.step('Logging out');
    await this.clickElement(this.userDropdown, 'User dropdown');
    await this.clickElement(this.logoutMenuItem, 'Logout menu item');
    await this.page.waitForURL('**/auth/login', { timeout: 15000 });
    logger.info('Successfully logged out');
  }

  async navigateToPIM(): Promise<void> {
    logger.step('Navigating to PIM module');
    await this.clickElement(this.pimMenuItem, 'PIM menu item');
    await this.page.waitForURL('**/pim/viewEmployeeList', { timeout: 15000 });
    logger.info('Navigated to PIM module');
  }

  async getLoggedInUserName(): Promise<string> {
    return await this.getElementText(this.userProfileName);
  }

  async navigateToModule(moduleName: string): Promise<void> {
    logger.step(`Navigating to module: ${moduleName}`);
    const menuItem = this.page.locator('.oxd-main-menu-item').filter({ hasText: moduleName });
    await this.clickElement(menuItem, `${moduleName} menu item`);
  }
}
