## 🚨 Phishing Email Samples

### Sample P1: Urgent Banking / Account Suspension
* **Expected Verdict:** **Phishing** (High Risk: >95%)
* **Subject:** `URGENT: Unauthorized Activity Detected - Verify Identity Immediately`
* **Sender:** `alerts@security-chasebank-verify.tk`
* **Email Body:**
```text
Dear Chase Customer,

We detected unusual login attempts from an unknown device in Moscow, Russia on your online banking profile. For your safety, your account access and debit card privileges have been temporarily suspended.

You are required to verify your identity within 24 hours to prevent permanent account suspension and asset freeze.

Click the official secure link below to verify your password, PIN, and Social Security Number:
http://192.168.1.105/chase-online-login/verify.html

Failure to verify within 24 hours will result in automatic closure of your account under federal fraud protection regulations.

Sincerely,
Chase Fraud Prevention & Security Operations
```
* **Why it's flagged:** High-urgency words ("freeze", "24 hours", "unauthorized"), IP-address link (`http://192.168.1.105`), suspicious `.tk` top-level domain.

---

### Sample P2: Microsoft 365 / IT Helpdesk Password Expiry
* **Expected Verdict:** **Phishing** (High Risk: >90%)
* **Subject:** `Action Required: Your Microsoft 365 password expires in 2 hours`
* **Sender:** `it-support@globalcorp-portal-renew.xyz`
* **Email Body:**
```text
All Employees,

Your Microsoft Office 365 enterprise account password will expire today at 5:00 PM.

To avoid losing access to your Outlook inbox, OneDrive files, and company VPN, please retain your current password by confirming your corporate credentials through our self-service portal:

https://login-microsoft365-auth-token.xyz/adfs/ls/

Note: If your credentials expire, you must physically visit the corporate IT helpdesk with two forms of government ID to regain network access.

Regards,
IT Global Infrastructure Support Team
```
* **Why it's flagged:** Deceptive domain (`.xyz`), artificial deadline, threat of losing work access.

---

### Sample P3: Fake DHL / FedEx Parcel Delivery Notice
* **Expected Verdict:** **Phishing** (High Risk: >90%)
* **Subject:** `DHL Express: We were unable to deliver your package #DH-94821038`
* **Sender:** `tracking@dhl-parcel-notification.top`
* **Email Body:**
```text
Dear Customer,

Your international package #DH-94821038 arrived at our local distribution hub on October 31, but could not be delivered due to an incorrect shipping address and unpaid customs import fees of $2.95.

To reschedule your courier delivery and update your delivery address, please download your shipping label and confirm payment:

http://dhl-express-tracking-portal.top/delivery/confirm.php?id=94821038

If payment is not settled within 48 hours, the parcel will be destroyed or returned to the international sender at your expense.

Thank you for choosing DHL Worldwide Express.
```
* **Why it's flagged:** Common courier delivery scam, low dollar fee lure, suspicious `.top` domain, threatening parcel destruction.

---

### Sample P4: Urgent CEO Wire Transfer / Payroll Update
* **Expected Verdict:** **Phishing** (High Risk: >85%)
* **Subject:** `Quick assistance needed / Confidential request`
* **Sender:** `ceo.executive.desk@gmail.com`
* **Email Body:**
```text
Hi,

Are you at your desk right now? I am currently in a closed-door board meeting and cannot take phone calls.

We need to finalize an urgent confidential vendor payment before the bank cutoff today at 3:00 PM. Please reply to this email immediately with the current balance in our operating account so I can forward you the wire instructions.

Treat this with utmost confidentiality and handle it as top priority.

Best regards,
Mark Stevens
Chief Executive Officer
```
* **Why it's flagged:** Classic Business Email Compromise (BEC), CEO impersonation via generic `@gmail.com` address, urgent confidential wire transfer demand.

---

### Sample P5: Amazon Order Confirmation Scam with Phone Lure
* **Expected Verdict:** **Phishing / Suspicious** (High Risk: >85%)
* **Subject:** `Order Confirmed: Apple MacBook Pro 16" ($2,499.00 billed to your account)`
* **Sender:** `order-updates@amzn-billing-department.info`
* **Email Body:**
```text
Thank you for your order on Amazon.com!

Order Number: #114-8930218-49219
Item: Apple MacBook Pro 16-inch M3 Max (36GB RAM, 1TB SSD) - Space Black
Amount Charged: $2,499.00
Payment Method: Visa ending in 4108

If you did not authorize this purchase, please call our 24/7 Fraud Support Helpline immediately at +1-800-555-0199 or click the dispute link below to cancel this transaction within 30 minutes:

http://amazon-fraud-cancellation-center.info/dispute

Failure to cancel within 30 minutes will result in final dispatch and non-refundable billing.

Amazon Customer Service
```
* **Why it's flagged:** Panic-inducing high dollar order, extreme urgency (30 minutes), fake Amazon domain (`.info`).

---

### Sample P6: Lottery / Reward Gift Card Bait
* **Expected Verdict:** **Phishing** (High Risk: >90%)
* **Subject:** `Congratulations! You have been selected for a $1,000 Walmart Gift Card`
* **Sender:** `rewards@shopper-survey-winners.biz`
* **Email Body:**
```text
Dear Shopper,

Congratulations! You have been chosen as one of our 10 lucky daily winners to receive a complimentary $1,000 Walmart Digital Shopping Card!

To claim your prize, simply complete our brief 60-second customer satisfaction survey and enter your delivery mailing address:

http://claim-free-walmart-giftcard.biz/claim/reward.html

Claim Code: WM-99482-GOLD
Notice: This voucher expires tonight at midnight if not claimed.

Promotion sponsored by Shopper Rewards Inc.
```
* **Why it's flagged:** Unsolicited prize/gift bait, countdown timer, fake claim link on `.biz` domain.

---

## ✅ Normal / Legitimate Email Samples

### Sample L1: Team Meeting & Project Sync Notes
* **Expected Verdict:** **Safe** (Low Risk: <5%)
* **Subject:** `Notes & Action Items from Weekly Sprint Sync - Oct 31`
* **Sender:** `sarah.chen@northwind-tech.com`
* **Email Body:**
```text
Hi everyone,

Thank you for joining today's sprint sync. Here is a quick summary of what we discussed and the action items for this week:

1. Frontend UI: Completed the dark theme adjustments and verified cross-browser compatibility.
2. API Integration: Testing the new endpoints on the staging environment.
3. Documentation: Drafted the initial user guide and deployment instructions.

Please review your assigned Jira tickets before Thursday's standup. Let me know if you run into any blockers.

Have a great rest of your day!

Best regards,
Sarah Chen
Technical Project Lead | Northwind Technologies
```
* **Why it's safe:** Standard corporate language, realistic task list, no urgent threats or credential solicitations.

---

### Sample L2: Genuine E-Commerce Order Receipt
* **Expected Verdict:** **Safe** (Low Risk: <10%)
* **Subject:** `Your order #849204 has shipped - Tracking details inside`
* **Sender:** `orders@powerelectronics.com`
* **Email Body:**
```text
Hello Alex,

Great news! Your recent order #849204 has been packaged and handed over to UPS.

Package Details:
- 1x USB-C Multiport Adapter
- 1x Ergonomic Wireless Mouse

Expected Delivery: Wednesday, November 4 by 7:00 PM.
Carrier: UPS Ground
Tracking Number: 1Z9999999999999999

You can monitor the shipment progress directly through your account dashboard on our website.

Thank you for shopping with Power Electronics!
Customer Support Team
```
* **Why it's safe:** Informational shipment update, realistic tracking details, no demand for passwords or panic-inducing charges.

---

### Sample L3: University Assignment & Office Hours Notice
* **Expected Verdict:** **Safe** (Low Risk: <5%)
* **Subject:** `CS410 Machine Learning - Assignment 3 Deadline Extension`
* **Sender:** `r.patel@engineering.university.edu`
* **Email Body:**
```text
Dear Students,

Several of you requested additional time to complete the hyperparameter tuning section of Assignment 3.

In response, the submission deadline has been extended to this Sunday, November 5, at 11:59 PM on Canvas. Please make sure to include your confusion matrix and classification report in your final PDF report.

Teaching assistant office hours will take place tomorrow from 2:00 PM to 4:00 PM in Room 302 of the Computer Science building.

Best regards,
Prof. R. Patel
Department of Computer Engineering
```
* **Why it's safe:** Educational `.edu` style communication, clear academic context, no suspicious external links.

---

### Sample L4: GitHub Pull Request & Code Review Digest
* **Expected Verdict:** **Safe** (Low Risk: <5%)
* **Subject:** `[GitHub] Pull request #42 reviewed by alexander-k`
* **Sender:** `notifications@github.com`
* **Email Body:**
```text
Hey dev team,

alexander-k approved pull request #42 (Feature/model-evaluation-dashboard).

Review summary:
- All unit tests passed on continuous integration runner.
- Code coverage is above 94%.
- Looks ready to be merged into main once the staging deployment check completes.

You can view the commit diff and discussions directly on GitHub.
```
* **Why it's safe:** Natural technical digest, standard GitHub notification style, consistent development context.

---

### Sample L5: Customer Support Ticket Resolution
* **Expected Verdict:** **Safe** (Low Risk: <5%)
* **Subject:** `Ticket #918204 resolved: Inability to export monthly analytics report`
* **Sender:** `support@cloudmetrics-service.io`
* **Email Body:**
```text
Hi Michael,

Our engineering team has identified and resolved the issue that prevented CSV report exports earlier today. The system is operating normally now.

Please try running your export again from the Reports tab in your admin console. If you experience any further difficulty, simply reply directly to this email to reopen your ticket.

We appreciate your patience while we resolved this.

Warm regards,
Jessica Miller
Customer Success Specialist | CloudMetrics
```
* **Why it's safe:** Standard courteous customer service resolution, no password or financial requests.

---

### Sample L6: Informal Catch-up Among Colleagues
* **Expected Verdict:** **Safe** (Low Risk: <5%)
* **Subject:** `Lunch tomorrow around 1:00 PM?`
* **Sender:** `priya.sharma@colleague-mail.com`
* **Email Body:**
```text
Hey Parth,

Are you free to grab lunch tomorrow around 1:00 PM at the campus cafeteria? 

I wanted to discuss the slide deck structure for our upcoming project review and see how the demo environment is looking. Let me know if that time works for you or if you'd prefer meeting later in the afternoon.

Cheers,
Priya
```
* **Why it's safe:** Casual, natural personal conversation with zero security red flags.

---

## ⚠️ Edge Cases & Tricky Samples

### Sample E1: Marketing Email with Urgency (Legitimate)
* **Expected Verdict:** **Safe / Low Risk** (Demonstrates model doesn't overreact to normal marketing words)
* **Subject:** `Flash Sale Ends Tonight: 40% off all coding books!`
* **Sender:** `promotions@oreilly-learning.com`
* **Email Body:**
```text
Hello Reader,

Don't miss our annual autumn programming book sale! For the next 12 hours only, enjoy 40% off all computer science and software development titles in our digital catalog.

Browse popular titles on Machine Learning, Python Backend Engineering, and Cloud Architecture. Discount is automatically applied at checkout.

Happy reading!
The O'Reilly Publishing Team
```
* **Why it's tricky:** Contains the word "Ends Tonight" and "12 hours only", but lacks malicious structures, fake logins, or threats. A smart model recognizes this as safe promotional marketing.

---

### Sample E2: Real Password Reset Link (Legitimate)
* **Expected Verdict:** **Safe / Low Risk**
* **Subject:** `Password reset request for your Slack workspace`
* **Sender:** `no-reply@slack.com`
* **Email Body:**
```text
Hi there,

We received a request to reset the password for your Slack account associated with this email address.

If you made this request, please click the button in your web browser or visit the standard Slack settings page to choose a new password.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Thanks,
The Slack Team
```
* **Why it's tricky:** Mentions "password reset", but reassuring tone ("If you didn't request, ignore this"), no false penalties, and standard authentication handling.

---

## 💡 How to Test in the PhishGuard Web App
1. Open your PhishGuard browser application (`http://localhost:5173/`).
2. Copy any **Email Body** above.
3. Paste it into the email analyzer box.
4. *(Optional)* Expand the metadata fields to paste the **Sender** and **Subject**.
5. Click **"Analyze Email"** to observe:
   - Real-time **Verdict** (Safe vs Phishing)
   - Risk confidence score
   - LightGBM & Random Forest engine breakdown
   - Highlighted safety indicators (URL counts, urgency phrasing, suspicious domains).

