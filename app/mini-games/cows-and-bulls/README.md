# Next.js Mini Games Collection

A collection of mini-games built with Next.js, including a real-time multiplayer Cows and Bulls game.

## Cows and Bulls Game

The Cows and Bulls game is a code-breaking game where players take turns guessing a secret number. After each guess, feedback is given in the form of "bulls" (correct digit in the correct position) and "cows" (correct digit in the wrong position).

### Supabase Integration

The game uses Supabase for real-time multiplayer functionality, allowing players to:
- Create a new game session
- Join an existing game with a session ID
- See other players' status in real time
- Take turns making guesses
- Share a link with friends to join a game

### Setup Instructions

1. **Create a Supabase Project**:
   - Sign up for a free account at [https://supabase.com](https://supabase.com)
   - Create a new project
   - Once your project is created, note down the project URL and anon key from the API settings

2. **Configure Environment Variables**:
   - Create a `.env.local` file in the root of the project with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set Up the Database**:
   - In your Supabase project, go to the SQL Editor
   - Run the SQL migration script located in `supabase/migrations/20240302_cows_and_bulls.sql`
   - This will create the necessary tables and enable real-time subscriptions

4. **Run the Application**:
   ```
   npm run dev
   ```

5. **Playing the Game**:
   - Navigate to the Cows and Bulls game in the mini-games section
   - Create a new game or join an existing one with a session ID
   - Share the link with friends to play together in real time

## Other Mini Games

More mini games coming soon!

## Technical Details

- Built with Next.js 13+ App Router
- UI components from shadcn/ui
- Real-time multiplayer powered by Supabase
- TypeScript for type safety