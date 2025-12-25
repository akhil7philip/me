"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Shield, Mail, Share2, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your blog configuration</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database
            </CardTitle>
            <CardDescription>Supabase configuration and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Connection Status</span>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your database is connected and running smoothly.
              </p>
              <Link href="https://supabase.com" target="_blank">
                <Button variant="outline" size="sm">
                  Open Supabase Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authentication
            </CardTitle>
            <CardDescription>User authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Auth Provider</span>
              <Badge variant="default">Supabase Auth</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Secure authentication powered by Supabase.
              </p>
              <Link href="/admin/profile">
                <Button variant="outline" size="sm">
                  Manage Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Newsletter
            </CardTitle>
            <CardDescription>Email subscription settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Email Service</span>
              <Badge variant="secondary">Resend (Optional)</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Configure Resend API for email newsletters.
              </p>
              <Link href="/admin/subscribers">
                <Button variant="outline" size="sm">
                  Manage Subscribers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              SEO & Sharing
            </CardTitle>
            <CardDescription>Search and social optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Sitemap</span>
                <Link href="/sitemap.xml" target="_blank">
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span>RSS Feed</span>
                <Link href="/rss.xml" target="_blank">
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Performance
            </CardTitle>
            <CardDescription>Site optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Badge variant="default">Next.js 13</Badge>
              <Badge variant="default">App Router</Badge>
              <Badge variant="default">Server Components</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Your blog is optimized for performance with modern web technologies.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Features
            </CardTitle>
            <CardDescription>Available functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Rich Text Editor</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Comments System</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Reactions</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Social Sharing</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Media Library</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Analytics</span>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Required configuration (set in .env.local)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div className="p-3 bg-secondary rounded">
              <strong>NEXT_PUBLIC_SUPABASE_URL</strong> - Your Supabase project URL
            </div>
            <div className="p-3 bg-secondary rounded">
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> - Your Supabase anon key
            </div>
            <div className="p-3 bg-secondary rounded">
              <strong>NEXT_PUBLIC_SITE_URL</strong> - Your site URL (for SEO)
            </div>
            <div className="p-3 bg-secondary/50 rounded">
              <strong>RESEND_API_KEY</strong> - (Optional) For email newsletters
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

