import { Link } from 'react-router-dom';
import { Zap, Github, ExternalLink } from 'lucide-react';
import { getSettings } from '@/lib/settings';
import { devLog } from '@/lib/config';

export function Footer() {
  const settings = getSettings();

  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="gradient-text">Grantee</span>
            </Link>
            <span className="text-sm text-muted-foreground">
              Powered by x402 payments
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a 
              href={`${settings.apiBaseUrl}/health`}
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1"
              onClick={() => devLog('footer-api-health')}
            >
              API Health
              <ExternalLink className="h-3 w-3" />
            </a>
            <Link 
              to="/settings" 
              className="hover:text-primary transition-colors"
              onClick={() => devLog('footer-settings')}
            >
              Settings
            </Link>
            <a 
              href="https://github.com/EstherLavender/Grantee" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              onClick={() => devLog('footer-github')}
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
