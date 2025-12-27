# DevTrace 🚀

DevTrace is a high-performance, community-driven platform designed for developers to connect, collaborate, and grow. It combines social networking with career growth tools and open-source discovery, all wrapped in a premium, glassmorphic UI.

![DevTrace Preview](https://github.com/CaptainRushi/DevTrace/raw/main/public/og-image.png) *(Note: Add your actual preview image path here or I can generate one)*

## ✨ Key Features

### 📊 Advanced Analytics System
- **Real-time Engagement Scoring**: Deeply integrated PostgreSQL triggers calculate popularity scores based on likes, comments, and bookmarks.
- **Personal Dashboard**: Visualize your impact with detailed analytics on your profile, including "Top Performer" post tracking.
- **Sub-50ms Performance**: Analytics are pre-computed on the server for instant loading.

### 🏢 Community Hub
- **Featured Communities**: Discover and join curated groups based on technology and interest.
- **Dynamic Membership**: Automatic tracking of community growth and member engagement.

### 💼 Developer Growth
- **Job Board**: Comprehensive job listings tailored for developers, with deep technical details.
- **Coding Challenges**: Level up your skills with community-uploaded challenges and project-based tasks.
- **Open Source Hub**: Discover trending projects and find meaningful ways to contribute to the ecosystem.

### 👤 Professional Profiles
- **Rich Activity Tracking**: Showcase your posts, challenges, and contributions in one place.
- **Social Interactions**: Robust system for following users, liking content, and saving resources.

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CaptainRushi/DevTrace.git
   cd dev-connect-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

### 🗄️ Database Setup
The platform relies on custom PostgreSQL functions and triggers for its analytics system. You can find the SQL migration files in the `/supabase` directory. 

Specifically, ensure you run:
- `schema.sql`: Core table structure.
- `improved_analytics.sql`: The analytics trigger system.
- `seed_communities.sql`: Initial community data.

## 📁 Project Structure

```text
src/
├── components/     # Reusable UI components (shadcn/ui + custom)
├── contexts/       # React Contexts (Auth, Theme)
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and library configs
├── pages/          # Full page components
├── services/       # API and Supabase interaction logic
└── types/          # TypeScript definitions
```

## 🤝 Contributing

Contributions are welcome! Whether it's fixing a bug or suggesting a new feature, feel free to open a PR.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by the DevTrace Team.
