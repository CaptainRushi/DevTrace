import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Filter, Plus } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { challenges } from '@/data/mockData';

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

const ChallengesPage = () => {
  const [filter, setFilter] = useState<DifficultyFilter>('all');

  const filteredChallenges = challenges.filter((c) => {
    if (filter !== 'all' && c.difficulty !== filter) return false;
    return true;
  });

  return (
    <Layout>
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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Post a Challenge
          </Button>
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
          {filteredChallenges.map((challenge, index) => (
            <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No challenges found</h3>
            <p className="mt-2 text-muted-foreground">Try adjusting your filters or create a new challenge</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChallengesPage;
