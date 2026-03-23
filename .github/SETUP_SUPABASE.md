# WealthOS shared household setup

1. Create a Supabase project.
2. In **Authentication**, enable Email + Password.
3. Run `supabase/schema.sql` in the SQL editor.
4. Add these GitHub Pages build secrets or local `.env` entries:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. For GitHub Pages, configure the same env vars in the deployment workflow or build environment.
6. In WealthOS, the first user creates the household, then the second user joins with the same household slug + invite code.
