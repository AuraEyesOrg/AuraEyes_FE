import json

flows = [
    # 3.1
    ("3.1.1", "Register Patient Account", "Patient", "System", "Email Service", "Submit Registration", "Validate Data", "Send OTP", "Verify OTP", "Activate Account"),
    ("3.1.2", "Patient Login (Standard & OAuth 2.0)", "Patient", "System", "Google OAuth", "Submit Credentials / Select Google", "Check Provider", "Authenticate Token", "Generate JWT", "Login Success"),
    ("3.1.3", "Internal Staff Secure Login", "Staff", "System", "Database", "Submit Credentials", "Validate Credentials", "Check Role & Status", "Generate JWT", "Login Success"),
    ("3.1.4", "Manage Internal Accounts & RBAC Policies", "SystemAdmin", "System", "Database", "Select Account & Roles", "Validate Admin Rights", "Update Roles", "Save Changes", "Notify User"),

    # 3.2
    ("3.2.1", "Manage Patient Profile", "Patient", "System", "Database", "Edit Profile Info", "Validate Input", "Update Records", "Save Changes", "Return Success"),
    ("3.2.2", "Manage Ophthalmologist Profile", "Ophthalmologist", "System", "Database", "Update Specialization/Info", "Validate Input", "Update Records", "Save Changes", "Return Success"),
    ("3.2.3", "Submit Leave of Absence Request", "Ophthalmologist", "System", "Database", "Select Dates & Submit", "Check Existing Schedules", "Block Calendar", "Save Request", "Notify Admin"),
    ("3.2.4", "Process Leave of Absence Request", "SystemAdmin", "System", "Database", "Review Request", "Approve or Reject", "Update Request Status", "Adjust Calendar", "Notify Ophthalmologist"),

    # 3.3
    ("3.3.1", "Schedule Online Appointment & Pay Deposit", "Patient", "System", "Payment Gateway", "Select Doctor & Time", "Hold Slot", "Process Payment", "Confirm Booking", "Send Notification"),
    ("3.3.2", "Register Walk-in Patient", "ClinicStaff", "System", "Database", "Input Patient Info", "Validate Info", "Create Appointment", "Add to Queue", "Print Ticket"),
    ("3.3.3", "Verify Online Booking Check-in", "ClinicStaff", "System", "Database", "Scan/Enter Booking ID", "Verify Booking Status", "Mark Checked-In", "Add to Queue", "Return Success"),
    ("3.3.4", "Manage Daily Appointment Schedules", "ClinicStaff", "System", "Database", "Select Date/Doctor", "Fetch Appointments", "Filter Data", "Return Schedule", "View Schedule"),

    # 3.4
    ("3.4.1", "Route Patient Cases", "ClinicStaff", "System", "Database", "Select Patient Case", "Check Doctor Availability", "Assign Doctor", "Update Case", "Notify Doctor"),
    ("3.4.2", "Upload Retinal Photo & Trigger AI Analysis", "ClinicStaff", "System", "AI Service", "Upload Image", "Validate Image Format", "Run AI Model", "Generate Heatmap/Score", "Notify Doctor"),
    ("3.4.3", "View AI Screening Results & EMR", "Ophthalmologist", "System", "Database", "Select Patient", "Fetch AI & EMR Data", "Aggregate Data", "Return Results", "Display to Doctor"),
    ("3.4.4", "Create Final Medical Diagnosis", "Ophthalmologist", "System", "Database", "Review Data & Input Diagnosis", "Validate Diagnosis", "Override/Confirm AI", "Save Diagnosis", "Notify Patient"),
    ("3.4.5", "Customize Patient Health Roadmap", "Ophthalmologist", "System", "Database", "Select Roadmap Template", "Fill Custom Info", "Generate PDF", "Save Roadmap", "Notify Patient"),

    # 3.5
    ("3.5.1", "Settle Final Payment & Complete Transaction", "ClinicStaff", "System", "Database", "Calculate Final Bill", "Deduct Deposit", "Process Payment", "Close Transaction", "Generate Invoice"),
    ("3.5.2", "Configure Clinic Service Pricing", "SystemAdmin", "System", "Database", "Input New Prices", "Validate Pricing Rules", "Update Price List", "Save Config", "Return Success"),
    ("3.5.3", "Monitor Clinic Operational & Financial Metrics", "SystemAdmin", "System", "Database", "Select Date Range", "Calculate Metrics", "Aggregate Financials", "Generate Report", "Display Dashboard"),
    ("3.5.4", "Audit System Activities & Transactions", "SystemAdmin", "System", "Database", "Select Audit Criteria", "Query Logs", "Filter Activities", "Return Audit Trail", "Display Audit Data"),
    ("3.5.5", "View Patient Transaction History", "Patient", "System", "Database", "Navigate to History", "Fetch Transactions", "Format Data", "Return History", "Display History"),

    # 3.6
    ("3.6.1", "View Patient Medical History", "Patient", "System", "Database", "Navigate to Medical Records", "Fetch Past Diagnoses", "Fetch Roadmaps", "Return Records", "Display Records"),
    ("3.6.2", "View & Download Clinical Results", "Patient", "System", "File Storage", "Click Download PDF", "Fetch Document", "Generate Secure Link", "Return Link", "Download File"),
    ("3.6.3", "Initiate Post-Visit Follow-up Chat", "Patient", "System", "Database", "Open Chat Window", "Check Session Validity", "Send Message", "Save Message", "Notify Doctor"),
    ("3.6.4", "Respond to Post-Visit Follow-up Chat", "Ophthalmologist", "System", "Database", "Open Patient Chat", "Load History", "Send Reply", "Save Message", "Notify Patient"),

    # 3.7
    ("3.7.1", "Share Clinical Cases & Internal Chat", "Ophthalmologist", "System", "Database", "Create Post/Case", "Anonymize Data", "Publish to Network", "Save Post", "Notify Peers"),
    ("3.7.2", "Initiate Peer Video Consultation", "Ophthalmologist", "System", "Google Meet API", "Click Start Call", "Generate Meet Link", "Create Call Event", "Share Link in Chat", "Join Call"),
    ("3.7.3", "Moderate Internal Network Communications", "SystemAdmin", "System", "Database", "Review Flagged Post", "Check Policy", "Hide/Delete Post", "Update Status", "Notify Author"),

    # 3.8
    ("3.8.1", "Dispatch Patient Notifications", "System", "Notification Engine", "Email/SMS Provider", "Trigger Event (Booking/Result)", "Format Message", "Queue Notification", "Send to Provider", "Deliver to Patient"),
    ("3.8.2", "Dispatch Ophthalmologist Notifications", "System", "Notification Engine", "Push Provider", "Trigger Event (New Case/Chat)", "Format Message", "Queue Notification", "Send Push", "Deliver to Doctor"),
    ("3.8.3", "Dispatch Clinic Staff Notifications", "System", "Notification Engine", "Push Provider", "Trigger Event (Walk-in/Payment)", "Format Message", "Queue Notification", "Send Push", "Deliver to Staff"),
    ("3.8.4", "Dispatch System Admin Notifications", "System", "Notification Engine", "Push Provider", "Trigger Event (Leave Req)", "Format Message", "Queue Notification", "Send Push", "Deliver to Admin"),
]

sections = {
    "3.1": "Authentication & Authorization",
    "3.2": "User Profile & Leave Management",
    "3.3": "Appointment & Scheduling Management",
    "3.4": "Clinical Operations & AI Integration",
    "3.5": "Financial & Checkout Operations",
    "3.6": "Medical Records & Post-Visit Care",
    "3.7": "Internal Knowledge Network",
    "3.8": "System Notification Dispatching"
}

output = "# AuraEyes Activity Diagrams (Swimlane Format)\n\n"
output += "*Note: These diagrams use Mermaid Flowchart syntax with subgraphs to perfectly simulate UML Activity Diagram Swimlanes, matching the provided standard.*\n\n"

current_sec = ""

for item in flows:
    id_val, title, actor1, actor2, actor3, step1, step2, step3, step4, step5 = item
    sec = id_val[:3]
    if sec != current_sec:
        current_sec = sec
        output += f"## {sec} {sections[sec]}\n\n"
    
    # Customizing flow structure to mimic decision diamonds and swimlane passes
    diagram = f"""### {id_val} {title}

```mermaid
flowchart TD
    %% Define styles for UML-like appearance
    classDef startStop fill:#000,stroke:#000,color:#fff,shape:circle;
    classDef action fill:#66b2ff,stroke:#000,color:#000,rx:10,ry:10;
    classDef decision fill:#fff,stroke:#000,color:#000,shape:diamond;

    subgraph {actor1}
        start(( )):::startStop --> A[{step1}]:::action
        A --> dec1
        D[{step5}]:::action --> stop((X)):::startStop
    end

    subgraph {actor2}
        dec1{{Validation}}:::decision
        dec1 -- "[Invalid]" --> err[Return Error]:::action
        err --> stop
        dec1 -- "[Valid]" --> B[{step2}]:::action
        B --> C[{step3}]:::action
        E[{step4}]:::action --> D
    end

    subgraph {actor3}
        C --> dec2{{Process Check}}:::decision
        dec2 -- "[Failed]" --> err
        dec2 -- "[Success]" --> E
    end
```
"""
    output += diagram + "\n"

with open(r"e:\FPT\SP26_Term9\SEP490\AuraEyes_BE\docs\activityDiagram.md", "w", encoding="utf-8") as f:
    f.write(output)

print("Activity Diagram Markdown generated successfully.")
