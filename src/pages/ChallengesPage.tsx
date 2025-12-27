import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Filter, Plus, Loader2 } from 'lucide-react';

import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { ChallengeSkeleton } from '@/components/common/Skeletons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { supabase } from "@/lib/supabase";

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

const ChallengesPage = () => {
  const [filter, setFilter] = useState<DifficultyFilter>('all');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const { data, error } = await supabase
          .from('challenges')
          .select('*, author:users!challenges_user_id_fkey(*)');

        if (error) throw error;

        if (data) {
          setChallenges(data.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            difficulty: c.difficulty?.toLowerCase() || 'medium',
            tags: c.tags || [],
            submissions: c.submissions_count || 0,
            author: {
              displayName: c.author?.username || 'Platform', // Default challenges have null author
              username: c.author?.username || 'platform',
              avatar: c.author?.avatar_url || (c.user_id ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.username}` : 'https://api.dicebear.com/7.x/identicon/svg?seed=platform')

            },
            is_default: c.is_default // Pass this if needed for UI distinction
          })));
        }
      } catch (e) {
        console.error("Fetch challenges error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const filteredChallenges = challenges.filter((c) => {
    if (filter !== 'all' && c.difficulty !== filter) return false;
    return true;
  });

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Coding Challenges</h1>
              <p className="text-muted-foreground">Practice and improve your skills</p>
            </div>
          </div>
          <Link to="/challenges/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Post a Challenge
            </Button>
          </Link>
        </motion.div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as DifficultyFilter)}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="easy" className="text-success">Easy</TabsTrigger>
            <TabsTrigger value="medium" className="text-warning">Medium</TabsTrigger>
            <TabsTrigger value="hard" className="text-destructive">Hard</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Challenges Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <ChallengeSkeleton key={i} />
            ))
          ) : filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge, index) => (
              <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No challenges found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your filters or create a new challenge</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChallengesPage;
