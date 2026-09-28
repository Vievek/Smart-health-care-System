SE4030 – SECURE SOFTWARE DEVELOPMENT
Group Assignment: Security Vulnerability Assessment and Remediation
Application: Smart Health Care System
Group ID: 3

GROUP MEMBERS
IT23259720 – T. Vievegan
IT23193840 – K. Vanaiyalini
IT22643254 – R. Shevoni
IT23190184 – P. Deepatharshan

REPOSITORIES
Original vulnerable project: Branch - Main
https://github.com/Vievek/Smart-health-care-System

Modified project (security fixes and OAuth implementation): Baranch - SSD-final
https://github.com/Vievek/Smart-health-care-System

VIDEO DEMONSTRATION
YouTube link: https://youtu.be/gK4hdOY3cmc
Duration: 21 minutes 15 seconds

SUBMISSION CONTENTS
- README.txt: Group details and project links
- Security Vulnerability Assessment & Remediation Report.pdf: Findings, fixes, tests, and OAuth implementation

PROJECT SUMMARY
The group assessed the Smart Health Care System using source-code review, Git history review, dependency auditing, and API testing with Postman. The report documents nine security findings (F1–F9), including one partially resolved dependency issue, along with the fixes and verification evidence. The modified project also adds a Google Sign-In OAuth 2.0 function.

INDIVIDUAL CONTRIBUTIONS
T. Vievegan: F2 (registration privilege escalation), F6 (NoSQL injection), F7 (vulnerable dependencies), and OAuth 2.0 implementation.
K. Vanaiyalini: F1 (exposed database/JWT secrets), F3 (medical-record IDOR), and report compilation.
R. Shevoni: F5 (appointment IDOR) and F9 (sensitive logging and audit trail).
P. Deepatharshan: F4 (user-data/password-hash exposure) and F8 (wildcard CORS).

BEFORE SUBMISSION
Replace the YouTube placeholder, verify that the link is accessible, and ensure the final report PDF is included in the ZIP.