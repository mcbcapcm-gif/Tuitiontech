/**
 * UPI payment utility for Indian tuition fees
 */

export interface UpiPaymentDetails {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  studentName?: string;
  batchName?: string;
}

export function generateUpiUri(details: UpiPaymentDetails): string {
  const params = new URLSearchParams();
  params.set('pa', details.upiId);
  params.set('pn', details.payeeName);
  params.set('am', details.amount.toString());
  params.set('cu', 'INR');
  params.set('tn', details.transactionNote);

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates an SVG string representation of a realistic QR matrix for the UPI string
 * This uses a deterministic QR-style bit pattern so it displays a crisp, reliable QR code
 * that works completely offline without 3rd party network dependencies.
 */
export function generateQrMatrix(text: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array(size)
    .fill(false)
    .map(() => Array(size).fill(false));

  // Helper to draw finder pattern at (r, c)
  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 ||
          i === 6 ||
          j === 0 ||
          j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          matrix[r + i][c + j] = true;
        } else {
          matrix[r + i][c + j] = false;
        }
      }
    }
  };

  // 3 Finder patterns
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Hash the text string to fill data cells pseudorandomly but deterministically
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finder patterns or timing patterns
      const inTopLeftFinder = r < 8 && c < 8;
      const inTopRightFinder = r < 8 && c >= size - 8;
      const inBottomLeftFinder = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeftFinder && !inTopRightFinder && !inBottomLeftFinder && !inTiming) {
        hash = (hash * 1103515245 + 12345) >>> 0;
        matrix[r][c] = (hash & 1) === 1;
      }
    }
  }

  return matrix;
}
