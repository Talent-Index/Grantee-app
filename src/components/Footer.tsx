import { Link } from 'react-router-dom';
import { Zap, Github, Twitter } from 'lucide-react';
import { devLog } from '@/lib/config';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="gradient-text">Grantee</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Grant Intelligence & Capital Access API powered by x402 native payments. 
              Analyze repos, match with grants, access funding.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link 
                  to="/analyze" 
                  className="hover:text-primary transition-colors"
                  onClick={() => devLog('footer-analyze')}
                >
                  Analyze Repo
                </Link>
              </li>
              <li>
                <Link 
                  to="/grants" 
                  className="hover:text-primary transition-colors"
                  onClick={() => devLog('footer-grants')}
                >
                  Grants Explorer
                </Link>
              </li>
              <li>
                <Link 
                  to="/history" 
                  className="hover:text-primary transition-colors"
                  onClick={() => devLog('footer-history')}
                >
                  History
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a 
                  href="https://github.com/EstherLavender/Grantee" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  onClick={() => devLog('footer-github')}
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://x402.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  onClick={() => devLog('footer-x402')}
                >
                  x402 Protocol
                </a>
              </li>
              <li>
                <a 
                  href="https://www.avax.network/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  onClick={() => devLog('footer-avalanche')}
                >
                  Avalanche
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Grantee. Built with x402.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/EstherLavender/Grantee" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => devLog('footer-social-github')}
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => devLog('footer-social-twitter')}
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
