/**
 * Helper to generate WhatsApp deep links and standardized messages for Indian tuition centres
 */

export function sanitizePhoneNumber(phone: string): string {
  // Clean phone number: remove +, spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\+\-\(\)]/g, '');
  // If it's a 10 digit Indian number, prefix with 91
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

export function openWhatsApp(phone: string, text: string) {
  const cleanPhone = sanitizePhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve(successful);
  } catch (err) {
    return Promise.resolve(false);
  }
}

export interface FeeReminderParams {
  studentName: string;
  parentName: string;
  batchName: string;
  pendingAmount: number;
  daysLate: number;
  dueDate: string;
  centreName: string;
  upiId: string;
}

export function generateFeeReminderText(params: FeeReminderParams): string {
  const parentSalutation = params.parentName.split(' ')[0] || 'Parent';
  return `Namaste ${parentSalutation} ji 🙏

This is a gentle reminder from ${params.centreName}.

The monthly tuition fee for *${params.studentName}* (${params.batchName}) is pending:
• Pending Fee: *₹${params.pendingAmount.toLocaleString('en-IN')}*
• Status: *${params.daysLate} days overdue* (Due Date: ${params.dueDate})

You can pay securely via UPI / Google Pay / PhonePe to our official Tuition ID:
UPI ID: *${params.upiId}*

Kindly share the payment screenshot once done.
Thank you for supporting your child's academic journey!

Warm regards,
${params.centreName}`;
}

export interface AbsentAlertParams {
  studentName: string;
  parentName: string;
  batchName: string;
  date: string;
  centreName: string;
  timing?: string;
}

export function generateAbsentAlertText(params: AbsentAlertParams): string {
  const parentSalutation = params.parentName.split(' ')[0] || 'Parent';
  return `⚠️ *Attendance Alert - ${params.centreName}*

Namaste ${parentSalutation} ji,

Please note that *${params.studentName}* was marked *ABSENT* for today's class:
• Date: *${params.date}*
• Batch: *${params.batchName}* ${params.timing ? `(${params.timing})` : ''}

Regular attendance is crucial for syllabus coverage and score improvement. If this was a planned leave or medical emergency, kindly inform us on WhatsApp.

Regards,
Teacher In-charge
${params.centreName}`;
}

export interface TestReportParams {
  studentName: string;
  parentName: string;
  batchName: string;
  testTitle: string;
  subject: string;
  score: number;
  maxMarks: number;
  rank: number;
  totalStudents: number;
  batchAverage: number;
  centreName: string;
}

export function generateTestReportText(params: TestReportParams): string {
  const percentage = Math.round((params.score / params.maxMarks) * 100);
  const parentSalutation = params.parentName.split(' ')[0] || 'Parent';

  let remark = 'Consistent performance. Keep revising key formulas.';
  if (percentage >= 85) {
    remark = '🌟 Outstanding grasp of concepts! On track for Top Board Grades.';
  } else if (percentage >= 70) {
    remark = 'Good effort! Needs 30 mins more daily practice on numericals/derivations.';
  } else {
    remark = 'Needs closer attention on foundational concepts. Extra doubt session arranged.';
  }

  return `📊 *Official Weekly Test Report - ${params.centreName}*

Namaste ${parentSalutation} ji,

Here is the performance report for *${params.studentName}*:
• Test: *${params.testTitle}*
• Subject: *${params.subject}*
• Score: *${params.score}/${params.maxMarks}* (${percentage}%)
• Batch Rank: *Rank #${params.rank}* (out of ${params.totalStudents} students)
• Batch Average: *${params.batchAverage.toFixed(1)}/${params.maxMarks}*

Teacher Note:
"${remark}"

You can view past 6 test charts & attendance in the TuitionDesk Parent Portal.
Warm regards,
${params.centreName}`;
}
