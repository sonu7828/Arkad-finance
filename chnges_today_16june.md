ARKAD FINANCE - Complete Application Description
& Developer Guide
Date: April 18, 2024
Status: Ready for Development
Audience: Development Team
Purpose: Master reference document for entire application
Table of Contents
1. 
Project Overview
2. 
Complete User Flow
3. 
Admin Dashboard Features
4. 
Agent Portal Features
5. 
User Dashboard Features
6. 
WhatsApp Integration Points
7. 
Database Schema Overview
8. 
API Endpoints
9. 
Business Logic & Calculations
10. 
Security & Compliance
Project Overview
What is ARKAD FINANCE?
ARKAD FINANCE is a comprehensive digital lending platform for Latin American markets
(Mexico, Colombia, Chile, Peru) that enables:
Users to apply for loans online and manage payments
Agents to refer customers and earn commissions
Admins to approve loans, manage collections, and track financials
Core Business Model
Loan Structure:
Users borrow money from business
Repay with monthly interest payments
Interest-only payments during tenure
Optional principal repayment
Delinquent interest accrues daily if late
Revenue Streams:
Monthly interest on active loans
Initiation fees (upfront deduction)
Delinquent interest on late payments
Commission Model:
Agents earn 10% of interest collected on referred clients
Commission only paid when client actually pays (not on approval)
Tracked automatically in Agent Portal
Complete User Flow
PHASE 1: Registration & Verification
Step 1: User Visits Website
Lands on ARKAD FINANCE homepage
Sees: “Get a loan in minutes”
Options: Login or Sign Up
Step 2: Signup Form (Initial)
User enters:
Full Name
Email Address
WhatsApp Number (with country code, e.g., +57 301 234 5678)
Agent Code (optional - if referred by agent)
Password (min 8 chars, 1 uppercase, 1 number, 1 special)
User clicks: “Get Verification Code”
Backend Action:
Validates email (not already registered)
Validates phone number format
Generates 6-digit OTP (random number)
Sends via Twilio WhatsApp API
Stores OTP in Redis (10-minute expiry)
Creates temporary user record
Step 3: WhatsApp OTP Verification
User receives WhatsApp message:
Your ARKAD FINANCE verification code is: 482957
This code expires in 10 minutes.
If you didn't sign up, ignore this message.
User sees screen:
Verify Your WhatsApp
We sent a 6-digit code to: +57 301 234 5678
Enter code: [_][_][_][_][_][_]
 Code expires in: 9:45
[Verify Code]
[Resend in 30 seconds]
User enters 6-digit code and clicks “Verify Code”
Backend Action:
Validates OTP matches Redis
Creates permanent User account
Sets status: “pending_verification”
Deletes temporary record
Clears OTP from Redis
Issues JWT tokens (access + refresh)
Sends confirmation email
User sees: “✓ Email Verified! Upload your documents”
PHASE 2: KYC (Know Your Customer) Documentation
User redirected to KYC upload page
What User Provides:
1. ID Document Type (dropdown)
Passport
Driver’s License
National ID
2. ID Front Photo (camera or upload)
Captures/uploads front of ID
Shows in real-time preview
Validates: file size, format, legibility
3. ID Back Photo (camera or upload)
Captures/uploads back of ID
4. Proof of Address (document upload)
Utility bill
Bank statement
Rental agreement
Max 2 documents
Frontend:
Camera integration using browser camera API
Real-time preview
File validation
Progress indicator
Backend:
Saves all documents to AWS S3
Creates document records in database
Sets KYC status: “pending_admin_review”
User cannot proceed until approved
Admin Review (Manual)
Admin views pending KYC:
Views all 4 documents (embedded viewer)
Compares ID with proof of address
Can approve or reject
If approved: User status → “kyc_verified”
If rejected: Sends rejection email with reason
User receives email: “KYC Approved! You can now apply for a loan”
PHASE 3: Loan Application
User now sees dashboard with:
Button: “Apply for Loan”
(Or: Card showing “No active loans”)
Loan Application Form
User fills:
1. Requested Amount ($100 - $10,000)
2. Requested Term (3, 6, 12, 24, 36 months)
3. Optional: Agent Code (if not entered at signup)
Real-Time Calculator Shows:
Loan Amount:              $1,000.00
Monthly Interest Rate:    5.0%
Monthly Interest Payment: $50.00
Initiation Fee (3%):      $30.00
Total Interest (12 mo):   $600.00
Total Cost:               $630.00
Net Funds You Receive:    $970.00
Interest/Month:           $50.00
Total to Repay:           $1,600.00
User sees terms clearly and clicks: “Apply Now”
Backend Action:
Creates Loan application record
Status: “pending_approval”
Stores all parameters
Sends SMS/Email: “Application received, admin will review”
PHASE 4: Loan Approval (Admin)
Admin sees in “Loan Applications” tab:
José Garcia - $1,000 requested, 12 months, Applied 2 hours ago
Button: “Review”
Admin clicks “Review”:
Modal Opens: Shows applicant info + document preview
Admin configures loan terms:
✓ Approved Amount: $1,000 (can change)
✓ Monthly Interest Rate: 5.0%
✓ Initiation Fee: 3%
✓ Grace Period: 0 days
✓ Delinquent Interest: 12%
✓ Minimum Interest-Only Months: 6
✓ Agent Commission: 10% (auto-filled if referred)
Admin clicks: “Approve Loan”
Backend Action:
Updates Loan status: “approved”
Locks in all terms (cannot change)
Auto-generates payment schedule:
Month 1: $50 due on Apr 15
Month 2: $50 due on May 15
…etc for 12 months
Creates contract PDF
Sends approval SMS/Email to user:
Your loan of $1,000 has been APPROVED!
Monthly payment: $50
Log in to view full details and arrange disbursement.
PHASE 5: Disbursement
User logs in and sees: “Approved - Arrange Disbursement”
User selects disbursement method:
1. Cash Delivery
Selects: Agent will pick up cash at location
Provides address/time preference
System notifies agent/staff
2. Bank Transfer
Provides account details
Bank name, account number, SWIFT code
Staff verifies and transfers funds
Backend:
Records disbursement method
Creates disbursement record
Sets status: “pending_disbursement”
After staff confirms: status → “active”
Once money delivered/transferred:
User status: “active_borrower”
Loan appears on user dashboard
Payment schedule begins
PHASE 6: Active Loan Management
User Dashboard Shows:
For Each Active Loan:
┌─────────────────────────────────────┐
│ LOAN-2024-001                       
│ Approved: $1,000 | Interest: 5%     
│                                     
│ Next Payment Due:                   
│ [$150.00] [12 days countdown]       
│
│
│
│
│
 WhatsApp Payment] [ Bank]    
│                                     
│ [
│                                     
│ Outstanding Balance: $1,000         
│ Total Interest Remaining: $600      
│
│
│
│
│
└─────────────────────────────────────┘
Live Countdown Timer:
Updates every second
Shows days remaining
Turns red when overdue
Updates balance if overdue (adds delinquent interest)
PHASE 7: Payment - WhatsApp Method
User Initiates Payment:
User clicks: “ WhatsApp Payment”
What Happens:
1. WhatsApp opens automatically
2. Pre-filled message appears:
Hello  I would like to make a payment for this loan: LOAN-2024-001. 
Amount due: $150.00. Please confirm the payment method and 
coordinate the receiving details.
3. User clicks “Send”
4. Your staff receives WhatsApp message
Staff Coordinates:
Staff: Hi José! Thank you for reaching out. 
       We can do cash pickup today at 3 PM 
       or tomorrow morning. What works for you?
José: Today at 3 PM is perfect!
Staff: Perfect! See you at 3 PM. Please have $150 ready.
       [Later at 3 PM - picks up $150 cash]
Staff: Received $150. Thank you José!
Payment Recorded in Admin:
Admin goes to: Admin Panel → Due Payments
Sees José Garcia in list:
Loan: LOAN-2024-001
Due: $150.00
Status: Overdue/Due Today/Upcoming
Admin clicks: “Custom Amount”
Enters: $150.00
Modal opens showing breakdown:
Amount Due: $150.00
Amount Received: $150.00
✓ EXACT PAYMENT
Clicks: “Record Payment”
Backend:
Creates LoanPayment record
Status: “PAID”
Amount: $150.00
Sends SMS to José:
Your payment of $150 for loan LOAN-2024-001 has been recorded.
Next payment due: May 15
Updates loan dashboard (removes from due, shows “PAID ✓”)
Calculates agent commission:
Interest paid: $150
Agent commission: $150 × 10% = $15
Updates Agent record
PHASE 8: Overdue Payment Scenario
User Misses Payment (Day 1):
Payment due: April 15
User doesn’t pay
April 16: Payment now overdue 1 day
What User Sees:
Dashboard updates:
 OVERDUE
5 days late
Next Payment Due: $155.00
(Includes delinquent interest)
Status: URGENT - PAY NOW
[ WhatsApp Payment] [ Bank]
Countdown timer turns RED Amount shows increased balance (delinquent interest accruing)
What Agent Sees:
Agent Portal automatically shows client in “Overdue” tab:
Miguel Santos
LOAN-2024-008
 5 DAYS OVERDUE
$175.00 due
Commission: $17.50
[ Urge Button]
 Urge”
Agent clicks “
WhatsApp opens with message:
¡Hola compa!  Tu pago está VENCIDO HACE 5 DÍAS. 
Préstamo: LOAN-2024-008 | Monto: $175.00 | 
Es URGENTE que realices el pago hoy. Gracias.
Agent sends message Miguel receives urgent reminder Miguel responds: “I’ll pay today”
Agent coordinates: “Perfect, I’ll pick up at 5 PM”
Admin Records Payment:
Miguel pays $175 (exact) Admin records in Due Payments Status: PAID ✓ Commission
unlocked for agent
PHASE 9: Partial Payment Scenario
User Can Only Pay Partial:
Client says: “I can only pay $100 today, not $150”
Admin in Due Payments:
Amount Due: $150
Enters: $100
Modal shows:
PARTIAL PAYMENT
Amount Due: $150
Amount Received: $100
Remaining: $50
Status: PARTIAL
Remaining $50 due next period
Clicks: “Record Payment”
What Updates:
Payment recorded as $100
$50 remaining balance carries forward
Next payment: $50 (old) + new interest = $X
SMS to client: “Partial payment of $100 recorded. Remaining: $50”
Agent commission: Only on paid amount
PHASE 10: Overpayment Scenario
User Pays More Than Due:
Client says: “I want to pay $250 to reduce my loan faster”
Amount normally due: $150 Amount paying: $250 Overpayment: $100
Admin in Due Payments:
Enters: $250
Modal shows:
✓ OVERPAYMENT
Amount Due: $150
Amount Received: $250
Interest Payment: $150
Principal Reduction: $100 ↓
Outstanding principal reduced by $100
Next payment will be lower
Clicks: “Record Payment”
What Updates:
Payment recorded: $250
Status: PAID (with overpayment)
Principal balance: Reduced by $100
Next month’s payment: Lower (less principal)
SMS to client: “Payment of $250 received! Your outstanding balance reduced by $100”
Agent commission: Only on $150 interest
Example:
Before Overpayment:
Outstanding Principal: $1,000
Next Month Interest: $50
After Overpayment ($100 principal paid):
Outstanding Principal: $900
Next Month Interest: $45 (5% of $900)
Savings: $5/month + full principal reduction
PHASE 11: Payment History
User can view Payment History page:
Due Date
Amount
Status
Apr 15
$150
Paid Date
✓ PAID
May 15
$150
Apr 15
✓ PAID
Jun 15
$150
May 16
 PENDING
Jul 15
$150 DUE SOON--
Shows all historical payments with status
PHASE 12: Loan Completion
After all 12 payments:
Final payment: $150
Total paid: $1,800 (principal + interest)
Outstanding: $0
Loan status: “COMPLETED ✓”
User sees: “Congratulations! Loan fully repaid”
Dashboard shows loan as completed User can apply for new loan if needed
Admin Dashboard Features
1. Dashboard Overview
Key Metrics Cards:
┌──────────────────┬──────────────────┬──────────────────┬──────────────┐
│ Active Loans     
│ Outstanding      
│ 24 loans         
│ $58,400          
│ Interest         
│ Delinquency  │
│ Collected $2,835 │ Rate 8.3%    
│
└──────────────────┴──────────────────┴──────────────────┴──────────────┘
Portfolio Health:
┌─────────────────────────────────────────────┐
│ On-Time Payments: 91.7% ████████████        
│
│ Late Payments:    8.3%  ██                  
│
└─────────────────────────────────────────────┘
Portfolio Summary:
Total revenue (interest + fees)
Collections rate
Average delinquency days
Agent commission paid
Projected interest revenue
2. Loan Applications & Approval
Pending Applications List:
Displays all applications waiting for approval:
Applicant
Requested
Term
Applied
José Garcia
$1,000
12 mo
Agent
Action
2 hrs ago
María López
$2,500
24 mo
None
[Review]
5 hrs ago
Miguel Santos
$500
6 mo
AG-001
[Review]
1 day ago
AG-002
[Review]
Approval Modal:
Admin clicks “Review” and sees:
Applicant Info:
Name, Email, WhatsApp
KYC documents preview
ID (front + back), Address proof
Loan Terms Configuration:
✓ Approved Amount: [input] (can differ from requested)
✓ Monthly Interest Rate (%): [input] default 5%
✓ Initiation Fee (%): [input] default 3%
✓ Grace Period (days): [input] default 0
✓ Delinquent Interest Rate (%): [input] default 12%
✓ Min Interest-Only Months: [input] default 6
✓ Agent Commission (%): [input] auto-filled 10% if referred
Buttons: [Approve Loan] [Reject Application]
On Approval:
Contract PDF auto-generated
Approval SMS/Email sent
Loan status: “approved”
Payment schedule created
User dashboard updated
3. Due Payments Management  CRITICAL
Access: Admin Panel → Due Payments Tab
Payment Display:
Lists all payments due from yesterday onwards
For each payment shows:
Borrower: Name + Loan ID
Due Date: Calendar date + days overdue
Amount Due: Total with delinquent interest if overdue
Action: Payment buttons
Payment Recording - 3 Scenarios:
Scenario A: Exact Payment
User paid exact amount due ($150)
Admin sees button: “✓ Confirm” Clicks: Modal opens
Confirm Exact Payment
Borrower: José Garcia
Loan: LOAN-2024-001
Amount: $150.00
☐ I confirm that $150.00 has been collected
[Confirm & Record] [Cancel]
Admin checks box and clicks “Confirm” Result: Payment marked PAID ✓, removed from list
Scenario B: Custom Amount - Partial Payment
User paid less than due ($100 of $150)
Admin sees: Input field for amount Enters: 100 Clicks: “Submit” button
Modal shows:
 PARTIAL PAYMENT
Amount Due: $150.00
Amount Collected: $100.00
Remaining: $50.00
→ Status: PARTIAL
→ $50 carries to next payment
[Record Payment] [Cancel]
Admin clicks “Record Payment” Result: Payment recorded, $50 remains owed
Scenario C: Custom Amount - Overpayment
User paid more than due ($250 of $150)
Admin enters: 250 Clicks: “Submit”
Modal shows:
✓ OVERPAYMENT
Amount Due: $150.00
Amount Collected: $250.00
Overpayment: $100.00
Interest Payment: $150.00
Principal Reduction: $100.00 ↓
Outstanding Principal Balance: 
$1,000 - $100 = $900
Next Payment (5% of $900):
$45.00 (down from $50)
[Record Payment] [Cancel]
Admin clicks “Record Payment” Result:
Interest marked paid: $150
Principal reduced: $100
Next month’s payment automatically recalculated
SMS to client: “Payment of $250 recorded! Principal reduced by $100”
Post-Payment UI:
Row updates to show:
✓ RECORDED
José Garcia
LOAN-2024-001
Collected: $150.00 | Principal Applied: $0 | Remaining: $0
[Undo] button available
4. User Management
Admin can:
View all registered users
Filter by KYC status (pending, approved, rejected)
View user loan history
Suspend/reactivate accounts
Manual KYC review if rejected
5. Agent Management
Admin can:
Create new agent account
Generate unique agent code (AG-2024-XXXX)
Set agent commission rate (usually 10%)
View agent-referred loans
Track agent earnings
Suspend/activate agents
6. Commission Management
Track commissions for all agents:
Agent
Clients
Rate
This Month
Carlos
12
10%
$320
Pending
All-Time
$145
Juan
8
10%
$210
$2,840
$95
Sofia
15
10%
$480
$1,680
$220
$3,200
Process monthly payout:
Aggregate all pending commissions
Pay to agent accounts
Update status to “PAID”
7. Disbursement Records
After loan approval, track disbursement:
Cash Delivery: Date/time/location of pickup
Bank Transfer: Account details, SWIFT code, transfer confirmation
Mark as completed when funds delivered
8. Reports & Analytics
Dashboards showing:
Daily/weekly/monthly collections
Interest revenue trends
Delinquency trends (% of loans late)
Agent performance rankings
Top borrowers
Export to CSV/Excel
Agent Portal Features
1. Agent Login
Email + Password login Shows agent info:
Name: Carlos Menendez
Code: AG-2024-CARLOS
Commission Rate: 10%
Referred Clients: 12
2. My Clients Dashboard
Shows all clients agent referred with payment status
Client Card Layout:
┌─────────────────────────────────────────────────────────┐
│ José Garcia                    
│ DUE TODAY    
│ LOAN-2024-001                  
│                                                          
│                     [
│              
 Remind] Button                  
│ $150.00 │
│ Comm: $15│
│
│
└─────────────────────────────────────────────────────────┘
For each client shows:
Name + Loan ID
Payment Status (color-coded badge)
Green: “DUE TODAY” or “ON-TIME”
Red: “X DAYS OVERDUE”
Gold: “DUE IN X DAYS”
Gray: “PAID”
Amount Due (large bold number)
Commission Earned for this loan
3. Status Filter Tabs
Tab 1: My Clients (Default)
Shows all 12 referred clients with status
Tab 2: Overdue
Shows only clients with late payments
María López: 2 DAYS OVERDUE, $200.00
Miguel Santos: 5 DAYS OVERDUE, $175.00 Total overdue from my clients: $375.00
Tab 3: Due Today
Shows clients with payments due today
José Garcia: DUE TODAY, $150.00 Total due today: $150.00
Tab 4: Upcoming
Shows future payment dates
Ana Rodriguez: DUE IN 8 DAYS, $225.00
[others…] Total upcoming: $1,050.00 in next 30 days
Tab 5: My Earnings
Shows commission breakdown:
Summary Cards:
Total Pending Commission    Commission Paid (This Month)    All-Time Earnings
$145.00                     $320.00                         $2,840.00
(waiting for collection)    (already received)              (since joining)
Breakdown Table:
Client
Loan
Rate
José Garcia
LOAN-2024-001
Commission
Status
10%
María López
LOAN-2024-005
$15.00
Pending
10%
Miguel Santos
LOAN-2024-008
$20.00
Pending
10%
Ana Rodriguez
LOAN-2024-012
$17.50
Pending
10%
$22.50
Paid
4. WhatsApp Payment Reminders 
Agent’s Daily Workflow:
 CRITICAL
Morning (9 AM):
1. Open Agent Portal
2. Click “Due Today” tab
3. See: José Garcia - DUE TODAY - $150.00
4. Click: “ Remind” button
What Happens:
WhatsApp opens automatically
Pre-filled message appears:
¡Hola compa!  Te recuerdo que tu pago está DUE TODAY. 
Préstamo: LOAN-2024-001 | Monto: $150.00 | 
Por favor realiza el pago hoy. ¡Gracias!
Agent clicks “Send”
José receives message in WhatsApp
Dynamic Messages Based on Status:
Message 1: Due Today
¡Hola compa!  Te recuerdo que tu pago está DUE TODAY. 
Préstamo: [LOAN_ID] | Monto: [AMOUNT] | 
Por favor realiza el pago hoy. ¡Gracias!
Message 2: 2 Days Overdue
¡Hola compa!  Tu pago está VENCIDO HACE 2 DÍAS. 
Préstamo: [LOAN_ID] | Monto: [AMOUNT] | 
Por favor realiza el pago cuanto antes. Gracias.
Message 3: 5+ Days Overdue
¡Hola compa!  Tu pago está VENCIDO HACE 5 DÍAS. 
Préstamo: [LOAN_ID] | Monto: [AMOUNT] | 
Es URGENTE que realices el pago hoy. Gracias.
Client Coordination:
José responds to agent’s WhatsApp:
José: Hola! Sí, hoy pago. Puedo a las 3 PM?
Agent: Perfecto! Te veo a las 3 PM. Gracias!
[Later at 3 PM - Agent collects $150 cash]
Agent: Recibido los $150. Gracias José!
José: Gracias hermano!
Agent Records Payment:
Agent logs into Admin Panel → Due Payments
Finds: José Garcia - LOAN-2024-001
Enters: $150.00
Clicks: “Record Payment”
Payment status: PAID ✓
Automatically:
José gets SMS confirmation
Agent’s commission becomes pending: $15.00
José’s dashboard updates
Next payment appears
User Dashboard Features
1. Hero/Landing Page
Before login:
Company logo + branding
Headline: “Get a Personal Loan Fast”
CTA buttons: [Login] [Sign Up]
Trust elements: Testimonials, stats
2. Authentication
Login Page:
Email input
Password input
Forgot password link
Sign up link
Signup (2-Step):
Step 1: Registration Details
Full Name
Email
WhatsApp Number
Agent Code (optional)
Password
Button: “Get Verification Code”
Step 2: WhatsApp OTP
Shows: “We sent code to +57 301 234 5678”
6-digit input field
Timer: “Expires in 9:45”
Button: “Verify Code”
Resend option (after 30 seconds)
3. Active Loans Dashboard
For Each Active Loan:
Loan Card:
┌─────────────────────────────────────┐
│ LOAN-2024-001                       
│ Approved: $1,000 | Interest: 5%     
│                                     
│ Next Payment Due:                   
│  [12] DAYS | $150.00              
│
│
│
│
│
│
│
│
│ Outstanding: $1,000 | Interest: $600│
│ Status: ✓ On-Time                   
│                                     
│ [ WhatsApp Payment] [ Bank]    
│                                     
│
└─────────────────────────────────────┘
For Overdue Loans:
┌─────────────────────────────────────┐
│ LOAN-2024-002                       
│ Approved: $2,500 | Interest: 5%     
│                                     
│  PAYMENT OVERDUE                  
│  [5] DAYS LATE | $250.00          
│                                     
│ [ WhatsApp Payment] [ Bank]    
│ (Red buttons - urgent)              
│                                     
│
│
│
│
│
│
│
│
│
│ Outstanding: $2,500 | Status: Late  │
└─────────────────────────────────────┘
Live Countdown Timer:
Updates every second
Shows days remaining
Turns red when overdue
Updates balance if delinquent
4. Apply for Loan Form
Available to verified users (KYC approved)
Inputs:
1. Loan Amount: $100 - $10,000
2. Loan Term: 3, 6, 12, 24, 36 months
3. Agent Code: (optional if not already entered)
Real-Time Calculator: Shows instantly as user changes values:
Loan Amount:              $1,000.00
Interest Rate (monthly):  5%
Initiation Fee:          3%
Monthly Payment:         $50.00
Total Interest:          $600.00
Initiation Fee:          $30.00
Total Cost:              $630.00
Net You Receive:         $970.00
Total to Repay:          $1,600.00
Submit:
Click “Apply Now”
Application received
Pending admin review
SMS/Email confirmation
5. Payment History
Table view of all payments:
Due Date
Amount
Status
Paid Date
Apr 15
$150
✓ PAID
Days Late
Apr 15
May 15
$150
✓ PAID
0
May 16
Jun 15
$150 PENDING
1
Jul 15
$150 DUE SOON--
Most recent first Color-coded by status
6. User Profile
Shows user info:
Name
Email
WhatsApp Number
National ID Type
KYC Status: ✓ Verified
Agent Code (if referred)
Member Since: Jan 15, 2024
Edit Profile button (change password, etc.)
WhatsApp Integration Points
1. User Signup OTP
System → User: 6-digit verification code
Twilio WhatsApp API
10-minute expiry
2. User Payment Request
User → System: Clicks “ WhatsApp Payment”
System → Your WhatsApp: User message with loan details
Staff → User: WhatsApp coordination
User makes payment
3. Agent Reminders
Agent Portal: Click “ Remind”/“ Urge”
System → Client: Dynamic message based on status
Client → Agent: WhatsApp response
Payment coordination & collection
4. Admin Notifications (Optional Future)
Could send status updates via WhatsApp
Payment reminders to users
Overduenotifications
Database Schema Overview
Core Tables:
Users
id, email, passwordHash, fullName, phoneWhatsapp, 
status, agentCode, kycStatus, createdAt, updatedAt
Loans
id, userId, approvedAmount, monthlyInterestRate %, 
initiationFee %, graceperiodDays, delinquentRate %, 
status, disbursedAt, createdAt, nextPaymentDue
LoanPayments
id, loanId, dueDate, amountDue, amountPaid, 
status (PAID/PARTIAL/PENDING), paidDate, 
delinquentInterestAccrued, createdAt
Agents
id, email, passwordHash, fullName, agentCode, 
commissionRate %, status, createdAt
AgentReferrals
id, agentId, userId, loanId, commissionAmount, 
commissionStatus (PENDING/PAID), createdAt
Documents (KYC)
id, userId, documentType, s3Url, uploadedAt, 
adminReviewedAt, approvalStatus
AuditLog
id, adminId, action, targetId, targetType, 
details, createdAt
API Endpoints
Authentication
POST /api/auth/register - Start signup
POST /api/auth/verify-otp - Verify WhatsApp OTP
POST /api/auth/resend-otp - Resend OTP
POST /api/auth/login - User login
POST /api/auth/refresh-token - Get new access token
POST /api/auth/logout - Logout
Loans
POST /api/loans/apply - Submit loan application
GET /api/loans/active - Get user’s active loans
GET /api/loans/:id - Get loan details
POST /api/loans/:id/approve - [Admin] Approve loan
POST /api/loans/:id/reject - [Admin] Reject loan
POST /api/loans/:id/disburse - [Admin] Record disbursement
Payments
POST /api/payments/submit - Record payment
GET /api/payments/history - Payment history
GET /api/payments/due - [Admin] Due payments list
POST /api/payments/:id/record-exact - Record exact payment
POST /api/payments/:id/record-custom - Record custom amount
Users
GET /api/users/profile - Get user profile
PUT /api/users/profile - Update profile
POST /api/users/kyc/upload - Upload KYC documents
GET /api/users/:id/kyc - [Admin] View KYC documents
POST /api/users/:id/kyc/approve - [Admin] Approve KYC
Agents
GET /api/agents/clients - Agent’s referred clients
GET /api/agents/earnings - Agent commission summary
POST /api/agents/reminder - Send WhatsApp reminder
GET /api/agents/dashboard - Agent dashboard data
Admin
GET /api/admin/dashboard - Admin overview
GET /api/admin/applications - Pending loan applications
GET /api/admin/agents - Agent list
GET /api/admin/reports - Financial reports
Business Logic & Calculations
Interest Calculation
Monthly Interest = Approved Amount × Monthly Interest Rate %
Example: $1,000 × 5% = $50/month
Total Interest = Monthly Interest × Number of Months
Example: $50 × 12 = $600 total
User Pays Back = Approved Amount + Total Interest
Example: $1,000 + $600 = $1,600
Initiation Fee
Initiation Fee = Approved Amount × Fee %
Example: $1,000 × 3% = $30
User Receives = Approved Amount - Initiation Fee
Example: $1,000 - $30 = $970
Delinquent Interest (Accrues Daily)
Days Overdue = Today - Due Date
Delinquent Interest = (Outstanding Balance × Delinquent Rate % × Days Overdue) / 30
Example:
Balance: $50
Rate: 12% annual (1% monthly)
Days Late: 5
Delinquent = ($50 × 12% × 5) / 30 = $1.00
New Balance Due = $50 + $1.00 = $51.00
Agent Commission
Commission = Interest Paid × Commission Rate %
Example: $150 interest paid × 10% = $15 commission
Only earned when client actually pays
Not when loan is approved
Overpayment to Principal
Amount Due: $150 (interest)
Amount Paid: $250
Overpayment: $100
$150 → Interest Payment
$100 → Reduce Outstanding Principal
New Outstanding = Old Outstanding - $100
New Next Payment = (New Outstanding × Rate)
Partial Payment
Amount Due: $150
Amount Paid: $100
Remaining: $50
$100 → Interest Payment
$50 → Carries to next payment (no delinquent charge yet)
Next Period:
New Due = $50 (remaining) + $50 (new interest) = $100
Security & Compliance
Authentication
✓ JWT tokens (15-min access, 7-day refresh)
✓ bcrypt password hashing (10+ rounds)
✓ HTTPS/TLS only
✓ CSRF protection on forms
Data Protection
✓ PII encrypted at rest (AES-256)
✓ Sensitive data (bank accounts) masked
✓ Document files on AWS S3 (encrypted)
✓ Database backups with point-in-time recovery
Compliance
✓ KYC verification required
✓ AML checks on large amounts
✓ Document retention policy (7 years)
✓ GDPR data deletion options
✓ Audit trail of all admin actions
Rate Limiting
✓ API: 1000 requests/hour per IP
✓ OTP: Max 3 failed attempts, 1-hour lockout
✓ Resend: 30-second cooldown
✓ Login: 5 failed attempts locks account 1 hour
Technology Stack
Frontend
React 18+ with TypeScript
Tailwind CSS or Material-UI
React Hook Form (form management)
Axios (HTTP client)
Redux Toolkit or Zustand (state)
Backend
Node.js 18+ with Express.js/NestJS
TypeScript
PostgreSQL database
Prisma ORM
Redis (caching, OTP storage)
Twilio (WhatsApp, SMS)
SendGrid (Email)
AWS S3 (Document storage)
DevOps
Docker for containerization
GitHub Actions for CI/CD
AWS deployment (EC2, RDS, S3)
Sentry for error tracking
Implementation Priority
Phase 1 (Weeks 1-5): Core Infrastructure
User registration with WhatsApp OTP 
KYC document upload
Authentication system
Database setup
Phase 2 (Weeks 6-10): Loan Management
Loan application form
Admin approval workflow
Disbursement management
Payment scheduling
Phase 3 (Weeks 11-17): Collection System 
Due Payments Management 
WhatsApp payment requests
Agent Portal 
WhatsApp agent reminders 
Phase 4 (Weeks 18-24): Polish & Launch
Admin dashboard
Reports & analytics
Testing & QA
Deployment
Complete User Journey Map
┌─────────────────────────────────────────────────────────────────┐
│
                    COMPLETE USER JOURNEY                         
└─────────────────────────────────────────────────────────────────┘
1. DISCOVERY
   Homepage → Learn about loans → Sign Up button
2. SIGNUP (2-Step)
   Step 1: Email, WhatsApp, Password
↓ (Click "Get Code")
   Step 2: WhatsApp OTP Verification
↓ (Enter 6 digits)
   Account Created ✓
3. KYC VERIFICATION
   Upload ID front/back + Address proof
↓ (Wait for admin review)
   KYC Approved ✓
4. LOAN APPLICATION
   View loan form → Enter amount/term
↓ (Click "Apply Now")
   Application submitted
↓ (Wait for admin review)
5. LOAN APPROVAL
   Admin approves terms
↓ (Sends notification)
   User sees: "Approved for $1,000"
6. DISBURSEMENT
   User chooses: Cash or Bank Transfer
↓ (Staff delivers/transfers)
   Money received ✓
│
7. ACTIVE LOAN
   Dashboard shows active loan
↓ (Next payment due date)
   Payment countdown timer
8. PAYMENT DUE
   Reminder SMS/Email
↓ (Due date approaches)
9. PAYMENT - USER INITIATES
   Clicks: " WhatsApp Payment"
↓ (WhatsApp opens with message)
   Sends request to staff
10. PAYMENT - STAFF COORDINATES
    Staff receives WhatsApp
↓ (Coordinates pickup)
    Client makes payment
11. PAYMENT - ADMIN RECORDS
    Admin logs into Due Payments
↓ (Enters amount)
    Records payment (exact/partial/overpay)
12. PAYMENT CONFIRMED
    Client receives SMS: "Payment received"
↓ (Dashboard updates)
    Payment history updated
    Next payment scheduled
13. LOAN COMPLETION (After all payments)
    Final payment recorded
↓ (Loan marked complete)
    Congratulations message
14. OPTIONS
    - Apply for new loan (repeat from step 4)
    - Close account
    - Refer agent and earn commissions
Agent Journey Map
┌─────────────────────────────────────────────────────────────────┐
│
                    AGENT JOURNEY MAP                             
│
└─────────────────────────────────────────────────────────────────┘
1. REFER CUSTOMER
   Agent promotes loan product
↓ (Customer signs up with agent code: AG-2024-CARLOS)
2. CUSTOMER APPROVED
   Loan approved by admin
↓ (Automatic commission assigned)
   Commission: Pending $15
3. DAILY MANAGEMENT
   MORNING:
   Open Agent Portal
↓ (Click "Due Today")
   See: José Garcia - $150 due
   CLICK: " Remind"
↓ (WhatsApp opens)
   Message: "¡Hola compa! Tu pago está DUE TODAY..."
↓ (Agent sends)
4. CLIENT COORDINATION
   José responds: "3 PM today?"
↓ (Agent confirms)
   Agent: "Perfect! See you at 3 PM"
5. PAYMENT COLLECTION
   Agent picks up $150 cash
↓ (Confirms with client)
   Client: "Here's $150"
6. ADMIN RECORDING
   Agent (or admin) records in Due Payments
↓ (Enter $150)
   Payment status: PAID ✓
7. COMMISSION TRIGGERED
   Commission becomes Pending: $15
↓ (Admin processes monthly)
   Commission status: Paid
↓ (Money transferred to agent)
8. EARNINGS TRACKING
   Agent Portal → Earnings tab
   Shows: $15 commission for José
   Shows: Total pending: $145
   Shows: This month paid: $320
   Shows: All-time earnings: $2,840
Complete Feature Checklist
User Features
✓ WhatsApp OTP signup verification
✓ KYC document upload
✓ Loan application with calculator
✓ Active loans dashboard with countdown
✓ Payment history tracking
✓ WhatsApp payment request button
✓ Bank transfer option
✓ Delinquency alerts
✓ User profile management
Agent Features
✓ Agent login & authentication
✓ My Clients dashboard
✓ Payment status filtering (due, overdue, upcoming)
✓ WhatsApp payment reminders (smart dynamic messages)
✓ Commission tracking
✓ Earnings dashboard
✓ Real-time commission updates
Admin Features
✓ Dashboard with KPIs
✓ Loan application review & approval
✓ Configurable loan terms
✓ Contract PDF generation
✓ Due Payments management (exact/partial/overpay)
✓ User KYC management
✓ Agent management
✓ Commission payout processing
✓ Reports & analytics
✓ Audit logging
Integrations
✓ Twilio WhatsApp API (OTP + reminders)
✓ SendGrid (Email notifications)
✓ AWS S3 (Document storage)
✓ Stripe/PayPal (Optional: payment processing)
✓ Redis (OTP storage, caching)
Success Metrics
For Users:
Signup conversion rate: Target > 80%
KYC approval rate: Target > 95%
Loan application completion: Target > 85%
Payment on-time rate: Target > 90%
For Agents:
Client referrals: Target > 5 per month
Collection rate: Target > 85%
Commission earned: Target > $200/month
Agent retention: Target > 90%
For Business:
Active loans: Target > 100
Portfolio revenue: Target > $50K/month
Delinquency rate: Target < 10%
Customer lifetime value: Target > $2,000
This is your complete application specification. Everything is defined, ready for
development! 
Next Steps for Developer
1. Week 1: Read this entire document
2. Week 2: Ask clarifying questions
3. Week 3: Setup development environment
4. Week 4: Start Phase 1 (authentication + OTP)
5. Week 11: Priority features (due payments, WhatsApp, agent portal)
Total timeline: 20-24 weeks for complete development
Contact: [Your contact info]
Last Updated: April 18, 2024
Status: Ready for Development