import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Github,
  Lock,
  Pen,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import React from "react";
import { Link } from "react-router";
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const styles = {
  gradientShift: `
    @keyframes gradient-shift {
      0% { transform: scale(1); }
      100% { transform: scale(1.1); }
    }
  `,
  gradientX: `
    @keyframes gradient-x {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
  `,
} as const;

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="hover:/50 group cursor-pointer rounded-lg border bg-background p-6 transition-colors">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <h4 className="mb-2 text-lg font-semibold">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        ${styles.gradientShift}
        ${styles.gradientX}
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 15s ease infinite;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(107, 114, 128, 0.1) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(107, 114, 128, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `,
        }}
      />

      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-medium">synthesis</h1>
          <nav className="hidden items-center space-x-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            <a
              href="https://github.com/synthesis/app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to={"/login"}>Sign In</Link>
            <Button size="sm">Try Free</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 z-0">
            <div className="bg-grid-pattern absolute inset-0 opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/70 to-background" />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 100% 100%, #3a6aed 0%, transparent 25%), radial-gradient(circle at 0% 0%, #eddb3a 0%, transparent 25%)`,
                backgroundSize: "100% 100%",
                animation: "gradient-shift 8s ease-in-out infinite alternate",
              }}
            />
          </div>
          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="mb-8 inline-flex items-center rounded-full border bg-muted/50 px-4 py-1.5 backdrop-blur-sm">
              <Star className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm">Over 10,000 users trust synthesis</span>
            </div>
            <h2 className="relative mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              <span className="animate-gradient-x bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Your Ideas, Amplified by AI
              </span>
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
              Experience note-taking reimagined with AI-powered insights,
              end-to-end encryption, and a beautiful interface that adapts to
              your workflow.
            </p>
            <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 sm:w-auto"
              >
                Start Writing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="group w-full sm:w-auto"
              >
                See How It Works
                <ArrowUpRight className="ml-2 h-5 w-5 transition-colors group-hover:text-primary" />
              </Button>
            </div>
            <div className="mb-12 flex justify-center">
              <div className="relative w-full max-w-5xl">
                <div className="aspect-[16/9] overflow-hidden rounded-lg border shadow-2xl">
                  <img
                    src="/api/placeholder/1200/675"
                    alt="synthesis App Interface - Main Editor"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute -right-8 top-1/4 hidden translate-x-1/2 transform rounded-lg border bg-background p-4 shadow-lg md:block">
                  <Sparkles className="mb-2 h-6 w-6 text-primary" />
                  <p className="text-sm font-medium">AI-Powered Insights</p>
                </div>
                <div className="absolute -left-8 bottom-1/4 hidden -translate-x-1/2 transform rounded-lg border bg-background p-4 shadow-lg md:block">
                  <Lock className="mb-2 h-6 w-6 text-primary" />
                  <p className="text-sm font-medium">End-to-End Encrypted</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-8 text-sm text-muted-foreground md:flex-row">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Free plan available</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h3 className="mb-4 text-3xl font-bold">
                Everything you need to capture brilliance
              </h3>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Powerful features wrapped in a beautiful, intuitive interface.
                Focus on your ideas while synthesis takes care of the rest.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Sparkles className="h-6 w-6 text-primary" />}
                title="AI-Powered Insights"
                description="Get smart suggestions, automatic categorization, and AI-generated summaries that help you make connections between your notes."
              />
              <FeatureCard
                icon={<Lock className="h-6 w-6 text-primary" />}
                title="End-to-End Encryption"
                description="Your notes are encrypted before they leave your device. Not even we can read them - your thoughts remain truly private."
              />
              <FeatureCard
                icon={<FileText className="h-6 w-6 text-primary" />}
                title="Rich Text Editor"
                description="A powerful yet intuitive editor with support for Markdown, rich formatting, images, and more. Write the way you want."
              />
              <FeatureCard
                icon={<ArrowUpRight className="h-6 w-6 text-primary" />}
                title="Smart Organization"
                description="Automatic tagging, nested folders, and powerful search help you find your notes instantly, no matter how large your collection grows."
              />
              <FeatureCard
                icon={<Users className="h-6 w-6 text-primary" />}
                title="Real-time Collaboration"
                description="Share notes and collaborate with team members while maintaining end-to-end encryption. Perfect for teams and projects."
              />
              <FeatureCard
                icon={<Github className="h-6 w-6 text-primary" />}
                title="Open Source"
                description="Full transparency with our open-source codebase. Audit the code, contribute features, or self-host - you're in control."
              />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-2xl">
              <h3 className="mb-4 text-3xl font-bold">
                Ready to transform your note-taking?
              </h3>
              <p className="mb-8 text-muted-foreground">
                Join thousands of writers, researchers, and professionals who
                use synthesis to capture and develop their best ideas.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Schedule a Demo
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Pen className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold">synthesis</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Open source note-taking,
                <br />
                amplified by AI.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <div className="space-y-3">
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  Security
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <div className="space-y-3">
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  About
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  Blog
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  Careers
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Resources</h4>
              <div className="space-y-3">
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  Documentation
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  Status
                </a>
              </div>
            </div>
          </div>
          <div className="border-t pt-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} synthesis. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
