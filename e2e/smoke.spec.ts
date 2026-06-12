import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home renders heading', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {level: 1})).toBeVisible();
});

test('home has no serious a11y violations', async ({page}) => {
  await page.goto('/');
  const results = await new AxeBuilder({page}).analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(serious).toEqual([]);
});
