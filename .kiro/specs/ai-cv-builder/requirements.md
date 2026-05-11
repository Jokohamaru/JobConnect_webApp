# Requirements: AI CV Builder

## 1. Overview

### 1.1 Feature Name
**AI-Powered CV Builder** - Tạo CV tự động bằng AI

### 1.2 Description
Cho phép ứng viên tạo CV chuyên nghiệp bằng cách trả lời các câu hỏi qua 3 bước wizard. AI sẽ tự động generate nội dung mô tả, summary, và bullet points dựa trên thông tin người dùng cung cấp.

### 1.3 Business Value
- **Giảm thời gian tạo CV**: Từ 2-3 giờ xuống còn 10-15 phút
- **Tăng chất lượng CV**: AI viết nội dung chuyên nghiệp, tối ưu ATS
- **Tăng conversion rate**: Nhiều ứng viên hoàn thành CV hơn
- **Competitive advantage**: Tính năng độc đáo so với đối thủ

### 1.4 Target Users
- **Primary**: Ứng viên (Candidates) đã đăng ký tài khoản
- **Secondary**: Sinh viên, người tìm việc lần đầu (Fresher)

---

## 2. User Stories

### 2.1 Core User Stories

#### US-1: Nhập thông tin cơ bản
**As a** candidate  
**I want to** nhập thông tin cơ bản về ngành nghề, vị trí, level  
**So that** AI có thể hiểu context và generate CV phù hợp

**Acceptance Criteria:**
- [ ] User có thể chọn lĩnh vực từ 8 options (IT, Marketing, Business, Design, Education, Finance, HR, Other)
- [ ] User có thể nhập vị trí ứng tuyển (free text)
- [ ] User có thể chọn level từ 5 options (Fresher, <1 năm, 1-3 năm, 3-5 năm, Senior)
- [ ] User có thể chọn template CV từ 3 options
- [ ] User có thể upload CV cũ (optional) - PDF/DOCX, max 5MB
- [ ] Form validation: jobTitle required nếu muốn tiếp tục
- [ ] Data được lưu vào state, không gọi API

#### US-2: Nhập kinh nghiệm làm việc
**As a** candidate  
**I want to** nhập kinh nghiệm làm việc của mình  
**So that** AI có thể generate mô tả công việc chuyên nghiệp

**Acceptance Criteria:**
- [ ] User có thể thêm nhiều kinh nghiệm (Add more button)
- [ ] Mỗi kinh nghiệm có: company name, job title, work type, start date, end date, description, achievements
- [ ] Checkbox "Đang làm việc" để bỏ qua end date
- [ ] User có thể chọn soft skills liên quan (6 predefined + Other)
- [ ] AI suggestions hiển thị gợi ý achievements
- [ ] Timeline hiển thị career journey
- [ ] Data được lưu vào state, không gọi API

#### US-3: Nhập kỹ năng
**As a** candidate  
**I want to** nhập kỹ năng của mình  
**So that** AI có thể highlight skills trong CV

**Acceptance Criteria:**
- [ ] User có thể nhập skills (tag input, press Enter to add)
- [ ] AI gợi ý skills phù hợp dựa trên industry + job title
- [ ] Skills được group thành 3 categories: Hard skills, Soft skills, Languages
- [ ] User có thể đánh giá level cho mỗi skill (Cơ bản, Khá, Thành thạo)
- [ ] User có thể chọn strengths (6 predefined options)
- [ ] User có thể upload CV cũ để extract skills (optional)
- [ ] Data được lưu vào state, không gọi API

#### US-4: Generate CV bằng AI
**As a** candidate  
**I want to** AI tự động generate nội dung CV  
**So that** tôi có CV chuyên nghiệp mà không cần viết từng dòng

**Acceptance Criteria:**
- [ ] Sau khi hoàn thành 3 bước, user click "Hoàn thiện"
- [ ] System gọi API POST /api/cv/generate với data từ 3 bước
- [ ] API gọi OpenAI GPT để generate:
  - Professional summary (2-3 câu)
  - Job descriptions (bullet points cho mỗi experience)
  - Achievement highlights (refined achievements)
  - Skills summary
- [ ] Loading state hiển thị "AI đang tạo CV của bạn..."
- [ ] Sau khi generate xong, redirect đến CV preview page
- [ ] CV preview hiển thị nội dung đã generate với template đã chọn
- [ ] User có thể edit nội dung sau khi generate
- [ ] User có thể regenerate nếu không hài lòng

#### US-5: Preview và Export CV
**As a** candidate  
**I want to** xem preview và export CV  
**So that** tôi có thể sử dụng CV để ứng tuyển

**Acceptance Criteria:**
- [ ] CV preview hiển thị đúng template đã chọn
- [ ] User có thể edit từng section
- [ ] User có thể download CV dạng PDF
- [ ] User có thể save CV vào account (optional)
- [ ] User có thể share CV link (optional)

### 2.2 Optional User Stories

#### US-6: Upload CV cũ để extract data
**As a** candidate  
**I want to** upload CV cũ  
**So that** AI có thể extract data và pre-fill form

**Acceptance Criteria:**
- [ ] User có thể upload PDF/DOCX (max 5MB)
- [ ] API parse CV và extract: name, email, phone, experiences, skills
- [ ] Extracted data pre-fill vào form
- [ ] User có thể edit extracted data

#### US-7: Import từ LinkedIn
**As a** candidate  
**I want to** import data từ LinkedIn  
**So that** tôi không cần nhập lại thông tin

**Acceptance Criteria:**
- [ ] User click "Import from LinkedIn"
- [ ] OAuth flow để connect LinkedIn
- [ ] API fetch LinkedIn profile data
- [ ] Data pre-fill vào form

#### US-8: AI suggestions real-time
**As a** candidate  
**I want to** nhận gợi ý từ AI khi đang nhập  
**So that** tôi có thể viết tốt hơn

**Acceptance Criteria:**
- [ ] Khi user nhập job description, AI gợi ý bullet points
- [ ] Khi user nhập achievements, AI gợi ý cách viết tốt hơn
- [ ] User có thể click để apply suggestion

---

## 3. Functional Requirements

### 3.1 Frontend Requirements

#### FR-1: Wizard Flow
- **FR-1.1**: 4-step wizard với progress indicator
- **FR-1.2**: Navigation: Next, Back, Skip buttons
- **FR-1.3**: Data persistence trong session (localStorage hoặc state)
- **FR-1.4**: Form validation trước khi next step
- **FR-1.5**: Responsive design (mobile, tablet, desktop)

#### FR-2: Step 1 - Info
- **FR-2.1**: Industry selection (8 options, icon buttons)
- **FR-2.2**: Job title input (text field với suggestions)
- **FR-2.3**: Level selection (5 options, pill buttons)
- **FR-2.4**: Template selection (3 options, image cards)
- **FR-2.5**: CV upload (drag & drop, file picker)

#### FR-3: Step 2 - Experience
- **FR-3.1**: Dynamic form (add/remove experiences)
- **FR-3.2**: Date picker (MM/YYYY format)
- **FR-3.3**: "Currently working" checkbox
- **FR-3.4**: Textarea với character count
- **FR-3.5**: Soft skills selection (multi-select chips)
- **FR-3.6**: AI suggestions panel (right sidebar)
- **FR-3.7**: Career timeline visualization

#### FR-4: Step 3 - Skills
- **FR-4.1**: Tag input (add skills by pressing Enter)
- **FR-4.2**: Suggested skills (click to add)
- **FR-4.3**: Skills grouping (Hard, Soft, Languages)
- **FR-4.4**: Skill level rating (3 levels per skill)
- **FR-4.5**: Strengths selection (multi-select with icons)

#### FR-5: Step 4 - Generate
- **FR-5.1**: Summary của data đã nhập
- **FR-5.2**: "Generate CV" button
- **FR-5.3**: Loading state với progress animation
- **FR-5.4**: Error handling với retry option

### 3.2 Backend Requirements

#### FR-6: API Endpoints

**POST /api/cv/generate**
- **Input**: 
  ```typescript
  {
    industry: string;
    jobTitle: string;
    level: string;
    templateId: number;
    experiences: Array<{
      company: string;
      position: string;
      workType: string;
      startDate: string;
      endDate?: string;
      isCurrently: boolean;
      description: string;
      achievements: string;
    }>;
    skills: Array<{
      name: string;
      category: 'hard' | 'soft' | 'language';
      level: 'basic' | 'intermediate' | 'advanced';
    }>;
    strengths: string[];
  }
  ```
- **Output**:
  ```typescript
  {
    summary: string;
    experiences: Array<{
      company: string;
      position: string;
      duration: string;
      description: string[]; // bullet points
      achievements: string[]; // refined achievements
    }>;
    skills: {
      hard: string[];
      soft: string[];
      languages: string[];
    };
    strengths: string[];
  }
  ```
- **Status Codes**: 200 (success), 400 (validation error), 500 (AI error)

**POST /api/cv/parse** (Optional)
- **Input**: multipart/form-data (CV file)
- **Output**: Extracted data structure
- **Status Codes**: 200, 400, 413 (file too large), 500

#### FR-7: AI Integration
- **FR-7.1**: OpenAI GPT-4 integration
- **FR-7.2**: Prompt engineering cho từng section
- **FR-7.3**: Token optimization (limit response length)
- **FR-7.4**: Error handling (retry logic, fallback)
- **FR-7.5**: Rate limiting (prevent abuse)

#### FR-8: Data Processing
- **FR-8.1**: Input validation (sanitize, validate format)
- **FR-8.2**: Data transformation (format dates, clean text)
- **FR-8.3**: Response formatting (structure AI output)

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-1**: AI generation time < 10 seconds (p95)
- **NFR-2**: Page load time < 2 seconds
- **NFR-3**: API response time < 500ms (excluding AI call)
- **NFR-4**: Support 100 concurrent users

### 4.2 Security
- **NFR-5**: Authentication required (JWT)
- **NFR-6**: Input sanitization (prevent XSS, injection)
- **NFR-7**: File upload validation (type, size, virus scan)
- **NFR-8**: API rate limiting (10 requests/minute per user)
- **NFR-9**: OpenAI API key stored securely (env variable)

### 4.3 Reliability
- **NFR-10**: 99.5% uptime
- **NFR-11**: Graceful degradation (fallback nếu AI fail)
- **NFR-12**: Error logging và monitoring
- **NFR-13**: Retry logic cho AI calls (max 3 retries)

### 4.4 Usability
- **NFR-14**: Mobile-friendly (responsive design)
- **NFR-15**: Accessibility (WCAG 2.1 Level AA)
- **NFR-16**: Multi-language support (Vietnamese, English)
- **NFR-17**: Clear error messages
- **NFR-18**: Loading indicators cho async operations

### 4.5 Scalability
- **NFR-19**: Horizontal scaling (stateless API)
- **NFR-20**: Caching strategy (Redis cho AI responses)
- **NFR-21**: CDN cho static assets

---

## 5. Data Requirements

### 5.1 Input Data
- **Industry**: Enum (8 values)
- **Job Title**: String (max 100 chars)
- **Level**: Enum (5 values)
- **Template ID**: Integer (1-3)
- **Experiences**: Array (max 10 items)
  - Company: String (max 100 chars)
  - Position: String (max 100 chars)
  - Work Type: Enum (4 values)
  - Start Date: String (MM/YYYY format)
  - End Date: String (MM/YYYY format, optional)
  - Description: String (max 1000 chars)
  - Achievements: String (max 800 chars)
- **Skills**: Array (max 50 items)
  - Name: String (max 50 chars)
  - Category: Enum (3 values)
  - Level: Enum (3 values)
- **Strengths**: Array (max 6 items)

### 5.2 Output Data
- **Summary**: String (100-200 chars)
- **Experiences**: Array
  - Description: Array of strings (3-5 bullet points)
  - Achievements: Array of strings (1-3 items)
- **Skills**: Grouped by category
- **Strengths**: Array of strings

### 5.3 Data Validation
- Required fields: industry, jobTitle, level, templateId
- At least 1 experience required
- At least 3 skills required
- File upload: PDF/DOCX only, max 5MB

---

## 6. Integration Requirements

### 6.1 External Services
- **OpenAI API**: GPT-4 or GPT-3.5-turbo
  - API Key management
  - Request/response handling
  - Error handling
  - Cost tracking

### 6.2 Internal Services
- **Auth Service**: JWT validation
- **User Service**: Get user profile
- **CV Service**: Save CV (optional)
- **Storage Service**: File upload (optional)

---

## 7. Constraints

### 7.1 Technical Constraints
- **TC-1**: Must use OpenAI GPT (as per user choice)
- **TC-2**: Frontend: Next.js, React, TypeScript
- **TC-3**: Backend: NestJS, Prisma, PostgreSQL
- **TC-4**: No database persistence for generated CV (as per user choice)
- **TC-5**: Batch generation only (not real-time)

### 7.2 Business Constraints
- **BC-1**: OpenAI API cost budget: $100/month
- **BC-2**: Free tier: 5 CV generations per month per user
- **BC-3**: Premium tier: Unlimited generations

### 7.3 Time Constraints
- **TIC-1**: MVP delivery: 2 weeks
- **TIC-2**: Full feature: 4 weeks

---

## 8. Assumptions

### 8.1 User Assumptions
- **A-1**: Users have basic computer literacy
- **A-2**: Users understand their own work experience
- **A-3**: Users can provide accurate information

### 8.2 Technical Assumptions
- **A-4**: OpenAI API is available and stable
- **A-5**: Users have modern browsers (Chrome, Firefox, Safari, Edge)
- **A-6**: Users have stable internet connection

### 8.3 Business Assumptions
- **A-7**: Users want AI-generated content (not manual)
- **A-8**: Generated CV quality is acceptable
- **A-9**: Users will edit generated content if needed

---

## 9. Dependencies

### 9.1 External Dependencies
- **D-1**: OpenAI API availability
- **D-2**: OpenAI API key and billing
- **D-3**: CV templates (design assets)

### 9.2 Internal Dependencies
- **D-4**: Authentication system (must be implemented first)
- **D-5**: User management system
- **D-6**: Frontend UI components library

---

## 10. Success Metrics

### 10.1 Usage Metrics
- **M-1**: Number of CV generations per day
- **M-2**: Completion rate (% users who finish all 4 steps)
- **M-3**: Average time to complete wizard
- **M-4**: Regeneration rate (% users who regenerate)

### 10.2 Quality Metrics
- **M-5**: User satisfaction score (1-5 stars)
- **M-6**: Edit rate (% of generated content edited)
- **M-7**: Download rate (% users who download CV)

### 10.3 Technical Metrics
- **M-8**: AI generation success rate (%)
- **M-9**: Average AI response time
- **M-10**: API error rate (%)

---

## 11. Out of Scope

### 11.1 Not Included in MVP
- ❌ Real-time AI suggestions
- ❌ CV parsing from uploaded files
- ❌ LinkedIn import
- ❌ Multiple language support (only Vietnamese)
- ❌ CV versioning
- ❌ Collaborative editing
- ❌ CV analytics (views, downloads)
- ❌ ATS optimization score
- ❌ Cover letter generation

### 11.2 Future Enhancements
- 🔮 AI-powered job matching
- 🔮 CV optimization suggestions
- 🔮 Interview preparation based on CV
- 🔮 Skill gap analysis
- 🔮 Career path recommendations

---

## 12. Risks and Mitigations

### 12.1 Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| OpenAI API downtime | High | Low | Implement retry logic, fallback to cached responses |
| AI generates poor quality content | High | Medium | Prompt engineering, user feedback loop, allow editing |
| API rate limits exceeded | Medium | Medium | Implement queueing, rate limiting per user |
| High OpenAI costs | Medium | High | Token optimization, caching, usage limits |

### 12.2 Business Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Users don't trust AI-generated content | High | Medium | Show "AI-generated" label, allow full editing |
| Low adoption rate | High | Low | User education, onboarding tutorial |
| Competitors copy feature | Low | High | Focus on quality and UX differentiation |

---

## 13. Acceptance Criteria (Overall)

### 13.1 Functional Acceptance
- [ ] All 5 core user stories implemented and tested
- [ ] All API endpoints working correctly
- [ ] AI generates quality content (manual review)
- [ ] Error handling works for all edge cases
- [ ] Mobile responsive design

### 13.2 Non-Functional Acceptance
- [ ] Performance meets NFR requirements
- [ ] Security audit passed
- [ ] Load testing passed (100 concurrent users)
- [ ] Accessibility audit passed (WCAG 2.1 AA)

### 13.3 Documentation Acceptance
- [ ] API documentation complete
- [ ] User guide created
- [ ] Technical documentation complete
- [ ] Deployment guide ready

---

## 14. Glossary

- **ATS**: Applicant Tracking System
- **Bullet Points**: Danh sách các điểm mô tả công việc
- **CV**: Curriculum Vitae (Hồ sơ xin việc)
- **GPT**: Generative Pre-trained Transformer
- **MVP**: Minimum Viable Product
- **Prompt Engineering**: Kỹ thuật viết prompt để AI generate content tốt hơn
- **Token**: Đơn vị đo lường input/output của AI model
- **Wizard**: Multi-step form interface

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-11  
**Status**: Draft → Ready for Review
