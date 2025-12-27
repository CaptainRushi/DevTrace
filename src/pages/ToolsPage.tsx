import { motion } from 'framer-motion';
import { Layers, ArrowRight, ExternalLink } from 'lucide-react';

import { techStackData } from '@/data/techStack';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ToolsPage = () => {
  return (
    <>
      <div className="space-y-8 max-w-6xl mx-auto pb-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-4 py-8"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/50">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Tools & Tech Stack</h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
              A transparent look at the technologies powering our platform.
              We use modern, scalable, and developer-friendly tools to build the best experience.
            </p>
          </div>
        </motion.div>

        {/* Stack Categories */}
        <div className="grid gap-6 md:grid-cols-2">
          {techStackData.map((category, catIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
              className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors"
            >
              {/* Category Header */}
              <div className="border-b border-border bg-muted/30 p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background border border-border">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">{category.title}</h2>
              </div>

              {/* Tools List */}
              <div className="divide-y divide-border">
                {category.items.map((tool, toolIndex) => (
                  <div
                    key={tool.name}
                    className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {tool.icon ? <tool.icon className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground">{tool.name}</h3>
                        {tool.link && (
                          <a
                            href={tool.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">
                          {tool.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <p className="text-sm text-muted-foreground">
            Built with <span className="text-red-500">♥</span> for developers.
          </p>
        </div>
      </div>
    </>
  );
};

export default ToolsPage;
