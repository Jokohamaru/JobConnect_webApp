# CV Module

This module handles CV (Curriculum Vitae) management for candidates in the JobConnect MVP platform.

## Features

- **CV Upload**: Candidates can upload their CVs in PDF, DOC, or DOCX format
- **File Validation**: Validates file format (PDF, DOC, DOCX) and size (max 5MB)
- **CV Listing**: Retrieve all CVs for a candidate, sorted by upload date
- **CV Deletion**: Delete a CV with proper authorization checks
- **Default CV**: Mark a CV as default for job applications (only one default per candidate)

## API Endpoints

All endpoints require JWT authentication and CANDIDATE role.

### POST /candidates/me/cvs
Upload a new CV for the authenticated candidate.

**Request Body:**
```json
{
  "file_name": "resume.pdf",
  "file_path": "/uploads/resume.pdf",
  "is_default": false
}
```

**Response:** CV object with metadata

**Validations:**
- File format must be PDF, DOC, or DOCX
- File size must not exceed 5MB (validated at controller level)
- If `is_default` is true, all other CVs are unmarked as default

### GET /candidates/me/cvs
List all CVs for the authenticated candidate.

**Response:** Array of CV objects sorted by `created_at` descending

### DELETE /candidates/me/cvs/:cvId
Delete a specific CV.

**Response:**
```json
{
  "message": "CV deleted successfully"
}
```

**Validations:**
- CV must exist
- CV must belong to the authenticated candidate

### PATCH /candidates/me/cvs/:cvId/default
Mark a specific CV as the default CV.

**Response:** Updated CV object with `is_default: true`

**Validations:**
- CV must exist
- CV must belong to the authenticated candidate
- All other CVs are automatically unmarked as default (idempotent operation)

## Requirements Validated

This module implements requirements 6.1-6.7 from the JobConnect MVP specification:

- **6.1**: CV file format validation (PDF, DOC, DOCX)
- **6.2**: Unsupported file format error handling
- **6.3**: File size validation (max 5MB)
- **6.4**: CV record creation and storage
- **6.5**: CV listing with timestamps and file names
- **6.6**: CV deletion with file cleanup
- **6.7**: Default CV marking (only one default per candidate)

## Testing

The module includes comprehensive unit tests:

- **cv.service.spec.ts**: 21 tests covering all service methods
- **cv.controller.spec.ts**: 9 tests covering all controller endpoints

Run tests:
```bash
npm test -- cv.service.spec.ts
npm test -- cv.controller.spec.ts
```

All tests pass successfully.

## Implementation Notes

1. **File Storage**: The current implementation expects file paths to be provided. Actual file upload handling (multipart/form-data) should be implemented at the controller level using NestJS file upload interceptors (e.g., `@UseInterceptors(FileInterceptor('file'))`).

2. **File Cleanup**: When deleting a CV, the database record is removed. Physical file cleanup from storage should be implemented separately based on the storage solution (local filesystem, S3, etc.).

3. **Authorization**: All endpoints are protected by JWT authentication and require the CANDIDATE role. The controller verifies that the CV belongs to the authenticated candidate before performing operations.

4. **Idempotence**: Marking a CV as default is idempotent - calling it multiple times on the same CV produces the same result.

5. **Case-Insensitive Extensions**: File extension validation is case-insensitive (e.g., .PDF, .pdf, .Pdf all work).

## Future Enhancements

- Add file upload handling with multipart/form-data
- Implement physical file storage and cleanup
- Add CV preview/download endpoints
- Add CV metadata extraction (e.g., parse PDF to extract text)
- Add virus scanning for uploaded files
- Add support for additional file formats
