export const PHISHING_SAMPLE = {
  text: `Dear Customer,

We detected unusual sign-in activity on your account. Your access has been temporarily suspended for security reasons.

You must verify your identity within 24 hours to avoid permanent closure. Click the link below and confirm your password and billing details immediately:

http://192.168.1.1/login

Failure to complete verification may result in unauthorized transactions.

Account Security Team`,
  sender: 'security@account-verify.tk',
  recipient: 'finance@northwind.example',
  reply_to: 'helpdesk@secure-restore.click',
  subject: 'URGENT: Verify your account within 24 hours',
  save_record: true,
}

export const LEGITIMATE_SAMPLE = {
  text: `Hi Team,

Please find attached the meeting minutes and the updated project timeline from yesterday's sync. Let me know if you have any questions before Friday's review.

Thanks,
Alice`,
  sender: 'alice@northwind.example',
  recipient: 'team@northwind.example',
  reply_to: 'alice@northwind.example',
  subject: 'Weekly project sync notes',
  save_record: true,
}
