import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { 
  Zap, 
  GitBranch, 
  Wallet, 
  Search, 
  ArrowRight,
  Shield,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { getSettings } from '@/lib/settings';
import { devLog } from '@/lib/config';

const features = [
  {
    icon: GitBranch,
    title: 'Repo Analysis',
    description: 'AI-powered analysis of your GitHub repository for grant eligibility.',
  },
  {
    icon: Wallet,
    title: 'x402 Payments',
    description: 'Pay-per-use with native USDC micropayments on Avalanche.',
  },
  {
    icon: Search,
    title: 'Grant Matching',
    description: 'Discover grants that match your project\'s tech stack and focus.',
  },
  {
    icon: Shield,
    title: 'Quality Scoring',
    description: 'Get insights on code quality, activity, and grant-fit signals.',
  },
];

export default function HomePage() {
  const { isConnected } = useAccount();
  const settings = getSettings();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8"
            >
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">x402 Native Payments</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Build more.{' '}
              <span className="gradient-text">Paperwork less.</span>{' '}
              Get funded.
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Analyze your GitHub repository, discover matching grants, and access 
              funding opportunities — all powered by seamless x402 micropayments.
            </motion.p>

            {/* Config Warning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="max-w-xl mx-auto mb-8"
            >
              <ConfigWarning />
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              {!isConnected ? (
                <div onClick={() => devLog('hero-connect-wallet')}>
                  <ConnectButton />
                </div>
              ) : (
                <Button
                  variant="hero"
                  size="xl"
                  asChild
                  onClick={() => devLog('hero-analyze')}
                >
                  <Link to="/analyze">
                    Analyze GitHub Repo
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              )}
              
              <Button
                variant="hero-outline"
                size="lg"
                asChild
                onClick={() => devLog('hero-grants')}
              >
                <Link to="/grants">
                  Browse Grants
                </Link>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  devLog('hero-api-status');
                  window.open(`${settings.apiBaseUrl}/health`, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Check API Status
              </Button>
            </motion.div>

            {/* Price tag */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <DollarSign className="h-4 w-4" />
              <span>Analysis costs just <strong className="text-primary">$0.10</strong> per repo</span>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent, and powered by the x402 protocol for native micropayments.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="glass" className="h-full p-6 hover:border-primary/30 transition-colors">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="gradient" className="p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to find your next grant?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Connect your wallet, analyze your repository, and unlock access to 
                curated grant opportunities tailored to your project.
              </p>
              <Button
                variant="hero"
                size="lg"
                asChild
                onClick={() => devLog('cta-get-started')}
              >
                <Link to="/analyze">
                  Get Started
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
