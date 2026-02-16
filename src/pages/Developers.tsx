import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, KeyRound, Server, Shield, Code } from "lucide-react";
import { Link } from "react-router-dom";

const codeBlockClass =
  "mt-3 rounded-lg bg-gray-950 text-gray-100 p-4 text-sm overflow-x-auto border border-gray-800";

const DevelopersPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white mb-4">
              <BookOpen className="h-4 w-4" />
              Developer Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Changebag <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">Partner API</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Use our API to fetch causes from our database and embed them into your own app or website.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">API key auth</Badge>
              <Badge variant="secondary">Pagination</Badge>
              <Badge variant="secondary">Rate limiting</Badge>
              <Badge variant="secondary">Stable response format</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-green-600" />
                  Base URLs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <div>
                  <p className="font-medium">Recommended (namespaced):</p>
                  <div className={codeBlockClass}>
                    <pre>{`https://api.changebag.org/api/partner`}</pre>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Compatibility alias (no /api):</p>
                  <div className={codeBlockClass}>
                    <pre>{`https://api.changebag.org/partner`}</pre>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  For convenience, we also support a public causes path alias: <code>/causes</code> (in addition to <code>/api/causes</code>).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-green-600" />
                  Get an API key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  API keys are issued per business. Each key has an optional per-minute rate limit.
                </p>
                <div className="text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                  You can self-register and get a key instantly.
                </div>
                <Button className="w-full" asChild>
                  <Link to="/developers/register">Register & get API key</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>Send your API key in the <code>X-API-Key</code> header.</p>
                <div className={codeBlockClass}>
                  <pre>{`curl -s \\
  -H "X-API-Key: YOUR_API_KEY" \\
  "https://api.changebag.org/api/partner/me"`}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-green-600" />
                  Fetch all causes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>
                  Endpoint: <code>GET /api/partner/causes</code>
                </p>
                <div className={codeBlockClass}>
                  <pre>{`curl -s \\
  -H "X-API-Key: YOUR_API_KEY" \\
  "https://api.changebag.org/api/partner/causes?page=1&limit=25"`}</pre>
                </div>
                <p className="text-sm text-gray-600">
                  Query params: <code>page</code>, <code>limit</code> (max 100), <code>category</code>, <code>search</code>, <code>isOnline</code>.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Example response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={codeBlockClass}>
                <pre>{`{
  "success": true,
  "page": 1,
  "limit": 25,
  "total": 123,
  "totalPages": 5,
  "count": 25,
  "causes": [
    {
      "causeId": "66f0...abc",
      "causeTitle": "Ocean Cleanup Initiative",
      "description": "Help us remove plastic waste...",
      "imageUrl": "/uploads/ocean.jpg",
      "category": "environment",
      "status": "approved",
      "isOnline": true,
      "totalTotes": 500,
      "claimedTotes": 120,
      "availableTotes": 380,
      "sponsorUrl": "https://changebag.org/sponsor/new?causeId=...",
      "claimUrl": "https://changebag.org/claim/...?source=partner&ref=external",
      "causeUrl": "https://changebag.org/cause/...",
      "waitlistUrl": "https://changebag.org/waitlist/...",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-20T00:00:00.000Z"
    }
  ]
}`}</pre>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Tip: <code>imageUrl</code> may be a relative path. Prefix with your API host for full URLs.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Adding Sponsor and Claim buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                Each cause includes <code>sponsorUrl</code>, <code>claimUrl</code>, <code>causeUrl</code>, and <code>waitlistUrl</code>. Use them to link users to Changebag.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Claim a Tote</strong> — show when <code>availableTotes &gt; 0</code>. Link to <code>claimUrl</code>.</li>
                <li><strong>Sponsor This Cause</strong> — always available. Link to <code>sponsorUrl</code>.</li>
                <li><strong>Join Waitlist</strong> — for causes with no totes yet. Link to <code>waitlistUrl</code>.</li>
              </ul>
              <p className="text-sm">
                Open links in a new tab (<code>target="_blank"</code>) so users complete sponsor/claim flows on Changebag.
              </p>
            </CardContent>
          </Card>

          <div className="mt-12 mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">
              Sponsor <span className="text-green-600">Widget</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
              Embed our donation flow directly into your website with just a few lines of code.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-green-600" />
                  Quick Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  Add this HTML snippet to your page where you want the widget to appear.
                </p>
                <div className={codeBlockClass}>
                  <pre>{`<!-- 1. Container -->
<div id="causeconn-sponsor-widget" 
     data-cause-id="OPTIONAL_CAUSE_ID" 
     data-theme="light">
</div>

<!-- 2. Script (at end of body) -->
<script src="https://causeconn.com/widget/embed.js"></script>`}</pre>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Requirements</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                    <li><strong>HTTPS:</strong> Your site must be served over HTTPS.</li>
                    <li><strong>Whitelisting:</strong> Your domain must be allowed by our CORS policy. Contact support to add your domain.</li>
                    <li><strong>Container ID:</strong> The div ID must be exactly <code>causeconn-sponsor-widget</code>.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration Options</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-500 border-b">
                    <tr>
                      <th className="pb-2">Attribute</th>
                      <th className="pb-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className="border-b">
                      <td className="py-2 font-mono text-green-700">data-cause-id</td>
                      <td className="py-2">Pre-select a specific cause. If specific, the user skips the selection step.</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-mono text-green-700">data-api-key</td>
                      <td className="py-2">Your Partner API Key for tracking sponsorships attributed to you.</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-mono text-green-700">data-theme</td>
                      <td className="py-2"><code>light</code> (default) or <code>dark</code>.</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Listening for Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-700">
                <p>The widget emits custom events you can listen to.</p>
                <div className={codeBlockClass}>
                  <pre>{`window.addEventListener(
  'causeconnSponsorSuccess', 
  function(e) {
    console.log('Sponsorship!', e.detail);
    // e.detail: { 
    //   sponsorshipId: "...", 
    //   amount: 5000 
    // }
  }
);`}</pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Docs & tooling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>
                The repo includes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><code>docs/partner-api/README.md</code> (integration guide)</li>
                <li><code>docs/partner-api/openapi.yaml</code> (OpenAPI spec)</li>
                <li><code>docs/partner-api/postman_collection.json</code> (Postman collection)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DevelopersPage;

