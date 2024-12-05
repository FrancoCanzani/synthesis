import React from 'react';
import {
  ArrowRight,
  Check,
  Github,
  Lock,
  Sparkles,
  FileText,
  Pen,
  Star,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className='bg-background p-6 rounded-lg border hover:border-primary/50 transition-colors group cursor-pointer'>
      <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors'>
        {icon}
      </div>
      <h4 className='text-lg font-semibold mb-2'>{title}</h4>
      <p className='text-muted-foreground'>{description}</p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className='min-h-screen bg-background text-foreground font-sans'>
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

      <header className='border-b sticky top-0 bg-background/80 backdrop-blur-lg z-50'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
          <h1 className='text-xl font-medium'>Synthetic</h1>
          <nav className='hidden md:flex items-center space-x-8'>
            <a
              href='#features'
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              Features
            </a>
            <a
              href='#testimonials'
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              Testimonials
            </a>
            <a
              href='#pricing'
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              Pricing
            </a>
            <a
              href='https://github.com/synthetic/app'
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center'
            >
              GitHub
            </a>
          </nav>
          <div className='flex items-center space-x-4'>
            <Button variant='ghost' size='sm'>
              Sign In
            </Button>
            <Button size='sm'>Try Free</Button>
          </div>
        </div>
      </header>

      <main>
        <section className='py-20 md:py-32 relative overflow-hidden'>
          <div className='absolute inset-0 z-0'>
            <div className='absolute inset-0 bg-grid-pattern opacity-20' />
            <div className='absolute inset-0 bg-gradient-to-b from-background/0 via-background/70 to-background' />
            <div
              className='absolute inset-0 opacity-30'
              style={{
                backgroundImage: `radial-gradient(circle at 100% 100%, #3a6aed 0%, transparent 25%), radial-gradient(circle at 0% 0%, #eddb3a 0%, transparent 25%)`,
                backgroundSize: '100% 100%',
                animation: 'gradient-shift 8s ease-in-out infinite alternate',
              }}
            />
          </div>
          <div className='container mx-auto px-4 text-center relative z-10'>
            <div className='inline-flex items-center bg-muted/50 backdrop-blur-sm border rounded-full px-4 py-1.5 mb-8'>
              <Star className='w-4 h-4 text-primary mr-2' />
              <span className='text-sm'>Over 10,000 users trust Synthetic</span>
            </div>
            <h2 className='text-4xl md:text-6xl font-bold tracking-tight mb-6 relative'>
              <span className='bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60 animate-gradient-x'>
                Your Ideas, Amplified by AI
              </span>
            </h2>
            <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
              Experience note-taking reimagined with AI-powered insights,
              end-to-end encryption, and a beautiful interface that adapts to
              your workflow.
            </p>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-12'>
              <Button
                size='lg'
                className='w-full sm:w-auto bg-primary hover:bg-primary/90'
              >
                Start Writing Now
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='w-full sm:w-auto group'
              >
                See How It Works
                <ArrowUpRight className='ml-2 h-5 w-5 group-hover:text-primary transition-colors' />
              </Button>
            </div>
            <div className='flex justify-center mb-12'>
              <div className='relative w-full max-w-5xl'>
                <div className='aspect-[16/9] rounded-lg overflow-hidden border shadow-2xl'>
                  <img
                    src='/api/placeholder/1200/675'
                    alt='Synthetic App Interface - Main Editor'
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='absolute -right-8 top-1/4 transform translate-x-1/2 bg-background border rounded-lg p-4 shadow-lg hidden md:block'>
                  <Sparkles className='w-6 h-6 text-primary mb-2' />
                  <p className='text-sm font-medium'>AI-Powered Insights</p>
                </div>
                <div className='absolute -left-8 bottom-1/4 transform -translate-x-1/2 bg-background border rounded-lg p-4 shadow-lg hidden md:block'>
                  <Lock className='w-6 h-6 text-primary mb-2' />
                  <p className='text-sm font-medium'>End-to-End Encrypted</p>
                </div>
              </div>
            </div>
            <div className='flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-primary' />
                <span>No credit card required</span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-primary' />
                <span>Free plan available</span>
              </div>
              <div className='flex items-center gap-2'>
                <Check className='w-4 h-4 text-primary' />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        <section id='features' className='py-20 bg-muted/50'>
          <div className='container mx-auto px-4'>
            <div className='text-center mb-16'>
              <h3 className='text-3xl font-bold mb-4'>
                Everything you need to capture brilliance
              </h3>
              <p className='text-muted-foreground max-w-2xl mx-auto'>
                Powerful features wrapped in a beautiful, intuitive interface.
                Focus on your ideas while Synthetic takes care of the rest.
              </p>
            </div>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              <FeatureCard
                icon={<Sparkles className='w-6 h-6 text-primary' />}
                title='AI-Powered Insights'
                description='Get smart suggestions, automatic categorization, and AI-generated summaries that help you make connections between your notes.'
              />
              <FeatureCard
                icon={<Lock className='w-6 h-6 text-primary' />}
                title='End-to-End Encryption'
                description='Your notes are encrypted before they leave your device. Not even we can read them - your thoughts remain truly private.'
              />
              <FeatureCard
                icon={<FileText className='w-6 h-6 text-primary' />}
                title='Rich Text Editor'
                description='A powerful yet intuitive editor with support for Markdown, rich formatting, images, and more. Write the way you want.'
              />
              <FeatureCard
                icon={<ArrowUpRight className='w-6 h-6 text-primary' />}
                title='Smart Organization'
                description='Automatic tagging, nested folders, and powerful search help you find your notes instantly, no matter how large your collection grows.'
              />
              <FeatureCard
                icon={<Users className='w-6 h-6 text-primary' />}
                title='Real-time Collaboration'
                description='Share notes and collaborate with team members while maintaining end-to-end encryption. Perfect for teams and projects.'
              />
              <FeatureCard
                icon={<Github className='w-6 h-6 text-primary' />}
                title='Open Source'
                description="Full transparency with our open-source codebase. Audit the code, contribute features, or self-host - you're in control."
              />
            </div>
          </div>
        </section>

        <section className='py-20'>
          <div className='container mx-auto px-4 text-center'>
            <div className='max-w-2xl mx-auto'>
              <h3 className='text-3xl font-bold mb-4'>
                Ready to transform your note-taking?
              </h3>
              <p className='text-muted-foreground mb-8'>
                Join thousands of writers, researchers, and professionals who
                use Synthetic to capture and develop their best ideas.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button size='lg' className='w-full sm:w-auto'>
                  Get Started for Free
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
                <Button
                  variant='outline'
                  size='lg'
                  className='w-full sm:w-auto'
                >
                  Schedule a Demo
                  <ArrowUpRight className='ml-2 h-5 w-5' />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='border-t py-12 bg-muted/20'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-8'>
            <div>
              <div className='flex items-center space-x-4 mb-4'>
                <div className='bg-primary/10 p-2 rounded-lg'>
                  <Pen className='w-6 h-6 text-primary' />
                </div>
                <span className='font-bold'>Synthetic</span>
              </div>
              <p className='text-sm text-muted-foreground'>
                Open source note-taking,
                <br />
                amplified by AI.
              </p>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>Product</h4>
              <div className='space-y-3'>
                <a
                  href='#'
                  className='block text-sm text-muted-foreground hover:text-foreground'
                >
                  Features
                </a>
                <a
                  href='#'
                  className='block text-sm text-muted-foreground hover:text-foreground'
                >
                  Pricing
                </a>
                <a
                  href='#'
                  className='block text-sm text-muted-foreground hover:text-foreground'
                >
                  Security
                </a>
              </div>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>Company</h4>
              <div className='space-y-3'>
                <a
                  href='#'
                  className='block text-sm text-muted-foreground hover:text-foreground'
                >
                  About
                </a>
                <a
                  href='#'
                  className='block text-sm text-muted-foreground hover:text-foreground'
                >
                  Blog
                </a>
                <a
                  href='#'
                  className='block text-sm text-muted-foreground hover:text-foreground'
                >
                  Careers
                </a>
              </div>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>Resources</h4>
              <div className='space-y-3'>
                <a
                  href='#'
                  className='block text-sm text-muted-foreground hover:text-foreground'
                >
                  Documentation
                </a>
                <a
                  href='#'
                  className='block text-sm text-muted-foreground hover:text-foreground'
                >
                  GitHub
                </a>
                <a
                  href='#'
                  className='block text-sm text-muted-foreground hover:text-foreground'
                >
                  Status
                </a>
              </div>
            </div>
          </div>
          <div className='pt-8 border-t'>
            <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
              <div className='text-sm text-muted-foreground'>
                © {new Date().getFullYear()} Synthetic. All rights reserved.
              </div>
              <div className='flex space-x-6'>
                <a
                  href='#'
                  className='text-sm text-muted-foreground hover:text-foreground'
                >
                  Privacy
                </a>
                <a
                  href='#'
                  className='text-sm text-muted-foreground hover:text-foreground'
                >
                  Terms
                </a>
                <a
                  href='#'
                  className='text-sm text-muted-foreground hover:text-foreground'
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
};

export default App;
