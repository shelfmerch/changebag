import React, { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, KeyRound, Copy, CheckCircle2 } from "lucide-react";
import axios from "axios";
import config from "@/config";

type RegisterResponse = {
  success: boolean;
  apiKey?: string;
  partner?: {
    id: string;
    businessName: string;
    businessEmail: string;
    contactName: string;
    isActive: boolean;
    rateLimitPerMinute?: number;
    createdAt: string;
  };
  message?: string;
  error?: string;
};

const DevelopersRegisterPage: React.FC = () => {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return businessName.trim() && businessEmail.trim() && contactName.trim() && !loading;
  }, [businessName, businessEmail, contactName, loading]);

  const handleCopy = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      toast({ title: "Copied", description: "API key copied to clipboard." });
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the key manually.",
        variant: "destructive"
      });
    }
  };

  const submit = async () => {
    try {
      setLoading(true);
      setApiKey(null);

      const { data } = await axios.post<RegisterResponse>(`${config.apiUrl}/partner/register`, {
        businessName: businessName.trim(),
        businessEmail: businessEmail.trim(),
        contactName: contactName.trim()
      });

      if (!data.success || !data.apiKey) {
        throw new Error(data.message || "Registration failed");
      }

      setApiKey(data.apiKey);
      toast({
        title: "API key created",
        description: "Copy and store it now — treat it like a password."
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Registration failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-green-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white mb-4">
                <KeyRound className="h-4 w-4" />
                Developer Registration
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-black">
                Create your Partner API key
              </h1>
              <p className="text-gray-600 mt-2">
                Register your app to receive an API key for fetching causes.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Business details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business / App name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Inc"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business email</Label>
                  <Input
                    id="businessEmail"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="e.g. dev@acme.com"
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact name</Label>
                  <Input
                    id="contactName"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                  />
                </div>

                <Button className="w-full" disabled={!canSubmit} onClick={submit}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating key…
                    </>
                  ) : (
                    "Create API key"
                  )}
                </Button>

                {apiKey ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-2 text-green-800 font-semibold">
                      <CheckCircle2 className="h-5 w-5" />
                      Your API key (shown once)
                    </div>
                    <p className="text-sm text-green-900/80 mt-1">
                      Store this securely. Treat it like a password.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Input readOnly value={apiKey} className="bg-white font-mono" />
                      <Button variant="outline" onClick={handleCopy} type="button">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-green-900/70 mt-3">
                      Example: <code>{`curl -H "X-API-Key: ${apiKey}" ${config.apiUrl}/partner/causes`}</code>
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DevelopersRegisterPage;

