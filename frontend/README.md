# HRMS Lite - Frontend

Modern, responsive frontend for HRMS Lite application built with Next.js 14 and TailwindCSS.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

## Features

- 📊 **Dashboard** - Overview with statistics
- 👥 **Employee Management** - Add, view, and delete employees
- 📅 **Attendance Tracking** - Mark and view attendance records
- 🎨 **Responsive Design** - Works on all devices
- ⚡ **Real-time Updates** - Instant UI updates
- 🎯 **Form Validation** - Client-side validation
- 🔄 **Loading States** - Smooth loading indicators
- ❌ **Error Handling** - User-friendly error messages

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, update to your deployed backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── employees/
│   │   └── page.tsx          # Employee management
│   └── attendance/
│       └── page.tsx          # Attendance management
├── components/
│   ├── Navigation.tsx        # Navigation bar
│   └── ui/                   # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Loading.tsx
│       ├── EmptyState.tsx
│       └── Alert.tsx
├── lib/
│   └── api.ts                # API client
├── types/
│   └── index.ts              # TypeScript types
└── public/                   # Static assets
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy!

Vercel will auto-detect Next.js and configure build settings.

### Deploy to Netlify

1. Push code to GitHub
2. Go to [Netlify](https://netlify.com)
3. New site from Git
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Add environment variable: `NEXT_PUBLIC_API_URL`
7. Deploy!

## Pages

### Dashboard (`/`)
- Overview statistics
- Total employees, attendance records
- Present/absent today counts

### Employees (`/employees`)
- View all employees in table
- Add new employee form
- Delete employee
- Email validation

### Attendance (`/attendance`)
- Mark attendance
- View all records
- Filter by date
- Filter by employee
- Statistics (total, present, absent)

## UI Components

All components are reusable and follow consistent design patterns:

- **Button** - Primary, danger, secondary variants
- **Input** - Text input with label and error handling
- **Select** - Dropdown with options
- **Card** - Container with shadow and padding
- **Loading** - Spinner with message
- **EmptyState** - Placeholder when no data
- **Alert** - Success/error/info messages

## API Integration

The `lib/api.ts` file provides typed API calls:

```typescript
// Example usage
import { employeeAPI } from '@/lib/api';

// Get all employees
const employees = await employeeAPI.getAll();

// Create employee
await employeeAPI.create({
  employee_id: 'EMP001',
  full_name: 'John Doe',
  email: 'john@example.com',
  department: 'Engineering',
});
```

## Styling

Using TailwindCSS utility classes with custom components:

- Consistent color scheme (blue primary)
- Responsive breakpoints (sm, md, lg)
- Custom utility classes in globals.css
- Hover and focus states

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Server-side rendering for initial load
- Client-side navigation
- Optimized images
- Code splitting
- Production build minification

## Contributing

This is a prototype/assignment project. Not accepting contributions.

## License

MIT
