import { test, expect } from '@playwright/test';

test('create post flow: sign in, upload to IPFS (mock), create post', async ({ page }) => {
  // Mock wallet provider (EIP-1193) before the app loads
  await page.addInitScript(() => {
    // @ts-ignore
    window.ethereum = {
      isMetaMask: true,
      request: (args: any) => {
        const { method } = args || {};
        if (method === 'eth_requestAccounts') return Promise.resolve(['0x1111111111111111111111111111111111111111']);
        if (method === 'eth_accounts') return Promise.resolve(['0x1111111111111111111111111111111111111111']);
        if (method === 'eth_chainId') return Promise.resolve('0x1');
        if (method === 'eth_sendTransaction') return Promise.resolve('0xdeadbeef');
        return Promise.resolve(null);
      },
    };
  });

  // Intercept IPFS upload requests and return a fake hash
  await page.route('**/api/v0/add**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ Hash: 'QmFakeHash' }),
    });
  });

  await page.goto('/');

  // Click create post button (depends on UI) - look for a button or link with 'Create'
  await page.click('text=Create Post, Create, New Post');

  // Fill the post content
  await page.fill('textarea[name="content"], textarea', 'E2E test post');

  // Submit the form
  await page.click('text=Mint|Submit|Create');

  // Wait for success toast/message
  await expect(page.locator('text=Post minted successfully')).toBeVisible({ timeout: 10000 });
});
