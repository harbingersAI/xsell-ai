# Create project directory
mkdir salesforge-ai
cd salesforge-ai

# Initialize Next.js project with TypeScript
npx create-next-app@latest . --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"

# Install necessary dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install -D @types/node

# Create auth-related files
New-Item -Path "src/app/api/auth" -ItemType Directory -Force
New-Item -Path "src/app/api/auth/callback/route.ts" -ItemType File
New-Item -Path "src/components/AuthButton.tsx" -ItemType File
New-Item -Path "src/lib/supabase.ts" -ItemType File
New-Item -Path "src/middleware.ts" -ItemType File

# Create basic pages
New-Item -Path "src/app/login/page.tsx" -ItemType File
New-Item -Path "src/app/register/page.tsx" -ItemType File
New-Item -Path "src/app/dashboard/page.tsx" -ItemType File

# Add Supabase environment variables to .env.local
@"
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
"@ | Out-File -FilePath .env.local -Encoding utf8

# Output success message
Write-Host "SalesForge AI project structure created. Remember to replace Supabase credentials in .env.local"