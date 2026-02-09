# Team Clawctor API Integration Skill

This document provides comprehensive API documentation for integrating with the Team Clawctor security assessment system. The system allows you to submit questionnaires, receive task IDs, and view generated security reports.

## Base URL

```
Production: https://api.clawctor.com
Development: http://localhost:3001
```

## Authentication

Currently, the API does not require authentication for questionnaire submission. Future versions may include API key authentication.

---

## API Endpoints

### 1. Get Questionnaire Template

Retrieve the questionnaire template structure before submission.

**Endpoint:** `GET /api/questionnaires/template`

**Response:**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "sectionKey": "company_info",
        "title": "Company Information",
        "icon": "building",
        "questions": [
          {
            "questionCode": "CI_001",
            "questionText": "What is your company name?",
            "type": "text",
            "required": true
          }
        ]
      }
    ]
  }
}
```

---

### 2. Submit Questionnaire

Submit a completed questionnaire for security assessment.

**Endpoint:** `POST /api/questionnaires`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "companyName": "Acme Corporation",
  "organizationId": "org_12345",
  "submitterEmail": "security@acme.com",
  "submitterName": "John Doe",
  "source": "web_portal",
  "sections": [
    {
      "sectionKey": "company_info",
      "title": "Company Information",
      "icon": "building",
      "answers": [
        {
          "questionCode": "CI_001",
          "questionText": "What is your company name?",
          "answerText": "Acme Corporation"
        },
        {
          "questionCode": "CI_002",
          "questionText": "Company size",
          "answerJson": {
            "employees": "100-500",
            "locations": ["US", "EU"]
          }
        }
      ]
    },
    {
      "sectionKey": "security_practices",
      "title": "Security Practices",
      "icon": "shield",
      "answers": [
        {
          "questionCode": "SP_001",
          "questionText": "Do you have a security policy?",
          "answerText": "Yes",
          "attachments": [
            {
              "fileName": "security_policy.pdf",
              "fileType": "application/pdf",
              "fileSize": 102400,
              "fileUrl": "https://storage.example.com/files/security_policy.pdf",
              "description": "Company security policy document"
            }
          ]
        }
      ]
    }
  ]
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `companyName` | string | Name of the company being assessed |
| `sections` | array | Array of section objects containing answers |
| `sections[].sectionKey` | string | Unique identifier for the section |
| `sections[].title` | string | Display title of the section |
| `sections[].answers` | array | Array of answer objects |
| `sections[].answers[].questionCode` | string | Unique code for the question |
| `sections[].answers[].questionText` | string | The question text |

**Optional Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `organizationId` | string | External organization identifier |
| `submitterEmail` | string | Email of the person submitting |
| `submitterName` | string | Name of the person submitting |
| `source` | string | Source of submission (default: "web_portal") |
| `sections[].icon` | string | Icon identifier for the section |
| `sections[].answers[].answerText` | string | Text answer |
| `sections[].answers[].answerJson` | object | Structured JSON answer |
| `sections[].answers[].attachments` | array | File attachments |

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cm6z1234abcd5678efgh",
    "assetHash": "a1b2c3d4e5f6...",
    "status": "SUBMITTED",
    "submittedAt": "2026-02-09T17:00:00.000Z",
    "companyName": "Acme Corporation",
    "sectionsCount": 2,
    "totalQuestions": 3,
    "task": {
      "taskId": "cm6z5678ijkl9012mnop",
      "status": "PROCESSING"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    "companyName is required and must be a string",
    "sections[0].sectionKey is required"
  ]
}
```

---

### 3. Get Task Status

Check the status of a security assessment task.

**Endpoint:** `GET /api/tasks/:taskId`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `taskId` | string | The task ID returned from questionnaire submission |

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cm6z5678ijkl9012mnop",
    "questionnaireId": "cm6z1234abcd5678efgh",
    "status": "COMPLETED",
    "riskScore": 72,
    "riskLevel": "MEDIUM",
    "confidenceScore": 85,
    "summary": "The organization demonstrates moderate security practices...",
    "findings": [
      {
        "category": "Access Control",
        "severity": "HIGH",
        "description": "Multi-factor authentication not enforced",
        "recommendation": "Implement MFA for all user accounts"
      }
    ],
    "reportStatus": "PENDING",
    "createdAt": "2026-02-09T17:00:00.000Z",
    "completedAt": "2026-02-09T17:05:00.000Z"
  }
}
```

**Task Status Values:**
| Status | Description |
|--------|-------------|
| `PENDING` | Task created, waiting to be processed |
| `PROCESSING` | AI is analyzing the questionnaire |
| `COMPLETED` | Analysis complete, ready for report |
| `FAILED` | Analysis failed |

---

### 4. Get Report Status

Check if the detailed report is ready.

**Endpoint:** `GET /api/tasks/:taskId/report-status`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "taskId": "cm6z5678ijkl9012mnop",
    "reportStatus": "COMPLETED",
    "reportGeneratedAt": "2026-02-09T17:10:00.000Z",
    "reportError": null,
    "hasReport": true
  }
}
```

**Report Status Values:**
| Status | Description |
|--------|-------------|
| `PENDING` | Report not yet requested |
| `GENERATING` | Report is being generated |
| `COMPLETED` | Report is ready to view |
| `FAILED` | Report generation failed |

---

### 5. View Report

Access the full HTML security assessment report.

**Endpoint:** `GET /api/tasks/:taskId/report`

**Success Response (200 OK):**
- Content-Type: `text/html; charset=utf-8`
- Returns the full HTML report document

**Report URL for Users:**
```
https://app.clawctor.com/tasks/{taskId}
```

Provide this URL to users so they can view their security assessment report in the web application.

---

### 6. Record Payment and Generate Report

Submit payment confirmation to unlock the full report.

**Endpoint:** `POST /api/tasks/:taskId/payment`

**Request Body:**
```json
{
  "txHash": "0x1234567890abcdef...",
  "amount": 100
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "taskId": "cm6z5678ijkl9012mnop",
    "reportStatus": "GENERATING",
    "message": "Payment recorded. Report generation started."
  }
}
```

---

## Complete Integration Flow

### Step 1: Submit Questionnaire

```bash
curl -X POST https://api.clawctor.com/api/questionnaires \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Acme Corporation",
    "submitterEmail": "security@acme.com",
    "sections": [
      {
        "sectionKey": "security_basics",
        "title": "Security Basics",
        "answers": [
          {
            "questionCode": "SB_001",
            "questionText": "Do you have a security policy?",
            "answerText": "Yes, we have a comprehensive security policy"
          }
        ]
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cm6z1234abcd5678efgh",
    "task": {
      "taskId": "cm6z5678ijkl9012mnop",
      "status": "PROCESSING"
    }
  }
}
```

### Step 2: Poll Task Status

```bash
curl https://api.clawctor.com/api/tasks/cm6z5678ijkl9012mnop
```

Wait until `status` is `COMPLETED`.

### Step 3: Provide Report Link to User

Once the task is completed, provide the user with the report viewing URL:

```
https://app.clawctor.com/tasks/cm6z5678ijkl9012mnop
```

The user can:
1. View the risk assessment summary (free)
2. Pay to unlock the full detailed report
3. Download the complete HTML report

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request - validation error |
| 404 | Resource not found |
| 409 | Conflict - resource already exists |
| 500 | Internal server error |

### Error Response Format

```json
{
  "error": "Error message description",
  "details": ["Detailed error 1", "Detailed error 2"]
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| POST /api/questionnaires | 10 requests per minute |
| GET /api/tasks/* | 60 requests per minute |
| POST /api/tasks/*/payment | 5 requests per minute |

---

## Webhooks (Coming Soon)

Configure webhooks to receive notifications when:
- Task analysis is completed
- Report is generated
- Payment is confirmed

---

## SDK Examples

### JavaScript/TypeScript

```typescript
interface QuestionnaireSubmission {
  companyName: string;
  submitterEmail?: string;
  sections: Section[];
}

interface Section {
  sectionKey: string;
  title: string;
  answers: Answer[];
}

interface Answer {
  questionCode: string;
  questionText: string;
  answerText?: string;
  answerJson?: Record<string, unknown>;
}

async function submitQuestionnaire(data: QuestionnaireSubmission) {
  const response = await fetch('https://api.clawctor.com/api/questionnaires', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Submission failed: ${response.statusText}`);
  }
  
  return response.json();
}

async function getTaskStatus(taskId: string) {
  const response = await fetch(`https://api.clawctor.com/api/tasks/${taskId}`);
  return response.json();
}

async function pollUntilComplete(taskId: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getTaskStatus(taskId);
    
    if (result.data.status === 'COMPLETED') {
      return result.data;
    }
    
    if (result.data.status === 'FAILED') {
      throw new Error('Task processing failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Timeout waiting for task completion');
}

// Usage
async function main() {
  const submission = await submitQuestionnaire({
    companyName: 'Acme Corp',
    submitterEmail: 'security@acme.com',
    sections: [
      {
        sectionKey: 'security',
        title: 'Security Assessment',
        answers: [
          {
            questionCode: 'Q1',
            questionText: 'Do you have MFA enabled?',
            answerText: 'Yes, for all employees',
          },
        ],
      },
    ],
  });
  
  console.log('Questionnaire submitted:', submission.data.id);
  console.log('Task ID:', submission.data.task.taskId);
  
  // Poll for completion
  const task = await pollUntilComplete(submission.data.task.taskId);
  
  console.log('Risk Score:', task.riskScore);
  console.log('Risk Level:', task.riskLevel);
  
  // Provide report link to user
  const reportUrl = `https://app.clawctor.com/tasks/${task.id}`;
  console.log('View Report:', reportUrl);
}
```

### Python

```python
import requests
import time

BASE_URL = "https://api.clawctor.com"

def submit_questionnaire(data: dict) -> dict:
    response = requests.post(
        f"{BASE_URL}/api/questionnaires",
        json=data,
        headers={"Content-Type": "application/json"}
    )
    response.raise_for_status()
    return response.json()

def get_task_status(task_id: str) -> dict:
    response = requests.get(f"{BASE_URL}/api/tasks/{task_id}")
    response.raise_for_status()
    return response.json()

def poll_until_complete(task_id: str, max_attempts: int = 30) -> dict:
    for _ in range(max_attempts):
        result = get_task_status(task_id)
        status = result["data"]["status"]
        
        if status == "COMPLETED":
            return result["data"]
        
        if status == "FAILED":
            raise Exception("Task processing failed")
        
        time.sleep(2)
    
    raise Exception("Timeout waiting for task completion")

# Usage
if __name__ == "__main__":
    submission = submit_questionnaire({
        "companyName": "Acme Corp",
        "submitterEmail": "security@acme.com",
        "sections": [
            {
                "sectionKey": "security",
                "title": "Security Assessment",
                "answers": [
                    {
                        "questionCode": "Q1",
                        "questionText": "Do you have MFA enabled?",
                        "answerText": "Yes, for all employees"
                    }
                ]
            }
        ]
    })
    
    task_id = submission["data"]["task"]["taskId"]
    print(f"Task ID: {task_id}")
    
    task = poll_until_complete(task_id)
    print(f"Risk Score: {task['riskScore']}")
    print(f"Risk Level: {task['riskLevel']}")
    
    report_url = f"https://app.clawctor.com/tasks/{task['id']}"
    print(f"View Report: {report_url}")
```

---

## Support

For API support or questions:
- Email: api-support@clawctor.com
- Documentation: https://docs.clawctor.com
- Status Page: https://status.clawctor.com
