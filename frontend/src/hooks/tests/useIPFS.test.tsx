import React, { useEffect, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock sonner toast
const toast = { error: vi.fn(), success: vi.fn() };
vi.mock('sonner', () => ({ toast }));

// Mock IPFS service functions
const storeOnIPFSMock = vi.fn();
const getFromIPFSMock = vi.fn();
vi.mock('@/services/ipfs', () => ({
  storeOnIPFS: storeOnIPFSMock,
  getFromIPFS: getFromIPFSMock,
}));

import { useIPFS } from '../useIPFS';

function TestUploadComponent() {
  const { uploadToIPFS, uploadImageToIPFS, isUploading } = useIPFS();
  const [result, setResult] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const r = await uploadToIPFS('hello world', 'alice');
      setResult(r);
    })();
  }, [uploadToIPFS]);

  return <div data-testid="result">{String(result)}</div>;
}

function TestDownloadComponent() {
  const { downloadFromIPFS } = useIPFS();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const r = await downloadFromIPFS('QmFakeHash');
      setResult(r);
    })();
  }, [downloadFromIPFS]);

  return <div data-testid="download">{result ? result.content : 'null'}</div>;
}

describe('useIPFS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads content and returns hash', async () => {
    storeOnIPFSMock.mockResolvedValue('QmFakeHash');

    render(<TestUploadComponent />);

    await waitFor(() => {
      expect(storeOnIPFSMock).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Content uploaded to IPFS successfully!');
      expect(screen.getByTestId('result').textContent).toBe('QmFakeHash');
    });
  });

  it('downloads content from IPFS', async () => {
    getFromIPFSMock.mockResolvedValue({ content: 'hello ipfs' });

    render(<TestDownloadComponent />);

    await waitFor(() => {
      expect(getFromIPFSMock).toHaveBeenCalledWith('QmFakeHash');
      expect(screen.getByTestId('download').textContent).toBe('hello ipfs');
    });
  });

  it('validates IPFS hashes correctly', () => {
    const { isValidIPFSHash } = useIPFS();
    expect(isValidIPFSHash('QmYwAPJzv5CZsnAzt8auVZRn9zS')).toBe(false); // too short
    expect(isValidIPFSHash('QmFakeHashTooLongButInvalid')).toBe(false);
    // A typical CIDv0 pattern starts with Qm and length 46; use one that matches regex
    expect(isValidIPFSHash('Qm' + 'a'.repeat(44))).toBe(true);
  });
});
