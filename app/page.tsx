import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, CheckCircle, Calendar, Zap, Globe, Users,
  BarChart3, ArrowRight, Star
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-powered content",
    description: "Generate a full month of social posts tailored to your brand voice in under 60 seconds.",
  },
  {
    icon: Globe,
    title: "5 platforms, one tool",
    description: "Instagram, Facebook, LinkedIn, X (Twitter), and TikTok — all managed from one dashboard.",
  },
  {
    icon: Calendar,
    title: "Smart scheduling",
    description: "Schedule all posts at once or individually. AI suggests optimal posting times.",
  },
  {
    icon: Zap,
    title: "Platform-perfect formatting",
    description: "Character limits, hashtag rules, and tone automatically adapted for each platform.",
  },
  {
    icon: Users,
    title: "Unlimited users & brands",
    description: "Add your whole team and manage multiple client brands — all in one subscription.",
  },
  {
    icon: BarChart3,
    title: "Visual preview mockups",
    description: "See exactly how your posts will look on each platform before publishing.",
  },
];

const steps = [
  { step: "1", title: "Set up your brand", description: "Add your logo, colours, tone, and audience in 3 minutes." },
  { step: "2", title: "Share your brief", description: "Tell AI about upcoming events, promotions, and campaigns." },
  { step: "3", title: "Review & edit", description: "Preview posts on each platform and tweak anything you like." },
  { step: "4", title: "Schedule & publish", description: "Schedule everything with one click or publish instantly." },
];

const testimonials = [
  {
    quote: "It used to take me half a day to plan social content. Now it takes 10 minutes and looks better.",
    name: "Sarah M.",
    business: "Bloom & Grow Florists",
  },
  {
    quote: "Finally a tool that actually writes like us. The brand tone feature is spot on.",
    name: "James T.",
    business: "Apex Accountancy",
  },
  {
    quote: "We manage 6 client brands with it. Worth every penny at £99.",
    name: "Lisa K.",
    business: "KD Marketing",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">SMB Social Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">
              Sign in
            </Link>
            <Button asChild className="bg-violet-600 hover:bg-violet-700">
              <Link href="/register">Start free trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <Badge className="bg-violet-100 text-violet-700 border-violet-200 mb-4 hover:bg-violet-100">
          <Sparkles className="w-3 h-3 mr-1" /> AI-powered social media
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          A full month of social content,{" "}
          <span className="text-violet-600">generated in seconds.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          SMB Social Studio creates platform-perfect social media posts for your small business
          using AI. Schedule to Instagram, Facebook, LinkedIn, X, and TikTok — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 text-base px-8">
            <Link href="/register">
              Start your free 14-day trial <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base">
            <Link href="/login">Sign in to your account</Link>
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          No credit card required · £99/month after trial · Cancel any time
        </p>
      </section>

      {/* Social proof strip */}
      <div className="bg-gray-50 border-y border-gray-100 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-8 flex-wrap text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Instagram</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Facebook</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> LinkedIn</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> X (Twitter)</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> TikTok</span>
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">From brief to published in minutes</h2>
          <p className="text-gray-500">A simple 4-step process designed for non-marketing people.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[calc(100%-1.5rem)] w-1/2 h-0.5 bg-gray-200 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-12 h-12 bg-violet-600 text-white rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need</h2>
            <p className="text-gray-500">Built specifically for small business owners who aren&apos;t social media experts.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Loved by small businesses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.business}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-violet-600 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Simple, transparent pricing</h2>
          <p className="text-violet-200 mb-8">One plan. Everything included. No surprises.</p>
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto">
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">£99</span>
              <span className="text-gray-500">/month</span>
              <p className="text-sm text-gray-400 mt-1">Billed on the last day of each month</p>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {[
                "Unlimited brands & social profiles",
                "Unlimited team members",
                "Unlimited AI-generated posts",
                "All 5 social platforms",
                "Scheduling & direct publishing",
                "Platform preview mockups",
                "Content calendar",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full bg-violet-600 hover:bg-violet-700 text-base" size="lg">
              <Link href="/register">
                Start 14-day free trial <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-gray-400 mt-3">No credit card required · Cancel any time</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span>SMB Social Studio</span>
          </div>
          <p>© {new Date().getFullYear()} SMB Social Studio. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-gray-600">Sign in</Link>
            <Link href="/register" className="hover:text-gray-600">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
