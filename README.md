# Workflow - Sales Platform

## Project Overview
- **Name**: Workflow
- **Goal**: A streamlined platform for Sales reps to manage their daily operations efficiently
- **Features**: 
  - Take notes on customer accounts
  - Store and manage customer-facing documents
  - Create and edit territory plans
  - Manage 1:1 documents with management

## URLs
- **Development**: https://3000-iw4s95m58uo3uoccrchbf-5185f4aa.sandbox.novita.ai
- **Production**: (To be deployed to Cloudflare Pages)
- **GitHub**: (To be configured)

## Currently Completed Features

### ✅ Accounts
- **Parent-child structure**: Create accounts as main entities with nested notes
- Create, read, update, and delete customer accounts
- Track company type, industry, and status
- View account details with all associated notes
- Add notes directly to specific accounts
- Account overview with metadata badges

### ✅ Tasks
- **Task management**: Create and track sales tasks
- Complete/uncomplete tasks with checkbox toggle
- Priority levels (low, medium, high) with visual indicators
- Due date tracking with overdue alerts
- Separate views for pending and completed tasks
- Task descriptions and details

### ✅ Customer Documents
- Store customer-facing documents (proposals, contracts, SOWs, presentations)
- Document type categorization
- Link documents to specific accounts
- Full CRUD operations with real-time updates

### ✅ Territory Plans
- Create and manage territory plans
- **Account Type Distinction**: Separate Growth (renewals, rewrites, expansions) from Acquisition (net new) accounts
- Filter plans by account type with visual indicators
- Track plan status (draft, active, completed)
- Edit territory plans with version tracking
- Associate plans with specific territories

### ✅ 1:1 Documents
- Record one-on-one meeting notes with managers
- Track meeting dates and topics discussed
- Document action items and follow-ups
- Historical view of all 1:1 meetings

## Functional URIs

### Account Notes API
- `GET /api/notes` - Get all account notes
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
  - Body: `{ account_name, note_title, note_content }`
- `PUT /api/notes/:id` - Update a note
  - Body: `{ account_name, note_title, note_content }`
- `DELETE /api/notes/:id` - Delete a note

### Documents API
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get a specific document
- `POST /api/documents` - Create a new document
  - Body: `{ document_name, document_type, document_content, account_name }`
- `PUT /api/documents/:id` - Update a document
  - Body: `{ document_name, document_type, document_content, account_name }`
- `DELETE /api/documents/:id` - Delete a document

### Territory Plans API
- `GET /api/plans` - Get all territory plans
- `GET /api/plans/:id` - Get a specific plan
- `POST /api/plans` - Create a new plan
  - Body: `{ plan_name, territory_name, plan_content, status, account_type }`
  - `account_type`: "growth" (renewals, rewrites, expansions) or "acquisition" (net new)
- `PUT /api/plans/:id` - Update a plan
  - Body: `{ plan_name, territory_name, plan_content, status, account_type }`
- `DELETE /api/plans/:id` - Delete a plan

### 1:1 Documents API
- `GET /api/oneononedocs` - Get all 1:1 documents
- `GET /api/oneononedocs/:id` - Get a specific document
- `POST /api/oneononedocs` - Create a new 1:1 document
  - Body: `{ manager_name, meeting_date, topics, notes, action_items }`
- `PUT /api/oneononedocs/:id` - Update a 1:1 document
  - Body: `{ manager_name, meeting_date, topics, notes, action_items }`
- `DELETE /api/oneononedocs/:id` - Delete a 1:1 document

## Data Architecture

### Data Models

#### Account Notes
- `id`: Integer (Primary Key)
- `account_name`: Text (Customer account name)
- `note_title`: Text (Note title/summary)
- `note_content`: Text (Full note content)
- `created_at`: DateTime (Auto-generated)
- `updated_at`: DateTime (Auto-updated)

#### Customer Documents
- `id`: Integer (Primary Key)
- `document_name`: Text (Document name)
- `document_type`: Text (Proposal, Contract, SOW, etc.)
- `document_content`: Text (Document content)
- `account_name`: Text (Associated account)
- `created_at`: DateTime (Auto-generated)
- `updated_at`: DateTime (Auto-updated)

#### Territory Plans
- `id`: Integer (Primary Key)
- `plan_name`: Text (Plan name)
- `territory_name`: Text (Territory identifier)
- `plan_content`: Text (Plan details)
- `status`: Text (draft, active, completed)
- `account_type`: Text (growth or acquisition)
  - **Growth**: Existing customers (renewals, rewrites, upsells, expansions)
  - **Acquisition**: Net new prospects (never been customers before)
- `created_at`: DateTime (Auto-generated)
- `updated_at`: DateTime (Auto-updated)

#### 1:1 Documents
- `id`: Integer (Primary Key)
- `manager_name`: Text (Manager's name)
- `meeting_date`: Date (Meeting date)
- `topics`: Text (Discussion topics)
- `notes`: Text (Meeting notes)
- `action_items`: Text (Follow-up actions)
- `created_at`: DateTime (Auto-generated)
- `updated_at`: DateTime (Auto-updated)

### Storage Services
- **Cloudflare D1 Database**: SQLite-based globally distributed database for all data storage
- **Local Development**: Uses `.wrangler/state/v3/d1` for local SQLite database
- **Database Indexing**: Optimized indexes on frequently queried fields (account names, territories, managers, dates)

### Data Flow
1. User interacts with the tab-based UI
2. Frontend sends AJAX requests to Hono API endpoints
3. API validates and processes requests
4. Data is stored/retrieved from Cloudflare D1 database
5. Responses are formatted as JSON and sent back to frontend
6. Frontend updates the UI with real-time data

## User Guide

### Getting Started
1. Open the application in your browser
2. You'll see four tabs: Account Notes, Documents, Territory Plans, and 1:1 Documents
3. Click on any tab to switch between different features

### Managing Account Notes
1. Click the "Account Notes" tab
2. Click "New Note" to create a note
3. Fill in the account name, note title, and content
4. Click "Save" to store the note
5. Use the edit icon to modify existing notes
6. Use the delete icon to remove notes

### Storing Documents
1. Click the "Documents" tab
2. Click "New Document" to upload a document reference
3. Enter document name, select type, optionally link to an account
4. Add document content or description
5. Click "Save" to store the document

### Creating Territory Plans
1. Click the "Territory Plans" tab
2. Click "New Plan" to create a territory plan
3. Enter plan name, territory name, and plan content
4. Select status (draft, active, or completed)
5. Click "Save" to create the plan
6. Edit plans as your strategy evolves

### Recording 1:1 Meetings
1. Click the "1:1 Documents" tab
2. Click "New 1:1" to record a meeting
3. Enter manager name and meeting date
4. List discussion topics
5. Add detailed notes from the meeting
6. Optionally add action items
7. Click "Save" to store the meeting notes

## Tech Stack
- **Backend**: Hono (lightweight web framework)
- **Database**: Cloudflare D1 (SQLite-based)
- **Frontend**: Vanilla JavaScript with Tailwind CSS
- **Design**: Axon black and yellow theme
- **Icons**: Font Awesome
- **HTTP Client**: Axios
- **Hosting**: Cloudflare Pages

## Development

### Local Development
```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate:local

# Seed the database with sample data
npm run db:seed

# Build the project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# View logs
pm2 logs workflow --nostream

# Stop server
pm2 delete workflow
```

### Database Management
```bash
# Reset database (clear all data and re-seed)
npm run db:reset

# Execute SQL commands
npm run db:console:local

# Apply migrations to production
npm run db:migrate:prod
```

## Deployment

### Prerequisites
- Cloudflare account with D1 database access
- Wrangler CLI configured with authentication

### Steps
1. Create production D1 database:
   ```bash
   npx wrangler d1 create workflow-production
   ```

2. Update `wrangler.jsonc` with the database ID

3. Apply migrations to production:
   ```bash
   npm run db:migrate:prod
   ```

4. Deploy to Cloudflare Pages:
   ```bash
   npm run deploy
   ```

## Deployment Status
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active (Development)
- **Database**: Cloudflare D1 (Local development mode)
- **Theme**: Axon black and yellow
- **Last Updated**: 2025-12-03

## Recent Updates
- **2025-12-03**: Added Accounts tab with hierarchical structure for accounts and notes
- **2025-12-03**: Added Tasks tab with create/complete functionality and priority management
- **2025-12-03**: Restructured data model - accounts as parent entities with child notes
- **2025-12-03**: Implemented task completion toggles with visual feedback
- **2025-12-03**: Upgraded to modern refined design with gradients, improved typography, and polished animations
- **2025-12-03**: Enhanced visual hierarchy with Inter font family and professional spacing
- **2025-12-03**: Updated UI to Axon black and yellow theme with sophisticated color palette
- **2025-12-03**: Added Growth vs Acquisition distinction for territory plans with filtering capabilities
- **2025-12-03**: Enhanced territory plan data model with account_type field

## Design Features
- **Modern Gradients**: Smooth color transitions for buttons and accents
- **Professional Typography**: Inter font family for clean readability
- **Card System**: Elevated card design with hover effects and subtle shadows
- **Smooth Animations**: Polished transitions and hover states
- **Dark Theme**: Sophisticated black background with yellow accents
- **Visual Hierarchy**: Clear information structure with proper spacing
- **Responsive Badges**: Color-coded labels for account types and statuses

## Features Not Yet Implemented
- User authentication and authorization
- Role-based access control (admin, manager, sales rep)
- Export functionality (PDF, Excel)
- Email notifications for action items
- Advanced search and filtering
- File upload support for documents
- Calendar integration for 1:1 meetings
- Dashboard with analytics and KPIs
- Mobile responsive optimizations
- Dark mode theme

## Recommended Next Steps
1. **User Authentication**: Implement user login system with Cloudflare Access or Auth0
2. **Multi-user Support**: Add user ownership to all records
3. **File Uploads**: Integrate Cloudflare R2 for actual document file storage
4. **Search Enhancement**: Add full-text search across all content
5. **Export Features**: Allow users to export data as PDF or Excel
6. **Email Integration**: Send reminders for action items from 1:1 meetings
7. **Analytics Dashboard**: Add a dashboard tab with sales metrics and visualizations
8. **Mobile App**: Create a mobile-friendly PWA version
9. **Collaboration**: Add commenting and sharing features
10. **Integration**: Connect with CRM systems (Salesforce, HubSpot)

## License
MIT License

## Support
For issues or questions, please contact your development team.
