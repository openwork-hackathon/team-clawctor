# Team Clawctor API Integration Skill

This document provides comprehensive API documentation for integrating with the Team Clawctor security assessment system. The system allows you to submit questionnaires, receive task IDs, and view generated security reports.

## Authentication

Currently, the API does not require authentication for questionnaire submission. Future versions may include API key authentication.

---

## API Endpoints

### 1. Get Questionnaire Template

Retrieve the latest questionnaire template structure before submission.

**Endpoint:** `GET /api/latest_questionnaires`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cmlg8sbzo0000bpqt1m35rptg",
    "sections": [
      {
        "id": "cm6z1234abcd5678efgh",
        "title": "Company Information",
        "icon": "building",
        "order": 0,
        "questions": [
          {
            "id": "cm6q1234abcd5678wxyz",
            "questionCode": "CI_001",
            "questionText": "What is your company name?",
            "order": 0
          },
          {
            "id": "cm6q2345bcde6789xyza",
            "questionCode": "CI_002",
            "questionText": "What is your company size?",
            "order": 1
          }
        ]
      }
    ]
  }
}
```

**Note:** Each question in the template has a unique `id` and section has a unique `id` that you must reference when submitting answers.

---

### 2. Submit Questionnaire Answers

Submit answers to the questionnaire for security assessment.

**Endpoint:** `POST /api/questionnaires`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "questionnaireId": "cmlg8sbzo0000bpqt1m35rptg",
  "submitterEmail": "security@acme.com",
  "submitterName": "John Doe",
  "source": "web_portal",
  "answers": [
    {
      "sectionId": "cm6z1234abcd5678efgh",
      "questionId": "cm6q1234abcd5678wxyz",
      "answerText": "Acme Corporation"
    },
    {
      "sectionId": "cm6z1234abcd5678efgh",
      "questionId": "cm6q2345bcde6789xyza",
      "answerText": "50-100 employees"
    },
    {
      "sectionId": "cm6z5678ijkl9012mnop",
      "questionId": "cm6q3456cdef7890abcd",
      "answerText": "Yes, we have a comprehensive security policy"
    }
  ]
}
```

**Important Notes:**
- The `questionnaireId` field is **required** - Get it from the latest questionnaire template endpoint (GET /api/latest_questionnaires)
- The `sectionId` field is **required** and must match a valid section ID from the questionnaire template
- The `questionId` field is **required** and must match a valid question ID from the questionnaire template
- The API validates that all referenced section and question IDs belong to the specified questionnaire

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `questionnaireId` | string | **Required** - Questionnaire template ID from GET /api/latest_questionnaires |
| `answers` | array | Array of answer objects |
| `answers[].sectionId` | string | **Required** - Section ID from the template |
| `answers[].questionId` | string | **Required** - Question ID from the template |

**Optional Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `submitterEmail` | string | Email of the person submitting |
| `submitterName` | string | Name of the person submitting |
| `source` | string | Source of submission (default: "web_portal") |
| `answers[].answerText` | string | Text answer |
| `answers[].answerJson` | object | Structured JSON answer |
| `answers[].attachments` | array | File attachments |

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cm6z1234abcd5678efgh",
    "status": "SUBMITTED",
    "submittedAt": "2026-02-09T17:00:00.000Z",
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

Validation errors:
```json
{
  "error": "Validation failed",
  "details": [
    "questionnaireId is required",
    "answers[0].sectionId is required",
    "answers[0].questionId is required"
  ]
}
```

Invalid section or question IDs:
```json
{
  "error": "Invalid section IDs",
  "details": "The following section IDs do not belong to this questionnaire: cm6z999invalid"
}
```

```json
{
  "error": "Invalid question IDs",
  "details": "The following question IDs do not belong to this questionnaire: cm6q999invalid"
}
```

Questionnaire not found:
```json
{
  "error": "Questionnaire template not found"
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
    "questionAnswerId": "cm6z9999abcd1234wxyz",
    "status": "COMPLETED",
    "highRiskCount": 2,
    "mediumRiskCount": 5,
    "lowRiskCount": 8,
    "assessmentSummary": "The organization demonstrates moderate security practices with some areas requiring immediate attention...",
    "reportStatus": "NOT_STARTED"
  }
}
```

**Risk Assessment Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `highRiskCount` | number | Number of high-risk findings |
| `mediumRiskCount` | number | Number of medium-risk findings |
| `lowRiskCount` | number | Number of low-risk findings |
| `assessmentSummary` | string | Brief summary from AI assessment |

**Task Status Values:**
| Status | Description |
|--------|-------------|
| `PENDING` | Task created, waiting to be processed |
| `PROCESSING` | AI is analyzing the questionnaire |
| `COMPLETED` | Analysis complete, ready for report |
| `FAILED` | Analysis failed |

---

### 4. View Report

Access the full HTML security assessment report.

**Report URL for Users:**
```
https://team-clawctor.tonob.net/tasks/{taskId}
```

Provide this URL to users so they can view their security assessment report in the web application.

---

## Complete Integration Flow

### Step 1: Get Latest Questionnaire Template

First, retrieve the latest questionnaire template to get the questionnaire ID, section IDs, and question IDs:

```bash
curl https://team-clawctor.tonob.net/api/latest_questionnaires
```

This returns the complete questionnaire structure with the questionnaire ID and all section IDs and question IDs you need to reference when submitting answers.

### Step 2: Submit Questionnaire Answers

```bash
curl -X POST https://team-clawctor.tonob.net/api/questionnaires \
  -H "Content-Type: application/json" \
  -d '{
    "questionnaireId": "cmlg8sbzo0000bpqt1m35rptg",
    "submitterEmail": "security@acme.com",
    "submitterName": "John Doe",
    "answers": [
      {
        "sectionId": "cm6z1234abcd5678efgh",
        "questionId": "cm6q1234abcd5678wxyz",
        "answerText": "Yes, we have a comprehensive security policy"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cmlg8sbzo0000bpqt1m35rptg",
    "assetHash": "a1b2c3d4e5f6...",
    "status": "SUBMITTED",
    "task": {
      "taskId": "cm6z5678ijkl9012mnop",
      "status": "PROCESSING"
    }
  }
}
```

### Step 3: Provide Report Link to User

After submitting the questionnaire, provide the user with the report viewing URL:

```
https://team-clawctor.tonob.net/tasks/{taskId}
```

Replace `{taskId}` with the actual task ID returned from the submission.

The user can:
1. Click the link to view the assessment status
2. Once processing is complete, view the risk assessment summary
3. Pay to unlock the full detailed report
4. Download the complete HTML report

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

## Support

For API support or questions:
- Email: support@team-clawctor.tonob.net
- Documentation: https://team-clawctor.tonob.net
